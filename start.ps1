# CodeFlow 启动脚本 (PowerShell版本)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CodeFlow Code Repository Management System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking environment..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found, please install Node.js first" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm not found, please install npm first" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Environment check passed!" -ForegroundColor Green
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm run install:all
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host "Frontend service: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend service: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting backend service..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd backend && npm run dev" -WindowStyle Normal

Write-Host "Waiting 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting frontend service..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd frontend && npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Services started successfully!" -ForegroundColor Green
Write-Host "Please visit: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
