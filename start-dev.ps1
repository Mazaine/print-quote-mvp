Write-Host "Starting Print Quote MVP..."

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# Backend inditas ugyanebben a terminal sessionben (nincs uj ablak)
$backendJob = Start-Job -Name "print-quote-backend" -ArgumentList $backendPath -ScriptBlock {
    param($backendPath)

    Set-Location $backendPath

    if (-not (Test-Path ".\\.venv\\Scripts\\python.exe")) {
        throw "Backend virtualenv python not found at: $backendPath\\.venv\\Scripts\\python.exe"
    }

    & .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
}

Start-Sleep -Seconds 2
$backendJob = Get-Job -Id $backendJob.Id

if ($backendJob.State -ne "Running") {
    Write-Host "Backend failed to start. Job output:"
    Receive-Job -Id $backendJob.Id -Keep
    throw "Backend startup failed."
}

Write-Host "Backend started in background job: $($backendJob.Id)"
Write-Host "Starting frontend in current terminal..."

try {
    Set-Location $frontendPath
    npm run dev
}
finally {
    Write-Host "Stopping backend job..."
    Stop-Job -Name "print-quote-backend" -ErrorAction SilentlyContinue
    Remove-Job -Name "print-quote-backend" -Force -ErrorAction SilentlyContinue
    Write-Host "Backend and Frontend stopped."
}
