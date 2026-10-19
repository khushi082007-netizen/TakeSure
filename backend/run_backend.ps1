# Starts the TakeSure API. Usage: .\run_backend.ps1 [port]
# If a healthy TakeSure backend is already running on 8000 (or 8001), this script says so and exits
# instead of starting a second copy on another port (which used to leave the website pointing at a dead port).
param([int]$Port = 0)
Set-Location $PSScriptRoot
$env:PYTHONIOENCODING = "utf-8"

function Test-Healthy($p) {
  try { $r = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$p/api/health" -TimeoutSec 3; return ($r.StatusCode -eq 200 -and $r.Content -like '*"status":"ok"*') } catch { return $false }
}
function Test-Busy($p) { [bool](Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) }

if ($Port -eq 0) {
  foreach ($p in 8000, 8001) {
    if (Test-Healthy $p) {
      Write-Host "TakeSure backend is ALREADY running on http://127.0.0.1:$p (docs: http://127.0.0.1:$p/docs)." -ForegroundColor Green
      Write-Host "Nothing to start. Close this window, or stop it first with ..\stop-servers.ps1" -ForegroundColor Yellow
      exit 0
    }
  }
  $Port = if (Test-Busy 8000) { 8001 } else { 8000 }
}
Write-Host "TakeSure backend on http://127.0.0.1:$Port  (docs: http://127.0.0.1:$Port/docs)" -ForegroundColor Green
& .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port $Port --reload
