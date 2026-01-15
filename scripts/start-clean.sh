#!/bin/bash

# Clean start script - kills all, installs deps, starts services

set -e

echo "🔪 Killing all processes..."
./scripts/kill-all.sh
sleep 2

echo ""
echo "📦 Installing Python dependencies..."
cd python-saas
if [ ! -d "venv" ]; then
    echo "Creating venv..."
    python3 -m venv venv || echo "⚠️  venv creation failed, using system Python"
fi

if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    pip install -q flask flask-cors PyPDF2 pdfplumber requests python-dotenv 2>&1 | tail -n 1
else
    echo "⚠️  Using system Python (venv not available)"
    python3 -m pip install --user flask flask-cors PyPDF2 pdfplumber requests python-dotenv 2>&1 | tail -n 1 || echo "⚠️  pip install failed"
fi
cd ..

echo ""
echo "🚀 Starting services..."

# Start Python SaaS
echo "🐍 Starting Python SaaS (5000)..."
cd python-saas
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    python app.py > /tmp/python-saas.log 2>&1 &
else
    python3 app.py > /tmp/python-saas.log 2>&1 &
fi
PYTHON_PID=$!
cd ..
sleep 3
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "   ✅ Python SaaS running (PID: $PYTHON_PID)"
else
    echo "   ❌ Python SaaS failed - check /tmp/python-saas.log"
    tail -n 5 /tmp/python-saas.log
fi

# Start Backend
echo "🔧 Starting Backend (3000)..."
cd backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 5
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend running (PID: $BACKEND_PID)"
else
    echo "   ❌ Backend failed - check /tmp/backend.log"
    tail -n 10 /tmp/backend.log | grep -A 5 "Error\|Cannot find" || tail -n 5 /tmp/backend.log
fi

# Start Frontend
echo "🎨 Starting Frontend (5173)..."
cd frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 4
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend running (PID: $FRONTEND_PID)"
else
    echo "   ❌ Frontend failed - check /tmp/frontend.log"
fi

echo ""
echo "=== ✅ SERVICES STATUS ==="
echo ""
echo "Python SaaS: http://localhost:5000/api/analyze"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Check logs:"
echo "  tail -f /tmp/python-saas.log"
echo "  tail -f /tmp/backend.log"
echo "  tail -f /tmp/frontend.log"
echo ""
echo "Kill all: ./scripts/kill-all.sh"

