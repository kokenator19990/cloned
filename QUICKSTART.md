# 🚀 INICIO RÁPIDO - DEADBOT (Cloned)

## ⚡ 5 Minutos hasta tener la app corriendo

### Paso 0: Verificar Requisitos (30 segundos)

```bash
node --version   # Debe ser >= 20.0.0
pnpm --version   # Debe ser >= 9.0.0
docker --version # Cualquier versión reciente
```

Si falta algo:
- Node: `winget install OpenJS.NodeJS.LTS` o https://nodejs.org/
- pnpm: `npm install -g pnpm@9`
- Docker: https://www.docker.com/products/docker-desktop

**Nota Windows**: Si node/pnpm no se reconocen en nuevas terminales:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine")+";"+[System.Environment]::GetEnvironmentVariable("PATH","User")
```

---

### Paso 1: Instalar Dependencias (2-3 minutos)

```bash
cd /path/to/cloned
pnpm install
```

---

### Paso 2: Iniciar Infraestructura (30 segundos)

```bash
# Usar script NPM
pnpm docker:up

# O directamente con Docker
docker compose -f infra/docker-compose.yml up -d
```

Verifica que esté corriendo:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
```

Deberías ver:
- `deadbot-postgres` (pgvector/pgvector:pg16) ✅
- `deadbot-redis` (redis:alpine) ✅
- `deadbot-minio` (minio/minio) ✅

---

### Paso 3: Configurar Base de Datos (1 minuto)

```bash
cd services/api

# Copiar .env.example si no existe .env (normalmente ya existe)
# cp .env.example .env

# Ejecutar migraciones
npx prisma migrate dev

# Poblar base de datos con datos demo
npx prisma db seed

cd ../..
```

Esto crea:
- ✅ Extensión pgvector habilitada
- ✅ Usuario demo: `demo@deadbot.app` / `password123`
- ✅ Perfil "Jorge" en estado ENROLLING

---

### Paso 4: Build + Iniciar Backend (30 segundos)

**Terminal 1:**
```bash
# Desde la raíz del proyecto:
pnpm build:api
pnpm start:api

# O en modo desarrollo (watch mode):
pnpm dev:api
```

Espera a ver: `Deadbot API running on http://localhost:3001`

**Verifica el health check:**
```bash
curl http://localhost:3001/health
# Deberías ver: {"status":"ok","timestamp":"...","checks":{"database":"ok",...}}
```

📚 **Swagger API Docs:** http://localhost:3001/api/docs

---

### Paso 5: Iniciar Frontend (30 segundos)

**Terminal 2 (nueva):**
```bash
pnpm dev:web
```

Espera a ver: `Ready on http://localhost:3000`

**Alternativamente, inicia ambos en paralelo:**
```bash
pnpm dev:all
```

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
- El sistema genera preguntas dinámicamente basadas en huecos de cobertura

### 3. Subir Documentos (RAG)
- Una vez creado el perfil, puedes subir documentos
- Formatos soportados: PDF, TXT, DOCX
- Los documentos se procesan automáticamente con embeddings
- El contexto relevante se incluye en las respuestas del chat

### 4. Chatear
- Una vez activado el perfil (50+ interacciones)
- Click en "Chat"
- ¡Empieza a conversar con el perfil cognitivo!
- Las respuestas incluyen contexto de documentos subidos

---

## 🔧 (Opcional) Agregar LLM Local

Para que las preguntas sean más inteligentes y habilitar embeddings:

```bash
# Instalar Ollama
# Descargar de: https://ollama.com

# Descargar modelos
ollama pull llama3              # Para generación de texto
ollama pull nomic-embed-text    # Para embeddings (RAG)

# Iniciar servidor
ollama serve
```

El backend detectará automáticamente Ollama en `http://localhost:11434`

**Configurar embeddings:**
```bash
# En services/api/.env
EMBEDDING_MODEL=nomic-embed-text
EMBEDDINGS_ENABLED=true
```

---

## 🎤 (Opcional) Configurar Voice Cloning

Para habilitar STT/TTS, necesitas servicios externos:

```bash
# En services/api/.env
VOICE_CLONING_ENABLED=true
STT_API_URL=http://localhost:8000/v1/audio/transcriptions
TTS_API_URL=http://localhost:8000/v1/audio/speech
```

**Opciones de Providers:**
- **Whisper** (STT): https://github.com/openai/whisper
- **Coqui TTS**: https://github.com/coqui-ai/TTS
- **OpenAI API**: Usar endpoints oficiales

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
```bash
# Inicia Docker Desktop manualmente
# Luego:
pnpm docker:up
```

### "Puerto 3000/3001 ya está en uso"
```bash
# Linux/Mac:
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <numero> /F
```

### "Prisma no encuentra la base de datos"
```bash
# Verifica que Docker esté corriendo
docker ps | grep postgres

# Reset completo (borra datos):
pnpm db:reset
pnpm db:seed
```

### "pnpm install falla"
```bash
# Limpia y reinstala:
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### "Health check muestra servicios unavailable"
```bash
# Verifica status de Docker
docker ps

# Reinicia servicios
pnpm docker:down
pnpm docker:up

# Verifica logs
docker logs deadbot-postgres
docker logs deadbot-redis
docker logs deadbot-minio
```

### "Build de API falla"
```bash
# Limpia y rebuilds
cd services/api
rm -rf dist node_modules
pnpm install
pnpm build
```

### "Tests fallan"
```bash
# Asegúrate de que la base de datos esté corriendo
pnpm docker:up

# Corre migraciones
cd services/api
npx prisma migrate dev

# Ejecuta tests
pnpm test
```

---

## 📚 Más Info

- **Documentación completa**: Ver `README.md`
- **Guía de instalación detallada**: Ver `INSTALL.md`
- **Reporte de bugs y features**: Ver `BUGFIX_REPORT.md`
- **Checklist de release**: Ver `RELEASE_CHECKLIST.md`
- **Reporte del proyecto**: Ver `COMPLETION_REPORT.md`
- **Cobertura de tests**: Ver `TEST_COVERAGE_SUMMARY.md`
- **API Docs (Swagger)**: http://localhost:3001/api/docs

---

## 🚀 Scripts Útiles

```bash
# Desarrollo
pnpm dev:api          # Inicia API en modo watch
pnpm dev:web          # Inicia Web en modo dev
pnpm dev:all          # Inicia ambos en paralelo

# Build
pnpm build            # Build todos los packages
pnpm build:api        # Build solo API
pnpm build:web        # Build solo Web

# Base de datos
pnpm db:migrate       # Ejecuta migraciones
pnpm db:seed          # Pobla base de datos
pnpm db:reset         # Reset completo (borra datos)
pnpm db:studio        # Abre Prisma Studio

# Docker
pnpm docker:up        # Inicia servicios
pnpm docker:down      # Detiene servicios
pnpm docker:reset     # Reset completo (borra volúmenes)

# Testing
pnpm test             # Ejecuta tests
pnpm typecheck        # Verifica tipos TypeScript
pnpm lint             # Ejecuta linter

# Producción
pnpm start:api        # Inicia API en modo producción
```

---

## 🎉 ¡Disfruta de Cloned (Deadbot)!

Tienes un sistema completo de **simulación cognitiva** listo para usar.

**Siguientes pasos sugeridos:**
1. ✅ Explorar todas las pantallas
2. ✅ Crear múltiples perfiles
3. ✅ Probar voice recording
4. ✅ Configurar avatares
5. ✅ Subir documentos para RAG
6. ✅ Instalar Ollama para LLM local + embeddings
7. ✅ Leer `README.md` para features avanzadas
8. ✅ Revisar `BUGFIX_REPORT.md` para detalles técnicos
9. ✅ Consultar `RELEASE_CHECKLIST.md` antes de desplegar

---

## 🔍 Health Check & Monitoring

Verifica que todos los servicios estén funcionando:

```bash
# API Health
curl http://localhost:3001/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2025-02-09T...",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "minio": "ok"
  }
}

# Si algún servicio muestra "unavailable", revisa logs de Docker
```

---

*¿Dudas? Revisa `INSTALL.md`, `BUGFIX_REPORT.md`, `COMPLETION_REPORT.md` o `RELEASE_CHECKLIST.md`*
