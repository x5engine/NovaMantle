/**
 * Configuration management
 */
import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Mantle Network
  rpcUrl: process.env.RPC_URL || 'https://rpc.sepolia.mantle.xyz',
  chainId: parseInt(process.env.MANTLE_CHAIN_ID || '5003'),
  contractAddress: process.env.CONTRACT_ADDRESS || '',

  // Agent
  agentPk: process.env.AGENT_PK || '',
  
  // AI/LLM (EmbedAPI with Claude)
  embedapiKey: process.env.EMBEDAPI_KEY || '',

  // Services
  pythonSaaSUrl: process.env.PYTHON_SAAS_URL || 'http://localhost:5000',
  mantleDAEndpoint: process.env.MANTLE_DA_ENDPOINT || 'https://da.mantle.xyz',

  // Firebase
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json',
};

// Validation
if (!config.agentPk) {
  console.warn('⚠️  AGENT_PK not set in environment variables');
}

if (!config.contractAddress) {
  console.warn('⚠️  CONTRACT_ADDRESS not set in environment variables');
}

if (!config.embedapiKey) {
  console.warn('⚠️  EMBEDAPI_KEY not set. AI analysis will not work.');
}

