@echo off
echo ========================================
echo    CodeFlow Code Repository Management System
echo ========================================
echo.

echo Checking environment...
node --version
if errorlevel 1 (
    echo Error: Node.js not found, please install Node.js first
    pause
    exit /b 1
)

npm --version
if errorlevel 1 (
    echo Error: npm not found, please install npm first
    pause
    exit /b 1
)

echo Environment check passed!
echo.

echo Installing dependencies...
npm run install:all
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

echo Starting backend service...
start "CodeFlow Backend" cmd /k "cd backend && npm run dev"

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting frontend service...
start "CodeFlow Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Services started successfully!
echo Please visit: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
