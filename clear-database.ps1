# Clear all races from the database
Write-Host "Clearing all races from database..." -ForegroundColor Cyan

$dbPath = "backend/volt.db"

if (Test-Path $dbPath) {
    # Use SQLite to clear the races table
    $query = "DELETE FROM races; DELETE FROM synthesis_results;"
    
    # Execute the query
    Set-Location backend
    sqlite3 volt.db "$query" 2>$null
    
    if ($?) {
        Write-Host "✓ Database cleared successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Could not clear database automatically" -ForegroundColor Yellow
        Write-Host "You can manually clear it by running:" -ForegroundColor Gray
        Write-Host "cd backend" -ForegroundColor White
        Write-Host 'sqlite3 volt.db "DELETE FROM races; DELETE FROM synthesis_results;"' -ForegroundColor White
    }
    Set-Location ..
} else {
    Write-Host "Database file not found at $dbPath" -ForegroundColor Red
}
