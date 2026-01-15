# ⚡ QUICK FIX - Deployment Issue

## Problem
Deployment wallet has 0 MNT on Mantle Sepolia testnet.

## Solution (2 minutes)

1. **Fund wallet:**
   - Go to: https://faucet.sepolia.mantle.xyz
   - Address: `0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac`
   - Request MNT

2. **Deploy:**
   ```bash
   cd contracts
   npm run deploy:testnet
   ```

3. **Copy contract address and update .env files**

4. **Grant role:**
   ```bash
   # Add to contracts/.env: AGENT_ADDRESS=0xC98F8CA35Af8B97910bca50E6351321a7955D45e
   npx hardhat run scripts/grant-role.ts --network mantleTestnet
   ```

5. **Test:**
   ```bash
   ./scripts/start-dev.sh
   ```

**That's it!** 🚀
