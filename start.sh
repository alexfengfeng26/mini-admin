#!/bin/bash

echo "🚀 启动 Mini Admin 后台管理系统"
echo "================================"
echo ""

# 检查端口占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  端口 $1 已被占用，尝试终止进程..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

echo "📋 检查端口占用情况..."
check_port 3000
check_port 5173

echo ""
echo "🔧 启动后端服务器 (端口 3000)..."
cd server && npm run dev &
SERVER_PID=$!

sleep 3

echo "🎨 启动前端开发服务器 (端口 5173)..."
cd ../packages/client && npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ 系统启动完成！"
echo "================================"
echo "📡 后端 API: http://localhost:3000"
echo "🌐 前端界面: http://localhost:5173"
echo ""
echo "👤 默认管理员账户:"
echo "   用户名: admin"
echo "   密码: admin123"
echo ""
echo "🛑 按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT
wait
