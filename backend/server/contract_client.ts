/**
 * Contract Client
 * Handles smart contract interactions
 */
import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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

const RPC_URL = process.env.RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`;
let AGENT_PK = process.env.AGENT_PK;

if (!AGENT_PK) {
  throw new Error('AGENT_PK not set in environment variables');
}

// Clean and format private key
AGENT_PK = AGENT_PK.trim();
// Remove any newlines or extra characters
AGENT_PK = AGENT_PK.split('\n')[0].split(' ')[0];
// Ensure private key has 0x prefix
if (!AGENT_PK.startsWith('0x')) {
  AGENT_PK = `0x${AGENT_PK}`;
}

// Validate private key length (should be 66 chars with 0x prefix = 64 hex chars)
if (AGENT_PK.length !== 66) {
  throw new Error(`Invalid AGENT_PK length: ${AGENT_PK.length}. Expected 66 characters (0x + 64 hex chars)`);
}

// Create account from private key
let account;
try {
  account = privateKeyToAccount(AGENT_PK as `0x${string}`);
} catch (error: any) {
  throw new Error(`Failed to create account from AGENT_PK: ${error.message}. PK length: ${AGENT_PK.length}, starts with 0x: ${AGENT_PK.startsWith('0x')}`);
}

// Create clients
export const publicClient = createPublicClient({
  chain: mantleSepolia,
  transport: http(RPC_URL)
});

export const walletClient = createWalletClient({
  account,
  chain: mantleSepolia,
  transport: http(RPC_URL)
});

// Load contract ABI
let contractABI: any[] = [];

export function loadContractABI(): any[] {
  if (contractABI.length > 0) {
    return contractABI;
  }

  // Try to load from artifacts
  // Get __dirname equivalent for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const artifactsPath = path.join(__dirname, '../../contracts/artifacts/contracts/MantleForgeFactory.sol/MantleForgeFactory.json');
  
  if (fs.existsSync(artifactsPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf-8'));
    contractABI = artifact.abi;
    console.log('✅ Contract ABI loaded from artifacts');
  } else {
    // Fallback: use minimal ABI for mintRWA
    contractABI = [
      {
        inputs: [
          { name: '_name', type: 'string' },
          { name: '_valuation', type: 'uint256' },
          { name: '_riskScore', type: 'uint256' },
          { name: '_mantleDAHash', type: 'string' },
          { name: '_signature', type: 'bytes' }
        ],
        name: 'mintRWA',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          { name: '_id', type: 'uint256' },
          { name: '_newRisk', type: 'uint256' }
        ],
        name: 'updateAssetRisk',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ];
    console.log('⚠️  Using minimal ABI (contract artifacts not found)');
  }

  return contractABI;
}

/**
 * Mint RWA asset
 */
export async function mintRWA(
  name: string,
  valuation: bigint,
  riskScore: number,
  mantleDAHash: string,
  signature: `0x${string}`
): Promise<`0x${string}`> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS not set');
  }

  const abi = loadContractABI();
  
  try {
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'mintRWA',
      args: [name, valuation, BigInt(riskScore), mantleDAHash, signature],
      value: 0n, // Explicitly set value to 0 (nonpayable function)
      gas: undefined // Let viem estimate gas automatically
    });

    console.log(`✅ Mint transaction sent: ${hash}`);
    return hash;
  } catch (error: any) {
    console.error('❌ Failed to mint RWA:', error.message);
    throw error;
  }
}

/**
 * Update asset risk score
 */
export async function updateAssetRisk(
  assetId: bigint,
  newRisk: number
): Promise<`0x${string}`> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS not set');
  }

  const abi = loadContractABI();
  
  try {
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'updateAssetRisk',
      args: [assetId, BigInt(newRisk)]
    });

    console.log(`✅ Risk update transaction sent: ${hash}`);
    return hash;
  } catch (error: any) {
    console.error('❌ Failed to update risk:', error.message);
    throw error;
  }
}

