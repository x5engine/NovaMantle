# 🏭 MantleForge - The Gamified RWA Orchestrator

> Turn Real-World Assets into Liquid Yield with Arcade-Speed Execution

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.10+
- Git

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

## 🔧 Configuration

### Required API Keys
- **EmbedAPI Key**: For Claude 3.5 Sonnet AI analysis
- **Privy App ID**: For email-based wallet authentication
- **Firebase**: Service account JSON (backend) + Config (frontend)

### Optional
- **Etherscan API Key**: For contract verification
- **Agent Private Key**: For contract interactions

## 📚 Documentation

- **Build Plan**: `.workspace/BUILD_PLAN.md`
- **Progress**: `.workspace/PROGRESS.md`
- **Configuration**: `.workspace/CONFIGURATION_STATUS.md`
- **Warning Notes**: `.workspace/warning-notes.md`
- **Mantle Resources**: `docs/mantleLinks.md`

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
./scripts/deploy-contracts.sh testnet
```

## 🧪 Testing

```bash
# Verify setup
./scripts/verify-setup.sh

# Check configuration
./scripts/check-config.sh

# Check server environment
./scripts/check-server.sh
```

## 📊 Status

**Overall Progress**: ~90% Complete

- ✅ All code written
- ✅ All integrations complete
- ✅ Configuration verified
- ⚠️ Contracts need deployment
- ⚠️ AGENT_PK needs to be set

## 🎯 Next Steps

1. Deploy contracts to Mantle Testnet
2. Set AGENT_PK in backend/.env
3. Test end-to-end flow
4. Deploy to production

## 📝 License

MIT

---

**Built for Mantle Hackathon** 🚀
