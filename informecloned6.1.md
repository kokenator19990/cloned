# Informe Técnico Completo — Cloned v6.1

> **Fecha**: 9 de febrero de 2026  
> **Repositorio**: https://github.com/kokenator19990/cloned.git  
> **Branch**: `master`  
> **Demo live**: https://kokenator19990.github.io/cloned/  
> **Estado general**: 87% funcional — front-end navegable, backend compilable, APK construible

---

## Tabla de Contenidos

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura de Alto Nivel](#2-arquitectura-de-alto-nivel)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura del Monorepo](#4-estructura-del-monorepo)
5. [Backend — API NestJS](#5-backend--api-nestjs)
6. [Frontend — Web Next.js](#6-frontend--web-nextjs)
7. [App Android — Kotlin/Compose](#7-app-android--kotlincompose)
8. [Infraestructura — Docker](#8-infraestructura--docker)
9. [Pipeline de IA (LLM, Embeddings, STT/TTS)](#9-pipeline-de-ia-llm-embeddings-stttts)
10. [Flujo Principal de la Aplicación](#10-flujo-principal-de-la-aplicación)
11. [Base de Datos — Schema Prisma](#11-base-de-datos--schema-prisma)
12. [Sistema de Diseño (Design System)](#12-sistema-de-diseño-design-system)
13. [CI/CD y Despliegue](#13-cicd-y-despliegue)
14. [Tests](#14-tests)
15. [Errores Conocidos y Limitaciones](#15-errores-conocidos-y-limitaciones)
16. [Áreas Pendientes de Desarrollo](#16-áreas-pendientes-de-desarrollo)
17. [Guía para Nuevos Desarrolladores](#17-guía-para-nuevos-desarrolladores)
18. [Resumen Ejecutivo](#18-resumen-ejecutivo)

---

## 1. Visión General del Proyecto

**Cloned** es una plataforma de simulación cognitiva que permite a los usuarios preservar la esencia de personas queridas. A través de un proceso de "enrollment" (inscripción cognitiva), el sistema captura patrones de pensamiento, valores, humor, emociones y estilo de comunicación de una persona, creando un perfil cognitivo con el cual el usuario puede mantener conversaciones simuladas.

### Concepto Central
- El usuario crea un **perfil de persona** (padre, madre, abuelo, amigo, etc.)
- Responde **50+ preguntas** distribuidas en 8 categorías cognitivas
- Las respuestas se convierten en **memorias cognitivas** con embeddings vectoriales
- Cuando el perfil se activa, se puede **conversar** con la simulación en tiempo real
- Opcionalmente, se agregan **muestras de voz** y un **avatar personalizable**
- Documentos (fotos, escritos) pueden complementar el contexto vía **RAG**

### Principios Éticos
- Consentimiento explícito obligatorio para modelado de voz
- Aviso permanente de que es una simulación, nunca una persona real
- El usuario puede pausar o eliminar cualquier perfil en cualquier momento
- Control total sobre los datos almacenados

---

## 2. Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Web (Next.js│  │ Android      │  │ (Futuro: iOS)    │  │
│  │  :3000)      │  │ (Kotlin)     │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
└─────────┼─────────────────┼─────────────────────────────────┘
          │ HTTP/WS         │ HTTP
          ▼                 ▼
┌─────────────────────────────────────┐
│       API NestJS (:3001)            │
│  ┌────────┐ ┌──────────┐ ┌──────┐  │
│  │  Auth  │ │ Profile  │ │ Chat │  │
│  │  JWT   │ │Enrollment│ │  WS  │  │
│  ├────────┤ ├──────────┤ ├──────┤  │
│  │Document│ │  Memory  │ │Voice │  │
│  │  RAG   │ │Embedding │ │STT/TTS│ │
│  ├────────┤ ├──────────┤ ├──────┤  │
│  │ Avatar │ │   LLM    │ │Health│  │
│  └────────┘ └──────────┘ └──────┘  │
└──────┬────────────┬────────────┬────┘
       │            │            │
       ▼            ▼            ▼
┌──────────┐ ┌───────────┐ ┌─────────┐
│PostgreSQL│ │   Redis   │ │  MinIO  │
│ pgvector │ │  (cache)  │ │  (S3)   │
│  :5432   │ │   :6379   │ │  :9000  │
└──────────┘ └───────────┘ └─────────┘
                                │
                          ┌─────┴──────┐
                          │ Buckets:   │
                          │ voice-sam. │
                          │ avatars    │
                          │ documents  │
                          │ exports    │
                          └────────────┘
       │
       ▼
┌────────────────────────┐
│  LLM Provider          │
│  (OpenAI / Ollama)     │
│  Chat + Embeddings     │
│  + STT/TTS             │
└────────────────────────┘
```

---

## 3. Stack Tecnológico

### Herramientas de Construcción
| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **pnpm** | 9.1.0 | Gestor de paquetes (workspaces) |
| **Turborepo** | ^2.1.0 | Orquestador de monorepo (builds paralelos, caching) |
| **Node.js** | ≥20.0.0 | Runtime del servidor |
| **TypeScript** | ^5.4.0 | Lenguaje principal (backend y frontend web) |
| **Kotlin** | (Gradle) | Lenguaje de la app Android |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | ^10.3.0 | Framework backend (módulos, DI, decoradores) |
| **Prisma** | ^5.14.0 | ORM + migraciones de base de datos |
| **PostgreSQL** | 16 | Base de datos relacional principal |
| **pgvector** | ext. PG | Búsqueda de similaridad vectorial (embeddings) |
| **Redis** | 7 | Caché (256MB, política LRU) |
| **MinIO** | latest | Almacenamiento de objetos S3-compatible |
| **bcrypt** | ^5.1.1 | Hashing de contraseñas (salt rounds: 10) |
| **JWT** | nestjs/jwt ^10.2 | Autenticación stateless |
| **Passport** | ^10.0.3 | Estrategias de autenticación (JWT, Local) |
| **Socket.IO** | ^4.7.4 | WebSocket para chat en tiempo real |
| **OpenAI SDK** | ^4.40.0 | Cliente LLM/embeddings/STT/TTS |
| **AWS S3 SDK** | ^3.500.0 | Interacción con MinIO |
| **multer** | ^1.4.5 | Manejo de subida de archivos |
| **class-validator** | — | Validación de DTOs |
| **ioredis** | ^5.3.2 | Cliente Redis |
| **Swagger** | ^7.3.0 | Documentación automática de API |

### Frontend Web
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | ^14.2.0 | Framework React (App Router, SSG/SSR) |
| **React** | ^18.3.0 | Biblioteca de UI |
| **Tailwind CSS** | ^3.4.0 | CSS utilitario (tema cálido personalizado) |
| **Zustand** | ^4.5.0 | State management (4 stores) |
| **Socket.IO Client** | ^4.8.3 | WebSocket para streaming de chat |
| **Axios** | ^1.7.0 | Cliente HTTP con interceptores |
| **Lucide React** | ^0.400.0 | Iconografía SVG |
| **clsx + tailwind-merge** | — | Utilidades para clases condicionales |

### Android
| Tecnología | Propósito |
|------------|-----------|
| **Kotlin** | Lenguaje principal |
| **Jetpack Compose** | UI declarativa |
| **Material3** | Componentes de diseño |
| **Retrofit / OkHttp** | Cliente HTTP (via ApiClient) |
| **Gradle + Kotlin DSL** | Build system |
| **Android SDK 34** | Target API level |

### Infraestructura
| Herramienta | Propósito |
|-------------|-----------|
| **Docker Compose** | Orquestación de servicios locales |
| **GitHub Actions** | CI/CD (deploy a GitHub Pages) |
| **GitHub Pages** | Hosting del front-end estático |

---

## 4. Estructura del Monorepo

```
deadbot/                          # Raíz del monorepo
├── package.json                  # Scripts raíz, configuración pnpm workspaces
├── pnpm-workspace.yaml           # Definición de workspaces: apps/*, services/*, packages/*
├── turbo.json                    # Pipeline Turborepo (build, dev, test, lint)
├── eslint.config.mjs             # ESLint compartido
│
├── apps/
│   ├── web/                      # 🌐 Frontend Next.js 14
│   │   ├── app/                  # App Router (pages, layouts)
│   │   │   ├── page.tsx          # Landing page pública
│   │   │   ├── layout.tsx        # Root layout (metadata, fonts)
│   │   │   ├── globals.css       # CSS global + variables + animaciones
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx      # Lista de perfiles + crear perfil
│   │   │       ├── layout.tsx    # Shell del dashboard (navbar, auth guard)
│   │   │       └── [profileId]/
│   │   │           ├── page.tsx          # Detalle del perfil + stats
│   │   │           ├── enrollment/page.tsx  # Interfaz de enrollment
│   │   │           ├── chat/page.tsx        # Chat en tiempo real
│   │   │           ├── voice/page.tsx       # Muestras de voz + STT/TTS
│   │   │           └── avatar/page.tsx      # Configuración del avatar
│   │   ├── components/
│   │   │   ├── ui/               # Componentes reutilizables
│   │   │   │   ├── Avatar.tsx    # Componente avatar SVG
│   │   │   │   ├── Badge.tsx     # Badges con variantes
│   │   │   │   ├── Button.tsx    # Botón con variantes (primary, ghost, danger)
│   │   │   │   ├── Card.tsx      # Tarjeta contenedora
│   │   │   │   ├── ChatBubble.tsx # Burbuja de chat
│   │   │   │   ├── ClonedLogo.tsx # Logo SVG inline (head gradient)
│   │   │   │   ├── Input.tsx     # Input con label
│   │   │   │   ├── ProgressBar.tsx # Barra de progreso
│   │   │   │   ├── RadarChart.tsx  # Gráfico radar cognitivo
│   │   │   │   └── SimulationBanner.tsx # Banner de aviso "es una simulación"
│   │   │   └── layout/          # Componentes de layout (vacío/futuro)
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios client (interceptores auth/401)
│   │   │   ├── socket.ts        # Socket.IO singleton
│   │   │   ├── store.ts         # 4 Zustand stores (auth, profile, enrollment, chat)
│   │   │   └── utils.ts         # cn() helper (clsx + tailwind-merge)
│   │   ├── public/
│   │   │   └── ClonedLogo.png   # Logo PNG (596KB) — usado como favicon
│   │   ├── next.config.mjs      # Config: rewrites API proxy + GH Pages static export
│   │   ├── tailwind.config.ts   # Tema cálido personalizado (cloned.*)
│   │   └── package.json
│   │
│   └── android/                  # 📱 App Android nativa
│       ├── app/src/main/java/com/deadbot/app/
│       │   ├── MainActivity.kt          # Entry point (Compose)
│       │   ├── DeadbotApplication.kt     # Application class
│       │   ├── data/
│       │   │   ├── api/ApiClient.kt      # Retrofit client
│       │   │   ├── api/ApiService.kt     # Endpoints Retrofit
│       │   │   └── model/Models.kt       # Data classes
│       │   ├── ui/
│       │   │   ├── navigation/Navigation.kt  # NavHost
│       │   │   ├── screens/
│       │   │   │   ├── LoginScreen.kt
│       │   │   │   ├── RegisterScreen.kt
│       │   │   │   ├── ProfileListScreen.kt
│       │   │   │   ├── ProfileDetailScreen.kt
│       │   │   │   ├── EnrollmentScreen.kt
│       │   │   │   └── ChatScreen.kt
│       │   │   └── theme/ (Color.kt, Theme.kt, Type.kt)
│       │   └── viewmodel/
│       │       ├── AuthViewModel.kt
│       │       ├── ProfileViewModel.kt
│       │       ├── EnrollmentViewModel.kt
│       │       └── ChatViewModel.kt
│       ├── build.gradle.kts
│       └── gradlew.bat
│
├── services/
│   ├── api/                      # 🔧 Backend NestJS
│   │   ├── src/
│   │   │   ├── main.ts           # Bootstrap NestJS (puerto 3001, CORS)
│   │   │   ├── app.module.ts     # Módulo raíz (12 módulos importados)
│   │   │   ├── auth/             # Autenticación (register, login, JWT, bcrypt)
│   │   │   ├── profile/          # CRUD perfiles persona
│   │   │   ├── enrollment/       # Flujo de inscripción cognitiva
│   │   │   ├── chat/             # Chat HTTP + WebSocket (Gateway)
│   │   │   ├── memory/           # Memorias cognitivas + timeline
│   │   │   ├── embedding/        # Generación/búsqueda de embeddings pgvector
│   │   │   ├── llm/              # Integración LLM (OpenAI-compatible)
│   │   │   ├── voice/            # Subida de voz, STT (Whisper), TTS
│   │   │   ├── avatar/           # Config de avatar (skin, mood, accesorios)
│   │   │   ├── document/         # Upload, chunking, RAG
│   │   │   ├── prisma/           # PrismaModule (servicio global)
│   │   │   ├── health/           # Endpoint /health
│   │   │   └── test/             # Tests (unit + e2e)
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # 11 modelos, 3 enums, vector fields
│   │   │   ├── seed.ts           # Seed usuario demo + perfil
│   │   │   └── migrations/       # 2 migraciones aplicadas
│   │   └── package.json
│   │
│   └── ai/                       # 🤖 Microservicio IA (VACÍO — placeholder)
│       └── src/                  # Futuro: servicio standalone IA
│
├── packages/
│   └── shared/                   # 📦 Paquete compartido
│       └── src/
│           ├── types.ts          # 20+ interfaces + 8 type aliases + constantes
│           ├── constants.ts      # Constantes del dominio (límites, mapas)
│           ├── utils.ts          # Utilidades compartidas
│           └── index.ts          # Barrel export
│
├── infra/
│   ├── docker-compose.yml        # PostgreSQL, Redis, MinIO, MinIO-init
│   └── init-pgvector.sql         # Habilitar extensión pgvector
│
├── scripts/
│   └── serve-apk.ps1             # Script PowerShell para servir APK
│
├── .github/
│   └── workflows/
│       └── gh-pages.yml          # Deploy automático a GitHub Pages
│
├── docs/                         # Documentación adicional
│   ├── DESIGN_SYSTEM.md
│   ├── DEV_PLAYBOOK.md
│   ├── STUBS.md
│   ├── DECISIONS.md
│   ├── AUDIT.md
│   └── APK_DISTRIBUTION.md
│
├── ClonedWeb/code.html           # Prototipo HTML estático de la web
└── ClonedMobile/stitch/          # 3 variantes de landing móvil (HTML)
```

---

## 5. Backend — API NestJS

### 5.1 Módulos (12 módulos)

| Módulo | Ruta | Responsabilidad |
|--------|------|----------------|
| **AuthModule** | `/auth` | Registro, login, JWT, eliminación de cuenta |
| **ProfileModule** | `/profile` | CRUD de perfiles persona |
| **EnrollmentModule** | `/enrollment` | Flujo de preguntas cognitivas |
| **ChatModule** | `/chat` + WS `/chat` | Conversaciones HTTP y WebSocket streaming |
| **MemoryModule** | `/memory` | Memorias cognitivas + timeline |
| **EmbeddingModule** | — (servicio interno) | Generación y búsqueda de embeddings |
| **LlmModule** | — (servicio interno) | Comunicación con LLM provider |
| **VoiceModule** | `/voice` | Subida de muestras, STT, TTS |
| **AvatarModule** | `/avatar` | Configuración de avatar (skin, mood, accesorios) |
| **DocumentModule** | `/document` | Upload de documentos, chunking, RAG |
| **PrismaModule** | — (global) | Servicio Prisma compartido |
| **HealthModule** | `/health` | Endpoint de salud |

### 5.2 Autenticación (`auth/`)

**Flujo de registro:**
1. Recibe `email`, `password`, `displayName`
2. Verifica que el email no exista → `ConflictException`
3. Hash de contraseña con `bcrypt.hash(password, 10)` (salt rounds: 10)
4. Crea usuario en PostgreSQL
5. Genera JWT con payload `{ sub: userId, email }`
6. Retorna `{ accessToken, user }`

**Flujo de login:**
1. Recibe `email`, `password`
2. Busca usuario por email
3. Compara con `bcrypt.compare`
4. Genera y retorna JWT

**Eliminación de cuenta:**
1. Double confirmation en el frontend
2. `DELETE /auth/account` — elimina en cascada todos los perfiles, memorias, sesiones, etc.
3. Luego elimina el usuario

**Guard:** `JwtAuthGuard` protege todas las rutas excepto registro, login y health.

### 5.3 Perfiles (`profile/`)

**Endpoints:**
- `GET /profile` — Lista perfiles del usuario autenticado
- `POST /profile` — Crear perfil (name, relationship?, description?)
- `GET /profile/:id` — Detalle del perfil
- `PUT /profile/:id` — Actualizar perfil
- `DELETE /profile/:id` — Eliminar perfil (cascada)
- `POST /profile/:id/activate` — Forzar activación

**CreateProfileDto:**
```typescript
class CreateProfileDto {
  @IsString() name: string;
  @IsOptional() @IsString() relationship?: string;
  @IsOptional() @IsString() description?: string;
}
```

**Nota:** Los campos vacíos (`""`) se transforman a `null` en el servicio.

### 5.4 Enrollment (`enrollment/`)

**Proceso de inscripción cognitiva — 8 categorías:**

| Categoría | Descripción |
|-----------|-------------|
| LINGUISTIC | Estilo de lenguaje, vocabulario, muletillas |
| LOGICAL | Forma de razonar y resolver problemas |
| MORAL | Principios éticos y dilemas morales |
| VALUES | Qué valora y prioriza en la vida |
| ASPIRATIONS | Sueños, metas, lo que quería lograr |
| PREFERENCES | Gustos, aversiones, preferencias cotidianas |
| AUTOBIOGRAPHICAL | Historias de vida, recuerdos significativos |
| EMOTIONAL | Respuestas emocionales, temperamento, empatía |

**Flujo:**
1. `POST /enrollment/:profileId/start` — Inicia enrollment, genera primera pregunta
2. `POST /enrollment/:profileId/answer` — Envía respuesta, genera siguiente pregunta
3. `GET /enrollment/:profileId/progress` — Consulta progreso

**Generación de preguntas:**
- El LLM analiza el `coverageMap` (categorías cubiertas/faltantes)
- Genera preguntas orientadas a la categoría con menor cobertura
- Evita repetir preguntas previas (últimas 5 como contexto)

**Almacenamiento:**
- Cada respuesta → `EnrollmentQuestion` (registro de la pregunta/respuesta)
- Cada respuesta → `CognitiveMemory` (importancia 0.7, embedding generado async)

**Activación automática:**
- Requiere ≥50 interacciones totales
- Requiere ≥5 interacciones por categoría (8 categorías)
- Al cumplirse: evalúa consistencia vía LLM (score 0.0-1.0)
- Cambia status a `ACTIVE`

**Fórmula de progreso:**
```
percentComplete = (60% × interacciones/50) + (40% × categoríasCubiertas/8)
```

### 5.5 Chat (`chat/`)

**Dos modos de comunicación:**

1. **HTTP (fallback):** `POST /chat/:sessionId/message` → respuesta completa
2. **WebSocket (primario):** Namespace `/chat`, evento `chat:send`

**Flujo WebSocket:**
```
Client → chat:send { sessionId, content }
Server → chat:stream { sessionId, chunk }  (múltiples veces)
Server → chat:end { sessionId }
```

**Construcción del contexto (por cada mensaje):**
1. Recupera memorias relevantes vía similaridad vectorial (RAG)
2. Recupera chunks de documentos relevantes (RAG)
3. Construye `systemPrompt` con la personalidad del perfil:
   - Memorias agrupadas por categoría (máx. 5 por categoría)
   - Contexto de documentos
   - Instrucciones: "Eres esta persona, mantén su estilo, humor, contradicciones"
4. LLM genera respuesta en streaming (AsyncGenerator)
5. Cada chunk se emite al cliente

**Autenticación WebSocket:**
- Token JWT enviado en `handshake.auth.token`
- Verificado con `jwt.verify` en `handleConnection`

### 5.6 Embeddings y Búsqueda Vectorial (`embedding/`)

- **Modelo**: `text-embedding-3-small` (1536 dimensiones)
- **Almacenamiento**: Campo `vector(1536)` en PostgreSQL via pgvector
- **Búsqueda**: Distancia coseno (`1 - (embedding <=> queryVector)`)
- **Threshold**: 0.3 (descarta resultados con similaridad < 0.3)
- **Fallback**: Si embeddings están deshabilitados, usa scoring por keywords

**Tablas con embeddings:**
- `CognitiveMemory.embedding` — Memorias del enrollment
- `DocumentChunk.embedding` — Chunks de documentos subidos

### 5.7 Voz (`voice/`)

**Funcionalidades:**
- `POST /voice/:profileId/upload` — Sube muestra de voz a MinIO
- `POST /voice/:profileId/consent` — Graba frase de consentimiento de voz
- `GET /voice/:profileId/samples` — Lista muestras
- `POST /voice/stt` — Speech-to-Text (Whisper API)
- `POST /voice/tts` — Text-to-Speech (OpenAI TTS API)

**STT:** Envia audio a Whisper API compatible → retorna texto transcrito  
**TTS:** Envia texto → retorna buffer WAV (`tts-1`, voz `alloy`)  
**Fallback:** Si TTS falla, genera archivo WAV de silencio

### 5.8 Avatar (`avatar/`)

- `GET /avatar/:profileId/config` — Obtener config (o crear default)
- `PUT /avatar/:profileId/config` — Actualizar skin, mood, accesorios
- `POST /avatar/:profileId/upload` — Subir foto base

**Opciones:**
- **Skins**: default, hoodie, suit, casual, dark, neon
- **Moods**: neutral, happy, serious, angry, sad, excited
- **Accesorios**: none, cap, hood, glasses, headphones

### 5.9 Documentos + RAG (`document/`)

**Flujo:**
1. `POST /document/:profileId/upload` — Sube documento a MinIO
2. Background: lee texto, divide en chunks (500 palabras, 50 overlap)
3. Cada chunk → `DocumentChunk` + embedding generado
4. En chat: `findRelevantChunks(profileId, query)` trae chunks más similares
5. Se inyectan en el system prompt como contexto adicional

---

## 6. Frontend — Web Next.js

### 6.1 Páginas y Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `app/page.tsx` | Landing page pública (hero, cómo funciona, ética, CTA) |
| `/auth/login` | `app/auth/login/page.tsx` | Formulario de login |
| `/auth/register` | `app/auth/register/page.tsx` | Formulario de registro |
| `/dashboard` | `app/dashboard/page.tsx` | Lista de perfiles + formulario de creación |
| `/dashboard/[profileId]` | `app/dashboard/[profileId]/page.tsx` | Detalle del perfil (stats, radar) |
| `/dashboard/[profileId]/enrollment` | `.../enrollment/page.tsx` | Interfaz conversacional de enrollment |
| `/dashboard/[profileId]/chat` | `.../chat/page.tsx` | Chat en tiempo real con el perfil |
| `/dashboard/[profileId]/voice` | `.../voice/page.tsx` | Grabación de voz + STT/TTS |
| `/dashboard/[profileId]/avatar` | `.../avatar/page.tsx` | Configuración visual del avatar |

### 6.2 State Management (Zustand)

**4 stores independientes:**

| Store | Estado | Acciones Principales |
|-------|--------|---------------------|
| `useAuthStore` | token, user, loading | login, register, logout, loadFromStorage |
| `useProfileStore` | profiles[], currentProfile | fetchProfiles, createProfile, deleteProfile, activateProfile |
| `useEnrollmentStore` | currentQuestion, progress, loading | startEnrollment, submitAnswer, fetchProgress |
| `useChatStore` | sessions[], messages[], streaming, streamText | createSession, sendMessage (WS→HTTP fallback) |

**Persistencia:** Token JWT guardado en `localStorage` como `cloned_token`.

### 6.3 API Client (`lib/api.ts`)

```typescript
// Axios instance con interceptores
const api = axios.create({ baseURL: 'http://localhost:3001' });

// Request: inyecta Bearer token automáticamente
// Response: en 401 → limpia token → redirige a /auth/login
```

### 6.4 WebSocket (`lib/socket.ts`)

- Patrón singleton: una sola conexión Socket.IO compartida
- Namespace: `/chat`
- Auth: `{ token }` en handshake
- Transports: `['websocket', 'polling']`

### 6.5 Componentes UI

| Componente | Funcionalidad |
|-----------|---------------|
| `Button` | 4 variantes: primary, secondary, ghost, danger. Soporte para loading/disabled |
| `Card` | Contenedor con bordes y padding del design system |
| `Input` | Input con label integrado |
| `Avatar` | SVG generado según skin, mood y accesorios |
| `Badge` | Badges con colores semánticos (status, categoría) |
| `ChatBubble` | Burbuja de chat con diferenciación USER/PERSONA |
| `ClonedLogo` | SVG inline del logo (gradient cyan→purple, forma de rostro) |
| `ProgressBar` | Barra de progreso con porcentaje |
| `RadarChart` | Gráfico radar de 8 categorías cognitivas |
| `SimulationBanner` | Banner fijo recordando que es una simulación |

### 6.6 Configuración Next.js

```javascript
// next.config.mjs
// Modo local: proxy /api/* → localhost:3001
// Modo GH Pages (GH_PAGES=true): output: 'export', basePath: '/cloned'
```

**Exportación estática:** 12 páginas pre-renderizadas para GitHub Pages.  
Rutas dinámicas (`[profileId]`) usan `generateStaticParams` con valor demo.

---

## 7. App Android — Kotlin/Compose

### 7.1 Estructura

| Capa | Archivos | Responsabilidad |
|------|----------|----------------|
| **UI** | 6 Screens + Navigation.kt | Pantallas Compose con Material3 |
| **ViewModel** | 4 ViewModels | Lógica de presentación (StateFlow) |
| **Data** | ApiClient + ApiService + Models | Retrofit HTTP client |
| **Theme** | Color.kt, Theme.kt, Type.kt | Material3 theme cálido |

### 7.2 Pantallas

- `LoginScreen` → autenticación
- `RegisterScreen` → registro de usuario
- `ProfileListScreen` → lista de perfiles
- `ProfileDetailScreen` → detalle y stats
- `EnrollmentScreen` → enrollment interactivo
- `ChatScreen` → chat con el perfil

### 7.3 Build

- **Paquete**: `com.deadbot.app`
- **SDK Target**: 34
- **APK Debug**: ~16MB
- **Build**: `gradlew.bat assembleDebug`
- **Output**: `app/build/outputs/apk/debug/app-debug.apk`

### 7.4 Limitaciones Android

- ⚠️ No tiene pantallas de Voice ni Avatar
- ⚠️ No soporta WebSocket streaming (solo HTTP)
- ⚠️ La URL del API está hardcoded (sin configuración dinámica)
- ⚠️ No tiene manejo de offline/retry

---

## 8. Infraestructura — Docker

### docker-compose.yml

```yaml
services:
  postgres:    # pgvector/pgvector:pg16 — Puerto 5432
  redis:       # redis:7-alpine — Puerto 6379 (256MB maxmemory)
  minio:       # minio/minio:latest — Puertos 9000 (API), 9001 (Console)
  minio-init:  # Crea buckets: voice-samples, avatars, documents, exports
```

**Credenciales de desarrollo:**
- PostgreSQL: `deadbot` / `deadbot_dev_2024` / DB: `deadbot`
- MinIO: `deadbot` / `deadbot_dev_2024`

**Init SQL:** `CREATE EXTENSION IF NOT EXISTS vector;`

**Volumes:** `pgdata` (datos PG), `miniodata` (archivos)

---

## 9. Pipeline de IA (LLM, Embeddings, STT/TTS)

### 9.1 LLM — Generación de Texto

**Configuración (variables de entorno):**
| Variable | Default | Descripción |
|----------|---------|-------------|
| `LLM_BASE_URL` | `https://api.openai.com/v1` | URL base del provider |
| `LLM_API_KEY` | — | API key |
| `LLM_MODEL` | `gpt-4o-mini` | Modelo a usar |

**Compatible con:** OpenAI, Ollama (local: `http://localhost:11434/v1`), Azure OpenAI, cualquier API compatible OpenAI.

**Funciones LLM:**
1. **Generar pregunta de enrollment**: Analiza coverageMap, evita repeticiones
2. **Evaluar consistencia**: Score 0.0-1.0 de coherencia del perfil
3. **Construir system prompt de persona**: Inyecta memorias + documentos
4. **Generar respuestas en conversación**: Streaming vía AsyncGenerator

### 9.2 Embeddings — Búsqueda Semántica

| Variable | Default |
|----------|---------|
| `EMBEDDING_MODEL` | `text-embedding-3-small` |
| `EMBEDDINGS_ENABLED` | `true` |

- **Dimensiones**: 1536
- **Almacenamiento**: pgvector en PostgreSQL
- **Búsqueda**: Distancia coseno, threshold 0.3
- **Uso**: RAG para chat (memorias + documentos)

### 9.3 STT / TTS

| Servicio | API | Modelo |
|----------|-----|--------|
| Speech-to-Text | Whisper compatible | — |
| Text-to-Speech | OpenAI TTS | `tts-1`, voz `alloy` |

**Configuración:** `STT_API_URL`, `TTS_API_URL`, `VOICE_CLONING_ENABLED`

---

## 10. Flujo Principal de la Aplicación

### Flujo completo de un usuario:

```
1. REGISTRO
   └─ POST /auth/register {email, password, displayName}
   └─ Recibe JWT token

2. CREAR PERFIL
   └─ POST /profile {name: "Abuelo Juan", relationship: "Abuelo", description: "..."}
   └─ Status: ENROLLING, coverageMap vacío

3. ENROLLMENT (50+ interacciones)
   └─ POST /enrollment/:id/start → Primera pregunta
   └─ Repite:
      ├─ POST /enrollment/:id/answer {questionId, answer}
      ├─ Respuesta → CognitiveMemory + embedding async
      ├─ CoverageMap actualizado
      └─ Si completo: LLM evalúa consistencia → ACTIVE

4. CHAT (perfil ACTIVE)
   └─ POST /chat/session {profileId} → Crear sesión
   └─ WS chat:send {sessionId, content}
   └─ Backend:
      ├─ Busca memorias similares (pgvector RAG)
      ├─ Busca chunks de docs similares (pgvector RAG)
      ├─ Construye system prompt con personalidad
      └─ LLM genera respuesta en streaming
   └─ WS chat:stream → chunks al cliente
   └─ WS chat:end → fin del mensaje

5. VOZ (opcional)
   └─ Grabar consentimiento (10 seg)
   └─ Subir muestras de voz
   └─ Probar STT (navegador Web Speech API)
   └─ Probar TTS (navegador SpeechSynthesis o API)

6. AVATAR (opcional)
   └─ Elegir skin, mood, accesorios
   └─ Subir foto base

7. DOCUMENTOS (opcional)
   └─ Subir fotos, escritos, cartas
   └─ Chunking + embedding → RAG en conversaciones
```

---

## 11. Base de Datos — Schema Prisma

### Diagrama de Relaciones

```
User (1) ─────── (*) PersonaProfile (1) ─── (*) EnrollmentQuestion
  │                     │                         
  │                     ├── (*) CognitiveMemory [vector(1536)]
  │                     ├── (*) ChatSession ─── (*) ChatMessage
  │                     ├── (*) VoiceSample
  │                     ├── (1) AvatarConfig
  │                     ├── (*) PersonaTimeline
  │                     ├── (*) Document ─── (*) DocumentChunk [vector(1536)]
  │                     │
  └── (*) ChatSession (vía userId)
```

### Cascade Delete
Eliminar un `PersonaProfile` elimina en cascada:
- Todas las `EnrollmentQuestion`
- Todas las `CognitiveMemory`
- Todas las `ChatSession` → `ChatMessage`
- Todas las `VoiceSample`
- El `AvatarConfig`
- Todos los `Document` → `DocumentChunk`
- Todos los `PersonaTimeline`

Eliminar un `User` elimina en cascada todos sus `PersonaProfile` (y todo lo anterior).

### Migraciones
1. `20260209194935_init` — Schema inicial completo
2. `20260209200647_add_documents_and_vector_embeddings` — DocumentChunk + embeddings
3. `20260209235524_add_profile_relationship_description` — Campos relationship/description en PersonaProfile

---

## 12. Sistema de Diseño (Design System)

### Paleta de Colores — Tema Cálido

| Token | Hex | Uso |
|-------|-----|-----|
| `cloned-bg` | `#FDFAF6` | Fondo principal (crema cálido) |
| `cloned-card` | `#FFFFFF` | Fondo de tarjetas |
| `cloned-card-alt` | `#F8F2EB` | Fondo alternativo de tarjetas |
| `cloned-border` | `#E8DFD3` | Bordes suaves |
| `cloned-accent` | `#C08552` | Color principal (marrón cálido) |
| `cloned-accent-light` | `#D4A574` | Accent claro |
| `cloned-accent-dark` | `#9A6B3E` | Accent oscuro (hover) |
| `cloned-text` | `#2D2A26` | Texto principal |
| `cloned-muted` | `#8C8279` | Texto secundario |
| `cloned-soft` | `#F5EDE3` | Fondos suaves |
| `cloned-success` | `#5A8A5E` | Éxito (verde oliva) |
| `cloned-danger` | `#C25B4A` | Peligro/error (terracota) |
| `cloned-hero` | `#FDF5EC` | Fondo del hero section |

### Tipografía
- **Display (títulos)**: Georgia, Times New Roman, serif
- **Body (texto)**: Inter, system-ui, sans-serif

### Animaciones CSS
- `animate-float` — Levitación suave (translateY, 3s loop)
- `animate-pulse-ring` — Anillo pulsante (1.5s loop)
- Scrollbar customizado (thin, colores del tema)

### Idioma
- **Todo el frontend está en español** (ES)
- STT/TTS configurados con `lang: 'es-ES'`

---

## 13. CI/CD y Despliegue

### GitHub Actions — Deploy a GitHub Pages

**Workflow:** `.github/workflows/gh-pages.yml`

```
Trigger: push a master
│
├─ Checkout
├─ Setup pnpm 9.1.0
├─ Setup Node 20 (con caché pnpm)
├─ pnpm install --frozen-lockfile
├─ GH_PAGES=true pnpm --filter @cloned/web build
├─ Upload artifact: apps/web/out
└─ Deploy a GitHub Pages
```

**URL pública:** `https://kokenator19990.github.io/cloned/`

### Build local completo

```bash
# 1. Infra
docker compose -f infra/docker-compose.yml up -d

# 2. Base de datos
cd services/api && npx prisma migrate dev && npx prisma db seed

# 3. Backend
pnpm dev:api    # http://localhost:3001

# 4. Frontend
pnpm dev:web    # http://localhost:3000

# 5. Android
cd apps/android && ./gradlew assembleDebug
```

---

## 14. Tests

### Tests existentes (22/22 PASS)

| Suite | Archivo | Tests | Descripción |
|-------|---------|-------|-------------|
| Auth Unit | `auth.service.spec.ts` | 6 | register, login, getUser, validateUser, deleteAccount, error handling |
| Enrollment Unit | `enrollment.service.spec.ts` | 6 | startEnrollment, submitAnswer, getProgress, auto-activation, coverage tracking |
| E2E | `app.e2e.spec.ts` | 10 | Health, Auth flow completo, Profile CRUD, Enrollment flow, error handling |

**Framework:** Jest 30 + Supertest (e2e) + ts-jest

**Ejecución:**
```bash
cd services/api && npx jest --forceExit
```

### Cobertura de tests

**Bien cubierto:**
- Autenticación (register, login, JWT, bcrypt)
- Enrollment (preguntas, respuestas, coverageMap, activación)
- Profile CRUD
- Health endpoint
- Error handling (401, 404, conflict)

**Sin tests:**
- Chat service / gateway
- Voice service
- Avatar service
- Document service / RAG
- Memory service
- Embedding service
- LLM service
- Frontend (sin tests unitarios ni E2E)
- Android (sin tests)

---

## 15. Errores Conocidos y Limitaciones

### 🔴 Errores Críticos

| # | Error | Ubicación | Estado |
|---|-------|-----------|--------|
| 1 | **`next/image` no respeta `basePath` en static export** | `apps/web` | ✅ Corregido — reemplazado por SVG inline |
| 2 | **Favicon no incluía basePath** | `app/layout.tsx` | ✅ Corregido — usa variable basePath |
| 3 | **Cancel button hacía submit del form** | `dashboard/page.tsx` | ✅ Corregido — añadido `type="button"` |
| 4 | **`.gitignore` con caracteres NUL** | `.gitignore` | ✅ Corregido — reescrito completo |
| 5 | **JSX tags duplicados** | `[profileId]/page.tsx` | ✅ Corregido |
| 6 | **Migración Prisma no aplicada** | Schema → DB | ✅ Corregido — migration applied |

### 🟡 Limitaciones Actuales

| # | Limitación | Detalles |
|---|-----------|----------|
| 1 | **Servicio AI vacío** | `services/ai/src/` está vacío; toda la lógica IA está en el API |
| 2 | **Embeddings pueden fallar silenciosamente** | Si OpenAI no responde, se almacena null; la búsqueda cae al fallback keyword |
| 3 | **No hay rate limiting** | API sin protección contra abuso |
| 4 | **No hay refresh token** | JWT sin renovación automática; expiración = cierre de sesión |
| 5 | **GH Pages solo muestra UI estática** | Sin backend, las funciones reales no operan en la demo pública |
| 6 | **Voice cloning no implementado** | `VOICE_CLONING_ENABLED` existe pero no hay lógica real de clonación |
| 7 | **Android sin Voice/Avatar** | App móvil incompleta |
| 8 | **Sin validación de archivos en frontend** | Upload de documentos/voz acepta cualquier tipo |
| 9 | **Sin paginación** | Listas de perfiles, memorias, sesiones sin paginar |
| 10 | **Redis no se usa activamente** | Configurado pero sin caching implementado |

---

## 16. Áreas Pendientes de Desarrollo

### Prioridad Alta 🔴

| Área | Descripción | Esfuerzo Estimado |
|------|-------------|------------------|
| **Tests de Chat** | Tests unitarios para ChatService, ChatGateway (WebSocket) | 2-3 días |
| **Tests de Voice/Avatar/Document** | Cobertura de servicios sin tests | 3-4 días |
| **Rate Limiting** | Implementar throttling en endpoints sensibles (auth, chat, LLM) | 1 día |
| **Refresh Token** | JWT refresh flow (access token corto + refresh token largo) | 2 días |
| **Validación de archivos** | Verificar tipos MIME, tamaños máximos en frontend y backend | 1 día |
| **Error handling robusto** | Manejo consistente de errores LLM/embedding/S3 con retry | 2 días |

### Prioridad Media 🟡

| Área | Descripción | Esfuerzo Estimado |
|------|-------------|------------------|
| **Paginación** | Implementar cursor-based pagination en todas las listas | 2-3 días |
| **Cache Redis** | Cachear perfiles activos, memorias frecuentes, preguntas | 2 días |
| **Servicio AI standalone** | Migrar lógica LLM/embedding a `services/ai/` como microservicio | 1 semana |
| **Android: Voice + Avatar** | Añadir pantallas de voz y avatar a la app móvil | 3-4 días |
| **Android: WebSocket** | Implementar streaming de chat en la app | 2-3 días |
| **Frontend E2E tests** | Cypress o Playwright para flujos críticos (auth, enrollment, chat) | 1 semana |
| **Internacionalización (i18n)** | Sistema formal de traducciones (vs strings hardcoded) | 3-4 días |
| **PWA** | Service worker + manifest para experiencia offline web | 2 días |

### Prioridad Baja 🟢

| Área | Descripción | Esfuerzo Estimado |
|------|-------------|------------------|
| **Voice Cloning real** | Integrar servicio de clonación de voz (ElevenLabs, etc.) | 1-2 semanas |
| **Exportar perfil** | Descargar perfil cognitivo como JSON/PDF para backup | 2-3 días |
| **Notificaciones** | Push notifications para recordar enrollment, nuevos mensajes | 3 días |
| **Multi-idioma UI** | Soporte inglés + español + más idiomas | 1 semana |
| **Analytics** | Métricas de uso, engagement, calidad de respuestas LLM | 1 semana |
| **Admin panel** | Dashboard administrativo para gestión de usuarios | 1-2 semanas |
| **iOS app** | Versión iOS (Swift/SwiftUI o React Native compartido) | 2-4 semanas |
| **Deploy producción** | Migrar de GH Pages a Vercel/Railway + DB cloud + S3 real | 1 semana |

---

## 17. Guía para Nuevos Desarrolladores

### Requisitos Previos

- **Node.js** ≥ 20.0.0
- **pnpm** 9.x (`npm install -g pnpm@9`)
- **Docker** y Docker Compose
- **Android Studio** (para desarrollo móvil, SDK 34)
- **Git**

### Setup Inicial

```bash
# 1. Clonar
git clone https://github.com/kokenator19990/cloned.git
cd cloned

# 2. Instalar dependencias
pnpm install

# 3. Levantar infraestructura
docker compose -f infra/docker-compose.yml up -d

# 4. Configurar variables de entorno
cp services/api/.env.example services/api/.env
# Editar: LLM_API_KEY, DATABASE_URL, etc.

# 5. Migraciones + seed
cd services/api
npx prisma migrate dev
npx prisma db seed

# 6. Desarrollo
pnpm dev:all  # API en :3001, Web en :3000
```

### Variables de Entorno Clave

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://deadbot:deadbot_dev_2024@localhost:5432/deadbot` | PostgreSQL |
| `JWT_SECRET` | `cloned-dev-secret` | Secreto para firmar JWT |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | URL del LLM provider |
| `LLM_API_KEY` | `sk-...` | API key para LLM |
| `LLM_MODEL` | `gpt-4o-mini` | Modelo de chat |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Modelo de embeddings |
| `EMBEDDINGS_ENABLED` | `true` | Habilitar/deshabilitar pgvector |
| `S3_ENDPOINT` | `http://localhost:9000` | MinIO endpoint |
| `S3_ACCESS_KEY` | `deadbot` | MinIO access key |
| `S3_SECRET_KEY` | `deadbot_dev_2024` | MinIO secret key |

### Convenciones de Código

- **Backend**: NestJS modules → controller → service → DTO con class-validator
- **Frontend**: Pages en App Router, estado global en Zustand, estilos Tailwind
- **Nombres de archivos**: kebab-case para módulos, PascalCase para componentes
- **Commits**: formato convencional (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branch**: desarrollo directo en `master` (considerar gitflow para producción)

### Scripts Útiles

```bash
pnpm dev:all          # Dev completo (API + Web)
pnpm dev:api          # Solo backend
pnpm dev:web          # Solo frontend
pnpm build            # Build completo (turbo)
pnpm test             # Todos los tests
pnpm db:migrate       # Aplicar migraciones
pnpm db:studio        # Prisma Studio (GUI de BD)
pnpm db:seed          # Seed datos demo
pnpm docker:up        # Levantar infra
pnpm docker:down      # Detener infra
```

### Seed / Datos Demo

- **Usuario**: `demo@cloned.app` / `password123`
- **Perfil**: "Jorge" en estado ENROLLING

---

## 18. Resumen Ejecutivo

### Estado del Proyecto

| Componente | Completitud | Funcional |
|-----------|------------|-----------|
| **Backend API** | 90% | ✅ Compila, 22 tests pasan |
| **Frontend Web** | 85% | ✅ 12 páginas, navegable, GH Pages live |
| **Android App** | 60% | ✅ APK construible (16MB), faltan Voice/Avatar |
| **Base de Datos** | 95% | ✅ Schema completo, migraciones aplicadas |
| **Pipeline IA** | 80% | ⚠️ Requiere API keys válidas para funcionar |
| **Infraestructura** | 90% | ✅ Docker Compose funcional |
| **CI/CD** | 70% | ✅ GH Pages auto-deploy; falta CI para tests |
| **Tests** | 40% | ⚠️ Backend parcial; sin tests frontend/Android |
| **Documentación** | 80% | ✅ Múltiples docs existentes |

### Métricas del Build (9 feb 2026)

- **Backend tests**: 22/22 PASS (3 suites)
- **Web build (local)**: 12/12 páginas (87.5 kB shared JS)
- **Web build (GH Pages)**: 12/12 páginas, export estático
- **NestJS build**: 0 errores TypeScript
- **Android APK**: BUILD SUCCESSFUL (~16 MB)
- **Prisma migrations**: 3/3 aplicadas

### Próximos Pasos Recomendados

1. **Inmediato**: Configurar `LLM_API_KEY` y probar flujo completo (enrollment → chat)
2. **Semana 1**: Añadir tests a Chat, Voice, Document services
3. **Semana 2**: Implementar rate limiting + refresh tokens
4. **Semana 3**: Completar app Android (Voice, Avatar, WebSocket)
5. **Mes 1**: Migrar a deployment de producción (Vercel + Railway/Render)

---

*Documento generado el 9 de febrero de 2026. Para dudas contactar al equipo de desarrollo.*
