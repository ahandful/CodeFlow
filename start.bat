@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo    CodeFlow Code Repository Management System
echo ========================================
echo.

echo Checking environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found, please install Node.js first
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm not found, please install npm first
    pause
    exit /b 1
)

echo Environment check passed!
echo.

echo Installing dependencies...
call npm run install:all
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.

echo Starting services...
echo Frontend service: http://localhost:3000
echo Backend service: http://localhost:3001
echo.

start "CodeFlow Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "CodeFlow Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Services started successfully!
echo Please visit: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
