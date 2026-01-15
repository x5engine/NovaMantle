#!/bin/bash

# Kill all MantleForge processes

echo "🔪 Killing all MantleForge processes..."

# Kill by process name
pkill -f "vite" 2>/dev/null
pkill -f "node.*dev" 2>/dev/null
pkill -f "python.*app.py" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "fastify" 2>/dev/null

# Kill by port
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null

sleep 2

echo "✅ All processes killed"
echo ""
echo "Remaining processes:"
ps aux | grep -E "(vite|node.*dev|python.*app|nodemon)" | grep -v grep || echo "  None"

