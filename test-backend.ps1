# Test Backend API Endpoints

Write-Host "Testing backend API endpoints..." -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:3000/api/v1"

# Test auth endpoints
Write-Host "Testing auth endpoints..." -ForegroundColor Yellow
try {
    $signupData = @{
        email = "test@example.com"
        username = "testuser"
        password = "Test123!"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/auth/signup" -Method POST `
        -ContentType "application/json" -Body $signupData -ErrorAction Stop
    Write-Host "POST /auth/signup: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "POST /auth/signup: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: 4xx errors are expected for auth endpoints without valid data" -ForegroundColor Gray
Write-Host "5xx errors indicate server problems that need fixing" -ForegroundColor Gray
