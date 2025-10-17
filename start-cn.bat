@echo off
chcp 65001 >nul
echo ========================================
echo    CodeFlow 代码仓库管理和评审系统
echo ========================================
echo.

echo 正在检查环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 npm，请先安装 npm
    pause
    exit /b 1
)

echo 环境检查通过！
echo.

echo 正在安装依赖...
call npm run install:all
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 依赖安装完成！
echo.

echo 正在启动服务...
echo 前端服务: http://localhost:3000
echo 后端服务: http://localhost:3001
echo.

start "CodeFlow Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "CodeFlow Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo 服务启动完成！
echo 请在浏览器中访问: http://localhost:3000
echo.
echo 按任意键退出...
pause >nul
