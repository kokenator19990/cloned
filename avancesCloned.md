# AVANCES CLONED - Checkpoint de Progreso
# Fecha: 2026-02-09
# Propósito: Restaurar contexto completo en nueva ventana de VS Code Copilot

---

## INSTRUCCIÓN PARA LA IA (leer primero)

Eres Staff Engineer + Release Captain trabajando en el monorepo "Cloned" (antes "Deadbot").
Lee este archivo + la estructura del repo para retomar exactamente donde se quedó la sesión anterior.
El objetivo final es: AUDITAR, DEPURAR, ARREGLAR y DEJAR LISTO PARA EJECUTAR todo el proyecto.

---

## 1. ESTADO DEL PROYECTO

### Qué ES Cloned/Deadbot
Plataforma de Simulación de Identidad Cognitiva. Construye "huellas cognitivas" de personas reales mediante conversación (mín 50 interacciones, 8 categorías cognitivas) y luego permite chatear con esa persona-simulada. LLM-agnostic (OpenAI-compatible, default Ollama).

### Stack
- **Monorepo**: pnpm 9 + Turborepo
- **Backend**: NestJS 10 + Prisma 5 + PostgreSQL 16 + Redis 7 + MinIO (S3) | Puerto 3001
- **Web**: Next.js 14 (App Router) + Tailwind + Zustand + Socket.IO | Puerto 3000
- **Android**: Kotlin + Jetpack Compose (no verificado aún)
- **Infra**: Docker Compose (postgres, redis, minio)
- **Node**: v24.13.0 (instalado via winget)

---

## 2. LO QUE YA SE HIZO (COMPLETADO ✅)

### Fase B: Entorno + Build
- ✅ Node.js 24 instalado via `winget install OpenJS.NodeJS.LTS`
- ✅ pnpm 9 instalado via `npm install -g pnpm@9`
- ✅ PowerShell ExecutionPolicy fijado a RemoteSigned
- ✅ `pnpm install` exitoso en todo el monorepo
- ✅ Docker Compose UP: postgres (healthy), redis (healthy), minio (healthy)
- ✅ `.env` creados copiando `.env.example` en `services/api/` y `apps/web/`
- ✅ Prisma migrate + seed ejecutados correctamente
- ✅ Demo user: demo@deadbot.app / password123 (con perfil "Jorge" ENROLLING)

### Fase C1: API Build Fixes
9 errores TypeScript corregidos:

1. **Falta `@nestjs/config`** → `pnpm add @nestjs/config` en services/api
2. **Prisma JSON casting** en `enrollment.service.ts` → `as unknown as Record<string, CoverageEntry>` (3 ocurrencias)
3. **Prisma JSON write** en `enrollment.service.ts` → `coverageMap: coverageMap as unknown as any`
4. **Prisma accessories** en `avatar.service.ts` → `(data.accessories ?? existing.accessories) as any`
5. **Prisma metadata** en `memory.service.ts` → `(metadata ?? undefined) as any`
6. **CoverageEntry export** en `enrollment.service.ts` → cambiado `interface` a `export interface`
7. **CoverageEntry re-export** en `enrollment.controller.ts` → agregado `export { CoverageEntry }`
8. **nest-cli.json** → `deleteOutDir: false` (Node 24 bug: deleteOutDir:true borra dist pero no re-escribe)

**Resultado**: `pnpm exec nest build` → 0 errores, 31 archivos JS en dist/

### API Verificada Funcionando
- ✅ `node dist/main.js` levanta en puerto 3001
- ✅ Swagger responde 200 en http://localhost:3001/api/docs
- ✅ POST /auth/login con demo credentials → devuelve JWT
- ✅ GET /profiles con Bearer token → devuelve perfil "Jorge"

### Fase C2: Web Build Fix
1. **Falta `voiceConsentGiven`** en interfaz Profile de `apps/web/lib/store.ts` → agregado campo `voiceConsentGiven: boolean`

**Resultado**: `pnpm exec next build` → 0 errores, 10 rutas compiladas:
- / (landing)
- /auth/login, /auth/register
- /dashboard
- /dashboard/[profileId] (+ enrollment, chat, voice, avatar)

---

## 3. LO QUE FALTA (PENDIENTE 🔴)

### D1: pgvector + RAG Real (EN PROGRESO - PARCIALMENTE INICIADO)
**Ya hecho:**
- docker-compose.yml actualizado: `image: pgvector/pgvector:pg16` (era postgres:16-alpine)
- Creado `infra/init-pgvector.sql` con `CREATE EXTENSION IF NOT EXISTS vector;`
- Prisma schema actualizado con `previewFeatures = ["postgresqlExtensions"]` y `extensions = [vector]`

**Falta:**
- Recrear container postgres con nueva imagen pgvector
- Agregar modelo `DocumentChunk` al schema Prisma (para RAG de documentos)
- Crear tabla `embedding_vectors` (o campo Unsupported("vector(1536)")) en CognitiveMemory
- Implementar `EmbeddingService` que genere embeddings (usar pipeline: si hay LLM endpoint con /embeddings, usarlo; si no, fallback a keyword scoring existente)
- Implementar `DocumentService` con: upload, chunking, embedding, storage
- Crear endpoints: POST /documents/:profileId/upload, GET /documents/:profileId
- Actualizar `MemoryService.getRelevantMemories()` para usar cosine similarity con pgvector cuando hay embeddings
- Actualizar `ChatService` para incluir documentos relevantes en context

### D2: Voice TTS/STT Funcional
**Falta TODO:**
- STT: Implementar proveedor HTTP pluggable (Whisper-compatible API o stub que no rompa)
- TTS: Implementar proveedor HTTP pluggable (devolver audio WAV/MP3 reproducible, aunque sea genérico)
- Actualizar `VoiceService.speechToText()` y `textToSpeech()` con lógica real
- Feature flag `VOICE_CLONING_ENABLED=false` en .env
- Endpoint STT debe aceptar audio y devolver texto funcional
- Endpoint TTS debe aceptar texto y devolver audio reproducible
- Web: Voice page ya graba con MediaRecorder → actualizar para reproducir respuestas TTS

### D3: Scripts + Healthcheck + DX
**Falta:**
- Endpoint GET /health en API
- Scripts pnpm root: `dev:api`, `dev:web`, `dev:all`, `typecheck`, `db:reset`
- VS Code launch.json para debug API y Web
- Verificar CORS funciona entre web:3000 → api:3001

### E: Tests Mínimos
**Falta TODO:**
- Instalar dependencias test: `@nestjs/testing`, `supertest`, `jest`, etc. (ya están en devDeps)
- Unit tests: AuthService (register, login, validate)
- Unit tests: EnrollmentService (startEnrollment, submitAnswer, getProgress)
- Integration tests: endpoints críticos con supertest
- Web: al menos 1 smoke test de render
- Script `pnpm test` en root

### F: Documentación Final
**Falta:**
- Crear/actualizar `BUGFIX_REPORT.md` (tabla con archivo, bug, fix, verificación)
- Actualizar `AI_REVIEW_GUIDE.md`
- Actualizar `README.md` / `QUICKSTART.md` con comandos exactos Windows PowerShell
- Release checklist final

---

## 4. ARCHIVOS MODIFICADOS HASTA AHORA

```
MODIFICADOS:
  services/api/src/enrollment/enrollment.service.ts    → export interface + JSON casting fixes
  services/api/src/enrollment/enrollment.controller.ts → re-export CoverageEntry
  services/api/src/avatar/avatar.service.ts            → accessories Prisma casting
  services/api/src/memory/memory.service.ts            → metadata Prisma casting
  services/api/nest-cli.json                           → deleteOutDir: false
  services/api/package.json                            → +@nestjs/config dependency
  apps/web/lib/store.ts                                → +voiceConsentGiven field
  infra/docker-compose.yml                             → pgvector/pgvector:pg16 image + init sql volume
  services/api/prisma/schema.prisma                    → previewFeatures + extensions = [vector]

CREADOS:
  infra/init-pgvector.sql                              → CREATE EXTENSION vector
  services/api/.env                                    → copia de .env.example
  apps/web/.env                                        → copia de .env.example

NO TOCADOS (ya funcionaban):
  Todo lo demás del repo original
```

---

## 5. ARQUITECTURA CLAVE (referencia rápida)

### Módulos NestJS (services/api/src/)
```
app.module.ts          → imports: Config, Prisma, Auth, Profile, Enrollment, Chat, Memory, Voice, Avatar, Llm
auth/                  → JWT+Passport, register/login/me
profile/               → CRUD perfiles, activate, export
enrollment/            → start, next-question, answer, progress (mín 50 interacciones, 8 categorías)
chat/                  → sessions CRUD, sendMessage (con LLM), WebSocket gateway streaming
memory/                → addMemory, getRelevantMemories (keyword scoring), timeline
voice/                 → upload samples a MinIO, consent, STT/TTS stubs
avatar/                → config (skin/mood/accessories), photo upload a MinIO
llm/                   → OpenAI SDK client, generateResponse, generateResponseStream, buildPersonaSystemPrompt
prisma/                → PrismaService global
```

### Prisma Models
```
User → PersonaProfile (1:N) → EnrollmentQuestion, CognitiveMemory, ChatSession, VoiceSample, AvatarConfig(1:1), PersonaTimeline
ChatSession → ChatMessage (1:N)
```

### Web Pages (apps/web/app/)
```
/                                → Landing page
/auth/login                      → Login form → Zustand authStore
/auth/register                   → Register form
/dashboard                       → Profile list + create
/dashboard/[profileId]           → Profile detail + coverage radar chart
/dashboard/[profileId]/enrollment → Chat-style enrollment (questions/answers)
/dashboard/[profileId]/chat      → Video-call style chat (avatar central, messages sidebar)
/dashboard/[profileId]/voice     → MediaRecorder, consent, sample list
/dashboard/[profileId]/avatar    → Skin/mood/accessories selector
```

### Zustand Stores (apps/web/lib/store.ts)
```
useAuthStore     → token, user, login(), register(), logout(), loadFromStorage()
useProfileStore  → profiles[], currentProfile, fetchProfiles(), createProfile(), deleteProfile(), activateProfile()
useEnrollmentStore → currentQuestion, progress, startEnrollment(), fetchNextQuestion(), submitAnswer()
useChatStore     → sessions[], messages[], sendMessage(), createSession(), streaming state
```

### API Client (apps/web/lib/api.ts)
```
Axios instance → baseURL from NEXT_PUBLIC_API_URL
Interceptor: inyecta Bearer token desde localStorage
Interceptor: 401 → limpia token, redirect a /auth/login
```

### Environment Variables
```
API (.env):
  DATABASE_URL=postgresql://deadbot:deadbot_dev_2024@localhost:5432/deadbot
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=deadbot-dev-secret-change-in-production
  JWT_EXPIRY=7d
  MINIO_ENDPOINT=localhost | MINIO_PORT=9000 | MINIO_ACCESS_KEY=deadbot | MINIO_SECRET_KEY=deadbot_dev_2024
  LLM_BASE_URL=http://localhost:11434/v1 | LLM_API_KEY=ollama | LLM_MODEL=llama3
  PORT=3001

Web (.env):
  NEXT_PUBLIC_API_URL=http://localhost:3001
  NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## 6. BUGS CONOCIDOS / NOTAS TÉCNICAS

1. **Node 24 + NestJS CLI**: `nest build` con `deleteOutDir: true` silenciosamente NO escribe output. Fix: `deleteOutDir: false`.
2. **pnpm PATH en background terminals**: Background shells en VS Code no heredan PATH actualizado post-instalación de Node. Workaround: prefixar `$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine")+";"+[System.Environment]::GetEnvironmentVariable("PATH","User")` o usar terminal foreground.
3. **Prisma JSON fields**: Prisma 5 con strict TS requiere `as unknown as` para castear `JsonValue` a tipos específicos, y `as any` para writes de records a campos Json.
4. **Docker postgres container**: Necesita recrearse para cambiar de postgres:16-alpine a pgvector/pgvector:pg16. Comando: `docker compose -f infra\docker-compose.yml down -v && docker compose -f infra\docker-compose.yml up -d`
5. **Enrollment questions**: Tiene pool de ~96 fallback questions (12 × 8 categorías). LLM genera dinámicas pero falla gracefully a fallback.
6. **WebSocket**: Gateway existe en /chat namespace pero web frontend usa HTTP POST, no WS streaming aún.
7. **Redis**: Importada (ioredis) pero no activamente usada. Lista para BullMQ queues.

---

## 7. COMANDOS DE RECUPERACIÓN RÁPIDA

```powershell
# 1. Fijar PATH (necesario en cada terminal nueva post-instalación de Node)
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine")+";"+[System.Environment]::GetEnvironmentVariable("PATH","User")

# 2. Ir al proyecto
cd c:\Users\coook\Desktop\deadbot

# 3. Verificar infra
docker ps --format "table {{.Names}}\t{{.Status}}"
# Si no corre: docker compose -f infra\docker-compose.yml up -d

# 4. Build API
cd services\api; pnpm exec nest build; cd ..\..

# 5. Start API
cd services\api; node dist/main.js
# Verificar: curl http://localhost:3001/api/docs → 200

# 6. Build Web
cd apps\web; pnpm exec next build; cd ..\..

# 7. Start Web (dev)
cd apps\web; pnpm exec next dev --port 3000

# 8. Test login
# POST http://localhost:3001/auth/login {"email":"demo@deadbot.app","password":"password123"}
```

---

## 8. PROMPT PARA CONTINUAR EN NUEVA VENTANA

```
Lee el archivo c:\Users\coook\Desktop\deadbot\avancesCloned.md que contiene el checkpoint completo del proyecto Cloned (Deadbot). También lee DEV_GUIDE.md y README.md del mismo directorio para contexto adicional.

Retoma exactamente donde se quedó. El estado actual es:
- API compila y corre (0 errores TS, Swagger funciona)
- Web compila (0 errores, 10 rutas OK)
- Docker infra funcionando (postgres, redis, minio)
- Prisma migrado y seeded

Lo que falta (en orden de prioridad):
1. D1: Completar pgvector + RAG real (recrear container, migración, EmbeddingService, DocumentService, endpoints, actualizar MemoryService y ChatService)
2. D2: Voice TTS/STT funcional (providers HTTP pluggables, feature flags)
3. D3: Healthcheck endpoint, scripts pnpm root, VS Code launch.json
4. E: Tests mínimos (auth + enrollment unit, integration endpoints, web smoke)
5. F: BUGFIX_REPORT.md, actualizar README/QUICKSTART, release checklist

Continúa implementando desde D1. No preguntes, asume lo más simple y documenta.
```
