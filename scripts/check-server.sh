#!/bin/bash
# Server Environment Check Script
# Run this FIRST to see what's already on your server

echo "🔍 MantleForge Server Environment Check"
echo "========================================"
echo ""

# Check current directory
echo "📁 Current Directory:"
pwd
echo ""

# Check Node.js
echo "📦 Node.js:"
if command -v node &> /dev/null; then
    echo "   ✅ Installed: $(node -v)"
    echo "   Location: $(which node)"
    NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        echo "   ✅ Version is 20+ (good)"
    else
        echo "   ⚠️  Version is less than 20 (consider using nvm)"
    fi
else
    echo "   ❌ Not installed"
fi
echo ""

# Check nvm
echo "📦 nvm:"
if [ -d "$HOME/.nvm" ]; then
    echo "   ✅ Installed at $HOME/.nvm"
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        echo "   Available versions:"
        nvm list | head -n 5
    fi
else
    echo "   ❌ Not installed"
fi
echo ""

# Check Python
echo "🐍 Python:"
if command -v python3 &> /dev/null; then
    echo "   ✅ Installed: $(python3 --version)"
    echo "   Location: $(which python3)"
    if python3 -m venv --help &> /dev/null 2>&1; then
        echo "   ✅ python3-venv available"
    else
        echo "   ⚠️  python3-venv not available (may need: sudo apt install python3.10-venv)"
    fi
else
    echo "   ❌ Not installed"
fi
echo ""

# Check PM2
echo "⚙️  PM2:"
if command -v pm2 &> /dev/null; then
    echo "   ✅ Installed: $(pm2 --version)"
    echo "   Location: $(which pm2)"
    echo "   Running apps:"
    pm2 list || echo "   (No apps running or PM2 not initialized)"
else
    echo "   ❌ Not installed"
fi
echo ""

# Check ports
echo "🔌 Port Status:"
if command -v lsof &> /dev/null; then
    echo "   Port 3000:"
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "      ⚠️  IN USE by:"
        lsof -Pi :3000 -sTCP:LISTEN | tail -n +2 | awk '{print "         " $1 " (PID: " $2 ")"}'
    else
        echo "      ✅ Available"
    fi
    
    echo "   Port 5000:"
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "      ⚠️  IN USE by:"
        lsof -Pi :5000 -sTCP:LISTEN | tail -n +2 | awk '{print "         " $1 " (PID: " $2 ")"}'
    else
        echo "      ✅ Available"
    fi
else
    echo "   ⚠️  lsof not available, cannot check ports"
    echo "   Install with: sudo apt install lsof"
fi
echo ""

# Check firewall
echo "🔥 Firewall (UFW):"
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -n 1)
    echo "   Status: $UFW_STATUS"
    if echo "$UFW_STATUS" | grep -q "Status: active"; then
        echo "   Port 3000:"
        if sudo ufw status | grep -q "3000/tcp"; then
            echo "      ✅ Allowed"
        else
            echo "      ❌ Not in rules"
        fi
        echo "   Port 5000:"
        if sudo ufw status | grep -q "5000/tcp"; then
            echo "      ✅ Allowed"
        else
            echo "      ❌ Not in rules"
        fi
    fi
else
    echo "   ℹ️  UFW not installed"
fi
echo ""

# Check project structure
echo "📁 Project Structure:"
if [ -d "backend" ]; then
    echo "   ✅ backend/ directory exists"
    if [ -f "backend/package.json" ]; then
        echo "      ✅ package.json found"
    fi
    if [ -f "backend/ecosystem.config.js" ]; then
        echo "      ✅ ecosystem.config.js found"
    fi
else
    echo "   ❌ backend/ directory not found"
fi

if [ -d "python-saas" ]; then
    echo "   ✅ python-saas/ directory exists"
    if [ -f "python-saas/requirements.txt" ]; then
        echo "      ✅ requirements.txt found"
    fi
    if [ -d "python-saas/venv" ]; then
        echo "      ✅ venv exists"
    fi
else
    echo "   ❌ python-saas/ directory not found"
fi
echo ""

# Check .env files
echo "🔐 Environment Files:"
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"
else
    echo "   ⚠️  backend/.env not found (create from .env.example)"
fi

if [ -f "python-saas/.env" ]; then
    echo "   ✅ python-saas/.env exists"
else
    echo "   ⚠️  python-saas/.env not found (create from .env.example)"
fi
echo ""

echo "✅ Check complete!"
echo ""
echo "💡 Recommendations:"
echo "   - Run this check before running setup-hetzner.sh"
echo "   - Verify ports 3000 and 5000 are available or change them in .env files"
echo "   - Make sure PM2 app names don't conflict with existing apps"
echo ""

