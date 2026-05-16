# OAuth Routes Manual Test Script
# Run this while dev server is running: npm run start:dev

param(
  [string]$BaseURL = "http://localhost:3000"
)

Write-Host "🧪 Testing OAuth Routes" -ForegroundColor Cyan
Write-Host "Base URL: $BaseURL" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
Write-Host "GET $BaseURL/api/auth/ok" -ForegroundColor Gray
try {
  $response = Invoke-WebRequest -Uri "$BaseURL/api/auth/ok" -Method GET -SkipHttpErrorCheck
  Write-Host "Status: $($response.StatusCode) ✅" -ForegroundColor Green
} catch {
  Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Google OAuth Callback
Write-Host "Test 2: Google OAuth Callback" -ForegroundColor Yellow
Write-Host "GET $BaseURL/api/auth/callback/google?code=test&state=test" -ForegroundColor Gray
try {
  $response = Invoke-WebRequest -Uri "$BaseURL/api/auth/callback/google?code=test_code_123&state=test_state_456" -Method GET -SkipHttpErrorCheck
  $status = $response.StatusCode
  if ($status -eq 400) {
    Write-Host "Status: $status (Bad Request) ✅ Route exists, invalid code expected" -ForegroundColor Green
  } elseif ($status -eq 404) {
    Write-Host "Status: $status (Not Found) ❌ Route not wired" -ForegroundColor Red
  } else {
    Write-Host "Status: $status" -ForegroundColor Yellow
  }
} catch {
  Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: GitHub OAuth Callback
Write-Host "Test 3: GitHub OAuth Callback" -ForegroundColor Yellow
Write-Host "GET $BaseURL/api/auth/callback/github?code=test&state=test" -ForegroundColor Gray
try {
  $response = Invoke-WebRequest -Uri "$BaseURL/api/auth/callback/github?code=test_code_789&state=test_state_012" -Method GET -SkipHttpErrorCheck
  $status = $response.StatusCode
  if ($status -eq 400) {
    Write-Host "Status: $status (Bad Request) ✅ Route exists, invalid code expected" -ForegroundColor Green
  } elseif ($status -eq 404) {
    Write-Host "Status: $status (Not Found) ❌ Route not wired" -ForegroundColor Red
  } else {
    Write-Host "Status: $status" -ForegroundColor Yellow
  }
} catch {
  Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Tests complete!" -ForegroundColor Green
