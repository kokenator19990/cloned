# serve-apk.ps1 — Sirve el APK de Cloned en la red local
# Uso: .\scripts\serve-apk.ps1 [-Port 8080]

param(
    [int]$Port = 8080
)

$apkPath = Join-Path $PSScriptRoot "..\apps\android\app\build\outputs\apk\debug\app-debug.apk"

if (-not (Test-Path $apkPath)) {
    Write-Host "APK no encontrado. Compilando..." -ForegroundColor Yellow
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
    $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
    Push-Location (Join-Path $PSScriptRoot "..\apps\android")
    & .\gradlew.bat assembleDebug
    Pop-Location
    if (-not (Test-Path $apkPath)) {
        Write-Error "No se pudo compilar el APK"
        exit 1
    }
}

$apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "=== Cloned APK Server ===" -ForegroundColor Cyan
Write-Host "APK: $apkPath ($apkSize MB)"
Write-Host ""
Write-Host "Descarga desde tu Android:" -ForegroundColor Green
Write-Host "  http://${ip}:${Port}/cloned.apk" -ForegroundColor Yellow
Write-Host ""
Write-Host "O escanea el QR desde el navegador:" -ForegroundColor Green  
Write-Host "  http://${ip}:${Port}" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor DarkGray
Write-Host ""

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://+:${Port}/")
$listener.Start()

$htmlPage = @"
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloned - Descargar APK</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; background: #FDFAF6; color: #2D2A26; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
    .card { background: white; border-radius: 1.5rem; padding: 3rem; max-width: 420px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #E8DFD3; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #C08552; }
    p { color: #8C8279; margin-bottom: 1.5rem; line-height: 1.6; }
    .btn { display: inline-block; background: #C08552; color: white; padding: 1rem 2.5rem; border-radius: 999px; text-decoration: none; font-size: 1.1rem; font-weight: 600; transition: background 0.2s; }
    .btn:hover { background: #9A6B3E; }
    .size { font-size: 0.85rem; color: #8C8279; margin-top: 1rem; }
    .warn { font-size: 0.75rem; color: #B8860B; margin-top: 1.5rem; padding: 0.75rem; background: #FFF8E7; border-radius: 0.75rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Cloned</h1>
    <p>Vuelve a conversar con quien extra&ntilde;as</p>
    <a href="/cloned.apk" class="btn">Descargar APK</a>
    <p class="size">$apkSize MB &bull; Android 8.0+</p>
    <div class="warn">Activa "Fuentes desconocidas" en Ajustes &gt; Seguridad antes de instalar</div>
  </div>
</body>
</html>
"@

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        if ($request.Url.AbsolutePath -eq "/cloned.apk") {
            $bytes = [System.IO.File]::ReadAllBytes($apkPath)
            $response.ContentType = "application/vnd.android.package-archive"
            $response.AddHeader("Content-Disposition", "attachment; filename=cloned-v0.2.0.apk")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] APK descargado por $($request.RemoteEndPoint)" -ForegroundColor Green
        } else {
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($htmlPage)
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }

        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
