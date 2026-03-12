#!/bin/bash

echo "🔍 Kalshi Trading Bot - Setup Verification"
echo "==========================================="
echo ""

# Check port 5001
echo "1️⃣  Checking if backend is running on port 5001..."
if lsof -i :5001 >/dev/null 2>&1; then
    echo "   ✅ Backend is running on port 5001!"
else
    echo "   ❌ Backend is NOT running on port 5001"
fi

# Check port 5173
echo ""
echo "2️⃣  Checking if frontend is running on port 5173..."
if lsof -i :5173 >/dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 5173!"
else
    echo "   ❌ Frontend is NOT running on port 5173"
fi

# Check if backend responds
echo ""
echo "3️⃣  Testing backend health endpoint..."
if curl -s http://localhost:5001/health >/dev/null 2>&1; then
    echo "   ✅ Backend API is responding!"
    curl -s http://localhost:5001/health | grep -o '"status":"ok"' >/dev/null && echo "   ✅ Health check passed!"
else
    echo "   ❌ Backend API is not responding"
fi

echo ""
echo "4️⃣  .env Configuration:"
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"
    grep "PORT=" backend/.env
else
    echo "   ❌ backend/.env missing"
fi

if [ -f "frontend/.env" ]; then
    echo "   ✅ frontend/.env exists"
    grep "VITE_API_BASE=" frontend/.env
else
    echo "   ❌ frontend/.env missing"
fi

echo ""
echo "==========================================="
echo "✅ If all checks passed, you're ready to use the bot!"
echo "❌ If any failed, check the README or QUICK_START_MACOS.md"
