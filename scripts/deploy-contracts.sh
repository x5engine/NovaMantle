#!/bin/bash
# Contract Deployment Script
# Deploys contracts to Mantle Testnet or Mainnet

set -e

NETWORK=${1:-testnet}

echo "🚀 Deploying MantleForge contracts to Mantle $NETWORK..."

cd contracts

# Check for .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found in contracts directory"
    echo "Please create .env file with PRIVATE_KEY and other required variables"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check for private key
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file"
    exit 1
fi

# Deploy based on network
if [ "$NETWORK" = "testnet" ]; then
    echo "📡 Deploying to Mantle Testnet..."
    npm run deploy:testnet
elif [ "$NETWORK" = "mainnet" ]; then
    echo "📡 Deploying to Mantle Mainnet..."
    npm run deploy:mainnet
else
    echo "❌ Invalid network. Use 'testnet' or 'mainnet'"
    exit 1
fi

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "1. Update backend/.env with CONTRACT_ADDRESS"
echo "2. Update frontend/.env with VITE_CONTRACT_ADDRESS"
echo "3. Verify contract on Mantlescan"

