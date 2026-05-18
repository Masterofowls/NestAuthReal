# set-fly-secrets.ps1
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'

# Populate these in your shell/session before running this script.
$databaseUrl = $env:DATABASE_URL
$betterAuthSecret = $env:BETTER_AUTH_SECRET
$googleClientId = $env:GOOGLE_CLIENT_ID
$googleClientSecret = $env:GOOGLE_CLIENT_SECRET
$githubClientId = $env:GITHUB_CLIENT_ID
$githubClientSecret = $env:GITHUB_CLIENT_SECRET

fly secrets set `
  "NODE_ENV=production" `
  "DATABASE_URL=$databaseUrl" `
  "BETTER_AUTH_SECRET=$betterAuthSecret" `
  "BETTER_AUTH_URL=https://frontend-five-gold-zmyppyq06g.vercel.app" `
  "AUTH_TRUSTED_ORIGINS=https://frontend-five-gold-zmyppyq06g.vercel.app,com.example.nestauth:/" `
  "GOOGLE_CLIENT_ID=$googleClientId" `
  "GOOGLE_CLIENT_SECRET=$googleClientSecret" `
  "GITHUB_CLIENT_ID=$githubClientId" `
  "GITHUB_CLIENT_SECRET=$githubClientSecret" `
  "PASSKEY_RP_ID=frontend-five-gold-zmyppyq06g.vercel.app" `
  "PASSKEY_RP_NAME=NestAuth" 2>&1

Write-Host "Exit: $LASTEXITCODE"
