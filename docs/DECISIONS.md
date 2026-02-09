# Cloned — Decisiones Técnicas

## Arquitectura

### Monorepo con pnpm + Turborepo
**Por qué**: Un solo repo facilita compartir tipos entre API y Web, ejecutar todo con un comando, y mantener versiones sincronizadas.

### NestJS para el API
**Por qué**: Framework maduro con módulos, guards, pipes, Swagger out of the box. La arquitectura modular permite agregar servicios (voice, avatar, memory) sin tocar el core.

### Prisma como ORM
**Por qué**: Type-safe, migrations declarativas, introspección, studio. El soporte para pgvector via extensión nativa es clave.

### PostgreSQL + pgvector
**Por qué**: Un solo motor para datos relacionales Y vectores. Eliminamos la necesidad de Pinecone/Weaviate/etc. Las queries de similarity search son SQL estándar.

### Next.js 14 (App Router)
**Por qué**: SSR/SSG para la landing (SEO), client components para el dashboard. App Router permite layouts anidados (dashboard/[profileId]).

### Zustand para estado
**Por qué**: Minimal, sin boilerplate vs Redux. Perfecto para auth token + profile cache + chat messages.

### Jetpack Compose para Android
**Por qué**: UI declarativa moderna, Material3 out of the box, preview functions.

## Decisiones de Diseño

### Tema claro (no oscuro)
**Por qué**: Una app de memorias y recuerdos debe sentirse cálida y cercana, no fría y técnica. El tema oscuro original ("Deadbot") comunicaba lo opuesto.

### Colores tierra (#C08552)
**Por qué**: Marrón/ámbar evoca nostalgia, calidez, fotos antiguas. Contrasta bien con fondos crema sin cansar la vista.

### Georgia para títulos
**Por qué**: Serif transmite permanencia y clasicismo — apropiado para "preservar memorias".

### Simulación Banner siempre visible
**Por qué**: Ética fundamental — nunca debe parecer que se está hablando con la persona real.

### Enrollment como chat
**Por qué**: Las preguntas en formato conversacional son más naturales que un formulario. El usuario siente que está "contando" sobre la persona.

## Decisiones de Seguridad

### JWT sin refresh token (v0.2)
**Decisión**: Tokens de 7 días sin refresh. En v1 agregaremos refresh tokens + rotación.

### Bcrypt con 10 rounds
**Decisión**: Balance entre seguridad y rendimiento. Suficiente para una app no-enterprise.

### CORS solo localhost en dev
**Decisión**: En producción se debe configurar el origen exacto.

## Trade-offs Aceptados

| Trade-off | Decisión | Razón |
|---|---|---|
| Sin i18n framework | Hardcoded Spanish | Scope del MVP, se puede agregar next-intl después |
| Sin rate limiting | Abierto | Dev-only, agregar express-rate-limit en prod |
| Sin CI/CD | Manual | GitHub Actions se agregará post-MVP |
| Sin tests de UI | Solo e2e API | Playwright/Cypress pendiente |
| Hilt removido de Android | Manual DI | Hilt causaba crashes, ViewModels inyectan ApiService directamente |
