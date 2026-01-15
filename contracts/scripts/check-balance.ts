import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY not set in contracts/.env");
    process.exit(1);
  }
  
  const pk = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
  const wallet = new ethers.Wallet(pk, provider);
  const address = wallet.address;
  const balance = await provider.getBalance(address);
  
  console.log(`📊 Deployment Wallet: ${address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} MNT`);
  console.log(`🔗 View on Explorer: https://sepolia.mantlescan.xyz/address/${address}`);
  
  if (balance === 0n) {
    console.log("\n⚠️  Wallet has 0 MNT!");
    console.log("   Get testnet MNT from: https://faucet.sepolia.mantle.xyz");
  } else if (balance < ethers.parseEther("0.1")) {
    console.log("\n⚠️  Low balance! You need at least 0.1 MNT for deployment.");
  } else {
    console.log("\n✅ Wallet has sufficient balance for deployment!");
  }
}

main().catch(console.error);

