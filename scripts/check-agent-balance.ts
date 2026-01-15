/**
 * Check Agent Wallet Balance on Mantle Sepolia
 */
import { createPublicClient, http, defineChain } from 'viem';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.join(__dirname, '../backend/.env');
dotenv.config({ path: envPath });

const AGENT_ADDRESS = process.env.AGENT_ADDRESS || '0xC98F8CA35Af8B97910bca50E6351321a7955D45e';
const RPC_URL = process.env.RPC_URL || 'https://rpc.sepolia.mantle.xyz';

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
      http: [RPC_URL],
    },
  },
});

const client = createPublicClient({
  chain: mantleSepolia,
  transport: http(),
});

async function checkBalance() {
  try {
    console.log('🔍 Checking Agent Wallet Balance...');
    console.log('Address:', AGENT_ADDRESS);
    console.log('Network: Mantle Sepolia (Chain ID: 5003)');
    console.log('RPC:', RPC_URL);
    console.log('');

    const balance = await client.getBalance({
      address: AGENT_ADDRESS as `0x${string}`,
    });

    const balanceInMNT = Number(balance) / 1e18;
    
    console.log('═══════════════════════════════════════');
    console.log('💰 Agent Wallet Balance:');
    console.log(`   ${balance.toString()} wei`);
    console.log(`   ${balanceInMNT.toFixed(6)} MNT`);
    console.log('═══════════════════════════════════════');
    console.log('');

    // Estimate gas cost for mintRWA (rough estimate)
    const estimatedGas = 500000n; // ~500k gas for mintRWA
    const gasPrice = await client.getGasPrice();
    const estimatedCost = estimatedGas * gasPrice;
    const estimatedCostInMNT = Number(estimatedCost) / 1e18;

    console.log('⛽ Estimated Gas Cost for mintRWA:');
    console.log(`   Gas: ~${estimatedGas.toString()}`);
    console.log(`   Gas Price: ${gasPrice.toString()} wei`);
    console.log(`   Total Cost: ~${estimatedCostInMNT.toFixed(6)} MNT`);
    console.log('');

    if (balance < estimatedCost) {
      console.log('❌ INSUFFICIENT FUNDS!');
      console.log(`   Need: ~${estimatedCostInMNT.toFixed(6)} MNT`);
      console.log(`   Have: ${balanceInMNT.toFixed(6)} MNT`);
      console.log(`   Shortfall: ~${(estimatedCostInMNT - balanceInMNT).toFixed(6)} MNT`);
      console.log('');
      console.log('💡 Solution:');
      console.log('   1. Bridge MNT from Sepolia (L1) to Mantle Sepolia (L2)');
      console.log('      https://bridge.testnet.mantle.xyz');
      console.log('   2. Or use Mantle Sepolia Faucet:');
      console.log('      https://faucet.sepolia.mantle.xyz');
      console.log('   3. Send MNT to Agent wallet:', AGENT_ADDRESS);
    } else {
      console.log('✅ Sufficient funds for minting!');
      console.log(`   Available: ${balanceInMNT.toFixed(6)} MNT`);
      console.log(`   Estimated cost: ~${estimatedCostInMNT.toFixed(6)} MNT`);
    }

    console.log('');
    console.log('🔗 Explorer:');
    console.log(`   https://sepolia.mantlescan.xyz/address/${AGENT_ADDRESS}`);
  } catch (error: any) {
    console.error('❌ Error checking balance:', error.message);
    process.exit(1);
  }
}

checkBalance();

