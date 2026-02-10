# INFORME COMPLETO — CLONED
## Plataforma de Simulación de Identidad Cognitiva
### Fecha: 9 de febrero de 2026

---

## ÍNDICE

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Arquitectura General](#2-arquitectura-general)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura del Monorepo](#4-estructura-del-monorepo)
5. [Base de Datos (Prisma + pgvector)](#5-base-de-datos)
6. [Backend — API NestJS](#6-backend--api-nestjs)
7. [Frontend Web — Next.js](#7-frontend-web--nextjs)
8. [App Android — Kotlin/Compose](#8-app-android)
9. [Infraestructura Docker](#9-infraestructura-docker)
10. [Configuración de Variables de Entorno](#10-configuración-de-variables-de-entorno)
11. [API Endpoints Completos](#11-api-endpoints-completos)
12. [Flujo de Usuario E2E](#12-flujo-de-usuario-e2e)
13. [Estado Actual — Qué Funciona y Qué Falta](#13-estado-actual)
14. [Bugs Conocidos](#14-bugs-conocidos)
15. [Plan de Desarrollo Pendiente](#15-plan-de-desarrollo-pendiente)
16. [Comandos Esenciales](#16-comandos-esenciales)
17. [Credenciales de Desarrollo](#17-credenciales-de-desarrollo)
18. [GitHub y Deployment](#18-github-y-deployment)
19. [Código Fuente — Referencia Rápida de Cada Servicio](#19-código-fuente--referencia-rápida)

---

## 1. Descripción del Proyecto

**Cloned** es una plataforma que permite "clonar" la identidad cognitiva de una persona a través de un proceso de enrollment (50+ preguntas profundas organizadas en 8 categorías cognitivas). Una vez completado el perfil, la app genera un clon conversacional que habla, piensa y razona como esa persona.

**Caso de uso principal**: Preservar la esencia cognitiva de seres queridos (abuelos, padres, amigos) para poder seguir "conversando" con ellos.

**Características principales**:
- Enrollment inteligente con preguntas generadas por IA (8 categorías cognitivas)
- Chat con el clon que imita el estilo de pensamiento de la persona
- Embeddings vectoriales (pgvector) para memoria semántica
- RAG (Retrieval Augmented Generation) con documentos subidos
- Voice cloning (STT/TTS) via OpenAI Whisper y TTS
- Avatar configurable
- Timeline de evolución del perfil
- Soporte Web + Android

---

## 2. Arquitectura General

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENTES                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ Next.js  │  │ Android  │  │ Swagger (api/docs)   │   │
│  │ :3000    │  │ Kotlin   │  │ localhost:3001        │   │
│  └─────┬────┘  └─────┬────┘  └──────────┬───────────┘   │
└────────┼─────────────┼──────────────────┼────────────────┘
         │ HTTP/WS     │ HTTP/WS          │
         ▼             ▼                  ▼
┌──────────────────────────────────────────────────────────┐
│                NestJS API (:3001)                         │
│  ┌────────┐ ┌──────────┐ ┌──────┐ ┌────────┐ ┌───────┐ │
│  │  Auth  │ │Enrollment│ │ Chat │ │ Voice  │ │Avatar │ │
│  └────────┘ └──────────┘ └──────┘ └────────┘ └───────┘ │
│  ┌────────┐ ┌──────────┐ ┌──────┐ ┌────────┐ ┌───────┐ │
│  │Profile │ │  Memory  │ │ LLM  │ │Embeddin│ │Documen│ │
│  └────────┘ └──────────┘ └──────┘ └────────┘ └───────┘ │
└──────┬────────────┬────────────┬─────────────┬───────────┘
       │            │            │             │
       ▼            ▼            ▼             ▼
┌───────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐
│PostgreSQL │ │  Redis   │ │  MinIO  │ │  OpenAI API  │
│+ pgvector │ │  :6379   │ │  :9000  │ │  gpt-4o-mini │
│  :5432    │ │          │ │         │ │  embeddings  │
└───────────┘ └──────────┘ └─────────┘ └──────────────┘
```

---

## 3. Stack Tecnológico

### Monorepo
| Componente | Tecnología | Versión |
|---|---|---|
| Package Manager | pnpm | 9.1.0 |
| Build System | Turborepo | ^2.1.0 |
| Node.js | >=20 | 24.13.0 (local) |

### Backend (services/api)
| Componente | Tecnología | Versión |
|---|---|---|
| Framework | NestJS | ^10.3.0 |
| ORM | Prisma | ^5.22.0 |
| Auth | Passport + JWT | ^10.2.0 |
| WebSocket | Socket.IO | ^4.7.4 |
| S3 | AWS SDK v3 | ^3.500.0 |
| LLM Client | openai (npm) | ^4.40.0 |
| Hashing | bcrypt | ^5.1.1 |
| Validation | class-validator | ^0.14.1 |

### Frontend Web (apps/web)
| Componente | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | ^14.2.0 |
| UI | React | ^18.3.0 |
| Styling | Tailwind CSS | ^3.4.0 |
| State | Zustand | ^4.5.0 |
| HTTP | axios | ^1.7.0 |
| WebSocket | socket.io-client | ^4.7.0 |
| Icons | lucide-react | ^0.400.0 |

### Android (apps/android)
| Componente | Tecnología | Versión |
|---|---|---|
| Language | Kotlin | 2.0.0 |
| UI | Jetpack Compose | BOM 2024.04.01 |
| HTTP | Retrofit + OkHttp | 2.9.0 / 4.12.0 |
| Navigation | Compose Navigation | — |
| compileSdk | 34 | — |
| minSdk | 26 | — |

### Infraestructura
| Componente | Tecnología | Versión |
|---|---|---|
| Database | PostgreSQL + pgvector | 16 |
| Cache | Redis | 7-alpine |
| Object Storage | MinIO | latest |
| LLM | OpenAI API | gpt-4o-mini |
| Embeddings | OpenAI API | text-embedding-3-small (1536 dims) |
| STT | OpenAI Whisper | whisper-1 |
| TTS | OpenAI TTS | tts-1 (voice: alloy) |

---

## 4. Estructura del Monorepo

```
c:\Users\coook\Desktop\deadbot\
├── package.json             # Root monorepo config
├── pnpm-workspace.yaml      # Workspace packages
├── turbo.json               # Turborepo pipeline
├── eslint.config.mjs        # ESLint config
├── .gitignore
├── .github/
│   └── workflows/
│       └── gh-pages.yml     # GitHub Pages deploy workflow
├── apps/
│   ├── web/                 # Next.js 14 frontend
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── tsconfig.json
│   │   ├── app/             # App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (landing)
│   │   │   ├── globals.css
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx (profile list)
│   │   │       └── [profileId]/
│   │   │           ├── layout.tsx (generateStaticParams)
│   │   │           ├── page.tsx (profile detail)
│   │   │           ├── enrollment/page.tsx
│   │   │           ├── chat/page.tsx
│   │   │           ├── voice/page.tsx
│   │   │           └── avatar/page.tsx
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── Avatar.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── ChatBubble.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── ProgressBar.tsx
│   │   │       ├── RadarChart.tsx
│   │   │       └── SimulationBanner.tsx
│   │   └── lib/
│   │       ├── api.ts       # axios instance con auth interceptor
│   │       ├── store.ts     # Zustand stores (Auth, Profile, Enrollment, Chat)
│   │       └── utils.ts     # cn() helper
│   └── android/             # Kotlin Jetpack Compose app
│       ├── build.gradle.kts
│       ├── settings.gradle.kts
│       └── app/src/main/...
├── services/
│   ├── api/                 # NestJS backend
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   ├── .env             # Variables de entorno (NO en git)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── auth/        # Login, Register, JWT
│   │       ├── profile/     # CRUD de PersonaProfile
│   │       ├── enrollment/  # Preguntas cognitivas + evaluación
│   │       ├── chat/        # REST + WebSocket streaming
│   │       ├── memory/      # CognitiveMemory + Timeline
│   │       ├── embedding/   # Vector embeddings (pgvector)
│   │       ├── document/    # Upload + RAG chunking
│   │       ├── llm/         # OpenAI client wrapper
│   │       ├── voice/       # STT/TTS + voice samples
│   │       ├── avatar/      # Avatar config
│   │       ├── prisma/      # PrismaService
│   │       └── health/      # Health check endpoint
│   └── ai/src/              # (Vacío — reservado para futuro servicio AI dedicado)
├── packages/
│   └── shared/              # Tipos y utilidades compartidas
│       └── src/
│           ├── index.ts
│           ├── types.ts
│           ├── constants.ts
│           └── utils.ts
└── infra/
    ├── docker-compose.yml   # PostgreSQL + Redis + MinIO
    └── init-pgvector.sql    # Extensión vector
```

---

## 5. Base de Datos

### Motor: PostgreSQL 16 + pgvector

### Modelo de Datos (Prisma Schema)

```
User (1) ──→ (N) PersonaProfile
PersonaProfile (1) ──→ (N) EnrollmentQuestion
PersonaProfile (1) ──→ (N) CognitiveMemory       [vector(1536)]
PersonaProfile (1) ──→ (N) ChatSession ──→ (N) ChatMessage
PersonaProfile (1) ──→ (N) VoiceSample
PersonaProfile (1) ──→ (1) AvatarConfig
PersonaProfile (1) ──→ (N) PersonaTimeline
PersonaProfile (1) ──→ (N) Document ──→ (N) DocumentChunk [vector(1536)]
```

### Tablas principales:

| Tabla | Propósito | Campos clave |
|---|---|---|
| `User` | Usuarios registrados | id, email, passwordHash, displayName |
| `PersonaProfile` | Perfil cognitivo de una persona | id, userId, name, status (ENROLLING/ACTIVE/ARCHIVED), coverageMap (JSON), consistencyScore, minInteractions (50), currentInteractions |
| `EnrollmentQuestion` | Preguntas del enrollment | id, profileId, category (8 tipos), question, answer, turnNumber |
| `CognitiveMemory` | Memorias con embedding vectorial | id, profileId, content, category, embedding vector(1536), importance |
| `ChatSession` | Sesiones de chat | id, profileId, userId, messageCount |
| `ChatMessage` | Mensajes individuales | id, sessionId, role (USER/PERSONA/SYSTEM), content, voiceUsed |
| `VoiceSample` | Samples de voz subidos | id, profileId, s3Key, durationSeconds, consentPhrase |
| `AvatarConfig` | Configuración visual del avatar | id, profileId, skin, mood, accessories (JSON) |
| `PersonaTimeline` | Eventos de evolución | id, profileId, event, category, previousValue, newValue |
| `Document` | Documentos subidos para RAG | id, profileId, filename, mimeType, s3Key, chunkCount, status |
| `DocumentChunk` | Chunks de documento con embedding | id, documentId, profileId, content, chunkIndex, embedding vector(1536) |

### Enums:
- **ProfileStatus**: `ENROLLING`, `ACTIVE`, `ARCHIVED`
- **CognitiveCategory**: `LINGUISTIC`, `LOGICAL`, `MORAL`, `VALUES`, `ASPIRATIONS`, `PREFERENCES`, `AUTOBIOGRAPHICAL`, `EMOTIONAL`
- **MessageRole**: `USER`, `PERSONA`, `SYSTEM`

### Coverage Map (JSON en PersonaProfile):
Cada categoría requiere 5 respuestas mínimas para considerarse "cubierta":
```json
{
  "LINGUISTIC": { "count": 0, "minRequired": 5, "covered": false },
  "LOGICAL": { "count": 0, "minRequired": 5, "covered": false },
  "MORAL": { "count": 0, "minRequired": 5, "covered": false },
  "VALUES": { "count": 0, "minRequired": 5, "covered": false },
  "ASPIRATIONS": { "count": 0, "minRequired": 5, "covered": false },
  "PREFERENCES": { "count": 0, "minRequired": 5, "covered": false },
  "AUTOBIOGRAPHICAL": { "count": 0, "minRequired": 5, "covered": false },
  "EMOTIONAL": { "count": 0, "minRequired": 5, "covered": false }
}
```
Total mínimo: 50 interacciones (minInteractions) + todas las categorías cubiertas.

---

## 6. Backend — API NestJS

### Módulos (services/api/src/)

#### 6.1 Auth Module
- **Archivos**: `auth.controller.ts`, `auth.service.ts`, `auth.module.ts`, `jwt.strategy.ts`, `jwt-auth.guard.ts`, `local.strategy.ts`
- **Endpoints**: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- **JWT**: Firma con `JWT_SECRET`, expira en 7 días. Payload: `{ sub: userId, email }`
- **Password**: bcrypt con 10 rounds
- **Response format**: `{ accessToken: string, user: { id, email, displayName, createdAt, updatedAt } }`

#### 6.2 Profile Module
- **Archivos**: `profile.controller.ts`, `profile.service.ts`, `profile.module.ts`
- **Endpoints**: `GET /profiles`, `POST /profiles`, `GET /profiles/:id`, `DELETE /profiles/:id`, `POST /profiles/:id/activate`, `POST /profiles/:id/export`
- **CreateProfileDto**: solo `{ name: string }` (validado con class-validator, whitelist + forbidNonWhitelisted)
- **Al crear**: inicializa `coverageMap` con las 8 categorías a 0
- **Export**: retorna perfil + memorias + preguntas + timeline + sesiones con mensajes

#### 6.3 Enrollment Module
- **Archivos**: `enrollment.controller.ts`, `enrollment.service.ts`, `enrollment-questions.service.ts`, `enrollment.module.ts`
- **Endpoints**: `POST /enrollment/:profileId/start`, `GET /enrollment/:profileId/next-question`, `POST /enrollment/:profileId/answer`, `GET /enrollment/:profileId/progress`
- **Flujo**:
  1. Start → genera primera pregunta (LLM o fallback)
  2. Next-question → selecciona categoría menos cubierta, genera pregunta vía LLM o fallback (96 preguntas hardcoded, 12 por categoría)
  3. Answer → guarda respuesta, crea CognitiveMemory con embedding, actualiza coverageMap, incrementa interacciones
  4. Auto-evaluate: cuando todas las categorías cubiertas Y ≥50 interacciones → evalúa consistencia vía LLM → activa perfil a ACTIVE
- **SubmitAnswerDto**: `{ questionId: string, answer: string }`
- **Progress response**: `{ profileId, totalInteractions, minRequired, percentComplete, coverageMap, isReady }`

#### 6.4 Chat Module
- **Archivos**: `chat.controller.ts`, `chat.service.ts`, `chat.gateway.ts`, `chat.module.ts`
- **REST Endpoints**: `POST /chat/:profileId/sessions`, `GET /chat/:profileId/sessions`, `GET /chat/sessions/:sessionId/messages`, `POST /chat/sessions/:sessionId/messages`
- **WebSocket**: namespace `/chat`, evento `chat:send` → emite `chat:stream` (chunks) + `chat:end`
- **Flujo sendMessage**:
  1. Guarda mensaje del usuario
  2. Obtiene últimos 20 mensajes de la sesión
  3. Busca 15 memorias relevantes (vector similarity → fallback keyword)
  4. Busca 5 chunks de documentos relevantes (RAG)
  5. Construye system prompt con persona (nombre, memorias por categoría, documentos)
  6. Genera respuesta vía LLM (gpt-4o-mini)
  7. Guarda respuesta como PERSONA message
  8. Almacena interacción como nueva memoria LINGUISTIC
- **SendMessageDto**: `{ content: string, voiceUsed?: boolean }`
- **WebSocket auth**: JWT verification con `jsonwebtoken` en `handleConnection()`. Secret: `JWT_SECRET || 'cloned-dev-secret-change-in-production'`

#### 6.5 LLM Module
- **Archivos**: `llm.service.ts`, `llm.module.ts`
- **Client**: OpenAI SDK (`openai` npm package)
- **Config**: `baseURL = LLM_BASE_URL || 'https://api.openai.com/v1'`, `model = LLM_MODEL || 'gpt-4o-mini'`
- **Métodos**:
  - `generateResponse(systemPrompt, messages, options?)` → string
  - `generateResponseStream(systemPrompt, messages)` → AsyncGenerator<string>
  - `generateEnrollmentQuestion(coverageMap, previousQuestions, targetCategory)` → string | null
  - `evaluateConsistency(memories)` → number (0.0 - 1.0)
  - `buildPersonaSystemPrompt(personaName, memories, documentContext?)` → string (system prompt completo que instruye al LLM a "ser" la persona)

#### 6.6 Embedding Module
- **Archivos**: `embedding.service.ts`, `embedding.module.ts`
- **Client**: OpenAI SDK
- **Model**: `text-embedding-3-small` (1536 dimensiones — coincide con schema)
- **Métodos**:
  - `generateEmbedding(text)` → number[] | null
  - `storeMemoryEmbedding(memoryId, embedding)` → raw SQL UPDATE con `::vector`
  - `storeChunkEmbedding(chunkId, embedding)` → raw SQL UPDATE con `::vector`
  - `findSimilarMemories(profileId, queryEmbedding, limit, threshold)` → cosine similarity query
  - `findSimilarChunks(profileId, queryEmbedding, limit, threshold)` → cosine similarity query
- **Fallback**: si embeddings fallan, los servicios usan keyword scoring

#### 6.7 Memory Module
- **Archivos**: `memory.service.ts`, `memory.module.ts`
- **Métodos**:
  - `addMemory(profileId, content, category, importance, metadata?)` → crea registro + genera embedding async
  - `getRelevantMemories(profileId, query, limit)` → vector similarity → fallback keyword scoring
  - `getMemoriesByCategory(profileId, category)`
  - `getAllMemories(profileId)`
  - `getTimeline(profileId)`
  - `addTimelineEvent(profileId, event, category, newValue, previousValue?, source?)`
  - `deleteMemory(id)`

#### 6.8 Document Module
- **Archivos**: `document.controller.ts`, `document.service.ts`, `document.module.ts`
- **Endpoints**: `POST /documents/:profileId/upload` (multipart), `GET /documents/:profileId`, `GET /documents/detail/:documentId`, `DELETE /documents/:documentId`
- **Procesamiento**:
  1. Upload → guarda en MinIO (bucket: `documents`)
  2. Chunking: 500 palabras por chunk, 50 palabras overlap
  3. Cada chunk → genera embedding y guarda con `storeChunkEmbedding()`
  4. Estado: `processing` → `ready` / `error`
- **RAG**: `findRelevantChunks()` busca chunks similares por vector → fallback keyword

#### 6.9 Voice Module
- **Archivos**: `voice.controller.ts`, `voice.service.ts`, `voice.module.ts`
- **Endpoints**: `POST /voice/:profileId/upload`, `GET /voice/:profileId/samples`, `GET /voice/samples/:sampleId`, `POST /voice/stt`, `POST /voice/tts`
- **STT**: OpenAI Whisper API (`whisper-1`). Envía audio como FormData con `Authorization: Bearer` header
- **TTS**: OpenAI TTS API (`tts-1`, voice `alloy`). POST JSON con `Authorization: Bearer` header. Formato wav
- **Voice Samples**: se guardan en MinIO (bucket: `voice-samples`). URLs presignadas para descarga
- **Fallback**: si TTS falla, genera archivo WAV de silencio
- **Voice Cloning**: flag `VOICE_CLONING_ENABLED` (actualmente `false`)

#### 6.10 Avatar Module
- **Archivos**: `avatar.controller.ts`, `avatar.service.ts`, `avatar.module.ts`
- **Funcionalidad**: CRUD de `AvatarConfig` (skin, mood, accessories)

#### 6.11 Health Controller
- **Endpoint**: `GET /health`
- **Response**: `{ status: "ok", timestamp, version: "0.1.0", checks: { database: "ok", pgvector: "ok" } }`

### Swagger
- Disponible en `http://localhost:3001/api/docs`
- Documentación automática con `@nestjs/swagger`

### Validation Pipeline
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,       // Strip unknown properties
  transform: true,       // Auto-transform types
  forbidNonWhitelisted: true, // Reject unknown properties with 400
}));
```

### CORS
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
});
```

---

## 7. Frontend Web — Next.js

### Tema Visual "Cloned"
Paleta cálida, clara, emocional:
```
Background:    #FDFAF6 (crema suave)
Card:          #FFFFFF
Border:        #E8DFD3 (arena)
Accent:        #C08552 (marrón cálido)
Accent Light:  #D4A574
Accent Dark:   #9A6B3E
Text:          #2D2A26 (casi negro)
Muted:         #8C8279
Success:       #5A8A5E
Danger:        #C25B4A
Hero gradient: #FDF5EC
```

### Páginas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `app/page.tsx` | Landing page emocional en español. Logo, hero, how-it-works, features, FAQ, footer |
| `/auth/login` | `app/auth/login/page.tsx` | Login form (email + password) |
| `/auth/register` | `app/auth/register/page.tsx` | Register form (nombre, email, password) |
| `/dashboard` | `app/dashboard/page.tsx` | Lista de perfiles con progreso y badge de estado |
| `/dashboard/[profileId]` | `app/dashboard/[profileId]/page.tsx` | Detalle del perfil (radar chart, stats) |
| `/dashboard/[profileId]/enrollment` | `enrollment/page.tsx` | Flujo de preguntas turn-by-turn |
| `/dashboard/[profileId]/chat` | `chat/page.tsx` | Chat con el clon |
| `/dashboard/[profileId]/voice` | `voice/page.tsx` | Upload voice samples, STT/TTS |
| `/dashboard/[profileId]/avatar` | `avatar/page.tsx` | Configuración de avatar |

### Estado Global (Zustand)

4 stores en `lib/store.ts`:

1. **useAuthStore**: `token`, `user`, `login()`, `register()`, `logout()`, `loadFromStorage()`
2. **useProfileStore**: `profiles[]`, `currentProfile`, `fetchProfiles()`, `createProfile(name)`, `fetchProfile(id)`, `deleteProfile(id)`, `activateProfile(id)`
3. **useEnrollmentStore**: `currentQuestion`, `progress`, `startEnrollment(profileId)`, `fetchNextQuestion(profileId)`, `submitAnswer(profileId, questionId, answer)`, `fetchProgress(profileId)`
4. **useChatStore**: `sessions[]`, `currentSessionId`, `messages[]`, `streaming`, `streamText`, `createSession(profileId)`, `fetchSessions(profileId)`, `fetchMessages(sessionId)`, `sendMessage(sessionId, content)`, `appendStreamChunk()`, `finalizeStream()`

### API Client (`lib/api.ts`)
- Base URL: `NEXT_PUBLIC_API_URL || 'http://localhost:3001'`
- Request interceptor: agrega `Authorization: Bearer <token>` desde localStorage (`cloned_token`)
- Response interceptor: si 401 → limpia token y redirige a login

### Componentes UI
| Componente | Propósito |
|---|---|
| `Button` | Botón con variants (primary, ghost, danger) y loading state |
| `Card` | Card container con efecto hover |
| `Input` | Input con label y error state |
| `Badge` | Muestra ProfileStatus con colores |
| `ProgressBar` | Barra de progreso animada |
| `ChatBubble` | Burbuja de chat con diferenciación USER/PERSONA |
| `RadarChart` | Gráfico radar para coverage map (8 ejes) |
| `Avatar` | Componente de avatar configurable |
| `SimulationBanner` | Banner informativo |

### Next.js Config
```javascript
// Modo normal (dev):
rewrites: [{ source: '/api/:path*', destination: 'http://localhost:3001/:path*' }]

// Modo GitHub Pages (GH_PAGES=true):
output: 'export', basePath: '/cloned', assetPrefix: '/cloned', images: { unoptimized: true }
```

---

## 8. App Android

### Stack
- Kotlin 2.0.0 + Jetpack Compose
- Retrofit 2.9.0 + OkHttp 4.12.0 + Gson
- Compose Navigation
- compileSdk=34, minSdk=26, targetSdk=34

### Funcionalidades implementadas
- Login / Register screens
- Profile list con estado
- Enrollment flow
- Chat screen
- Dark mode support
- SharedPreferences para token

### Estado
- APK compilado exitosamente (15.9 MB)
- Funcional pero necesita testing end-to-end con API real

---

## 9. Infraestructura Docker

### docker-compose.yml (3 servicios):

```yaml
services:
  postgres:   # pgvector/pgvector:pg16, puerto 5432
  redis:      # redis:7-alpine, puerto 6379
  minio:      # minio/minio:latest, puertos 9000/9001
```

### Containers:
| Container | Puerto | Credenciales |
|---|---|---|
| `deadbot-postgres` | 5432 | user: `deadbot`, pass: `deadbot_dev_2024`, db: `deadbot` |
| `deadbot-redis` | 6379 | sin password |
| `deadbot-minio` | 9000 (API) / 9001 (Console) | user: `deadbot`, pass: `deadbot_dev_2024` |

### Healthchecks
- PostgreSQL: `pg_isready -U deadbot`
- Redis: `redis-cli ping`
- MinIO: `mc ready local`

---

## 10. Configuración de Variables de Entorno

### Archivo: `services/api/.env` (NO versionado)

```dotenv
# Database
DATABASE_URL=postgresql://deadbot:deadbot_dev_2024@localhost:5432/deadbot

# Cache
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=cloned-dev-secret-change-in-production
JWT_EXPIRY=7d

# MinIO (Object Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=deadbot
MINIO_SECRET_KEY=deadbot_dev_2024
MINIO_USE_SSL=false

# LLM (OpenAI)
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=<TU_OPENAI_API_KEY>
LLM_MODEL=gpt-4o-mini

# Embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDINGS_ENABLED=true

# Voice
STT_API_URL=https://api.openai.com/v1/audio/transcriptions
TTS_API_URL=https://api.openai.com/v1/audio/speech
VOICE_CLONING_ENABLED=false

# Server
PORT=3001
```

### NOTA IMPORTANTE sobre JWT Secret
Hay una inconsistencia menor en el fallback del JWT secret:
- `auth.module.ts` y `jwt.strategy.ts` usan fallback `'cloned-dev-secret'`
- `chat.gateway.ts` usa fallback `'cloned-dev-secret-change-in-production'`
- El `.env` tiene `cloned-dev-secret-change-in-production`

**Mientras el .env esté cargado, no hay problema** porque todos leen de `process.env.JWT_SECRET`. Pero si el .env no carga, habría mismatch. **Recomendación**: unificar todos los fallbacks.

---

## 11. API Endpoints Completos

### Auth
```
POST   /auth/register     { email, password, displayName }  → { accessToken, user }
POST   /auth/login         { email, password }               → { accessToken, user }
GET    /auth/me            (Bearer token)                    → { user }
```

### Profiles (requiere Bearer token)
```
GET    /profiles                    → Profile[]
POST   /profiles                    { name }                → Profile
GET    /profiles/:id                                        → Profile (con avatar, timeline)
DELETE /profiles/:id                                        → { deleted: true }
POST   /profiles/:id/activate                               → Profile
POST   /profiles/:id/export                                 → { profile, memories, questions, timeline, sessions }
```

### Enrollment (requiere Bearer token)
```
POST   /enrollment/:profileId/start                         → { id, profileId, category, question, turnNumber }
GET    /enrollment/:profileId/next-question                  → { id, profileId, category, question, turnNumber }
POST   /enrollment/:profileId/answer    { questionId, answer } → { profileId, totalInteractions, percentComplete, coverageMap, isReady }
GET    /enrollment/:profileId/progress                       → { profileId, totalInteractions, percentComplete, coverageMap, isReady }
```

### Chat (requiere Bearer token)
```
POST   /chat/:profileId/sessions                            → ChatSession
GET    /chat/:profileId/sessions                             → ChatSession[]
GET    /chat/sessions/:sessionId/messages                    → ChatMessage[]
POST   /chat/sessions/:sessionId/messages  { content, voiceUsed? } → { userMessage, personaMessage }
```

### WebSocket (namespace /chat)
```
Connect: handshake.auth.token = JWT
Event:   chat:send   { sessionId, content, userId }
Emits:   chat:stream { sessionId, chunk }
Emits:   chat:end    { sessionId }
Emits:   chat:error  { sessionId, error }
```

### Documents (requiere Bearer token)
```
POST   /documents/:profileId/upload   (multipart: file)     → Document
GET    /documents/:profileId                                 → Document[]
GET    /documents/detail/:documentId                         → Document (con chunks y downloadUrl)
DELETE /documents/:documentId                                → void
```

### Voice (requiere Bearer token)
```
POST   /voice/:profileId/upload      (multipart: audio)     → VoiceSample
GET    /voice/:profileId/samples                             → VoiceSample[]
GET    /voice/samples/:sampleId                              → { ...sample, url }
POST   /voice/stt                    (multipart: audio)      → { text }
POST   /voice/tts                    { text, profileId? }    → audio binary (wav)
```

### Avatar (requiere Bearer token)
```
GET    /avatar/:profileId                                    → AvatarConfig
PUT    /avatar/:profileId            { skin, mood, accessories } → AvatarConfig
```

### Health
```
GET    /health → { status, timestamp, version, checks: { database, pgvector } }
```

---

## 12. Flujo de Usuario E2E

```
1. REGISTRO/LOGIN
   POST /auth/register → obtener accessToken
   
2. CREAR PERFIL
   POST /profiles { name: "Abuelo Juan" }
   → Profile con status: ENROLLING, coverageMap con 8 categorías a 0

3. ENROLLMENT (repetir 50+ veces)
   POST /enrollment/:profileId/start → primera pregunta
   
   Loop:
     POST /enrollment/:profileId/answer { questionId, answer }
       → Guarda respuesta
       → Crea CognitiveMemory + embedding vectorial
       → Actualiza coverageMap
       → Si listo → evalúa consistencyScore vía LLM → status = ACTIVE
     
     GET /enrollment/:profileId/next-question → siguiente pregunta

4. PERFIL ACTIVO
   Cuando todas las categorías están cubiertas (5 mín cada una)
   Y totalInteractions >= 50
   → Auto-evaluación de consistencia
   → status cambia a ACTIVE

5. CHAT
   POST /chat/:profileId/sessions → crear sesión
   POST /chat/sessions/:sessionId/messages { content: "Hola abuelo" }
   → Busca memorias relevantes (vector similarity)
   → Busca chunks de documentos (RAG)
   → Construye system prompt con personalidad
   → Genera respuesta como abuelo Juan vía gpt-4o-mini
   → Guarda interacción como nueva memoria

6. VOZ (opcional)
   POST /voice/:profileId/upload → subir samples de voz
   POST /voice/stt { audio } → transcripción con Whisper
   POST /voice/tts { text } → síntesis con OpenAI TTS

7. DOCUMENTOS (opcional)
   POST /documents/:profileId/upload → sube documento
   → Chunking automático (500 palabras, 50 overlap)
   → Embedding de cada chunk
   → Disponible para RAG en chat
```

---

## 13. Estado Actual

### ✅ COMPLETADO

| Componente | Estado | Notas |
|---|---|---|
| Monorepo setup (pnpm + turbo) | ✅ | Funcional |
| Docker (Postgres + Redis + MinIO) | ✅ | 3 containers healthy |
| Prisma schema + migraciones | ✅ | 11 tablas, pgvector |
| NestJS API completa | ✅ | 11 módulos, builds sin errores |
| Auth (register/login/JWT) | ✅ | Funcional, probado |
| Profile CRUD | ✅ | Funcional, probado |
| Enrollment flow | ✅ | LLM + fallback questions |
| Chat con LLM | ✅ | REST + WebSocket streaming |
| Embeddings (pgvector) | ✅ | OpenAI text-embedding-3-small |
| Memory service (vector + keyword) | ✅ | Dual fallback |
| Document upload + RAG | ✅ | Chunking + embeddings |
| Voice STT/TTS | ✅ | OpenAI Whisper + TTS |
| Avatar config | ✅ | CRUD básico |
| Health endpoint | ✅ | DB + pgvector checks |
| Swagger | ✅ | /api/docs |
| Next.js landing page | ✅ | En español, tema cálido |
| Auth pages (login/register) | ✅ | Funcionales |
| Dashboard (profile list) | ✅ | Con progreso y badges |
| Enrollment UI | ✅ | Turn-by-turn questions |
| Chat UI | ✅ | Burbujas de chat |
| Voice UI | ✅ | Upload + STT/TTS |
| Avatar UI | ✅ | Configurador |
| Zustand stores (4) | ✅ | Auth, Profile, Enrollment, Chat |
| UI components (9) | ✅ | Button, Card, Input, Badge, etc. |
| Android app (Kotlin/Compose) | ✅ | APK compilado (15.9 MB) |
| GitHub repo | ✅ | github.com/kokenator19990/cloned |
| GitHub Pages workflow | ✅ | .github/workflows/gh-pages.yml |
| OpenAI integration | ✅ | Configurado en .env |
| Auto-evaluate consistency | ✅ | En enrollment.service |
| Auto-activate profile | ✅ | Cuando enrollment completo |
| WebSocket JWT auth | ✅ | Real jwt.verify() |

### ⚠️ PARCIALMENTE IMPLEMENTADO

| Componente | Estado | Notas |
|---|---|---|
| GitHub Pages deploy | ⚠️ | Workflow creado pero último deploy falló. Fix (generateStaticParams) listo pero NO pusheado aún |
| E2E testing | ⚠️ | Login y profile creation probados OK. Enrollment y Chat con OpenAI NO probados aún |
| Voice cloning | ⚠️ | STT/TTS funcional, pero clonación de voz deshabilitada |

### ❌ PENDIENTE

| Componente | Estado | Prioridad |
|---|---|---|
| Test E2E enrollment con OpenAI | ❌ | ALTA — verificar que gpt-4o-mini genera preguntas |
| Test E2E chat con OpenAI | ❌ | ALTA — verificar que el clon responde in character |
| Test embeddings reales | ❌ | ALTA — verificar vector similarity search |
| Git push Phase 1 changes | ❌ | ALTA — muchos cambios sin commit |
| Streaming chat en frontend | ❌ | MEDIA — el WebSocket está listo, falta conectar useChatStore con socket.io-client |
| Voice cloning real | ❌ | BAJA — requiere servicio de clonación (ElevenLabs, etc.) |
| Avatar generation con IA | ❌ | BAJA — actualmente solo config manual |
| Timeline events automáticos | ❌ | MEDIA — detectar cambios en personalidad |
| Tests unitarios | ❌ | MEDIA — solo auth.service.spec.ts existe |
| Tests E2E automatizados | ❌ | MEDIA — solo app.e2e.spec.ts existe |
| Rate limiting | ❌ | MEDIA — sin protección contra abuso |
| Email verification | ❌ | BAJA |
| Password reset | ❌ | BAJA |
| Admin panel | ❌ | BAJA |
| Multi-language support | ❌ | BAJA — actualmente solo español |
| PWA / offline support | ❌ | BAJA |
| Android E2E testing con API real | ❌ | MEDIA |
| Production deployment | ❌ | BAJA — solo desarrollo local |

---

## 14. Bugs Conocidos

### 14.1 JWT Secret Mismatch en Fallbacks
- `auth.module.ts` → `'cloned-dev-secret'`
- `jwt.strategy.ts` → `'cloned-dev-secret'`
- `chat.gateway.ts` → `'cloned-dev-secret-change-in-production'`
- **Impacto**: Si `.env` no carga, WebSocket auth fallaría vs REST auth.
- **Fix**: Unificar todos los fallbacks al mismo string.

### 14.2 GitHub Pages Deploy
- Último deploy falló por falta de `generateStaticParams()` en rutas dinámicas.
- Ya se creó `[profileId]/layout.tsx` con `generateStaticParams()`, pero NO se ha pusheado.
- GitHub Pages solo muestra landing estática; el dashboard no funciona (requiere API backend).

### 14.3 Redis No Utilizado
- Redis está corriendo en Docker pero ningún servicio lo usa actualmente.
- Pensado para: caché de sesiones, rate limiting, pub/sub para WebSocket scaling.

### 14.4 MinIO Buckets
- Los buckets `voice-samples` y `documents` deben crearse manualmente o la primera operación fallará.
- Falta auto-creación de buckets al iniciar el API.

---

## 15. Plan de Desarrollo Pendiente

### Fase 1 — COMPLETAR TESTING (Prioridad ALTA)
1. ~~Conectar OpenAI API~~ ✅
2. Test enrollment E2E: verificar que gpt-4o-mini genera preguntas inteligentes
3. Test chat E2E: verificar que el clon responde como la persona
4. Test embeddings: verificar que vector similarity retorna resultados relevantes
5. Push Phase 1 a GitHub

### Fase 2 — CHAT STREAMING EN FRONTEND
1. Conectar `useChatStore` con socket.io-client
2. Implementar streaming real en chat page
3. Mostrar texto apareciendo chunk por chunk
4. Indicador de "escribiendo..."

### Fase 3 — VOZ COMPLETA
1. Grabar audio desde el micrófono en web
2. Enviar a STT → obtener texto → enviar al chat
3. Respuesta del chat → TTS → reproducir audio
4. UI de grabación/reproducción
5. (Futuro) Voice cloning con ElevenLabs o similar

### Fase 4 — ONBOARDING Y UX
1. Tutorial de primer uso
2. Suggestions de preguntas durante enrollment
3. Indicadores visuales de progreso más detallados
4. Animaciones de transición
5. Empty states mejorados

### Fase 5 — PRODUCCIÓN
1. Rate limiting (NestJS throttler)
2. Error logging centralizado
3. Health checks mejorados
4. Auto-creación de MinIO buckets
5. Email verification
6. Password reset
7. Deploy a cloud (Railway, Fly.io, Vercel, etc.)

### Fase 6 — FEATURES AVANZADOS
1. Document upload UI mejorado (drag & drop, progress)
2. Timeline automático (detectar cambios de personalidad entre sesiones)
3. Avatar generation con IA (DALL-E o Stable Diffusion)
4. Compartir perfil (modo público de lectura)
5. Export/Import de perfiles completos
6. Multi-idioma (EN, ES, PT)

---

## 16. Comandos Esenciales

### Setup Inicial
```powershell
# Asegurar PATH (Windows)
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine")+";"+[System.Environment]::GetEnvironmentVariable("PATH","User")

# Levantar infraestructura Docker
cd c:\Users\coook\Desktop\deadbot
docker compose -f infra/docker-compose.yml up -d

# Instalar dependencias
pnpm install

# Generar Prisma client
cd services/api
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Seed de datos demo
npx prisma db seed
```

### Desarrollo
```powershell
# Compilar API
cd c:\Users\coook\Desktop\deadbot\services\api
pnpm exec nest build

# Iniciar API (foreground)
node dist/main.js

# Iniciar API (background en Windows)
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "c:\Users\coook\Desktop\deadbot\services\api\dist\main.js" -WorkingDirectory "c:\Users\coook\Desktop\deadbot\services\api" -WindowStyle Hidden

# Iniciar Web Dev
cd c:\Users\coook\Desktop\deadbot\apps\web
pnpm exec next dev --port 3000

# Build Web (producción)
pnpm exec next build

# Build Web (GitHub Pages)
$env:GH_PAGES = "true"
pnpm exec next build
```

### Base de Datos
```powershell
cd c:\Users\coook\Desktop\deadbot\services\api

# Prisma Studio (GUI)
npx prisma studio

# Reset DB
npx prisma migrate reset --force

# Seed
npx prisma db seed
```

### Git
```powershell
cd c:\Users\coook\Desktop\deadbot
$env:PATH += ";C:\Program Files\GitHub CLI"

git add -A
git commit -m "mensaje"
git push origin master
```

### Android
```powershell
cd c:\Users\coook\Desktop\deadbot\apps\android

# Build APK (requiere Java 17 y Android SDK)
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew assembleDebug
# APK en: app/build/outputs/apk/debug/app-debug.apk
```

### Test E2E Manual (PowerShell)
```powershell
# Login
$login = Invoke-RestMethod -Uri http://localhost:3001/auth/login -Method POST -ContentType "application/json" -Body '{"email":"demo@cloned.app","password":"password123"}'
$tok = $login.accessToken

# Headers
$headers = @{ Authorization = "Bearer $tok" }

# Crear perfil
$profile = Invoke-RestMethod -Uri http://localhost:3001/profiles -Method POST -ContentType "application/json" -Headers $headers -Body '{"name":"Abuelo Juan"}'

# Start enrollment
$q = Invoke-RestMethod -Uri "http://localhost:3001/enrollment/$($profile.id)/start" -Method POST -Headers $headers

# Submit answer
Invoke-RestMethod -Uri "http://localhost:3001/enrollment/$($profile.id)/answer" -Method POST -ContentType "application/json" -Headers $headers -Body "{`"questionId`":`"$($q.id)`",`"answer`":`"Mi respuesta aquí`"}"

# Chat (requiere perfil ACTIVE)
$session = Invoke-RestMethod -Uri "http://localhost:3001/chat/$($profile.id)/sessions" -Method POST -Headers $headers
Invoke-RestMethod -Uri "http://localhost:3001/chat/sessions/$($session.id)/messages" -Method POST -ContentType "application/json" -Headers $headers -Body '{"content":"Hola abuelo, ¿cómo estás?"}'
```

---

## 17. Credenciales de Desarrollo

| Servicio | Credencial | Valor |
|---|---|---|
| Demo User | email | `demo@cloned.app` |
| Demo User | password | `password123` |
| PostgreSQL | user/pass/db | `deadbot` / `deadbot_dev_2024` / `deadbot` |
| MinIO | user/pass | `deadbot` / `deadbot_dev_2024` |
| Redis | password | (sin password) |
| JWT Secret | env var | `cloned-dev-secret-change-in-production` |
| OpenAI API Key | env var | Configurar en `services/api/.env` → `LLM_API_KEY` |

---

## 18. GitHub y Deployment

### Repositorio
- **URL**: https://github.com/kokenator19990/cloned
- **Branch principal**: `master`
- **Usuario GitHub**: `kokenator19990`
- **CLI**: `gh` en `C:\Program Files\GitHub CLI`

### GitHub Pages
- **Workflow**: `.github/workflows/gh-pages.yml`
- **URL esperada**: `https://kokenator19990.github.io/cloned/`
- **Estado**: Workflow configurado, último deploy falló pero el fix ya está en local (falta push)
- **Nota**: Solo la landing page se muestra en Pages (es export estático). El dashboard requiere backend.

### .gitignore
```
node_modules/
dist/
.next/
.env
.env.local
*.log
.turbo/
coverage/
.gradle/
build/
*.apk
*.aab
```

---

## 19. Código Fuente — Referencia Rápida

### Archivos más críticos para continuar desarrollo:

| Archivo | Líneas | Qué hace |
|---|---|---|
| `services/api/src/llm/llm.service.ts` | 149 | Client OpenAI, generación de respuestas, evaluation de consistencia, system prompt builder |
| `services/api/src/chat/chat.service.ts` | 184 | Lógica de chat completa: memory retrieval + RAG + LLM response + stream |
| `services/api/src/enrollment/enrollment.service.ts` | 154 | Flujo enrollment: preguntas, respuestas, coverage map, auto-activate |
| `services/api/src/enrollment/enrollment-questions.service.ts` | 187 | LLM question gen + 96 fallback questions (12 × 8 categorías) |
| `services/api/src/memory/memory.service.ts` | 132 | Memorias cognitivas + vector similarity + keyword fallback |
| `services/api/src/embedding/embedding.service.ts` | ~130 | Embeddings OpenAI + raw SQL pgvector queries |
| `services/api/src/document/document.service.ts` | ~190 | Upload, chunking, RAG retrieval |
| `services/api/src/voice/voice.service.ts` | 174 | STT/TTS OpenAI + voice samples |
| `apps/web/lib/store.ts` | 231 | 4 Zustand stores (Auth, Profile, Enrollment, Chat) |
| `apps/web/lib/api.ts` | 33 | Axios instance con auth interceptor |
| `apps/web/app/page.tsx` | 204 | Landing page completa |
| `services/api/prisma/schema.prisma` | ~200 | Modelo de datos completo |

### Patrón de cada módulo NestJS:
```
module/
  ├── module.module.ts     # @Module con imports, providers, exports
  ├── module.controller.ts # @Controller con endpoints REST
  └── module.service.ts    # @Injectable con lógica de negocio
```

### Patrón de autenticación:
1. `@UseGuards(JwtAuthGuard)` en controller
2. `@Request() req` → `req.user.userId` (inyectado por passport)
3. Service verifica `profile.userId !== userId` → throw ForbiddenException

---

## RESUMEN EJECUTIVO

**Cloned** es una app funcional con backend completo (11 módulos NestJS), frontend web (Next.js), y app Android. La integración con OpenAI (gpt-4o-mini, embeddings, STT, TTS) está configurada pero necesita testing E2E completo. La base de datos con pgvector soporta búsqueda semántica real. El pipeline enrollment → chat está implementado end-to-end en código pero falta verificar que funcione correctamente con la API de OpenAI en producción.

**Para continuar el desarrollo**, el próximo paso inmediato es:
1. Probar el enrollment completo (una pregunta + respuesta) con OpenAI
2. Probar el chat con memorias y respuesta del clon
3. Hacer git push con todos los cambios de Phase 1
4. Luego avanzar con streaming en frontend, voz en tiempo real, y mejoras de UX
