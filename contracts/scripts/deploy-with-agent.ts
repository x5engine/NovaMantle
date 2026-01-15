import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Alternative deployment script using Agent wallet
 * Use this if deployment wallet doesn't have MNT
 */
async function main() {
  console.log("🚀 Deploying MantleForge RWA Factory using Agent wallet...");

  const network = await ethers.provider.getNetwork();
  const isTestnet = network.chainId === BigInt(5003);
  
  // Get Agent wallet from backend/.env
  let agentPk = process.env.AGENT_PK;
  
  if (!agentPk) {
    // Try to read from backend/.env
    const fs = require("fs");
    const path = require("path");
    const backendEnvPath = path.join(__dirname, "../backend/.env");
    try {
      if (fs.existsSync(backendEnvPath)) {
        const backendEnv = fs.readFileSync(backendEnvPath, "utf8");
        const match = backendEnv.match(/AGENT_PK=(0x?[a-fA-F0-9]+)/);
        if (match) {
          agentPk = match[1];
        }
      }
    } catch (e) {
      // Ignore
    }
  }
  
  if (!agentPk) {
    throw new Error("❌ AGENT_PK must be set in contracts/.env or backend/.env");
  }
  
  const pk = agentPk.startsWith('0x') ? agentPk : '0x' + agentPk;
  const agentWallet = new ethers.Wallet(pk);
  const agentAddress = agentWallet.address;
  
  console.log(`🔑 Using Agent wallet: ${agentAddress}`);
  
  // Check balance
  const provider = new ethers.JsonRpcProvider(
    isTestnet ? "https://rpc.sepolia.mantle.xyz" : "https://rpc.mantle.xyz"
  );
  const balance = await provider.getBalance(agentAddress);
  console.log(`💰 Agent wallet balance: ${ethers.formatEther(balance)} MNT`);
  
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ Agent wallet doesn't have enough MNT for deployment");
  }
  
  // Connect wallet to provider
  const signer = agentWallet.connect(provider);
  
  // Oracle address is the Agent wallet itself
  const ORACLE_ADDRESS = agentAddress;
  
  // USDY address (zero for testnet is okay)
  const USDY_ADDRESS = isTestnet 
    ? (process.env.USDY_ADDRESS || "0x0000000000000000000000000000000000000000")
    : (process.env.USDY_ADDRESS || "0x5bE26527e817999639B563495F53bb94D253d891");
  
  console.log(`📡 Network: ${isTestnet ? 'Mantle Testnet' : 'Mantle Mainnet'} (Chain ID: ${network.chainId})`);
  console.log(`🔑 Oracle Address: ${ORACLE_ADDRESS}`);
  console.log(`💰 USDY Address: ${USDY_ADDRESS}`);
  
  // Deploy
  const Factory = await ethers.getContractFactory("MantleForgeFactory", signer);
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
  
  console.log("\n⚠️  NOTE: Agent wallet is now the Oracle (has AI_ORACLE_ROLE)");
  console.log("\n⚠️  NEXT STEPS:");
  console.log("1. Add CONTRACT_ADDRESS=" + address + " to backend/.env");
  console.log("2. Add VITE_CONTRACT_ADDRESS=" + address + " to frontend/.env");
  console.log("3. Agent wallet already has AI_ORACLE_ROLE (granted in constructor)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

