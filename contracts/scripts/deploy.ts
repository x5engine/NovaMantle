import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying MantleForge RWA Factory...");

  // --- CONFIGURATION ---
  const network = await ethers.provider.getNetwork();
  const isTestnet = network.chainId === BigInt(5003);
  
  // 1. The Oracle (Agent wallet address - from .env or parameter)
  const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || process.env.AGENT_PK 
    ? ethers.computeAddress(`0x${process.env.AGENT_PK}`) 
    : "0x0000000000000000000000000000000000000000";
  
  if (ORACLE_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("ORACLE_ADDRESS or AGENT_PK must be set in .env");
  }
  
  // 2. Ondo USDY Address
  // Testnet: Use a mock address or deploy mock token first
  // Mainnet: 0x5bE26527e817999639B563495F53bb94D253d891
  const USDY_ADDRESS = isTestnet 
    ? (process.env.USDY_ADDRESS || "0x0000000000000000000000000000000000000000")
    : (process.env.USDY_ADDRESS || "0x5bE26527e817999639B563495F53bb94D253d891");
  
  if (USDY_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.warn("⚠️  USDY_ADDRESS not set. Using zero address (will need to update later).");
  }

  console.log(`📡 Network: ${isTestnet ? 'Mantle Testnet' : 'Mantle Mainnet'} (Chain ID: ${network.chainId})`);
  console.log(`🔑 Oracle Address: ${ORACLE_ADDRESS}`);
  console.log(`💰 USDY Address: ${USDY_ADDRESS}`);

  // --- DEPLOY ---
  const Factory = await ethers.getContractFactory("MantleForgeFactory");
  console.log("📦 Deploying contract...");
  
  const factory = await Factory.deploy(USDY_ADDRESS, ORACLE_ADDRESS);
  await factory.waitForDeployment();
  const address = await factory.getAddress();

  console.log(`\n✅ Deployment Successful!`);
  console.log(`📍 Contract Address: ${address}`);
  
  const explorerUrl = isTestnet
    ? `https://sepolia.mantlescan.xyz/address/${address}`
    : `https://explorer.mantle.xyz/address/${address}`;
  console.log(`🔗 View on Explorer: ${explorerUrl}`);
  
  console.log("\n⚠️  NEXT STEPS:");
  console.log("1. Add CONTRACT_ADDRESS=" + address + " to your backend .env file");
  console.log("2. Add CONTRACT_ADDRESS=" + address + " to your frontend .env file");
  console.log("3. Verify contract:");
  console.log(`   npx hardhat verify --network ${isTestnet ? 'mantleTestnet' : 'mantle'} ${address} ${USDY_ADDRESS} ${ORACLE_ADDRESS}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});