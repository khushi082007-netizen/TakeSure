# TakeSure — start backend (FastAPI) and frontend (Next.js :3000) in two windows.
# Usage: right-click > Run with PowerShell, or from a terminal:  .\start-dev.ps1
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path "$root\backend\.venv\Scripts\python.exe")) {
  Write-Host "Backend virtualenv missing — run .\setup.ps1 first." -ForegroundColor Yellow
  exit 1
}
if (-not (Test-Path "$root\frontend\node_modules")) {
  Write-Host "Frontend node_modules missing — run .\setup.ps1 first." -ForegroundColor Yellow
  exit 1
}

function Test-PortBusy($port) {
  return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}
function Free-Port($port) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop; Write-Host "Stopped old process $($_.OwningProcess) on port $port" } catch { }
  }
  Start-Sleep -Seconds 1
}

# Backend port: prefer 8000; if something we cannot stop is holding it, fall back to 8001.
$backendPort = 8000
if (Test-PortBusy $backendPort) { Free-Port $backendPort }
if (Test-PortBusy $backendPort) {
  $backendPort = 8001
  Write-Host "Port 8000 is held by another process; using $backendPort for the backend." -ForegroundColor Yellow
}
if (Test-PortBusy 3000) { Free-Port 3000 }

# Point the frontend at whichever backend port we ended up with.
"NEXT_PUBLIC_API_BASE_URL=http://localhost:$backendPort/api" | Out-File -Encoding ascii "$root\frontend\.env.local"

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$root\backend\run_backend.ps1", "$backendPort"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$root\frontend\run_frontend.ps1", "$backendPort"
Start-Sleep -Seconds 6
Start-Process "http://localhost:3000"
Write-Host ""
Write-Host "TakeSure is starting:" -ForegroundColor Green
Write-Host "  Frontend  http://localhost:3000"
Write-Host "  Backend   http://localhost:$backendPort   (API docs: http://localhost:$backendPort/docs)"
Write-Host "Close the two PowerShell windows to stop."
