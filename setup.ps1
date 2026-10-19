# TakeSure — one-time setup on Windows. Needs Python 3.12+ and Node 20+ on PATH.
# Installs backend deps into backend\.venv, frontend deps into frontend\node_modules, seeds the knowledge base.
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ErrorActionPreference = "Stop"

Write-Host "== Backend ==" -ForegroundColor Cyan
Set-Location "$root\backend"
if (-not (Test-Path ".venv")) { python -m venv .venv }
.\.venv\Scripts\python.exe -m pip install --upgrade pip -q
.\.venv\Scripts\python.exe -m pip install -r requirements.txt -q
if (-not (Test-Path ".env")) { Copy-Item .env.example .env }
$env:PYTHONIOENCODING = "utf-8"
.\.venv\Scripts\python.exe scripts\seed.py
.\.venv\Scripts\python.exe scripts\seed_demo_activity.py

Write-Host "== Tesseract (photo reading) ==" -ForegroundColor Cyan
$tess = "C:\Program Files\Tesseract-OCR\tesseract.exe"
if (-not (Test-Path $tess)) {
  Write-Host "Tesseract not found. Installing with winget (you may be prompted)..."
  try { winget install --id UB-Mannheim.TesseractOCR -e --accept-package-agreements --accept-source-agreements --silent } catch { Write-Host "winget install failed; install Tesseract manually from https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Yellow }
}
if (-not (Test-Path "$root\backend\tessdata\hin.traineddata")) {
  New-Item -ItemType Directory -Force "$root\backend\tessdata" | Out-Null
  if (Test-Path "C:\Program Files\Tesseract-OCR\tessdata\eng.traineddata") {
    Copy-Item "C:\Program Files\Tesseract-OCR\tessdata\eng.traineddata" "$root\backend\tessdata\" -Force
    Copy-Item "C:\Program Files\Tesseract-OCR\tessdata\osd.traineddata" "$root\backend\tessdata\" -Force
  }
  try { Invoke-WebRequest -Uri "https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata" -OutFile "$root\backend\tessdata\hin.traineddata" } catch { Write-Host "Could not download Hindi OCR data; English OCR still works." -ForegroundColor Yellow }
}

Write-Host "== Frontend ==" -ForegroundColor Cyan
Set-Location "$root\frontend"
npm install --no-audit --no-fund
if (-not (Test-Path ".env.local")) { "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api" | Out-File -Encoding ascii .env.local }

Set-Location $root
Write-Host ""
Write-Host "Setup complete. Run .\start-dev.ps1 to launch TakeSure." -ForegroundColor Green
Write-Host "Optional: put your Groq key in backend\.env (GROQ_API_KEY=...) to enable the AI explainer and vision OCR."
