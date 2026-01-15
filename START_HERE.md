# 🚨 START HERE - 2 DAYS TO DEMO!

## ✅ STEP 1: API KEYS - **DONE!**

1. **EmbedAPI Key** ✅ DONE
2. **Privy App ID** ✅ DONE  
3. **Agent Wallet** ✅ DONE (account has 999 MNT, address: `0xC98F8CA35Af8B97910bca50E6351321a7955D45e`)
4. **Deployment Wallet** ✅ DONE (has 448 MNT on Mantle Sepolia)

---

## ✅ STEP 2: CONTRACT DEPLOYED - **DONE!**

### Contract Details
- **Address:** `0x3224870fe1ce2F729bEe585Caf54632fC92aa638`
- **Network:** Mantle Sepolia Testnet (Chain ID: 5003)
- **Explorer:** https://sepolia.mantlescan.xyz/address/0x3224870fe1ce2F729bEe585Caf54632fC92aa638
- **Status:** ✅ Deployed and configured

### Environment Variables Updated
- ✅ `backend/.env`: `CONTRACT_ADDRESS=0x3224870fe1ce2F729bEe585Caf54632fC92aa638`
- ✅ `frontend/.env`: `VITE_CONTRACT_ADDRESS=0x3224870fe1ce2F729bEe585Caf54632fC92aa638`
- ✅ `contracts/.env`: `CONTRACT_ADDRESS=0x3224870fe1ce2F729bEe585Caf54632fC92aa638`

---

## 🔐 STEP 3: GRANT ORACLE ROLE - **IN PROGRESS**

**CRITICAL - Do this immediately!**

```bash
cd contracts
npx hardhat run scripts/grant-role.ts --network mantleTestnet
```

**This is required for minting to work!**

---

## 🧪 STEP 4: TEST EVERYTHING

```bash
# Terminal 1: Python SaaS
cd python-saas
source venv/bin/activate
python app.py

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

**Test Flow:**
1. Open http://localhost:5173
2. Connect wallet (Privy email)
3. Upload PDF
4. See AI analysis
5. Sign EIP-712 message
6. Mint asset
7. See ticker update

**If all 7 steps work → YOU'RE READY! 🎉**

---

## 📋 CURRENT STATUS

- ✅ API Keys configured
- ✅ Agent wallet ready (999 MNT)
- ✅ Contract compiled
- ✅ Contract deployed
- ✅ Environment variables updated
- ⏳ **In Progress**: Grant Oracle role
- ⏳ **Pending**: Test full flow

---

## 📊 All Important Data Saved

**See:** `.workspace/DEPLOYMENT_DATA.md` for complete deployment information including:
- Contract address
- Wallet addresses and balances
- Roles and permissions
- Network configuration
- Environment variables
- Important links

**Quick Reference:** `.workspace/QUICK_REFERENCE.md`

---

## 🆘 QUICK FIXES

**"Oracle role not granted"**
- Run: `cd contracts && npx hardhat run scripts/grant-role.ts --network mantleTestnet`
- Make sure `CONTRACT_ADDRESS` and `AGENT_PK` are in `contracts/.env`

**"Contract deployment fails"**
- Check wallet has MNT on Mantle Sepolia (L2)
- Check PRIVATE_KEY is correct in contracts/.env

**"Minting fails"**
- Make sure AI_ORACLE_ROLE was granted to Agent wallet
- Check Agent wallet has MNT for gas

---

## 📚 DETAILED GUIDES

- **Deployment Data**: `.workspace/DEPLOYMENT_DATA.md` ⭐ **SAVE THIS!**
- **Quick Reference**: `.workspace/QUICK_REFERENCE.md`
- **Full Plan**: `.workspace/2_DAY_ACTION_PLAN.md`
- **Next Steps**: `.workspace/NEXT_STEPS_AFTER_DEPLOY.md`

---

## ⏰ TIME LEFT: 2 DAYS

**Today:**
- Grant Oracle role: 2 min
- Test: 1 hour
- **Total: ~1 hour**

**Tomorrow:**
- Final testing: 1 hour
- Demo prep: 1 hour
- **Total: ~2 hours**

---

**FOCUS: Grant Role → Test → Demo! 🏆**

**You've got this! 🚀**
