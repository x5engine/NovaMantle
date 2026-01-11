#!/bin/bash
# Test API Endpoints Script
# Tests all backend and Python SaaS endpoints

set -e

echo "🧪 Testing MantleForge API Endpoints"
echo "======================================"
echo ""

BACKEND_URL=${BACKEND_URL:-"http://localhost:3000"}
PYTHON_SAAS_URL=${PYTHON_SAAS_URL:-"http://localhost:5000"}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url" || echo "000")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ OK (${http_code})${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (${http_code})${NC}"
        echo "   Response: $body"
        return 1
    fi
}

# Test Backend
echo "📡 Backend Endpoints ($BACKEND_URL)"
echo "-----------------------------------"

test_endpoint "GET" "$BACKEND_URL/api/health" "" "Health Check"
test_endpoint "GET" "$BACKEND_URL/api/status" "" "Status Check"

echo ""

# Test Python SaaS
echo "🐍 Python SaaS Endpoints ($PYTHON_SAAS_URL)"
echo "-------------------------------------------"

test_endpoint "GET" "$PYTHON_SAAS_URL/api/health" "" "Health Check"

# Test with JSON (no file)
test_endpoint "POST" "$PYTHON_SAAS_URL/api/analyze" \
    '{"pdf_text": "Sample invoice text", "asset_type": "invoice"}' \
    "Risk Analysis (JSON)"

echo ""
echo "✅ Endpoint testing complete!"
echo ""
echo "Note: To test PDF upload, use:"
echo "  curl -X POST -F 'pdf=@test.pdf' $PYTHON_SAAS_URL/api/analyze"

