# BUGFIX REPORT - Deadbot/Cloned Project

## Fecha: 2026-02-09

### Resumen
Total de bugs corregidos: **12**
Total de features implementados: **6 módulos nuevos**
Test suites: **3** | Tests: **22** (all passing)

---

## Bugs Corregidos (Fase C1 - API Build)

| # | Archivo | Bug | Fix | Verificación |
|---|---------|-----|-----|-------------|
| 1 | `services/api/package.json` | Faltaba `@nestjs/config` | `pnpm add @nestjs/config` | Build OK |
| 2 | `services/api/src/enrollment/enrollment.service.ts` | Prisma JSON casting (3 ocurrencias) | `as unknown as Record<string, CoverageEntry>` | Build OK |
| 3 | `services/api/src/enrollment/enrollment.service.ts` | Prisma JSON write | `coverageMap as unknown as any` | Build OK |
| 4 | `services/api/src/avatar/avatar.service.ts` | Prisma accessories JSON | `(data.accessories ?? existing.accessories) as any` | Build OK |
| 5 | `services/api/src/memory/memory.service.ts` | Prisma metadata JSON | `(metadata ?? undefined) as any` | Build OK |
| 6 | `services/api/src/enrollment/enrollment.service.ts` | `CoverageEntry` no exportada | `export interface CoverageEntry` | Build OK |
| 7 | `services/api/src/enrollment/enrollment.controller.ts` | `CoverageEntry` re-export faltante | `export { CoverageEntry }` | Build OK |
| 8 | `services/api/nest-cli.json` | `deleteOutDir: true` causa build vacío en Node 24 | `deleteOutDir: false` | Build OK, 31+ archivos JS |
| 9 | `apps/web/lib/store.ts` | Falta `voiceConsentGiven` en interfaz Profile | Agregado campo `voiceConsentGiven: boolean` | Web build OK |

## Bugs Corregidos (Fase D - Features)

| # | Archivo | Bug | Fix | Verificación |
|---|---------|-----|-----|-------------|
| 10 | `infra/docker-compose.yml` | Postgres sin pgvector support | `image: pgvector/pgvector:pg16` + init SQL | pgvector=ok en /health |
| 11 | `infra/docker-compose.yml` | `version: "3.9"` obsoleto | Eliminado atributo `version` | Sin warnings |
| 12 | `services/api/src/voice/voice.service.ts` | Buffer→BlobPart incompatible (Node 24) | `new Uint8Array(audioBuffer)` | Build OK |

---

## Features Implementados (Fase D)

### D1: pgvector + RAG
- **EmbeddingService** (`src/embedding/`): Generación de embeddings via OpenAI-compatible API, store/search con pgvector cosine similarity
- **DocumentService** (`src/document/`): Upload, chunking, embedding, búsqueda por similaridad + fallback keyword
- **DocumentController**: POST upload, GET list, GET detail, DELETE
- **Prisma Schema**: Modelos `Document`, `DocumentChunk` con `Unsupported("vector(1536)")`
- **MemoryService**: Actualizado para usar vector similarity con fallback a keyword scoring
- **ChatService**: Incluye contexto de documentos relevantes (RAG) en prompt del LLM
- **LlmService**: `buildPersonaSystemPrompt()` acepta `documentContext[]`

### D2: Voice TTS/STT
- **STT**: Provider HTTP pluggable (Whisper-compatible `/v1/audio/transcriptions`), fallback graceful
- **TTS**: Provider HTTP pluggable (OpenAI-compatible `/v1/audio/speech`), fallback a WAV silencio válido
- **Feature flags**: `VOICE_CLONING_ENABLED`, `STT_API_URL`, `TTS_API_URL` en `.env`
- **GET /voice/config**: Endpoint para capabilities del servicio de voz

### D3: Health + Scripts + DX
- **GET /health**: Healthcheck con checks de database + pgvector
- **Scripts root**: `dev:api`, `dev:web`, `dev:all`, `build:api`, `build:web`, `start:api`, `typecheck`, `db:reset`, `db:studio`, `docker:reset`
- **VS Code launch.json**: Debug API, Attach, NestJS Watch, Next.js Dev, Jest Tests, compound Full Stack

### E: Tests
- **AuthService**: 8 unit tests (register, login, validate, getUser)
- **EnrollmentService**: 6 unit tests (startEnrollment, submitAnswer, getProgress)
- **E2E Integration**: 8 tests (health, register, login x2, profiles auth/unauth, voice config)
- **Total**: 22 tests, 3 suites, ALL PASSING

---

## Archivos Creados en Esta Sesión

```
services/api/src/embedding/embedding.service.ts    (EmbeddingService)
services/api/src/embedding/embedding.module.ts     (EmbeddingModule)
services/api/src/document/document.service.ts      (DocumentService)
services/api/src/document/document.controller.ts   (DocumentController)
services/api/src/document/document.module.ts       (DocumentModule)
services/api/src/health/health.controller.ts       (HealthController)
services/api/src/auth/auth.service.spec.ts         (Unit tests)
services/api/src/enrollment/enrollment.service.spec.ts (Unit tests)
services/api/src/test/app.e2e.spec.ts              (Integration tests)
services/api/jest.config.js                        (Jest config)
.vscode/launch.json                                (Debug configurations)
services/api/prisma/migrations/20260209200647_.../  (pgvector migration)
```

## Archivos Modificados en Esta Sesión

```
services/api/prisma/schema.prisma          → Document, DocumentChunk models + vector fields
services/api/src/memory/memory.service.ts  → Vector similarity + fallback
services/api/src/memory/memory.module.ts   → Import EmbeddingModule
services/api/src/chat/chat.service.ts      → Document context in RAG
services/api/src/llm/llm.service.ts        → documentContext param in buildPersonaSystemPrompt
services/api/src/voice/voice.service.ts    → Real STT/TTS with HTTP providers
services/api/src/voice/voice.controller.ts → mimetype param, voice config endpoint
services/api/src/app.module.ts             → Import EmbeddingModule, DocumentModule, HealthController
services/api/.env                          → New env vars (EMBEDDING_*, STT_*, TTS_*, VOICE_CLONING)
services/api/package.json                  → typecheck script, test deps
infra/docker-compose.yml                   → Removed obsolete version
package.json                               → All new root scripts
```
