# Check Volt Database
Write-Host "Checking Volt database..." -ForegroundColor Cyan

$dbPath = "backend/volt.db"

if (Test-Path $dbPath) {
    $dbInfo = Get-Item $dbPath
    Write-Host "✓ Database found: $($dbInfo.Name)" -ForegroundColor Green
    Write-Host "  Size: $([math]::Round($dbInfo.Length / 1KB, 2)) KB" -ForegroundColor Gray
    Write-Host "  Modified: $($dbInfo.LastWriteTime)" -ForegroundColor Gray
    
    # Check if we can connect to it
    Set-Location backend
    
    # Run migrations to ensure database is up to date
    Write-Host "`nRunning database migrations..." -ForegroundColor Yellow
    sqlx migrate run
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database migrations successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Database migration failed" -ForegroundColor Red
        Write-Host "  You may need to delete the database and start fresh" -ForegroundColor Yellow
    }
    
    Set-Location ..
} else {
    Write-Host "✗ Database not found at: $dbPath" -ForegroundColor Red
    Write-Host "  The database will be created when you first run the backend" -ForegroundColor Yellow
}
