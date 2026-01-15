#!/bin/bash

# Start All Services - MantleForge
# Usage: npm run start or ./scripts/start-all.sh

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "🚀 Starting MantleForge - All Services"
echo ""

# Kill existing processes first
echo "🔪 Cleaning up existing processes..."
"$SCRIPT_DIR/kill-all.sh" > /dev/null 2>&1 || true
sleep 2

# Check dependencies
echo "📦 Checking dependencies..."
if [ ! -d "$PROJECT_ROOT/python-saas/venv" ] && [ ! -f "$(which python3)" ]; then
  echo "⚠️  Python 3 not found"
fi

if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
  echo "⚠️  Backend node_modules not found. Run: cd backend && npm install"
fi

if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
  echo "⚠️  Frontend node_modules not found. Run: cd frontend && npm install"
fi

echo ""
echo "Starting services..."
echo ""

# Start Python SaaS
echo "🐍 [1/3] Starting Python SaaS on port 5000..."
cd "$PROJECT_ROOT/python-saas"
if [ -f "venv/bin/activate" ]; then
  source venv/bin/activate
  python app.py > /tmp/python-saas.log 2>&1 &
  PYTHON_PID=$!
else
  python3 app.py > /tmp/python-saas.log 2>&1 &
  PYTHON_PID=$!
fi
cd "$PROJECT_ROOT"
sleep 3
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
  echo "   ✅ Python SaaS running (PID: $PYTHON_PID)"
else
  echo "   ⚠️  Python SaaS starting... (check /tmp/python-saas.log)"
fi

# Start Backend
echo "🔧 [2/3] Starting Backend on port 3000..."
cd "$PROJECT_ROOT/backend"
# Use nvm to ensure Node 20
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 20 > /dev/null 2>&1 || true
fi
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd "$PROJECT_ROOT"
echo "   ⏳ Waiting for backend to start (PID: $BACKEND_PID)..."
# Wait longer and check multiple times
for i in {1..10}; do
  sleep 2
  if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend running (PID: $BACKEND_PID)"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "   ⚠️  Backend may still be starting... (check /tmp/backend.log)"
    echo "   📝 Last 10 lines of log:"
    tail -n 10 /tmp/backend.log | sed 's/^/      /'
  fi
done

# Start Frontend
echo "🎨 [3/3] Starting Frontend on port 5173..."
cd "$PROJECT_ROOT/frontend"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"
sleep 4
if curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "   ✅ Frontend running (PID: $FRONTEND_PID)"
else
  echo "   ⚠️  Frontend starting... (check /tmp/frontend.log)"
fi

echo ""
echo "=== ✅ All Services Started ==="
echo ""
echo "📍 Services:"
echo "   - Python SaaS: http://localhost:5000/api/analyze"
echo "   - Backend:     http://localhost:3000"
echo "   - Frontend:    http://localhost:5173"
echo ""
echo "📊 Check status:"
echo "   curl http://localhost:5000/api/health  # Python SaaS"
echo "   curl http://localhost:3000/api/health  # Backend"
echo "   curl http://localhost:5173             # Frontend"
echo ""
echo "📝 Logs:"
echo "   tail -f /tmp/python-saas.log  # Python SaaS"
echo "   tail -f /tmp/backend.log      # Backend"
echo "   tail -f /tmp/frontend.log     # Frontend"
echo ""
echo "🛑 Stop all: npm run kill or ./scripts/kill-all.sh"
echo ""

