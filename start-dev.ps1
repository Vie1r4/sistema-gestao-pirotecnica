$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "A iniciar backend (nova janela)..."
Start-Process powershell -WorkingDirectory $root -ArgumentList @(
    "-NoExit", "-NoLogo",
    "-Command", "Write-Host 'API — https://localhost:7225  |  Ctrl+C para terminar' -ForegroundColor Cyan; dotnet run --project src/Finalproj.Api/Finalproj.Api.csproj"
)
Start-Sleep -Seconds 4

Write-Host "A iniciar frontend (nova janela)..."
Start-Process powershell -WorkingDirectory (Join-Path $root "apps\web") -ArgumentList @(
    "-NoExit", "-NoLogo",
    "-Command", "Write-Host 'Next.js — http://localhost:3000  |  Ctrl+C para terminar' -ForegroundColor Cyan; npm.cmd run dev"
)

Write-Host "Pronto. Feche cada janela quando terminar de trabalhar."
