import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MantleForge RWA Factory...");

  // --- CONFIGURATION ---
  // 1. The Oracle (Your Hetzner Server Wallet Address)
  const ORACLE_ADDRESS = "YOUR_HETZNER_WALLET_ADDRESS"; 
  
  // 2. Ondo USDY Address (Official Mantle Mainnet)
  // NOTE: On Testnet, deploy a mock USDY first! 
  // Mainnet: 0x5bE26527e817999639B563495F53bb94D253d891
  const USDY_ADDRESS = "0x5bE26527e817999639B563495F53bb94D253d891"; 

  // --- DEPLOY ---
  const Factory = await ethers.getContractFactory("MantleForgeFactory");
  const factory = await Factory.deploy(USDY_ADDRESS, ORACLE_ADDRESS);

  await factory.waitForDeployment();
  const address = await factory.getAddress();

  console.log(`✅ Deployment Successful!`);
  console.log(`📍 Contract Address: ${address}`);
  console.log(`🔗 View on Explorer: https://explorer.mantle.xyz/address/${address}`);
  
  console.log("\n⚠️ NEXT STEPS:");
  console.log("1. Add this address to your Hetzner .env file.");
  console.log("2. Verify contract: npx hardhat verify --network mantle " + address + " " + USDY_ADDRESS + " " + ORACLE_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});