import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  let contractAddress = process.env.CONTRACT_ADDRESS;
  let agentAddress = process.env.AGENT_ADDRESS;
  
  // If AGENT_ADDRESS not set, derive from AGENT_PK
  if (!agentAddress && process.env.AGENT_PK) {
    // Clean up AGENT_PK (remove any extra text)
    let pk = process.env.AGENT_PK.trim();
    // Extract just the private key (64 hex chars)
    const pkMatch = pk.match(/^(0x)?([a-fA-F0-9]{64})/);
    if (pkMatch) {
      pk = pkMatch[1] ? pkMatch[0] : '0x' + pkMatch[2];
      const wallet = new ethers.Wallet(pk);
      agentAddress = wallet.address;
      console.log(`📝 Derived Agent address from AGENT_PK: ${agentAddress}`);
    }
  }
  
  // Also try to extract from AGENT_ADDRESS if it's in the same line
  if (!agentAddress && process.env.AGENT_ADDRESS) {
    const addrMatch = process.env.AGENT_ADDRESS.match(/(0x[a-fA-F0-9]{40})/);
    if (addrMatch) {
      agentAddress = addrMatch[1];
    }
  }
  
  if (!contractAddress) {
    console.error("❌ Missing CONTRACT_ADDRESS in .env");
    console.error("   Add CONTRACT_ADDRESS=0x...contract_address to contracts/.env");
    process.exit(1);
  }
  
  if (!agentAddress) {
    console.error("❌ Missing AGENT_ADDRESS or AGENT_PK in .env");
    console.error("   Add AGENT_ADDRESS=0x...your_agent_wallet_address to contracts/.env");
    process.exit(1);
  }
  
  // Use the known agent address
  agentAddress = "0xC98F8CA35Af8B97910bca50E6351321a7955D45e";

  console.log(`🔐 Granting AI_ORACLE_ROLE to ${agentAddress}...`);
  
  const Factory = await ethers.getContractAt("MantleForgeFactory", contractAddress);
  const AI_ORACLE_ROLE = await Factory.AI_ORACLE_ROLE();
  
  const tx = await Factory.grantRole(AI_ORACLE_ROLE, agentAddress);
  console.log(`   Transaction: ${tx.hash}`);
  await tx.wait();
  
  const hasRole = await Factory.hasRole(AI_ORACLE_ROLE, agentAddress);
  if (hasRole) {
    console.log(`✅ Successfully granted AI_ORACLE_ROLE to ${agentAddress}`);
  } else {
    console.error(`❌ Failed to grant role`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
