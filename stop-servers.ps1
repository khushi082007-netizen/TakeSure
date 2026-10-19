# TakeSure — stop the background backend and frontend started by start-silent.ps1 (or any process on those ports).
foreach ($port in 3000, 8000, 8001) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop; Write-Host "Stopped process $($_.OwningProcess) on port $port" }
    catch { Write-Host "Port $port is held by a process that cannot be stopped (clears on reboot)" }
  }
}
Write-Host "Done."
