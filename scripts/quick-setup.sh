#!/bin/bash
# Quick Setup Script for 2-Day Sprint
# Sets up everything needed for local development

set -e

echo "⚡ Quick Setup for 2-Day Sprint"
echo "================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node.js 20+ first."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Install Python 3.10+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."

echo "  → Contracts..."
cd "$PROJECT_ROOT/contracts"
npm install --silent

echo "  → Backend..."
cd "$PROJECT_ROOT/backend"
npm install --silent

echo "  → Frontend..."
cd "$PROJECT_ROOT/frontend"
npm install --silent

echo "  → Python SaaS..."
cd "$PROJECT_ROOT/python-saas"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt

echo ""
echo "✅ Dependencies installed"
echo ""

# Check .env files
echo "🔍 Checking .env files..."

MISSING_ENV=0

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found - CREATE IT!"
    MISSING_ENV=1
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found - CREATE IT!"
    MISSING_ENV=1
fi

if [ ! -f "contracts/.env" ]; then
    echo "⚠️  contracts/.env not found - CREATE IT!"
    MISSING_ENV=1
fi

if [ $MISSING_ENV -eq 1 ]; then
    echo ""
    echo "❌ Missing .env files!"
    echo "   See .workspace/2_DAY_ACTION_PLAN.md for what to add"
    exit 1
fi

echo "✅ .env files found"
echo ""

# Final check
echo "📋 Quick Checklist:"
echo "  [ ] EmbedAPI_KEY in backend/.env"
echo "  [ ] VITE_PRIVY_APP_ID in frontend/.env"
echo "  [ ] AGENT_PK in backend/.env"
echo "  [ ] PRIVATE_KEY in contracts/.env"
echo "  [ ] Contract deployed (if ready)"
echo "  [ ] CONTRACT_ADDRESS in backend/.env and frontend/.env"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "  1. Fill in .env files (see checklist above)"
echo "  2. Deploy contracts: cd contracts && npm run deploy:testnet"
echo "  3. Start services: ./scripts/start-dev.sh"
echo ""

