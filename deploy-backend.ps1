# deploy-backend.ps1
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
fly deploy --ha=false 2>&1
Write-Host "Exit: $LASTEXITCODE"
