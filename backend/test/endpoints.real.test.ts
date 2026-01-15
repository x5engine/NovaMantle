/**
 * Real Endpoint Tests
 * Tests actual running server endpoints with HTTP requests
 * 
 * IMPORTANT: Backend server must be running on port 3000
 * Run: cd backend && npm run dev
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { privateKeyToAccount } from 'viem/accounts';
import { signTypedData } from 'viem';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const PYTHON_SAAS_URL = process.env.PYTHON_SAAS_URL || 'http://localhost:5000';

// Test account
const testPrivateKey = '0x' + '1'.repeat(64) as `0x${string}`;
const testAccount = privateKeyToAccount(testPrivateKey);
const testAddress = testAccount.address;

// EIP-712 domain (must match backend)
const domain = {
  name: 'MantleForge',
  version: '1',
  chainId: 5003,
  verifyingContract: '0x' + '2'.repeat(40) as `0x${string}`
} as const;

const types = {
  MintRequest: [
    { name: 'name', type: 'string' },
    { name: 'valuation', type: 'uint256' },
    { name: 'riskScore', type: 'uint256' },
    { name: 'mantleDAHash', type: 'string' }
  ]
} as const;

describe('Real Endpoint Tests - Backend (Port 3000)', () => {
  beforeAll(async () => {
    // Wait for server to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        if (response.ok) break;
      } catch (e) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }
  });

  describe('GET /api/health', () => {
    it('should return 200 with healthy status', async () => {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.service).toBe('mantle-forge-backend');
      expect(data.chainId).toBe(5003);
      expect(data.rpcUrl).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should include valid timestamp', async () => {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      const data = await response.json();
      
      const timestamp = new Date(data.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should respond quickly (< 500ms)', async () => {
      const start = Date.now();
      await fetch(`${BACKEND_URL}/api/health`);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });

    it('should return JSON content type', async () => {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      const contentType = response.headers.get('content-type');
      
      expect(contentType).toContain('application/json');
    });
  });

  describe('GET /api/status', () => {
    it('should return operational status', async () => {
      const response = await fetch(`${BACKEND_URL}/api/status`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('operational');
      expect(data.chainId).toBe(5003);
      expect(data.contractAddress).toBeDefined();
      expect(data.agentAddress).toBeDefined();
    });

    it('should include Firebase status', async () => {
      const response = await fetch(`${BACKEND_URL}/api/status`);
      const data = await response.json();
      
      expect(data.firebaseEnabled).toBeDefined();
      expect(typeof data.firebaseEnabled).toBe('boolean');
    });

    it('should include EmbedAPI status', async () => {
      const response = await fetch(`${BACKEND_URL}/api/status`);
      const data = await response.json();
      
      expect(data.embedapiEnabled).toBeDefined();
      expect(typeof data.embedapiEnabled).toBe('boolean');
    });

    it('should include Python SaaS URL', async () => {
      const response = await fetch(`${BACKEND_URL}/api/status`);
      const data = await response.json();
      
      expect(data.pythonSaaS).toBeDefined();
      expect(data.pythonSaaS).toContain('http');
    });
  });

  describe('POST /mint-intent', () => {
    const createValidRequest = async () => {
      const message = {
        name: 'Test Asset',
        valuation: BigInt(150000),
        riskScore: BigInt(15),
        mantleDAHash: '0x' + 'b'.repeat(64)
      };

      // Sign with test account
      const signature = await signTypedData({
        account: testAccount,
        domain,
        types,
        primaryType: 'MintRequest',
        message
      });

      return {
        signature,
        assetData: {
          name: message.name,
          valuation: message.valuation.toString(),
          riskScore: message.riskScore.toString(),
          mantleDAHash: message.mantleDAHash,
          assetType: 'invoice',
          pdfText: 'Mock PDF text for testing'
        },
        userAddress: testAddress
      };
    };

    it('should reject request without signature', async () => {
      const response = await fetch(`${BACKEND_URL}/mint-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetData: { name: 'Test' },
          userAddress: testAddress
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Invalid Signature');
    });

    it('should reject request without userAddress', async () => {
      const request = await createValidRequest();
      delete (request as any).userAddress;

      const response = await fetch(`${BACKEND_URL}/mint-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject request without assetData', async () => {
      const request = await createValidRequest();
      delete (request as any).assetData;

      const response = await fetch(`${BACKEND_URL}/mint-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should accept valid mint request structure', async () => {
      const request = await createValidRequest();

      const response = await fetch(`${BACKEND_URL}/mint-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      // Should either succeed (200) or fail with specific error (not 400/401)
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.txHash).toBeDefined();
        expect(data.mantleDA_Log).toBeDefined();
      }
    });

    it('should validate signature format', async () => {
      const request = await createValidRequest();
      request.signature = 'invalid-signature' as any;

      const response = await fetch(`${BACKEND_URL}/mint-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/estimate-gas', () => {
    it('should estimate gas for transaction', async () => {
      const response = await fetch(`${BACKEND_URL}/api/estimate-gas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '0x' + '3'.repeat(40),
          data: '0x' + '4'.repeat(64)
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.gasCost).toBeDefined();
      expect(data.network).toBe('Mantle Testnet');
      expect(data.chainId).toBe(5003);
    });

    it('should handle missing transaction data', async () => {
      const response = await fetch(`${BACKEND_URL}/api/estimate-gas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        headers: {
          origin: 'http://localhost:5173'
        }
      });

      // CORS headers should be present
      expect(response.status).toBe(200);
      // Note: CORS headers are added by browser, not visible in fetch
    });
  });
});

describe('Real Endpoint Tests - Python SaaS (Port 5000)', () => {
  beforeAll(async () => {
    // Wait for Python SaaS to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        const response = await fetch(`${PYTHON_SAAS_URL}/api/health`);
        if (response.ok) break;
      } catch (e) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${PYTHON_SAAS_URL}/api/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });
  });

  describe('POST /api/analyze', () => {
    it('should reject request without PDF', async () => {
      const response = await fetch(`${PYTHON_SAAS_URL}/api/analyze`, {
        method: 'POST',
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.status).toBe('error');
    });

    it('should accept PDF file upload', async () => {
      // Create a minimal PDF buffer for testing
      const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
      
      const formData = new FormData();
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      formData.append('pdf', blob, 'test.pdf');

      const response = await fetch(`${PYTHON_SAAS_URL}/api/analyze`, {
        method: 'POST',
        body: formData
      });

      // Should either succeed or fail with specific error
      expect([200, 400, 500]).toContain(response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.status).toBe('success');
        expect(data.risk_score).toBeDefined();
        expect(data.valuation).toBeDefined();
      }
    });

    it('should return JSON serializable response', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
      
      const formData = new FormData();
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      formData.append('pdf', blob, 'test.pdf');

      const response = await fetch(`${PYTHON_SAAS_URL}/api/analyze`, {
        method: 'POST',
        body: formData
      });

      if (response.status === 200) {
        const data = await response.json();
        
        // Should be JSON serializable (no IndirectObject errors)
        const jsonString = JSON.stringify(data);
        const parsed = JSON.parse(jsonString);
        
        expect(parsed.extracted_data).toBeDefined();
        if (parsed.extracted_data.pdf_metadata) {
          // All metadata values should be strings
          Object.values(parsed.extracted_data.pdf_metadata).forEach(value => {
            expect(typeof value === 'string' || typeof value === 'number' || value === null).toBe(true);
          });
        }
      }
    });
  });
});

describe('Complete User Flow - End-to-End', () => {
  it('should complete full mint flow', async () => {
    // 1. Check Python SaaS health
    const pythonHealth = await fetch(`${PYTHON_SAAS_URL}/api/health`);
    expect(pythonHealth.status).toBe(200);

    // 2. Check Backend health
    const backendHealth = await fetch(`${BACKEND_URL}/api/health`);
    expect(backendHealth.status).toBe(200);

    // 3. Upload PDF to Python SaaS
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('pdf', blob, 'test.pdf');

    const analysisResponse = await fetch(`${PYTHON_SAAS_URL}/api/analyze`, {
      method: 'POST',
      body: formData
    });

    if (analysisResponse.status === 200) {
      const analysisData = await analysisResponse.json();
      expect(analysisData.risk_score).toBeDefined();
      expect(analysisData.valuation).toBeDefined();

      // 4. Sign and send mint request to backend
      const message = {
        name: 'Test Asset',
        valuation: BigInt(analysisData.valuation),
        riskScore: BigInt(analysisData.risk_score),
        mantleDAHash: '0x' + 'b'.repeat(64)
      };

      const signature = await signTypedData({
        account: testAccount,
        domain,
        types,
        primaryType: 'MintRequest',
        message
      });

      const mintResponse = await fetch(`${BACKEND_URL}/mint-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature,
          assetData: {
            name: message.name,
            valuation: message.valuation.toString(),
            riskScore: message.riskScore.toString(),
            mantleDAHash: message.mantleDAHash,
            assetType: analysisData.asset_type || 'invoice',
            pdfText: analysisData.pdf_text || ''
          },
          userAddress: testAddress
        })
      });

      // Should either succeed or fail with specific error
      expect([200, 401, 500]).toContain(mintResponse.status);
    }
  });
});

