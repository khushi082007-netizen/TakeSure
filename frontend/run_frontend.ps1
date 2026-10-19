# Starts the TakeSure web app on http://localhost:3000. Usage: .\run_frontend.ps1 [backendPort]
# Points the website at whichever port actually has a healthy TakeSure backend (8000 first, then 8001).
param([int]$BackendPort = 0)
Set-Location $PSScriptRoot

function Test-Healthy($p) {
  try { $r = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$p/api/health" -TimeoutSec 3; return ($r.StatusCode -eq 200 -and $r.Content -like '*"status":"ok"*') } catch { return $false }
}

if ($BackendPort -eq 0) {
  if (Test-Healthy 8000) { $BackendPort = 8000 }
  elseif (Test-Healthy 8001) { $BackendPort = 8001 }
  else {
    $BackendPort = 8000
    Write-Host "No running TakeSure backend found on 8000 or 8001. Start it with ..\backend\run_backend.ps1 (website will use port 8000)." -ForegroundColor Yellow
  }
}
"NEXT_PUBLIC_API_BASE_URL=http://localhost:$BackendPort/api" | Out-File -Encoding ascii .env.local
Write-Host "TakeSure frontend -> backend on port $BackendPort" -ForegroundColor Green
npm run dev
