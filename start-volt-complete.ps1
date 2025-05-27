# Start Volt Platform (Backend First)
Write-Host "Starting Volt Platform..." -ForegroundColor Cyan
Write-Host "This script will start the backend first, then the frontend" -ForegroundColor Gray

# Step 1: Check database
Write-Host "`n=== Checking Database ===" -ForegroundColor Yellow
& .\check-database.ps1

# Step 2: Start backend in new window
Write-Host "`n=== Starting Backend ===" -ForegroundColor Yellow
Write-Host "Opening new window for backend server..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-File", "start-backend.ps1"

# Step 3: Wait for backend to start
Write-Host "`nWaiting for backend to start..." -ForegroundColor Gray
$attempts = 0
$maxAttempts = 30

while ($attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -UseBasicParsing -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "✓ Backend is ready!" -ForegroundColor Green
            break
        }
    }
    
    $attempts++
    if ($attempts % 5 -eq 0) {
        Write-Host "  Still waiting... ($attempts/$maxAttempts)" -ForegroundColor Gray
    }
}

if ($attempts -eq $maxAttempts) {
    Write-Host "✗ Backend failed to start after 30 seconds" -ForegroundColor Red
    Write-Host "  Check the backend window for error messages" -ForegroundColor Yellow
    exit 1
}

# Step 4: Start frontend
Write-Host "`n=== Starting Frontend ===" -ForegroundColor Yellow
Write-Host "Frontend will run in this window" -ForegroundColor Gray
Write-Host "URL: http://localhost:5173" -ForegroundColor Cyan

Set-Location frontend
npm run dev
