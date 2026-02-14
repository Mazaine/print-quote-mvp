# start-dev.ps1
$ErrorActionPreference = "Stop"

Write-Host "Starting Print Quote MVP..."

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# --- start backend as a separate process (NO new window) ---
$python = Join-Path $backendPath ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) { throw "Backend venv python not found: $python" }

$uvicornArgs = "-m uvicorn app.main:app --host 127.0.0.1 --port 8001"
Write-Host "Starting backend..."
$backendProc = Start-Process -FilePath $python -ArgumentList $uvicornArgs -WorkingDirectory $backendPath -NoNewWindow -PassThru

# Give it a moment to boot
Start-Sleep -Seconds 2

# --- start frontend in current terminal ---
Write-Host "Starting frontend..."
try {
  Set-Location $frontendPath
  npm run dev
}
finally {
  Write-Host "Stopping backend..."
  if ($backendProc -and -not $backendProc.HasExited) {
    Stop-Process -Id $backendProc.Id -Force
  }
  Write-Host "Backend and Frontend stopped."
}
