#!/bin/bash

echo "🚀 Starting Radian Key System..."
echo ""

# Check if backend dependencies installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Starting backend on http://localhost:3001"
cd backend && node server.js &
BACKEND_PID=$!

sleep 3

echo "✅ Starting frontend on http://localhost:5173"
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Radian Key is running!"
echo ""
echo "📱 Open in browser:"
echo "   Kasir: http://localhost:5173/kasir"
echo "   Customer: http://localhost:5173/customer"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
