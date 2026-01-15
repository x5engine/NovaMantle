import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
  const address = "0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac";
  
  console.log(`📊 Checking balances for: ${address}\n`);
  
  // Check native balance
  const nativeBalance = await provider.getBalance(address);
  console.log(`💰 Native MNT Balance: ${ethers.formatEther(nativeBalance)} MNT`);
  console.log(`   (in Wei: ${nativeBalance.toString()})\n`);
  
  // Check if SepoliaMNT is a token (ERC-20)
  // Common SepoliaMNT token addresses on Mantle Sepolia
  const possibleTokenAddresses = [
    "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000", // Predeployed MNT
  ];
  
  for (const tokenAddr of possibleTokenAddresses) {
    try {
      const token = new ethers.Contract(
        tokenAddr,
        ["function balanceOf(address) view returns (uint256)", "function symbol() view returns (string)"],
        provider
      );
      const balance = await token.balanceOf(address);
      const symbol = await token.symbol();
      if (balance > 0n) {
        console.log(`🪙 ${symbol} Token Balance: ${ethers.formatEther(balance)} ${symbol}`);
        console.log(`   Token Address: ${tokenAddr}`);
      }
    } catch (e) {
      // Token doesn't exist or error
    }
  }
  
  // Check transaction count
  const txCount = await provider.getTransactionCount(address);
  console.log(`\n📝 Transaction Count: ${txCount}`);
  
  // Check if wallet has been used
  if (txCount > 0) {
    console.log(`✅ Wallet has been used (${txCount} transactions)`);
  } else {
    console.log(`⚠️  Wallet has never been used`);
  }
  
  console.log(`\n🔗 View on Explorer: https://sepolia.mantlescan.xyz/address/${address}`);
  
  if (nativeBalance === 0n && txCount === 0) {
    console.log("\n⚠️  Wallet appears empty. If you have SepoliaMNT, it might be:");
    console.log("   1. A wrapped token (check token balances above)");
    console.log("   2. On a different network");
    console.log("   3. Need to wait for RPC sync");
  }
}

main().catch(console.error);

