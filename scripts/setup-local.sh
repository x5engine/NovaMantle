#!/bin/bash
# Local Development Setup Script
# Run this to set up the complete development environment locally

set -e

echo "🚀 Setting up MantleForge for local development..."

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20 first."
    echo "   Using nvm: nvm install 20"
    exit 1
fi

NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
echo "📦 Node.js: $NODE_VERSION"

if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "⚠️  Node.js version is less than 20. Attempting to use nvm..."
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        if nvm list | grep -q "v20"; then
            nvm use 20
            echo "✅ Switched to Node.js 20 via nvm"
        else
            echo "⚠️  Node.js 20 not found in nvm. Please install: nvm install 20"
        fi
    else
        echo "⚠️  nvm not found. Please install Node.js 20 manually."
    fi
fi

# Setup Contracts
echo ""
echo "📜 Setting up contracts..."
cd "$PROJECT_ROOT/contracts"
if [ -f "package.json" ]; then
    npm install
    echo "✅ Contracts dependencies installed"
else
    echo "⚠️  No package.json in contracts/, skipping"
fi
cd "$PROJECT_ROOT"

# Setup Backend
echo ""
echo "🔧 Setting up backend..."
cd "$PROJECT_ROOT/backend"
if [ -f "package.json" ]; then
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  No package.json in backend/, skipping"
fi
cd "$PROJECT_ROOT"

# Setup Frontend
echo ""
echo "🎨 Setting up frontend..."
cd "$PROJECT_ROOT/frontend"
if [ -f "package.json" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  No package.json in frontend/, skipping"
fi
cd "$PROJECT_ROOT"

# Setup Python SaaS
echo ""
echo "🐍 Setting up Python SaaS..."
cd "$PROJECT_ROOT/python-saas"

if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    if python3 -m venv venv 2>/dev/null; then
        echo "   ✅ Virtual environment created"
    else
        echo "   ❌ Failed to create venv"
        echo "   You may need to install: sudo apt install python3.10-venv"
        echo "   Or on macOS: python3 -m ensurepip --upgrade"
        exit 1
    fi
else
    echo "   ✅ Virtual environment already exists"
fi

echo "   Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip --quiet
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt --quiet
    echo "   ✅ Python dependencies installed"
else
    echo "   ⚠️  requirements.txt not found"
fi
deactivate
cd "$PROJECT_ROOT"

echo ""
echo "✅ Local setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create .env files in each directory (copy from .env.example)"
echo "2. Start Python SaaS:"
echo "   cd python-saas && source venv/bin/activate && python app.py"
echo "3. Start Backend (in another terminal):"
echo "   cd backend && npm run dev"
echo "4. Start Frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
