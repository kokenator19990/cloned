# ─── Cloned — Script de arranque ───────────────────────────────────────────────
# Uso: .\start.ps1
# Levanta PostgreSQL + Redis en Docker y arranca el API en modo dev.

Write-Host ""
Write-Host "  ██████╗██╗      ██████╗ ███╗   ██╗███████╗██████╗ " -ForegroundColor Cyan
Write-Host " ██╔════╝██║     ██╔═══██╗████╗  ██║██╔════╝██╔══██╗" -ForegroundColor Cyan
Write-Host " ██║     ██║     ██║   ██║██╔██╗ ██║█████╗  ██║  ██║" -ForegroundColor Cyan
Write-Host " ██║     ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║  ██║" -ForegroundColor Cyan
Write-Host " ╚██████╗███████╗╚██████╔╝██║ ╚████║███████╗██████╔╝" -ForegroundColor Cyan
Write-Host "  ╚═════╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═════╝ " -ForegroundColor Cyan
Write-Host ""

# ─── 1. Verificar .env ─────────────────────────────────────────────────────────
$envFile = Join-Path $PSScriptRoot "services\api\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] No se encontró services/api/.env" -ForegroundColor Red
    Write-Host "        Copia .env.example y configura tu GROQ_API_KEY" -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content $envFile -Raw
if ($envContent -match 'LLM_API_KEY="REEMPLAZA_CON_TU_GROQ_API_KEY"') {
    Write-Host "[AVISO] Aún no configuraste tu Groq API key en services/api/.env" -ForegroundColor Yellow
    Write-Host "        Obtén una gratis en: https://console.groq.com" -ForegroundColor Yellow
    Write-Host "        El chat usará fallback hasta que la configures." -ForegroundColor Yellow
    Write-Host ""
}

# ─── 2. Verificar Docker ───────────────────────────────────────────────────────
Write-Host "[1/3] Verificando Docker..." -ForegroundColor White
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "      Docker no está corriendo. Intentando arrancar Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "      Esperando 30 segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# ─── 3. Levantar DB y Redis ────────────────────────────────────────────────────
Write-Host "[2/3] Levantando PostgreSQL + Redis..." -ForegroundColor White
Set-Location (Join-Path $PSScriptRoot "infra")
docker compose up -d postgres redis
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] No se pudo levantar los containers. Revisa Docker." -ForegroundColor Red
    exit 1
}
Write-Host "       ✓ PostgreSQL en localhost:5432" -ForegroundColor Green
Write-Host "       ✓ Redis en localhost:6379" -ForegroundColor Green

# ─── 4. Arrancar API ───────────────────────────────────────────────────────────
Write-Host "[3/3] Arrancando API..." -ForegroundColor White
Set-Location (Join-Path $PSScriptRoot "services\api")

Write-Host ""
Write-Host "  API:    http://localhost:3001" -ForegroundColor Green
Write-Host "  Docs:   http://localhost:3001/api/docs" -ForegroundColor Green
Write-Host "  Health: http://localhost:3001/health" -ForegroundColor Green
Write-Host ""
Write-Host "  Demo:   demo@cloned.app / password123" -ForegroundColor Cyan
Write-Host ""

npm run dev
