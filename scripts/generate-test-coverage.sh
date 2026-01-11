#!/bin/bash
# Generate Test Coverage Report
# Runs all tests and generates coverage reports

set -e

echo "🧪 Generating Test Coverage Reports..."
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

# Contracts Coverage
echo "📜 Contracts Coverage..."
cd "$PROJECT_ROOT/contracts"
if command -v npx &> /dev/null; then
    npm run test:coverage 2>/dev/null || npm test
else
    npm test
fi
cd "$PROJECT_ROOT"

# Backend Coverage
echo "🔧 Backend Coverage..."
cd "$PROJECT_ROOT/backend"
npm run test:coverage 2>/dev/null || npm test
cd "$PROJECT_ROOT"

# Frontend Coverage
echo "🎨 Frontend Coverage..."
cd "$PROJECT_ROOT/frontend"
npm run test:coverage 2>/dev/null || npm test
cd "$PROJECT_ROOT"

# Python Coverage
echo "🐍 Python Coverage..."
cd "$PROJECT_ROOT/python-saas"
if command -v coverage &> /dev/null; then
    coverage run -m unittest discover tests -v
    coverage report
    coverage html
else
    python3 -m unittest discover tests -v
fi
cd "$PROJECT_ROOT"

echo ""
echo "✅ Coverage reports generated!"
echo "Check coverage/ directories for HTML reports"

