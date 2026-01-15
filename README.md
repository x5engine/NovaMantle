# 🏭 MantleForge - The Gamified RWA Orchestrator

> Turn Real-World Assets into Liquid Yield with Arcade-Speed Execution

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.10+
- Git
- Firebase CLI (for deployment)

### 1. Clone & Setup
```bash
git clone <your-repo>
cd novamantle
./scripts/setup-local.sh
```

### 2. Configure Environment
```bash
# Backend
cp backend/.env.example backend/.env
# Add: EMBEDAPI_KEY, AGENT_PK, CONTRACT_ADDRESS

# Frontend  
cp frontend/.env.example frontend/.env
# Add: VITE_PRIVY_APP_ID, VITE_CONTRACT_ADDRESS

# Contracts
cp contracts/.env.example contracts/.env
# Add: PRIVATE_KEY, ETHERSCAN_API_KEY (optional)
```

### 3. Start Development
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

Or use the convenience script:
```bash
./scripts/start-dev.sh
```

---

## 📊 Deployment Information

### 🏗️ Smart Contract

**MantleForgeFactory Contract**
- **Address:** `0x3224870fe1ce2F729bEe585Caf54632fC92aa638`
- **Network:** Mantle Sepolia Testnet (Chain ID: 5003)
- **Explorer:** https://sepolia.mantlescan.xyz/address/0x3224870fe1ce2F729bEe585Caf54632fC92aa638
- **Status:** ✅ Deployed and Active

**Contract Configuration:**
- **USDY Address:** `0x0000000000000000000000000000000000000000` (Zero address - testnet)
- **Treasury:** `0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac` (Deployment wallet)
- **AI Oracle Role:** Granted to Agent wallet ✅

### 👤 Wallets & Accounts

**1. Deployment Wallet (Deployer)**
- **Address:** `0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac`
- **Balance:** 448 MNT (Mantle Sepolia)
- **Purpose:** Contract deployment, treasury, ADMIN_ROLE
- **Explorer:** https://sepolia.mantlescan.xyz/address/0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac

**2. Agent Wallet (AI Oracle)**
- **Address:** `0xC98F8CA35Af8B97910bca50E6351321a7955D45e`
- **Balance:** 999 MNT (Mantle Sepolia)
- **Purpose:** AI Oracle role, signs EIP-712 messages, pays gas for gasless transactions
- **Explorer:** https://sepolia.mantlescan.xyz/address/0xC98F8CA35Af8B97910bca50E6351321a7955D45e
- **Role:** `AI_ORACLE_ROLE` ✅ GRANTED
- **Grant Transaction:** `0xecffb5e04bd26fa2317ec662f7e4a72a06022554127008f70cf389beef8cdf3a`

### 🔐 Roles & Permissions

- **AI_ORACLE_ROLE:** `0xC98F8CA35Af8B97910bca50E6351321a7955D45e` ✅ ACTIVE
- **ADMIN_ROLE:** `0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac` ✅ ACTIVE

### 🌐 Network Configuration

**Mantle Sepolia Testnet**
- **RPC URL:** `https://rpc.sepolia.mantle.xyz`
- **Chain ID:** `5003` (0x138b)
- **Currency Symbol:** `MNT`
- **Block Explorer:** https://sepolia.mantlescan.xyz
- **Faucet:** https://faucet.sepolia.mantle.xyz
- **Bridge:** https://bridge.testnet.mantle.xyz

---

## 📋 What's Built

### ✅ Complete Stack
- **Frontend**: ViteJS + React + TypeScript + Privy (email auth)
- **Backend**: Node.js + Fastify + EmbedAPI (Claude 3.5 Sonnet)
- **Python SaaS**: Flask + PDF parsing + Risk analysis
- **Smart Contracts**: Hardhat + Solidity + ERC1155
- **Blockchain**: Mantle Network (Sepolia Testnet)

### ✅ Features
- 🔐 **Gasless Transactions**: EIP-712 signing
- 🤖 **AI Risk Analysis**: Claude 3.5 Sonnet via EmbedAPI
- 📊 **Real-time Ticker**: Firebase Firestore
- 🎮 **Gamified XP System**: Leaderboard integration
- 🛡️ **Risk Sentinel**: Automated risk monitoring
- 📄 **PDF Processing**: Upload and analyze assets

---

## 🏗️ Architecture

```
User → Privy (Email Auth) → Frontend (ViteJS)
  ↓
PDF Upload → Python SaaS (Analysis)
  ↓
EIP-712 Sign → Backend (Fastify)
  ↓
AI Analysis (EmbedAPI/Claude) → Smart Contract (Mantle)
  ↓
Mint RWA → Firebase (Ticker/Leaderboard)
```

---

## 📁 Project Structure

```
novamantle/
├── contracts/          # Hardhat smart contracts
├── backend/            # Node.js Fastify server
├── frontend/           # ViteJS React app
├── python-saas/        # Flask risk analysis service
├── scripts/            # Setup and deployment scripts
└── .workspace/         # Build plans and documentation
```

---

## 🔧 Configuration

### Required API Keys
- **EmbedAPI Key**: For Claude 3.5 Sonnet AI analysis
- **Privy App ID**: For email-based wallet authentication
- **Firebase**: Service account JSON (backend) + Config (frontend)

### Environment Variables

**Backend (.env)**
```bash
CONTRACT_ADDRESS=0x3224870fe1ce2F729bEe585Caf54632fC92aa638
AGENT_PK=df4c663077fe583ddf4980a5752e87bd8e477b89ab0b113f04b8612c6834a435
EMBEDAPI_KEY=your_embedapi_key
RPC_URL=https://rpc.sepolia.mantle.xyz
```

**Frontend (.env)**
```bash
VITE_CONTRACT_ADDRESS=0x3224870fe1ce2F729bEe585Caf54632fC92aa638
VITE_PRIVY_APP_ID=your_privy_app_id
```

**Contracts (.env)**
```bash
PRIVATE_KEY=your_deployment_wallet_private_key
AGENT_PK=df4c663077fe583ddf4980a5752e87bd8e477b89ab0b113f04b8612c6834a435
AGENT_ADDRESS=0xC98F8CA35Af8B97910bca50E6351321a7955D45e
CONTRACT_ADDRESS=0x3224870fe1ce2F729bEe585Caf54632fC92aa638
```

---

## 🧪 Testing

### 1. Verify Setup
```bash
# Check all services are configured
./scripts/verify-setup.sh

# Check configuration
./scripts/check-config.sh

# Check server environment (if deploying to server)
./scripts/check-server.sh
```

### 2. Test API Endpoints
```bash
# Test backend health
curl http://localhost:3000/api/health

# Test Python SaaS health
curl http://localhost:5000/api/health
```

### 3. Test Full Flow (Local)

**Start all services:**
```bash
# Terminal 1: Python SaaS
cd python-saas
source venv/bin/activate
python app.py
# Should see: 🚀 MantleForge Risk Analyzer starting on port 5000

# Terminal 2: Backend
cd backend
npm run dev
# Should see: 🤖 MantleForge Backend running on port 3000

# Terminal 3: Frontend
cd frontend
npm run dev
# Should see: Local: http://localhost:5173
```

**Test Steps:**
1. **Open Frontend:** http://localhost:5173
2. **Connect Wallet:** Click "Connect Wallet" → Use Privy email login
3. **Upload PDF:** Click "Upload PDF" → Select a test PDF file
4. **Wait for Analysis:** Should show risk score and valuation
5. **Sign Message:** Click "MINT" → Sign EIP-712 message in wallet
6. **Mint Asset:** Backend processes → Contract mints on-chain
7. **Verify:**
   - Check ticker updates in real-time
   - Check transaction on Mantlescan: https://sepolia.mantlescan.xyz
   - Verify asset minted in your wallet

### 4. Test Contract Functions

**Check Oracle Role:**
```bash
cd contracts
npx hardhat console --network mantleTestnet
# In console:
const Factory = await ethers.getContractAt("MantleForgeFactory", "0x3224870fe1ce2F729bEe585Caf54632fC92aa638");
const AI_ORACLE_ROLE = await Factory.AI_ORACLE_ROLE();
const hasRole = await Factory.hasRole(AI_ORACLE_ROLE, "0xC98F8CA35Af8B97910bca50E6351321a7955D45e");
console.log("Has AI_ORACLE_ROLE:", hasRole);
```

**Check Asset Count:**
```bash
const assetCounter = await Factory.assetCounter();
console.log("Total Assets:", assetCounter.toString());
```

### 5. Run Unit Tests
```bash
# Contracts
cd contracts
npm test

# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Python SaaS
cd python-saas
source venv/bin/activate
python -m pytest tests/
```

---

## 🚀 Deployment

### Local Development
```bash
./scripts/setup-local.sh
./scripts/start-dev.sh
```

### Production (Hetzner)
```bash
# On server
./scripts/check-server.sh  # Check environment first!
./scripts/setup-hetzner.sh
cd backend
pm2 start ecosystem.config.js
```

### Deploy Contracts
```bash
# Testnet
cd contracts
npm run deploy:testnet

# Mainnet
npm run deploy:mainnet
```

### Deploy Frontend to Firebase Hosting

**1. Install Firebase CLI (if not installed):**
```bash
npm install -g firebase-tools
firebase login
```

**2. Build Frontend:**
```bash
cd frontend
npm run build
```

**3. Deploy:**
```bash
# From project root
firebase deploy --only hosting
```

**4. View Deployment:**
- Your app will be available at: `https://mantleforge.web.app` (or your Firebase project URL)

**Firebase Configuration:**
- Config file: `firebase.json`
- Project: `.firebaserc`
- Build output: `frontend/dist`

---

## 📚 Documentation

- **Build Plan**: `.workspace/BUILD_PLAN.md`
- **Progress**: `.workspace/PROGRESS.md`
- **Deployment Data**: `.workspace/DEPLOYMENT_DATA.md` ⭐ **SAVE THIS!**
- **Quick Reference**: `.workspace/QUICK_REFERENCE.md`
- **Configuration**: `.workspace/CONFIGURATION_STATUS.md`
- **Warning Notes**: `.workspace/warning-notes.md`
- **Mantle Resources**: `docs/mantleLinks.md`

---

## 🔗 Important Links

### Contract
- **Explorer:** https://sepolia.mantlescan.xyz/address/0x3224870fe1ce2F729bEe585Caf54632fC92aa638
- **Verify Command:** 
  ```bash
  cd contracts
  npx hardhat verify --network mantleTestnet 0x3224870fe1ce2F729bEe585Caf54632fC92aa638 0x0000000000000000000000000000000000000000 0xC98F8CA35Af8B97910bca50E6351321a7955D45e
  ```

### Wallets
- **Deployment Wallet:** https://sepolia.mantlescan.xyz/address/0x4941632F8639ECd7D6a468CeAFa8b9cA5B4Ba1ac
- **Agent Wallet:** https://sepolia.mantlescan.xyz/address/0xC98F8CA35Af8B97910bca50E6351321a7955D45e

### Network
- **Mantle Sepolia Explorer:** https://sepolia.mantlescan.xyz
- **Faucet:** https://faucet.sepolia.mantle.xyz
- **Bridge:** https://bridge.testnet.mantle.xyz

---

## 📊 Status

**Overall Progress**: ✅ 100% Complete

- ✅ All code written
- ✅ All integrations complete
- ✅ Configuration verified
- ✅ Contracts deployed
- ✅ Oracle role granted
- ✅ Environment variables configured
- ✅ Ready for testing

---

## 🎯 Next Steps

1. ✅ Deploy contracts to Mantle Testnet - **DONE**
2. ✅ Set AGENT_PK in backend/.env - **DONE**
3. ⏳ Test end-to-end flow - **IN PROGRESS**
4. ⏳ Deploy to production - **READY**

---

## ⚠️ Security Notes

- **Private Keys:** Never commit private keys to git
- **Agent Wallet:** Keep secure - it has AI_ORACLE_ROLE and funds
- **Deployment Wallet:** Keep secure - it's the admin
- **Backup:** Save `.workspace/DEPLOYMENT_DATA.md` in a secure location

---

## 📝 License

MIT

---

**Built for Mantle Hackathon** 🚀

**Status:** ✅ **DEPLOYED AND READY FOR TESTING**
