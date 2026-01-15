#!/bin/bash

# Deploy Frontend to Firebase Hosting

set -e

echo "🚀 Deploying MantleForge Frontend to Firebase Hosting..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Frontend built successfully"

# Deploy to Firebase
echo "🌐 Deploying to Firebase Hosting..."
cd ..
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "🔗 Your app should be live at: https://mantleforge.web.app"
echo "   (or check your Firebase project URL)"

