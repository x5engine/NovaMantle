#!/bin/bash
# Run All Tests Script
# Runs tests for contracts, backend, frontend, and Python SaaS

set -e

echo "🧪 Running All Tests for MantleForge"
echo "======================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

FAILED=0

# Test Contracts
echo "📜 Testing Smart Contracts..."
cd "$PROJECT_ROOT/contracts"
if npm test; then
    echo "✅ Contracts tests passed"
else
    echo "❌ Contracts tests failed"
    FAILED=1
fi
echo ""

# Test Backend
echo "🔧 Testing Backend..."
cd "$PROJECT_ROOT/backend"
if npm test; then
    echo "✅ Backend tests passed"
else
    echo "❌ Backend tests failed"
    FAILED=1
fi
echo ""

# Test Frontend
echo "🎨 Testing Frontend..."
cd "$PROJECT_ROOT/frontend"
if npm test; then
    echo "✅ Frontend tests passed"
else
    echo "❌ Frontend tests failed"
    FAILED=1
fi
echo ""

# Test Python SaaS
echo "🐍 Testing Python SaaS..."
cd "$PROJECT_ROOT/python-saas"
if python3 -m pytest tests/ -v 2>/dev/null || python3 -m unittest discover tests -v; then
    echo "✅ Python SaaS tests passed"
else
    echo "⚠️  Python SaaS tests (using unittest)"
    if python3 -m unittest discover tests -v; then
        echo "✅ Python SaaS tests passed"
    else
        echo "❌ Python SaaS tests failed"
        FAILED=1
    fi
fi
echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
if [ $FAILED -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi

