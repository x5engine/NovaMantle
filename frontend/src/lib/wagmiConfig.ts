/**
 * Wagmi Configuration for Mantle Network
 * Used with Privy for wallet connection
 */
import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

// Define Mantle Sepolia chain (testnet)
export const mantleSepolia = defineChain({
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

// Define Mantle Mainnet chain
export const mantleMainnet = defineChain({
  id: 17000,
  name: 'Mantle',
  network: 'mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantlescan',
      url: 'https://mantlescan.xyz',
    },
  },
  testnet: false,
});

// Wagmi config - Privy will handle wallet connection
// IMPORTANT: Do NOT add connectors here - Privy manages them
export const config = createConfig({
  chains: [mantleSepolia, mantleMainnet],
  transports: {
    [mantleSepolia.id]: http(),
    [mantleMainnet.id]: http(),
  },
  // Disable auto-connect to prevent MetaMask from auto-connecting
  ssr: false,
});
