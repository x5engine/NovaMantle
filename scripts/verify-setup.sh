#!/bin/bash
# Setup Verification Script
# Verifies that setup completed successfully

set -e

echo "🔍 Verifying MantleForge Setup..."
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

ERRORS=0
WARNINGS=0

# Check project structure
echo "📁 Checking project structure..."
if [ -d "contracts" ]; then
    echo "   ✅ contracts/ exists"
    if [ -f "contracts/package.json" ]; then
        echo "      ✅ package.json exists"
        if [ -d "contracts/node_modules" ]; then
            echo "      ✅ node_modules exists"
        else
            echo "      ⚠️  node_modules not found (run: cd contracts && npm install)"
            ((WARNINGS++))
        fi
    fi
else
    echo "   ❌ contracts/ not found"
    ((ERRORS++))
fi

if [ -d "backend" ]; then
    echo "   ✅ backend/ exists"
    if [ -f "backend/package.json" ]; then
        echo "      ✅ package.json exists"
        if [ -d "backend/node_modules" ]; then
            echo "      ✅ node_modules exists"
        else
            echo "      ⚠️  node_modules not found (run: cd backend && npm install)"
            ((WARNINGS++))
        fi
        if [ -f "backend/ecosystem.config.js" ]; then
            echo "      ✅ ecosystem.config.js exists"
        fi
    fi
else
    echo "   ❌ backend/ not found"
    ((ERRORS++))
fi

if [ -d "frontend" ]; then
    echo "   ✅ frontend/ exists"
    if [ -f "frontend/package.json" ]; then
        echo "      ✅ package.json exists"
        if [ -d "frontend/node_modules" ]; then
            echo "      ✅ node_modules exists"
        else
            echo "      ⚠️  node_modules not found (run: cd frontend && npm install)"
            ((WARNINGS++))
        fi
    fi
else
    echo "   ❌ frontend/ not found"
    ((ERRORS++))
fi

if [ -d "python-saas" ]; then
    echo "   ✅ python-saas/ exists"
    if [ -f "python-saas/requirements.txt" ]; then
        echo "      ✅ requirements.txt exists"
        if [ -d "python-saas/venv" ]; then
            echo "      ✅ venv exists"
            if [ -f "python-saas/venv/bin/python" ]; then
                echo "      ✅ Python interpreter found"
            fi
        else
            echo "      ⚠️  venv not found (run: cd python-saas && python3 -m venv venv)"
            ((WARNINGS++))
        fi
    fi
else
    echo "   ❌ python-saas/ not found"
    ((ERRORS++))
fi

echo ""

# Check .env files
echo "🔐 Checking environment files..."
if [ -f "contracts/.env" ]; then
    echo "   ✅ contracts/.env exists"
    if grep -q "PRIVATE_KEY" contracts/.env 2>/dev/null; then
        if grep -q "PRIVATE_KEY=your_private_key" contracts/.env 2>/dev/null; then
            echo "      ⚠️  PRIVATE_KEY appears to be placeholder"
            ((WARNINGS++))
        else
            echo "      ✅ PRIVATE_KEY is set"
        fi
    else
        echo "      ⚠️  PRIVATE_KEY not found in .env"
        ((WARNINGS++))
    fi
else
    echo "   ⚠️  contracts/.env not found (create from .env.example)"
    ((WARNINGS++))
fi

if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"
    if grep -q "AGENT_PK" backend/.env 2>/dev/null; then
        if grep -q "AGENT_PK=your_agent" backend/.env 2>/dev/null; then
            echo "      ⚠️  AGENT_PK appears to be placeholder"
            ((WARNINGS++))
        else
            echo "      ✅ AGENT_PK is set"
        fi
    else
        echo "      ⚠️  AGENT_PK not found in .env"
        ((WARNINGS++))
    fi
else
    echo "   ⚠️  backend/.env not found (create from .env.example)"
    ((WARNINGS++))
fi

if [ -f "frontend/.env" ]; then
    echo "   ✅ frontend/.env exists"
else
    echo "   ⚠️  frontend/.env not found (create from .env.example)"
    ((WARNINGS++))
fi

if [ -f "python-saas/.env" ]; then
    echo "   ✅ python-saas/.env exists"
    if grep -q "OPENAI_API_KEY" python-saas/.env 2>/dev/null; then
        if grep -q "OPENAI_API_KEY=your_openai" python-saas/.env 2>/dev/null; then
            echo "      ⚠️  OPENAI_API_KEY appears to be placeholder"
            ((WARNINGS++))
        else
            echo "      ✅ OPENAI_API_KEY is set"
        fi
    else
        echo "      ⚠️  OPENAI_API_KEY not found in .env"
        ((WARNINGS++))
    fi
else
    echo "   ⚠️  python-saas/.env not found (create from .env.example)"
    ((WARNINGS++))
fi

echo ""

# Check if services can start
echo "🚀 Checking if services can start..."

# Check backend build
if [ -d "backend" ] && [ -f "backend/tsconfig.json" ]; then
    if [ -d "backend/dist" ]; then
        echo "   ✅ Backend is built (dist/ exists)"
    else
        echo "   ⚠️  Backend not built (run: cd backend && npm run build)"
        ((WARNINGS++))
    fi
fi

# Check Python dependencies
if [ -d "python-saas/venv" ]; then
    source python-saas/venv/bin/activate
    if python -c "import flask" 2>/dev/null; then
        echo "   ✅ Python dependencies installed"
    else
        echo "   ⚠️  Python dependencies not installed (run: pip install -r requirements.txt)"
        ((WARNINGS++))
    fi
    deactivate
fi

echo ""

# Summary
echo "📊 Summary:"
echo "   Errors: $ERRORS"
echo "   Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Setup verification complete! Everything looks good."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Setup verification complete with $WARNINGS warning(s)."
    echo "   Review warnings above and fix as needed."
    exit 0
else
    echo "❌ Setup verification found $ERRORS error(s) and $WARNINGS warning(s)."
    echo "   Please fix errors before proceeding."
    exit 1
fi

