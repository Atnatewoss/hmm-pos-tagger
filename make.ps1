param(
    [Parameter(Position = 0)]
    [ValidateSet("install", "train", "serve", "client", "data", "lint", "clean", "help")]
    [string]$Target = "help"
)

$SERVER = "server"
$CLIENT = "client"

function Invoke-Help {
    Write-Host @"
Usage: .\make.ps1 <target>

Targets:
  install    Install all dependencies (Python venv + npm)
  train      Train the HMM model
  serve      Start the API server (http://localhost:8000)
  client     Start the frontend dev server (http://localhost:3000)
  data       Download CoNLL-U datasets
  lint       Run ruff linter on Python code
  clean      Remove venv, node_modules, models, data
"@
}

function Invoke-Install {
    Write-Host "=== Installing server dependencies ==="
    if (-not (Test-Path "$SERVER/venv/Scripts/python.exe")) {
        Push-Location $SERVER
        python -m venv venv
        Pop-Location
    }
    & "$SERVER/venv/Scripts/python" -m pip install --upgrade pip setuptools
    & "$SERVER/venv/Scripts/python" -m pip install -e "$SERVER"

    Write-Host "=== Installing client dependencies ==="
    Push-Location $CLIENT
    npm install
    Pop-Location

    Write-Host "Done."
}

function Invoke-Train {
    if (-not (Test-Path "$SERVER/venv/Scripts/python.exe")) {
        Write-Host "Error: venv not found. Run '.\make.ps1 install' first." -ForegroundColor Red
        exit 1
    }
    Push-Location $SERVER
    & "$PSScriptRoot/$SERVER/venv/Scripts/python" scripts/train.py
    Pop-Location
}

function Invoke-Serve {
    if (-not (Test-Path "$SERVER/venv/Scripts/python.exe")) {
        Write-Host "Error: venv not found. Run '.\make.ps1 install' first." -ForegroundColor Red
        exit 1
    }
    Push-Location $SERVER
    & "$PSScriptRoot/$SERVER/venv/Scripts/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload
    Pop-Location
}

function Invoke-Client {
    Push-Location $CLIENT
    npm run dev
    Pop-Location
}

function Invoke-Data {
    if (-not (Test-Path "$SERVER/venv/Scripts/python.exe")) {
        Write-Host "Error: venv not found. Run '.\make.ps1 install' first." -ForegroundColor Red
        exit 1
    }
    Push-Location $SERVER
    & "$PSScriptRoot/$SERVER/venv/Scripts/python" -c "from app.core.dataset import download_data; download_data('data')"
    Pop-Location
}

function Invoke-Lint {
    if (-not (Test-Path "$SERVER/venv/Scripts/python.exe")) {
        Write-Host "Error: venv not found. Run '.\make.ps1 install' first." -ForegroundColor Red
        exit 1
    }
    & "$SERVER/venv/Scripts/python" -m pip install ruff
    & "$SERVER/venv/Scripts/python" -m ruff check "$SERVER/app/" "$SERVER/scripts/"
}

function Invoke-Clean {
    if (Test-Path "$SERVER/venv") { Remove-Item -Recurse -Force "$SERVER/venv" }
    if (Test-Path "$CLIENT/node_modules") { Remove-Item -Recurse -Force "$CLIENT/node_modules" }
    if (Test-Path "$SERVER/models") { Remove-Item -Recurse -Force "$SERVER/models" }
    if (Test-Path "$SERVER/data") { Remove-Item -Recurse -Force "$SERVER/data" }
    Get-ChildItem -Path $SERVER -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force
    Get-ChildItem -Path $SERVER -Recurse -Filter "*.pyc" | RemoveItem -Force
    Write-Host "Cleaned."
}

switch ($Target) {
    "install" { Invoke-Install }
    "train"   { Invoke-Train }
    "serve"   { Invoke-Serve }
    "client"  { Invoke-Client }
    "data"    { Invoke-Data }
    "lint"    { Invoke-Lint }
    "clean"   { Invoke-Clean }
    default   { Invoke-Help }
}
