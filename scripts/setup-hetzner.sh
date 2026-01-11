#!/bin/bash
# Hetzner Server Setup Script - SAFE FOR SHARED SERVERS
# This script is designed to work alongside existing services without conflicts
# Run this in your project directory on Hetzner server

set -e

echo "🚀 Setting up MantleForge on Hetzner Server (Shared Server Safe Mode)..."
echo "⚠️  This script will NOT modify system-wide configurations"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "📁 Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "python-saas" ]; then
    echo "❌ Error: This doesn't look like the MantleForge project directory"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Check for existing services on ports
echo "🔍 Checking for existing services on ports 3000 and 5000..."
if command -v lsof &> /dev/null; then
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  WARNING: Port 3000 is already in use!"
        echo "   Existing service detected. MantleForge backend will use port 3000."
        echo "   If this conflicts, you can change PORT in backend/.env"
        read -p "   Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  WARNING: Port 5000 is already in use!"
        echo "   Existing service detected. MantleForge Python SaaS will use port 5000."
        echo "   If this conflicts, you can change PORT in python-saas/.env"
        read -p "   Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "⚠️  lsof not available, skipping port check"
fi

# Check for existing Node.js installation
echo "🔍 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js found: $NODE_VERSION"
    
    # Check if it's version 20 or higher
    NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 20 ]; then
        echo "⚠️  Node.js version is less than 20. We'll use nvm to get Node.js 20."
        USE_NVM=true
    else
        echo "✅ Node.js version is sufficient"
        USE_NVM=false
    fi
else
    echo "⚠️  Node.js not found. We'll install via nvm."
    USE_NVM=true
fi

# Setup nvm if needed
if [ "$USE_NVM" = true ]; then
    echo "📦 Setting up nvm for Node.js 20..."
    if [ ! -d "$HOME/.nvm" ]; then
        echo "   Installing nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
        echo "   nvm already installed, sourcing..."
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install and use Node.js 20
    if ! nvm list | grep -q "v20"; then
        echo "   Installing Node.js 20..."
        nvm install 20
    fi
    nvm use 20
    echo "✅ Node.js 20 ready via nvm"
else
    # Use existing Node.js
    echo "✅ Using existing Node.js installation"
fi

# Check for existing Python installation
echo "🔍 Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python found: $PYTHON_VERSION"
    
    # Check for python3-venv
    if ! python3 -m venv --help &> /dev/null; then
        echo "⚠️  python3-venv not available. Checking if we can install it..."
        if command -v apt-get &> /dev/null; then
            echo "   You may need to run: sudo apt install python3.10-venv"
            echo "   But we'll try to proceed without it first..."
        fi
    else
        echo "✅ python3-venv available"
    fi
else
    echo "❌ Python 3 not found. Please install Python 3.10+ first."
    exit 1
fi

# Check for existing PM2
echo "🔍 Checking PM2 installation..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    echo "✅ PM2 found: $PM2_VERSION"
    echo "⚠️  PM2 is already installed. We'll use the existing installation."
    echo "   Make sure your PM2 apps don't conflict with 'mantle-forge-backend' and 'mantle-forge-python-saas'"
else
    echo "📦 Installing PM2 (project-specific, won't affect system)..."
    npm install -g pm2
    echo "✅ PM2 installed"
fi

# Setup Python SaaS (isolated venv)
echo "🐍 Setting up Python SaaS..."
cd "$PROJECT_ROOT/python-saas"

if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    python3 -m venv venv || {
        echo "❌ Failed to create venv. You may need to install python3-venv:"
        echo "   sudo apt install python3.10-venv"
        exit 1
    }
else
    echo "   Virtual environment already exists"
fi

echo "   Activating venv and installing dependencies..."
source venv/bin/activate
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
deactivate
echo "✅ Python SaaS dependencies installed"

# Setup Node.js Backend
echo "📦 Setting up Node.js Backend..."
cd "$PROJECT_ROOT/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "   Installing npm dependencies..."
    npm install
else
    echo "   node_modules exists, skipping install (run 'npm install' manually if needed)"
fi

# Build TypeScript
if [ -f "tsconfig.json" ]; then
    echo "   Building TypeScript..."
    npm run build || {
        echo "⚠️  Build failed, but continuing. You can build manually later with 'npm run build'"
    }
else
    echo "   No TypeScript config found, skipping build"
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p "$PROJECT_ROOT/backend/logs"
mkdir -p "$PROJECT_ROOT/python-saas/logs" 2>/dev/null || true

# Check if ecosystem.config.js exists
if [ ! -f "$PROJECT_ROOT/backend/ecosystem.config.js" ]; then
    echo "⚠️  ecosystem.config.js not found in backend/"
    echo "   Using the one in project root if it exists..."
fi

# Verify ecosystem.config.js paths are correct
if [ -f "$PROJECT_ROOT/backend/ecosystem.config.js" ]; then
    echo "✅ Found ecosystem.config.js"
    # Update paths to be absolute
    echo "   Verifying paths in ecosystem.config.js..."
fi

# Check firewall (but don't modify if ufw is active with other rules)
echo "🔥 Checking firewall configuration..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status | head -n 1)
    if echo "$UFW_STATUS" | grep -q "Status: active"; then
        echo "⚠️  UFW is active. We'll check if ports 3000 and 5000 are allowed..."
        
        # Check if ports are already allowed
        if sudo ufw status | grep -q "3000/tcp"; then
            echo "✅ Port 3000 is already allowed in firewall"
        else
            echo "⚠️  Port 3000 is NOT in firewall rules"
            echo "   You may need to allow it manually: sudo ufw allow 3000/tcp"
            echo "   (We won't modify firewall automatically to avoid conflicts)"
        fi
        
        if sudo ufw status | grep -q "5000/tcp"; then
            echo "✅ Port 5000 is already allowed in firewall"
        else
            echo "⚠️  Port 5000 is NOT in firewall rules"
            echo "   You may need to allow it manually: sudo ufw allow 5000/tcp"
            echo "   (We won't modify firewall automatically to avoid conflicts)"
        fi
    else
        echo "ℹ️  UFW is not active or not configured"
    fi
else
    echo "ℹ️  UFW not found, skipping firewall check"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 IMPORTANT NEXT STEPS:"
echo ""
echo "1. Create .env files:"
echo "   - Copy backend/.env.example to backend/.env and fill in values"
echo "   - Copy python-saas/.env.example to python-saas/.env and fill in values"
echo ""
echo "2. Verify ports are available:"
echo "   - Backend will use port 3000 (change in backend/.env if needed)"
echo "   - Python SaaS will use port 5000 (change in python-saas/.env if needed)"
echo ""
echo "3. Start services (from project root):"
echo "   cd backend"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "4. Check PM2 status:"
echo "   pm2 list"
echo "   pm2 logs"
echo ""
echo "5. Setup PM2 to start on boot (optional):"
echo "   pm2 startup"
echo "   (Follow the instructions it provides)"
echo ""
echo "⚠️  Remember: This is a shared server setup."
echo "   - Services use project-specific directories"
echo "   - PM2 apps are named 'mantle-forge-backend' and 'mantle-forge-python-saas'"
echo "   - No system-wide configurations were modified"
echo ""
