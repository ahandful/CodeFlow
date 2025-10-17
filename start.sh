#!/bin/bash

echo "========================================"
echo "   CodeFlow 代码仓库管理和评审系统"
echo "========================================"
echo

echo "正在检查环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "环境检查通过！"
echo

echo "正在安装依赖..."
npm run install:all
if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

echo
echo "依赖安装完成！"
echo

echo "正在启动服务..."
echo "前端服务: http://localhost:3000"
echo "后端服务: http://localhost:3001"
echo

# 启动后端服务
cd backend && npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo
echo "服务启动完成！"
echo "请在浏览器中访问: http://localhost:3000"
echo
echo "按 Ctrl+C 停止服务"

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
