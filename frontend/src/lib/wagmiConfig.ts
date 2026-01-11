/**
 * Wagmi Configuration for Mantle Network
 * Used with Privy for wallet connection
 */
import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

// Define Mantle Sepolia chain
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

// Wagmi config (Privy will handle wallet connection)
export const config = createConfig({
  chains: [mantleSepolia],
  transports: {
    [mantleSepolia.id]: http(),
  },
});

