# Reset Volt Platform (Use if having issues)
Write-Host "Resetting Volt Platform..." -ForegroundColor Cyan
Write-Host "This will clean build artifacts and optionally reset the database" -ForegroundColor Yellow

# Kill any running processes
Write-Host "`nStopping any running processes..." -ForegroundColor Yellow
$processes = Get-Process | Where-Object { $_.ProcessName -like "*cargo*" -or $_.ProcessName -like "*node*" }
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "✓ Stopped running processes" -ForegroundColor Green
}

# Clean backend
Write-Host "`nCleaning backend build artifacts..." -ForegroundColor Yellow
if (Test-Path "backend/target") {
    Remove-Item -Path "backend/target" -Recurse -Force
    Write-Host "✓ Removed backend/target" -ForegroundColor Green
}

# Clean frontend
Write-Host "`nCleaning frontend cache..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules/.vite") {
    Remove-Item -Path "frontend/node_modules/.vite" -Recurse -Force
    Write-Host "✓ Removed frontend Vite cache" -ForegroundColor Green
}

# Ask about database
$resetDb = Read-Host "`nReset database too? (y/N)"
if ($resetDb -eq 'y') {
    if (Test-Path "backend/volt.db") {
        Remove-Item -Path "backend/volt.db*" -Force
        Write-Host "✓ Removed database files" -ForegroundColor Green
    }
}

Write-Host "`n✓ Reset complete!" -ForegroundColor Green
Write-Host "Run .\start-volt-complete.ps1 to start fresh" -ForegroundColor Cyan
