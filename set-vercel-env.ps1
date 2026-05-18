$env:PATH += ";$env:APPDATA\npm"
Set-Location 'C:\Users\mrdan\NestAuth\frontend'

$backendUrl = 'https://nest-auth-backend.fly.dev'
$frontendUrl = 'https://frontend-five-gold-zmyppyq06g.vercel.app'
$authBasePath = '/api/auth'

# Set NEXT_PUBLIC_AUTH_BASE_URL
echo $backendUrl | vercel env add NEXT_PUBLIC_AUTH_BASE_URL production --force
echo $backendUrl | vercel env add NEXT_PUBLIC_AUTH_BASE_URL preview --force
echo $backendUrl | vercel env add NEXT_PUBLIC_AUTH_BASE_URL development --force

# Set NEXT_PUBLIC_APP_URL
echo $frontendUrl | vercel env add NEXT_PUBLIC_APP_URL production --force
echo $frontendUrl | vercel env add NEXT_PUBLIC_APP_URL preview --force
echo "http://localhost:3001" | vercel env add NEXT_PUBLIC_APP_URL development --force

# Set NEXT_PUBLIC_AUTH_BASE_PATH
echo $authBasePath | vercel env add NEXT_PUBLIC_AUTH_BASE_PATH production --force
echo $authBasePath | vercel env add NEXT_PUBLIC_AUTH_BASE_PATH preview --force
echo $authBasePath | vercel env add NEXT_PUBLIC_AUTH_BASE_PATH development --force

Write-Host "All Vercel env vars set." -ForegroundColor Green
