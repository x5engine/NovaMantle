/**
 * Contract Client
 * Handles smart contract interactions
 */
import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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
const AGENT_PK = process.env.AGENT_PK as `0x${string}`;

if (!AGENT_PK) {
  throw new Error('AGENT_PK not set in environment variables');
}

// Create account from private key
const account = privateKeyToAccount(AGENT_PK);

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
      args: [name, valuation, BigInt(riskScore), mantleDAHash, signature]
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

