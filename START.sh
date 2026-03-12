#!/bin/bash

# Kalshi Trading Bot - Quick Start Script

echo "🤖 Kalshi Trading Bot - Startup"
echo "================================="
echo ""

# Check if already running
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5000 is in use. Killing existing process..."
    lsof -i :5000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9 2>/dev/null
    sleep 1
fi

echo ""
echo "📍 Terminal 1 Instructions:"
echo "================================="
echo "Run this in Terminal 1 to start backend:"
echo ""
echo "cd backend"
echo "npm start"
echo ""
echo "Expected output:"
echo "  🚀 Kalshi Trading Bot Server running on http://localhost:5000"
echo ""

echo "📍 Terminal 2 Instructions:"
echo "================================="
echo "Run this in Terminal 2 (AFTER backend starts) to start frontend:"
echo ""
echo "cd frontend"
echo "npm run dev"
echo ""
echo "Expected output:"
echo "  Local: http://localhost:5173"
echo ""

echo "🌐 Then open browser:"
echo "================================="
echo "http://localhost:5173"
echo ""

echo "✅ Ready! Press Ctrl+C to stop any server."
