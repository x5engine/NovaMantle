#!/bin/bash

# Start Python SaaS service

cd "$(dirname "$0")/../python-saas"

echo "🐍 Starting Python SaaS on port 5000..."

# Try to use user pip
if [ -f ~/.local/bin/pip ]; then
    echo "Installing dependencies with user pip..."
    ~/.local/bin/pip install -q flask flask-cors PyPDF2 pdfplumber requests python-dotenv 2>&1 | tail -n 1
    ~/.local/bin/python app.py
elif [ -f venv/bin/activate ]; then
    echo "Using venv..."
    source venv/bin/activate
    pip install -q flask flask-cors PyPDF2 pdfplumber requests python-dotenv 2>&1 | tail -n 1
    python app.py
else
    echo "⚠️  No pip found. Please install pip first:"
    echo "   curl -sS https://bootstrap.pypa.io/get-pip.py | python3 - --user"
    exit 1
fi

