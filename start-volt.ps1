# Start Volt Platform

Write-Host "Starting Volt Platform..." -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
$backendPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Host "⚠️  Port 3000 is already in use. Please stop the existing backend process." -ForegroundColor Yellow
    Write-Host "   You can find the process with: Get-Process | Where-Object {$_.Id -eq (Get-NetTCPConnection -LocalPort 3000).OwningProcess}" -ForegroundColor Gray
    exit 1
}

# Start backend in new window
Write-Host "Starting backend server on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'Backend starting...' -ForegroundColor Cyan; cargo run"

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Test if backend is responsive
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/signup" -Method POST -UseBasicParsing -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Backend is running!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend might not be ready yet" -ForegroundColor Yellow
    }
}

# Start frontend
Write-Host "`nStarting frontend server on http://localhost:5173..." -ForegroundColor Yellow
Set-Location frontend
npm run dev
