# TakeSure — start backend + frontend WITHOUT visible windows. Logs go to .\logs\.
# Usage:  powershell -ExecutionPolicy Bypass -File .\start-silent.ps1
# Stop:   powershell -ExecutionPolicy Bypass -File .\stop-servers.ps1
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force "$root\logs" | Out-Null

function Test-PortBusy($port) { [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) }

# Launch a fully detached, hidden process (not tied to this console, survives it closing).
function Start-Hidden($commandLine, $workDir) {
  $startup = New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ ShowWindow = [uint16]0 }
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $commandLine; CurrentDirectory = $workDir; ProcessStartupInformation = $startup }
  if ($r.ReturnValue -ne 0) { Write-Host "Could not start: $commandLine (code $($r.ReturnValue))" -ForegroundColor Red }
  return $r.ProcessId
}

function Test-Healthy($port) {
  try { $r = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$port/api/health" -TimeoutSec 3; return ($r.StatusCode -eq 200 -and $r.Content -like '*"status":"ok"*') } catch { return $false }
}

# Backend: reuse a healthy TakeSure backend if one is already running; otherwise 8000 if free, else 8001.
$backendPort = if (Test-Healthy 8000) { 8000 } elseif (Test-Healthy 8001) { 8001 } elseif (Test-PortBusy 8000) { 8001 } else { 8000 }
if (-not (Test-PortBusy $backendPort)) {
  $cmd = "cmd.exe /c set PYTHONIOENCODING=utf-8&& `"$root\backend\.venv\Scripts\python.exe`" -m uvicorn app.main:app --host 127.0.0.1 --port $backendPort > `"$root\logs\backend.log`" 2>&1"
  $pidB = Start-Hidden $cmd "$root\backend"
  Write-Host "Backend starting on port $backendPort (hidden, pid $pidB)"
} else {
  Write-Host "Backend already running on port $backendPort"
}

# Frontend: point it at the live backend port, then start hidden.
"NEXT_PUBLIC_API_BASE_URL=http://localhost:$backendPort/api" | Out-File -Encoding ascii "$root\frontend\.env.local"
if (-not (Test-PortBusy 3000)) {
  $cmd = "cmd.exe /c npm run dev > `"$root\logs\frontend.log`" 2>&1"
  $pidF = Start-Hidden $cmd "$root\frontend"
  Write-Host "Frontend starting on port 3000 (hidden, pid $pidF)"
} else {
  Write-Host "Frontend already running on port 3000"
}

Start-Sleep -Seconds 8
Start-Process "http://localhost:3000"
Write-Host ""
Write-Host "TakeSure is running in the background:" -ForegroundColor Green
Write-Host "  Website   http://localhost:3000"
Write-Host "  API       http://localhost:$backendPort/docs"
Write-Host "  Logs      $root\logs\"
Write-Host "Stop with .\stop-servers.ps1 (they also stop when you shut down the PC)."
