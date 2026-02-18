# REPORT_INTEGRITY_STATUS.md — Cloned Project

> Generated: 2026-02-18

## Module Status

| Module | Status | Notes |
|--------|--------|-------|
| Landing (HTML) | ✅ OK | `landing/index.html` + `styles.css` desplegados en GitHub Pages |
| Auth (register/login) | ✅ OK | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `DELETE /auth/account` |
| **Guest Trial** | ✅ NEW | `POST /auth/guest` (JWT 30m), `POST /auth/cleanup-guests`, cron cada 10m |
| Profiles (CRUD) | ✅ OK | `GET/POST/DELETE /profiles`, `POST /profiles/:id/activate`, `POST /profiles/:id/export` |
| Guest Profile | ✅ NEW | `minInteractions: 20`, `minRequired: 2/cat` (vs 50/5 normal) |
| Enrollment | ✅ OK | `start`, `next-question`, `answer`, `progress` — fallback bank (96 preguntas) + LLM |
| Chat (HTTP) | ✅ OK | `POST /chat/:profileId/sessions`, `GET sessions`, `POST messages` |
| Chat (WS) | ✅ OK | `chat:send` → stream → `chat:end`, JWT auth en handshake |
| LLM | ✅ OK | OpenAI-compatible (configurable vía `LLM_BASE_URL`, `LLM_MODEL`) |
| Memory | ✅ OK | `addMemory`, `getRelevantMemories` (vector + keyword fallback) |
| Voice | ⚠️ Parcial | Config endpoint OK, cloning depende de S3/provider externo |
| Avatar | ⚠️ Parcial | Config CRUD OK, rendering no implementado |
| Documents (RAG) | ✅ OK | Upload + chunking + embedding + retrieval en chat |
| Share/Export | ⚠️ Parcial | `POST /profiles/:id/export` existe (JSON dump). Share por link no implementado |
| Import | ❌ No impl. | No existe endpoint de import |
| Feedback (👍/👎) | ❌ No impl. | No existe endpoint dedicado. La corrección se hace vía chat (memory learning) |

## Archivos Tocados (Guest Trial)

### Backend (`services/api/`)
| Archivo | Cambio |
|---------|--------|
| `prisma/schema.prisma` | `isGuest`, `guestExpiresAt` en User |
| `src/auth/auth.service.ts` | `createGuest()`, `cleanupExpiredGuests()` |
| `src/auth/auth.controller.ts` | `POST /auth/guest`, `POST /auth/cleanup-guests` |
| `src/auth/jwt.strategy.ts` | `isGuest` en payload |
| `src/auth/auth.module.ts` | + `GuestCleanupService` |
| `src/auth/guest-cleanup.service.ts` | **NEW** — cron `@Cron('*/10 * * * *')` |
| `src/profile/profile.service.ts` | Guest-aware `createProfile()` |
| `src/app.module.ts` | + `ScheduleModule.forRoot()` |

### Frontend (`landing/`)
| Archivo | Cambio |
|---------|--------|
| `index.html` | Botón guest, banner countdown, JS (fetch + localStorage) |
| `styles.css` | `.btn--guest`, `.guest-banner`, `@keyframes slideDown` |

### Tests
| Archivo | Cambio |
|---------|--------|
| `src/auth/auth.service.spec.ts` | + `createGuest`, `cleanupExpiredGuests` tests |
| `src/test/app.e2e.spec.ts` | + Guest trial E2E (create, profile, me, cleanup) |

## Gaps Restantes

1. **Feedback endpoint dedicado** — actualmente no hay `POST /feedback`. La corrección del usuario se incorpora vía chat (memory learning)
2. **Import de perfil** — no existe endpoint
3. **Share por link** — no existe endpoint público de sharing
4. **Prisma migration** — `npx prisma migrate dev --name add-guest-fields` necesita DB PostgreSQL activa
5. **Avatar rendering** — config CRUD existe, pero no hay renderizado visual
6. **Voice cloning** — requiere provider externo (ElevenLabs/etc.)

## Cómo Correr

```bash
# Backend
cd services/api
npx prisma migrate dev --name add-guest-fields
npm run start:dev

# Tests
cd services/api
npx jest --passWithNoTests

# Landing local
# Abrir landing/index.html en navegador

# Deploy landing a GitHub Pages
npx gh-pages -d landing -t
```

## Commits Sugeridos

```
feat(guest): add 30min guest trial with auto-cleanup
fix(profile): reduce minInteractions for guest users
test(auth): add guest trial unit and e2e tests
docs: add REPORT_INTEGRITY_STATUS.md
```
