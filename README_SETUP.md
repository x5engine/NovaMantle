# 🚀 MantleForge Quick Setup Guide

## Prerequisites

- Node.js 20+ (use nvm: `nvm install 20`)
- Python 3.10+
- Git

## Quick Start

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd novamantle
```

### 2. Run Setup Script
```bash
chmod +x scripts/*.sh
./scripts/setup-local.sh
```

### 3. Configure Environment
Copy `.env.example` files and fill in your values:

```bash
# Contracts
cp contracts/.env.example contracts/.env
# Edit contracts/.env with your PRIVATE_KEY

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys and config

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Firebase and Privy config

# Python SaaS
cp python-saas/.env.example python-saas/.env
# Edit python-saas/.env with your OpenAI API key
```

### 4. Get Required API Keys

**Essential:**
- OpenAI API Key: https://platform.openai.com
- Firebase: https://console.firebase.google.com
- Privy: https://privy.io

**See `.workspace/warning-notes.md` for complete list.**

### 5. Start Development

**Terminal 1 - Python SaaS:**
```bash
cd python-saas
source venv/bin/activate
python app.py
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Deploy Contracts (When Ready)

```bash
# Get testnet MNT from faucet first!
./scripts/deploy-contracts.sh testnet
```

---

## Production Deployment (Hetzner)

### On Your Hetzner Server:

```bash
# Clone repository
git clone <your-repo-url>
cd novamantle

# Run setup script
./scripts/setup-hetzner.sh

# Create .env files (copy from local or create manually)
# Then start services:
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## What's Automated?

✅ Project structure  
✅ Dependencies installation  
✅ Server configuration  
✅ Process management (PM2)  
✅ Firewall setup  
✅ TypeScript configuration  
✅ All build configurations  

## What's Manual?

⚠️ API keys (OpenAI, Privy, Firebase)  
⚠️ Account creation (Firebase, Privy)  
⚠️ Wallet generation and funding  
⚠️ Contract deployment (requires MNT)  
⚠️ Creating .env files with actual values  

**See `.workspace/warning-notes.md` for details.**

---

## Need Help?

- **Setup Issues:** Check `scripts/README.md`
- **Manual Actions:** See `.workspace/warning-notes.md`
- **Build Plan:** See `.workspace/BUILD_PLAN.md`
- **Progress:** See `.workspace/PROGRESS.md`

---

*Happy Building! 🚀*

