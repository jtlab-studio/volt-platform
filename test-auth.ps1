# Test Volt Platform Auth Flow

Write-Host "Testing Volt Platform Authentication..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v1"

# Test 1: Create a new user
Write-Host "1. Testing signup..." -ForegroundColor Yellow
$signupData = @{
    email = "test@example.com"
    username = "testuser"
    password = "Test123!"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method POST `
        -ContentType "application/json" -Body $signupData
    
    Write-Host "✅ Signup successful!" -ForegroundColor Green
    Write-Host "User ID: $($signupResponse.user.id)" -ForegroundColor Gray
    Write-Host "Token: $($signupResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $signupResponse.token
} catch {
    Write-Host "❌ Signup failed: $_" -ForegroundColor Red
    $token = $null
}

Write-Host ""

# Test 2: Login with the created user
Write-Host "2. Testing login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
        -ContentType "application/json" -Body $loginData
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $loginResponse.token
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Access protected endpoint
if ($token) {
    Write-Host "3. Testing protected endpoint (races)..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    try {
        $racesResponse = Invoke-RestMethod -Uri "$baseUrl/races" -Method GET -Headers $headers
        Write-Host "✅ Protected endpoint access successful!" -ForegroundColor Green
        Write-Host "Number of races: $($racesResponse.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Protected endpoint access failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
