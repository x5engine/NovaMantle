#!/bin/bash
# Development Start Script
# Starts all services for local development

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "🚀 Starting MantleForge Development Environment..."
echo ""
echo "⚠️  This will start 3 services. Press Ctrl+C to stop all."
echo ""

# Check if .env files exist
if [ ! -f "$PROJECT_ROOT/python-saas/.env" ]; then
    echo "⚠️  python-saas/.env not found. Service may not work correctly."
fi
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "⚠️  backend/.env not found. Service may not work correctly."
fi
if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo "⚠️  frontend/.env not found. Service may not work correctly."
fi

echo "Starting services..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $PYTHON_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start Python SaaS
echo "🐍 Starting Python SaaS on port 5000..."
cd "$PROJECT_ROOT/python-saas"
if [ -d "venv" ]; then
    source venv/bin/activate
    python app.py &
    PYTHON_PID=$!
    echo "   ✅ Python SaaS started (PID: $PYTHON_PID)"
else
    echo "   ❌ venv not found. Run setup-local.sh first."
    exit 1
fi
cd "$PROJECT_ROOT"

sleep 2

# Start Backend
echo "🔧 Starting Backend on port 3000..."
cd "$PROJECT_ROOT/backend"
if [ -d "node_modules" ]; then
    npm run dev &
    BACKEND_PID=$!
    echo "   ✅ Backend started (PID: $BACKEND_PID)"
else
    echo "   ❌ node_modules not found. Run setup-local.sh first."
    kill $PYTHON_PID 2>/dev/null
    exit 1
fi
cd "$PROJECT_ROOT"

sleep 2

# Start Frontend
echo "🎨 Starting Frontend on port 5173..."
cd "$PROJECT_ROOT/frontend"
if [ -d "node_modules" ]; then
    npm run dev &
    FRONTEND_PID=$!
    echo "   ✅ Frontend started (PID: $FRONTEND_PID)"
else
    echo "   ❌ node_modules not found. Run setup-local.sh first."
    kill $PYTHON_PID $BACKEND_PID 2>/dev/null
    exit 1
fi
cd "$PROJECT_ROOT"

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Services:"
echo "   - Python SaaS: http://localhost:5000"
echo "   - Backend: http://localhost:3000"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for all processes
wait

