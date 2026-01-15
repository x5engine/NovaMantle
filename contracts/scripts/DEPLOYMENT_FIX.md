# 🔧 Deployment Fix

## Current Status

✅ Contract compiled successfully
✅ Agent wallet found: `0xC98F8CA35Af8B97910bca50E6351321a7955D45e`
❌ Deployment wallet has 0 MNT: `0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac`

## Fix: Fund Deployment Wallet

**Your deployment wallet needs testnet MNT:**

1. Go to: https://faucet.sepolia.mantle.xyz
2. Enter address: `0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac`
3. Request testnet MNT
4. Wait for confirmation
5. Run deployment again

**OR** if you have MNT in a different wallet:
- Send MNT from that wallet to: `0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac`

## After Funding

```bash
cd contracts
npm run deploy:testnet
```

## Check Balance

```bash
npx hardhat run scripts/check-balance.ts --network mantleTestnet
```

