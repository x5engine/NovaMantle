/**
 * viem Client Setup for Mantle Network
 */
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { mantleSepolia } from 'viem/chains';

// Configuration
const RPC_URL = import.meta.env.VITE_MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
const CHAIN_ID = parseInt(import.meta.env.VITE_MANTLE_CHAIN_ID || '5003');

// Public client for reading from blockchain
export const publicClient = createPublicClient({
  chain: mantleSepolia,
  transport: http(RPC_URL)
});

// Wallet client factory
export function createWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet found');
  }

  return createWalletClient({
    chain: mantleSepolia,
    transport: custom(window.ethereum)
  });
}

// EIP-712 Domain (must match backend)
export const eip712Domain = {
  name: 'MantleForge',
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`
} as const;

export const eip712Types = {
  MintRequest: [
    { name: 'name', type: 'string' },
    { name: 'valuation', type: 'uint256' },
    { name: 'riskScore', type: 'uint256' },
    { name: 'mantleDAHash', type: 'string' }
  ]
} as const;

