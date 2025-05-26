Write-Host "Starting Volt Platform Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Start backend in a new PowerShell window
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; cargo run"

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start frontend in current window
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Set-Location frontend
npm run dev
