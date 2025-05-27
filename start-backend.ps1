# Start Volt Backend Server
Write-Host "Starting Volt Backend Server..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "backend"

# Check if target directory exists (indicating it's been built before)
if (Test-Path "target") {
    Write-Host "Found existing build artifacts" -ForegroundColor Gray
} else {
    Write-Host "No build artifacts found. Building backend..." -ForegroundColor Yellow
    cargo build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed! Check error messages above." -ForegroundColor Red
        exit 1
    }
}

# Set environment variables for better logging
$env:RUST_LOG = "volt_backend=debug,tower_http=debug,sqlx=debug"
$env:RUST_BACKTRACE = "1"

Write-Host "`nStarting backend with debug logging..." -ForegroundColor Yellow
Write-Host "Server will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API endpoints at: http://localhost:3000/api/v1" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Gray

# Run the backend
cargo run

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBackend exited with error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Check the error messages above for details" -ForegroundColor Yellow
}
