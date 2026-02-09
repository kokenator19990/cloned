# Cloned — APK Distribution Guide

## Distribución Local (LAN)

### Usando el script serve-apk.ps1

```powershell
cd cloned
.\scripts\serve-apk.ps1
```

Esto:
1. Compila el APK si no existe
2. Inicia un servidor HTTP en tu red local
3. Muestra la URL de descarga (ej: `http://192.168.1.113:8080/cloned.apk`)
4. Sirve una landing page bonita para descargar

### Manualmente

```powershell
# Compilar
cd apps/android
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleDebug

# El APK está en:
# app/build/outputs/apk/debug/app-debug.apk
```

Luego comparte el APK via:
- Cable USB
- Bluetooth
- Google Drive
- Servidor HTTP local

## Configurar la IP del API

El APK se conecta a la IP configurada en `app/build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://TU_IP:3001\"")
```

Para encontrar tu IP local:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback" }).IPAddress
```

**IMPORTANTE**: El dispositivo Android debe estar en la misma red WiFi que la PC donde corre el API.

## Instalación en Android

1. Descarga el APK
2. Si Android bloquea la instalación:
   - Ve a **Ajustes → Seguridad → Fuentes desconocidas**
   - O en Android 8+: **Ajustes → Apps → Permisos especiales → Instalar apps desconocidas**
   - Habilita para tu navegador/gestor de archivos
3. Abre el APK e instala
4. La app aparece como "Cloned" en tu launcher

## Puerto personalizado

```powershell
.\scripts\serve-apk.ps1 -Port 9090
```

## Requisitos del dispositivo

- Android 8.0 (API 26) o superior
- ~20 MB de espacio libre
- Conexión WiFi en la misma red que el servidor
