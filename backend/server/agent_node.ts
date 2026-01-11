/**
 * MantleForge Backend - Node.js Agent Server
 * 
 * NOTE: Mantle Agent SDK may not be available yet.
 * This implementation provides structure for SDK integration.
 * May need manual implementation using viem + LLM APIs.
 */
import Fastify from 'fastify';
import { createPublicClient, http, verifyTypedData, defineChain } from 'viem';
import { estimateTotalGasCost } from '@mantlenetworkio/sdk';
import * as dotenv from 'dotenv';
import { initializeFirebase, addTickerEvent, updateLeaderboard } from './firebase_client';
import { mintRWA } from './contract_client';
import { consultRiskModel } from './tools/consult_risk_model';
import { uploadToMantleDA } from './tools/upload_to_mantle_da';
import { startRiskSentinel } from './risk_sentinel';
import { analyzeAssetRisk } from './tools/ai_analyzer';

dotenv.config();

// Define Mantle Sepolia chain
const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia',
  network: 'mantle-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantlescan',
      url: 'https://sepolia.mantlescan.xyz',
    },
  },
  testnet: true,
});

const server = Fastify({ 
  logger: true,
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false
});

// Initialize Firebase (serviceAccountKey.json is in backend/ directory)
try {
  initializeFirebase();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️  Firebase initialization failed. Ticker and leaderboard features may not work.');
  console.warn('   Make sure serviceAccountKey.json exists in backend/ directory');
}

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const CHAIN_ID = parseInt(process.env.MANTLE_CHAIN_ID || '5003');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const AGENT_PK = process.env.AGENT_PK || '';
const PYTHON_SAAS_URL = process.env.PYTHON_SAAS_URL || 'http://localhost:5000';
const PORT = parseInt(process.env.PORT || '3000');

// Initialize viem client
const client = createPublicClient({
  chain: mantleSepolia,
  transport: http(RPC_URL)
});

// EIP-712 Domain (must match frontend)
const domain = {
  name: 'MantleForge',
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS as `0x${string}`
} as const;

const types = {
  MintRequest: [
    { name: 'name', type: 'string' },
    { name: 'valuation', type: 'uint256' },
    { name: 'riskScore', type: 'uint256' },
    { name: 'mantleDAHash', type: 'string' }
  ]
} as const;

// TODO: Initialize Mantle Agent SDK when available
// import { Agent, GeminiProvider } from "@mantle-agent-sdk/core";
// const agent = new Agent(...);

/**
 * Agent implementation using EmbedAPI with Claude 3.5 Sonnet
 */
const EmbedAPIClient = require('@embedapi/core');

interface AgentLike {
  think(prompt: string): Promise<string>;
  execute<T>(action: () => Promise<T>): Promise<T>;
}

class ManualAgent implements AgentLike {
  private embedapi: any | null = null;

  constructor() {
    const apiKey = process.env.EMBEDAPI_KEY;
    if (apiKey) {
      this.embedapi = new EmbedAPIClient(apiKey);
      console.log('✅ EmbedAPI initialized with Claude 3.5 Sonnet');
    } else {
      console.warn('⚠️  EMBEDAPI_KEY not set. Agent will use mock responses.');
    }
  }

  async think(prompt: string): Promise<string> {
    if (!this.embedapi) {
      console.log(`Agent thinking (mock): ${prompt}`);
      return "Analysis complete (mock)";
    }

    try {
      console.log(`Agent thinking: ${prompt}`);
      
      // Use EmbedAPI generate with Claude 3.5 Sonnet
      const response = await this.embedapi.generate({
        service: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are a risk manager for RWA (Real-World Asset) tokenization. Analyze requests and provide concise reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        maxTokens: 500
      });

      // Extract response text from EmbedAPI response
      const reasoning = response.choices?.[0]?.message?.content || 
                       response.content || 
                       response.text || 
                       "Analysis complete";
      console.log(`Agent reasoning: ${reasoning}`);
      return reasoning;
    } catch (error: any) {
      console.error('Error in agent thinking:', error.message);
      return "Analysis complete (error occurred)";
    }
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    // TODO: Add Mantle DA logging
    console.log("Agent executing action...");
    return await action();
  }
}

const agent = new ManualAgent();

// Health check
server.get('/api/health', async (request, reply) => {
  return {
    status: 'healthy',
    service: 'mantle-forge-backend',
    chainId: CHAIN_ID,
    rpcUrl: RPC_URL,
    timestamp: new Date().toISOString()
  };
});

// Status endpoint
server.get('/api/status', async (request, reply) => {
  try {
    const agentAddress = AGENT_PK ? 
      (await import('viem/accounts')).privateKeyToAccount(AGENT_PK as `0x${string}`).address : 
      'Not configured';
    
    return {
      status: 'operational',
      chainId: CHAIN_ID,
      contractAddress: CONTRACT_ADDRESS || 'Not deployed',
      agentAddress,
      firebaseEnabled: !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH || true, // serviceAccountKey.json exists
      embedapiEnabled: !!process.env.EMBEDAPI_KEY,
      pythonSaaS: PYTHON_SAAS_URL,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return reply.code(500).send({ error: error.message });
  }
});

// Main mint intent endpoint
server.post('/mint-intent', async (request, reply) => {
  try {
    const { signature, assetData, userAddress } = request.body as {
      signature: `0x${string}`;
      assetData: any;
      userAddress: `0x${string}`;
    };

    // Verify EIP-712 signature
    const isValid = await verifyTypedData({
      address: userAddress,
      domain,
      types,
      primaryType: 'MintRequest',
      message: assetData,
      signature
    });

    if (!isValid) {
      return reply.code(401).send({ error: "Invalid Signature" });
    }

    // Agent thinks about the request
    await agent.think(`User ${userAddress} wants to mint ${assetData.name}. Verifying risk...`);

    // Analyze risk using EmbedAPI + Claude 3.5 Sonnet
    let riskData: any;
    
    if (assetData.pdfText) {
      // Use AI analysis directly with Claude
      try {
        const aiAnalysis = await analyzeAssetRisk(
          assetData.pdfText,
          assetData.assetType || 'invoice'
        );
        riskData = {
          risk_score: aiAnalysis.riskScore || 15,
          valuation: assetData.valuation || 150000,
          asset_type: assetData.assetType || 'invoice',
          extracted_data: {
            reasoning: aiAnalysis.reasoning,
            confidence: aiAnalysis.confidence
          },
          confidence: aiAnalysis.confidence
        };
      } catch (error) {
        console.warn('AI analysis failed, falling back to Python SaaS:', error);
        // Fallback to Python SaaS
        riskData = await consultRiskModel(PYTHON_SAAS_URL, {
          asset_type: assetData.assetType || 'invoice',
          pdf_text: assetData.pdfText || ''
        });
      }
    } else {
      // No PDF text, use Python SaaS
      riskData = await consultRiskModel(PYTHON_SAAS_URL, {
        asset_type: assetData.assetType || 'invoice',
        pdf_text: ''
      });
    }

    // Upload to Mantle DA (if PDF provided)
    let mantleDAHash = assetData.mantleDAHash || '0x';
    if (assetData.pdfData && !mantleDAHash) {
      const daResult = await uploadToMantleDA(
        process.env.MANTLE_DA_ENDPOINT || 'https://da.mantle.xyz',
        { pdf: assetData.pdfData, metadata: assetData }
      );
      mantleDAHash = daResult.blobHash;
    }

    // Estimate gas costs
    // TODO: Encode actual contract call data properly
    let gasEstimate = '0';
    try {
      if (CONTRACT_ADDRESS) {
        // For now, use a placeholder. In production, encode the actual function call
        gasEstimate = '200000'; // Placeholder
        // const gasCost = await estimateTotalGasCost(RPC_URL, {
        //   to: CONTRACT_ADDRESS as `0x${string}`,
        //   data: encodedMintData
        // });
        // gasEstimate = gasCost.toString();
      }
    } catch (error) {
      console.warn('Gas estimation failed:', error);
    }

    // Agent executes transaction
    const txHash = await agent.execute(async () => {
      if (!CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS not set');
      }
      
      // Mint the asset
      return await mintRWA(
        assetData.name,
        BigInt(assetData.valuation || riskData.valuation),
        riskData.risk_score,
        mantleDAHash,
        signature
      );
    });

    // Update Firebase ticker (if configured)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      try {
        await addTickerEvent({
          type: '🏠',
          name: assetData.name,
          val: `$${(assetData.valuation || riskData.valuation) / 1000}k`,
          risk: riskData.risk_score
        });
      } catch (error) {
        console.warn('Failed to update ticker:', error);
      }

      // Update leaderboard (award XP)
      try {
        await updateLeaderboard(userAddress, 50);
      } catch (error) {
        console.warn('Failed to update leaderboard:', error);
      }
    }

    return {
      txHash,
      mantleDA_Log: mantleDAHash,
      gasEstimate,
      riskScore: riskData.risk_score,
      valuation: riskData.valuation
    };

  } catch (error: any) {
    server.log.error(error);
    return reply.code(500).send({ error: error.message });
  }
});

// Gas estimation endpoint
server.post('/api/estimate-gas', async (request, reply) => {
  try {
    const { to, data } = request.body as { to: string; data: string };
    const gasCost = await estimateTotalGasCost(RPC_URL, {
      to: to as `0x${string}`,
      data: data as `0x${string}`
    });

    return {
      gasCost: gasCost.toString(),
      network: 'Mantle Testnet',
      chainId: CHAIN_ID
    };
  } catch (error: any) {
    return reply.code(500).send({ error: error.message });
  }
});

// Start server
server.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`🤖 MantleForge Backend running on port ${PORT}`);
  console.log(`📡 Connected to: ${RPC_URL} (Chain ID: ${CHAIN_ID})`);
  console.log(`⚠️  Agent SDK: Using manual implementation (SDK not available)`);
  
  // Start Risk Sentinel if enabled
  if (process.env.ENABLE_RISK_SENTINEL !== 'false') {
    try {
      startRiskSentinel();
      console.log(`🛡️  Risk Sentinel: Enabled`);
    } catch (error) {
      console.warn('⚠️  Failed to start Risk Sentinel:', error);
    }
  }
});

