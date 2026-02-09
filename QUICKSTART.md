# 🚀 INICIO RÁPIDO - DEADBOT (Cloned)

## ⚡ 5 Minutos hasta tener la app corriendo

### Paso 0: Fix PATH en PowerShell (Windows)

Si node/pnpm no se reconocen en nuevas terminales:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine")+";"+[System.Environment]::GetEnvironmentVariable("PATH","User")
```

### Paso 1: Verificar Requisitos (30 segundos)

```powershell
node --version   # Debe ser >= 20.0.0 (probado con v24.13.0)
pnpm --version   # Debe ser >= 9.0.0
docker --version # Cualquier versión reciente
```

Si falta algo:
- Node: `winget install OpenJS.NodeJS.LTS` o https://nodejs.org/
- pnpm: `npm install -g pnpm@9`
- Docker: https://www.docker.com/products/docker-desktop

---

### Paso 2: Instalar Dependencias (2-3 minutos)

```powershell
cd c:\Users\coook\Desktop\deadbot
pnpm install
```

---

### Paso 3: Iniciar Docker (30 segundos)

```powershell
pnpm docker:up
# O directamente:
docker compose -f infra\docker-compose.yml up -d
```

Verifica que esté corriendo:
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
```

Deberías ver: `deadbot-postgres` (pgvector/pgvector:pg16), `deadbot-redis`, `deadbot-minio`

---

### Paso 4: Configurar Base de Datos (1 minuto)

```powershell
cd services\api
# Copiar .env.example si no existe .env
# (ya debería existir)
npx prisma migrate dev
npx prisma db seed
cd ..\..
```

Esto crea:
- Extensión pgvector habilitada
- Usuario demo: `demo@deadbot.app` / `password123`
- Perfil "Jorge" en estado ENROLLING

---

### Paso 5: Build + Iniciar Backend (30 segundos)

**Terminal 1:**
```powershell
# Desde la raíz del proyecto:
pnpm build:api
pnpm start:api
# O en modo watch:
pnpm dev:api
```

Espera a ver: `Deadbot API running on http://localhost:3001`

Verifica: http://localhost:3001/health → `{"status":"ok"}`
Swagger: http://localhost:3001/api/docs

---

### Paso 6: Iniciar Frontend (30 segundos)

**Terminal 2 (nueva):**
```powershell
pnpm dev:web
```

Espera a ver: `Ready on http://localhost:3000`

---

## ✅ ¡Listo!

Abre tu navegador en: **http://localhost:3000**

**Login:**
- Email: `demo@deadbot.app`
- Password: `password123`

---

## 🎯 Primeros Pasos en la App

### 1. Crear un Perfil
- Click en "Create Profile"
- Nombra el perfil (ej: "Jorge", "Mamá", etc.)

### 2. Empezar Enrollment
- Click en el perfil creado
- Click en "Start Enrollment"
- **Responde al menos 50 preguntas** para activar el perfil

### 3. Chatear
- Una vez activado el perfil (50+ interacciones)
- Click en "Chat"
- ¡Empieza a conversar con el perfil cognitivo!

---

## 🔧 (Opcional) Agregar LLM Local

Para que las preguntas sean más inteligentes:

```powershell
# Instalar Ollama
# Descargar de: https://ollama.com

# Descargar modelo
ollama pull llama3

# Iniciar servidor
ollama serve
```

El backend detectará automáticamente Ollama en `http://localhost:11434`

---

## 📱 Android (Opcional)

1. Abrir Android Studio
2. File → Open → Seleccionar `c:\Users\coook\Desktop\deadbot\apps\android`
3. Esperar sync de Gradle
4. Run

**Nota:** En el emulador, el backend está en `http://10.0.2.2:3001`

---

## ❌ Problemas Comunes

### "Docker no está corriendo"
```powershell
# Inicia Docker Desktop manualmente
# Luego:
docker-compose -f infra\docker-compose.yml up -d
```

### "Puerto 3000/3001 ya está en uso"
```powershell
# Mata el proceso:
netstat -ano | findstr :3000
taskkill /PID <numero> /F
```

### "Prisma no encuentra la base de datos"
```powershell
# Verifica que Docker esté corriendo
docker ps | findstr postgres

# Reset completo (borra datos):
pnpm db:reset
pnpm db:seed
```

### "pnpm install falla"
```powershell
# Limpia y reinstala:
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

## 📚 Más Info

- **Documentación completa**: Ver `INSTALL.md`
- **Reporte del proyecto**: Ver `COMPLETION_REPORT.md`
- **README**: Ver `README.md`
- **API Docs (Swagger)**: http://localhost:3001/api/docs

---

## 🎉 ¡Disfruta de Deadbot!

Tienes un sistema completo de **simulación cognitiva** listo para usar.

**Siguientes pasos sugeridos:**
1. Explorar todas las pantallas
2. Crear múltiples perfiles
3. Probar voice recording
4. Configurar avatares
5. Subir documentos para RAG
6. Instalar Ollama para LLM local + embeddings
7. Leer `INSTALL.md` para features avanzadas

**Scripts útiles:**
```powershell
pnpm dev:all        # API + Web en paralelo
pnpm test           # Correr tests
pnpm typecheck      # Verificar tipos
pnpm db:studio      # Abrir Prisma Studio
pnpm docker:reset   # Reset Docker (borra datos)
```

---

*¿Dudas? Revisa `INSTALL.md`, `BUGFIX_REPORT.md` o `COMPLETION_REPORT.md`*
