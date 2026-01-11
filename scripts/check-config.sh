#!/bin/bash
# Configuration Verification Script
# Checks all critical configurations

echo "🔍 MantleForge Configuration Check"
echo "===================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

ERRORS=0
WARNINGS=0

# Check Backend Configuration
echo "🔧 Backend Configuration:"
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"
    
    # Check EMBEDAPI_KEY
    if grep -q "EMBEDAPI_KEY=" backend/.env && ! grep -q "EMBEDAPI_KEY=your_" backend/.env; then
        echo "      ✅ EMBEDAPI_KEY is set"
    else
        echo "      ❌ EMBEDAPI_KEY not set or is placeholder"
        ((ERRORS++))
    fi
    
    # Check AGENT_PK
    if grep -q "AGENT_PK=" backend/.env && ! grep -q "AGENT_PK=your_" backend/.env; then
        echo "      ✅ AGENT_PK is set"
    else
        echo "      ⚠️  AGENT_PK not set or is placeholder"
        ((WARNINGS++))
    fi
    
    # Check CONTRACT_ADDRESS
    if grep -q "CONTRACT_ADDRESS=" backend/.env && ! grep -q "CONTRACT_ADDRESS=0xYour" backend/.env; then
        echo "      ✅ CONTRACT_ADDRESS is set"
    else
        echo "      ⚠️  CONTRACT_ADDRESS not set (contracts not deployed yet)"
        ((WARNINGS++))
    fi
else
    echo "   ❌ backend/.env not found"
    ((ERRORS++))
fi

# Check Firebase Service Account
echo ""
echo "🔥 Firebase Configuration:"
if [ -f "backend/serviceAccountKey.json" ]; then
    echo "   ✅ backend/serviceAccountKey.json exists"
    
    # Validate JSON
    if python3 -m json.tool backend/serviceAccountKey.json > /dev/null 2>&1; then
        echo "      ✅ Valid JSON format"
        
        # Check for required fields
        if grep -q "project_id" backend/serviceAccountKey.json && \
           grep -q "private_key" backend/serviceAccountKey.json && \
           grep -q "client_email" backend/serviceAccountKey.json; then
            echo "      ✅ Contains required fields"
        else
            echo "      ⚠️  Missing some required fields"
            ((WARNINGS++))
        fi
    else
        echo "      ❌ Invalid JSON format"
        ((ERRORS++))
    fi
else
    echo "   ❌ backend/serviceAccountKey.json not found"
    ((ERRORS++))
fi

# Check Frontend Firebase Config
echo ""
echo "🎨 Frontend Firebase Configuration:"
if [ -f "frontend/firebaseConfig.js" ]; then
    echo "   ✅ frontend/firebaseConfig.js exists"
    
    # Check for required fields
    if grep -q "apiKey" frontend/firebaseConfig.js && \
       grep -q "projectId" frontend/firebaseConfig.js && \
       grep -q "authDomain" frontend/firebaseConfig.js; then
        echo "      ✅ Contains required Firebase config fields"
    else
        echo "      ⚠️  Missing some Firebase config fields"
        ((WARNINGS++))
    fi
else
    echo "   ❌ frontend/firebaseConfig.js not found"
    ((ERRORS++))
fi

# Check Privy Configuration
echo ""
echo "🔐 Privy Configuration:"
if [ -f "frontend/.env" ]; then
    if grep -q "VITE_PRIVY_APP_ID=" frontend/.env && ! grep -q "VITE_PRIVY_APP_ID=your_" frontend/.env; then
        echo "   ✅ VITE_PRIVY_APP_ID is set in frontend/.env"
    else
        echo "   ⚠️  VITE_PRIVY_APP_ID not set or is placeholder"
        ((WARNINGS++))
    fi
else
    echo "   ⚠️  frontend/.env not found (Privy App ID should be in .env or hardcoded)"
    ((WARNINGS++))
fi

# Check Python SaaS
echo ""
echo "🐍 Python SaaS Configuration:"
if [ -f "python-saas/.env" ]; then
    echo "   ✅ python-saas/.env exists"
    # Python SaaS now uses backend's EmbedAPI, so no API key needed here
    echo "      ℹ️  Uses backend's EmbedAPI (no separate API key needed)"
else
    echo "   ⚠️  python-saas/.env not found (optional, uses backend API)"
    ((WARNINGS++))
fi

# Check Contracts
echo ""
echo "📜 Contracts Configuration:"
if [ -f "contracts/.env" ]; then
    echo "   ✅ contracts/.env exists"
    
    if grep -q "PRIVATE_KEY=" contracts/.env && ! grep -q "PRIVATE_KEY=your_" contracts/.env; then
        echo "      ✅ PRIVATE_KEY is set"
    else
        echo "      ⚠️  PRIVATE_KEY not set or is placeholder"
        ((WARNINGS++))
    fi
    
    # ETHERSCAN_API_KEY is optional (user will add later)
    if grep -q "ETHERSCAN_API_KEY=" contracts/.env && ! grep -q "ETHERSCAN_API_KEY=your_" contracts/.env; then
        echo "      ✅ ETHERSCAN_API_KEY is set"
    else
        echo "      ℹ️  ETHERSCAN_API_KEY not set (optional, user will add later)"
    fi
else
    echo "   ⚠️  contracts/.env not found"
    ((WARNINGS++))
fi

# Summary
echo ""
echo "📊 Summary:"
echo "   Errors: $ERRORS"
echo "   Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All configurations verified!"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Configuration check complete with $WARNINGS warning(s)."
    echo "   Review warnings above - some may be expected (e.g., contracts not deployed yet)."
    exit 0
else
    echo "❌ Configuration check found $ERRORS error(s)."
    echo "   Please fix errors before proceeding."
    exit 1
fi

