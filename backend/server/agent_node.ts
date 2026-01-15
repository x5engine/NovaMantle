/**
 * MantleForge Backend - Node.js Agent Server
 * 
 * NOTE: Mantle Agent SDK may not be available yet.
 * This implementation provides structure for SDK integration.
 * May need manual implementation using viem + LLM APIs.
 */
import Fastify from 'fastify';
import { createPublicClient, http, verifyTypedData, defineChain, parseAbiItem } from 'viem';
// import { estimateTotalGasCost } from '@mantlenetworkio/sdk';
// Temporarily disabled - may cause import issues
import * as dotenv from 'dotenv';
import { initializeFirebase, addTickerEvent, updateLeaderboard, addMintHistory, getMintHistory } from './firebase_client.js';
import { mintRWA } from './contract_client.js';
import { consultRiskModel } from './tools/consult_risk_model.js';
import { uploadToMantleDA } from './tools/upload_to_mantle_da.js';
import { startRiskSentinel } from './risk_sentinel.js';
import { analyzeAssetRisk } from './tools/ai_analyzer.js';
import { setupCORS } from './middleware/cors.js';

dotenv.config();

// Log uncaught errors early to surface startup crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

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

// CORS will be set up in startServer() function

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
const RPC_FALLBACKS = [
  RPC_URL,
  'https://rpc.sepolia.mantle.xyz',
  'https://mantle-sepolia.drpc.org',
  'https://mantle-sepolia.publicnode.com'
].filter(Boolean);
const CHAIN_ID = parseInt(process.env.MANTLE_CHAIN_ID || '5003');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const AGENT_PK = process.env.AGENT_PK || '';
const PYTHON_SAAS_URL = process.env.PYTHON_SAAS_URL || 'http://localhost:5000';
const PORT = parseInt(process.env.PORT || '3000');
const EXPLORER_BASE_URL = CHAIN_ID === 5003
  ? 'https://sepolia.mantlescan.xyz'
  : 'https://mantlescan.xyz';

function normalizePrivateKey(rawKey: string): `0x${string}` {
  const trimmed = rawKey.trim();
  const hex = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('AGENT_PK must be a 32-byte hex string (64 chars) with or without 0x prefix');
  }
  return `0x${hex}` as `0x${string}`;
}

// Initialize viem client
const client = createPublicClient({
  chain: mantleSepolia,
  transport: http(RPC_URL)
});

async function getLogsWithFallback<T>(params: Parameters<typeof client.getLogs>[0]): Promise<T[]> {
  let lastError: any = null;
  for (const rpcUrl of RPC_FALLBACKS) {
    try {
      const rpcClient = createPublicClient({
        chain: mantleSepolia,
        transport: http(rpcUrl)
      });
      return await rpcClient.getLogs(params) as T[];
    } catch (error) {
      lastError = error;
      console.warn(`⚠️  getLogs failed on ${rpcUrl}:`, (error as Error).message);
    }
  }
  throw lastError || new Error('All RPC endpoints failed for getLogs');
}

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
// @ts-ignore - EmbedAPI may not have proper types
import * as EmbedAPIClient from '@embedapi/core';

interface AgentLike {
  think(prompt: string): Promise<string>;
  execute<T>(action: () => Promise<T>): Promise<T>;
}

class ManualAgent implements AgentLike {
  private embedapi: any | null = null;

  constructor() {
    const apiKey = process.env.EMBEDAPI_KEY;
    if (apiKey) {
      // EmbedAPI uses a default export in CommonJS interop
      this.embedapi = new (EmbedAPIClient as any).default(apiKey);
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
    // Extract only the fields that match the EIP-712 types (must match what frontend signed)
    // Frontend signs with: { name, valuation: BigInt, riskScore: BigInt, mantleDAHash }
    
    // Parse valuation - handle string, number, or BigInt
    let valuationBigInt: bigint;
    try {
      if (typeof assetData.valuation === 'bigint') {
        valuationBigInt = assetData.valuation;
      } else if (typeof assetData.valuation === 'string') {
        valuationBigInt = BigInt(assetData.valuation);
      } else if (typeof assetData.valuation === 'number') {
        valuationBigInt = BigInt(Math.floor(assetData.valuation));
      } else {
        throw new Error(`Invalid valuation type: ${typeof assetData.valuation}`);
      }
    } catch (e) {
      console.error('Error parsing valuation:', e, assetData.valuation);
      valuationBigInt = BigInt(0);
    }

    // Parse riskScore - handle string, number, or BigInt
    let riskScoreBigInt: bigint;
    try {
      if (typeof assetData.riskScore === 'bigint') {
        riskScoreBigInt = assetData.riskScore;
      } else if (typeof assetData.riskScore === 'string') {
        riskScoreBigInt = BigInt(assetData.riskScore);
      } else if (typeof assetData.riskScore === 'number') {
        riskScoreBigInt = BigInt(Math.floor(assetData.riskScore));
      } else {
        throw new Error(`Invalid riskScore type: ${typeof assetData.riskScore}`);
      }
    } catch (e) {
      console.error('Error parsing riskScore:', e, assetData.riskScore);
      riskScoreBigInt = BigInt(0);
    }

    const messageToVerify = {
      name: String(assetData.name || ''),
      valuation: valuationBigInt,
      riskScore: riskScoreBigInt,
      mantleDAHash: String(assetData.mantleDAHash || '0x')
    };

    // Always log for debugging signature issues
    console.log('🔍 Verifying signature:', {
      userAddress,
      messageReceived: {
        name: assetData.name,
        valuation: assetData.valuation,
        valuationType: typeof assetData.valuation,
        riskScore: assetData.riskScore,
        riskScoreType: typeof assetData.riskScore,
        mantleDAHash: assetData.mantleDAHash
      },
      messageToVerify: {
        name: messageToVerify.name,
        valuation: messageToVerify.valuation.toString(),
        riskScore: messageToVerify.riskScore.toString(),
        mantleDAHash: messageToVerify.mantleDAHash
      },
      signature: signature.slice(0, 20) + '...',
      signatureLength: signature.length,
      domain: {
        name: domain.name,
        version: domain.version,
        chainId: domain.chainId,
        verifyingContract: domain.verifyingContract
      }
    });

    const isValid = await verifyTypedData({
      address: userAddress,
      domain,
      types,
      primaryType: 'MintRequest',
      message: messageToVerify,
      signature
    });

    if (!isValid) {
      const errorDetails = {
        userAddress,
        messageReceived: {
          name: assetData.name,
          valuation: assetData.valuation,
          riskScore: assetData.riskScore,
          mantleDAHash: assetData.mantleDAHash
        },
        messageToVerify: {
          name: messageToVerify.name,
          valuation: messageToVerify.valuation.toString(),
          riskScore: messageToVerify.riskScore.toString(),
          mantleDAHash: messageToVerify.mantleDAHash
        },
        domain: {
          name: domain.name,
          version: domain.version,
          chainId: domain.chainId,
          verifyingContract: domain.verifyingContract
        },
        signatureLength: signature.length,
        signaturePrefix: signature.slice(0, 20)
      };

      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Signature verification failed. Details:', errorDetails);
      }

      return reply.code(401).send({ 
        error: "Invalid Signature",
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      });
    }

    // Agent thinks about the request
    await agent.think(`User ${userAddress} wants to mint ${assetData.name}. Verifying risk...`);

    // Analyze risk using EmbedAPI + Claude 3.5 Sonnet
    // Frontend already analyzed the PDF, so we use that data
    let riskData: any;
    
    if (assetData.pdfText && assetData.pdfText.length > 0) {
      // Use AI analysis directly with Claude if PDF text is available
      try {
        const aiAnalysis = await analyzeAssetRisk(
          assetData.pdfText,
          assetData.assetType || 'invoice'
        );
        riskData = {
          risk_score: aiAnalysis.riskScore || parseInt(assetData.riskScore?.toString() || '15'),
          valuation: parseInt(assetData.valuation?.toString() || '150000'),
          asset_type: assetData.assetType || 'invoice',
          extracted_data: {
            reasoning: aiAnalysis.reasoning,
            confidence: aiAnalysis.confidence
          },
          confidence: aiAnalysis.confidence
        };
      } catch (error) {
        console.warn('AI analysis failed, using provided risk data:', error);
        // Fallback: Use the risk data from frontend analysis
        riskData = {
          risk_score: parseInt(assetData.riskScore?.toString() || '15'),
          valuation: parseInt(assetData.valuation?.toString() || '150000'),
          asset_type: assetData.assetType || 'invoice',
          extracted_data: {},
          confidence: 0.85
        };
      }
    } else {
      // No PDF text - use the risk data already provided by frontend
      // Frontend already analyzed the PDF, so we trust that data
      riskData = {
        risk_score: parseInt(assetData.riskScore?.toString() || '15'),
        valuation: parseInt(assetData.valuation?.toString() || '150000'),
        asset_type: assetData.assetType || 'invoice',
        extracted_data: {},
        confidence: 0.85
      };
      
      console.log('📊 Using frontend-provided risk data (no PDF text for re-analysis):', {
        risk_score: riskData.risk_score,
        valuation: riskData.valuation
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
    // IMPORTANT: The contract expects the signature to be from the AI Oracle (agent)
    // But the user signed the message. We need to create a new signature from the agent
    // that includes the user's address as the minter.
    const txHash = await agent.execute(async () => {
      if (!CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS not set');
      }
      
      // The contract's EIP-712 struct includes 'address minter'
      // We need to sign with the agent's key, including userAddress as minter
      const { privateKeyToAccount } = await import('viem/accounts');
      
      if (!AGENT_PK) {
        throw new Error('AGENT_PK not set');
      }

      const normalizedAgentPk = normalizePrivateKey(AGENT_PK);
      const agentAccount = privateKeyToAccount(normalizedAgentPk);
      
      // Create EIP-712 domain (must match frontend)
      const domain = {
        name: 'MantleForge',
        version: '1',
        chainId: CHAIN_ID,
        verifyingContract: CONTRACT_ADDRESS as `0x${string}`
      };
      
      // Contract expects: MintRequest(string name,uint256 valuation,uint256 riskScore,string mantleDAHash,address minter)
      const types = {
        MintRequest: [
          { name: 'name', type: 'string' },
          { name: 'valuation', type: 'uint256' },
          { name: 'riskScore', type: 'uint256' },
          { name: 'mantleDAHash', type: 'string' },
          { name: 'minter', type: 'address' }
        ]
      };
      
      // NOTE: Contract uses msg.sender as `minter` inside the struct hash.
      // Since the agent is the caller, minter must be the agent address here.
      const message = {
        name: assetData.name,
        valuation: BigInt(assetData.valuation || riskData.valuation),
        riskScore: BigInt(riskData.risk_score),
        mantleDAHash: mantleDAHash,
        minter: agentAccount.address
      };
      
      // Sign with agent's key
      const agentSignature = await agentAccount.signTypedData({
        domain,
        types,
        primaryType: 'MintRequest',
        message
      });
      
      // Mint the asset with agent's signature
      return await mintRWA(
        assetData.name,
        BigInt(assetData.valuation || riskData.valuation),
        riskData.risk_score,
        mantleDAHash,
        agentSignature
      );
    });

    const txUrl = `${EXPLORER_BASE_URL}/tx/${txHash}`;

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

      // Save mint history
      try {
        await addMintHistory({
          userAddress,
          txHash,
          txUrl,
          assetName: assetData.name,
          valuation: Number(assetData.valuation || riskData.valuation),
          riskScore: riskData.risk_score,
          mantleDAHash: mantleDAHash
        });
      } catch (error) {
        console.warn('Failed to add mint history:', error);
      }
    }

    return {
      txHash,
      txUrl,
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
    
    // TODO: Re-enable when SDK import is fixed
    // const gasCost = await estimateTotalGasCost(RPC_URL, {
    //   to: to as `0x${string}`,
    //   data: data as `0x${string}`
    // });

    // Mock gas cost for now (standard transaction)
    const gasCost = BigInt(21000);

    return {
      gasCost: gasCost.toString(),
      network: 'Mantle Testnet',
      chainId: CHAIN_ID
    };
  } catch (error: any) {
    return reply.code(500).send({ error: error.message });
  }
});

// Mint history endpoint
server.get('/api/mint-history/:userAddress', async (request, reply) => {
  try {
    const { userAddress } = request.params as { userAddress: string };
    const { limit } = request.query as { limit?: string };
    const parsedLimit = limit ? Math.min(Math.max(parseInt(limit, 10), 1), 100) : 20;

    try {
      const items = await getMintHistory(userAddress, parsedLimit);
      return { items, source: 'firestore' };
    } catch (error) {
      // Fallback: query on-chain events directly
      const eventAbi = parseAbiItem('event AssetMinted(uint256 indexed id, string name, uint256 valuation, uint256 risk, address indexed owner)');
      const logs = await getLogsWithFallback({
        address: CONTRACT_ADDRESS as `0x${string}`,
        event: eventAbi,
        args: { owner: userAddress as `0x${string}` },
        fromBlock: 0n
      });

      const items = logs.slice(-parsedLimit).map((log) => {
        const args = log.args as any;
        return {
          id: `${log.transactionHash}-${log.logIndex}`,
          txHash: log.transactionHash,
          txUrl: `${EXPLORER_BASE_URL}/tx/${log.transactionHash}`,
          assetName: args.name,
          valuation: Number(args.valuation),
          riskScore: Number(args.risk),
          mantleDAHash: '0x',
          blockNumber: Number(log.blockNumber)
        };
      }).reverse();

      return { items, source: 'onchain' };
    }
  } catch (error: any) {
    return reply.code(500).send({ error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    // Setup CORS before starting server
    await setupCORS(server);
    
    await server.listen({ port: PORT, host: '0.0.0.0' });
    
    console.log(`🤖 MantleForge Backend running on port ${PORT}`);
    console.log(`📡 Connected to: ${RPC_URL} (Chain ID: ${CHAIN_ID})`);
    console.log(`⚠️  Agent SDK: Using manual implementation (SDK not available)`);
    console.log(`✅ CORS enabled - accepting requests from all origins`);
    
    // Start Risk Sentinel if enabled
    if (process.env.ENABLE_RISK_SENTINEL !== 'false') {
      try {
        startRiskSentinel();
        console.log(`🛡️  Risk Sentinel: Enabled`);
      } catch (error) {
        console.warn('⚠️  Failed to start Risk Sentinel:', error);
      }
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Start server with error handling
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

