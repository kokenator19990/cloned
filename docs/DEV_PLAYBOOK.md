# Cloned — Developer Playbook

## Requisitos

- Node.js 20+ (testeado con 24)
- pnpm 9+
- Docker + Docker Compose
- JDK 17 (para Android)
- Android SDK (platform-34, build-tools-34.0.0)

## Setup Rápido

```bash
# 1. Clonar
git clone https://github.com/kokenator19990/cloned.git
cd cloned

# 2. Instalar dependencias
pnpm install

# 3. Levantar infraestructura
docker compose -f infra/docker-compose.yml up -d

# 4. Migrar base de datos
cd services/api && npx prisma migrate deploy && npx prisma db seed && cd ../..

# 5. Desarrollo
pnpm dev:api   # Terminal 1 — API en :3001
pnpm dev:web   # Terminal 2 — Web en :3000
```

## Estructura del Monorepo

```
cloned/
├── apps/
│   ├── web/          # Next.js 14 (App Router)
│   └── android/      # Kotlin + Jetpack Compose
├── services/
│   └── api/          # NestJS 10 + Prisma 5
├── packages/
│   └── shared/       # Types + utils compartidos
├── infra/            # Docker Compose + SQL init
├── scripts/          # serve-apk.ps1
└── docs/             # Documentación
```

## Scripts Disponibles (raíz)

| Script | Qué hace |
|---|---|
| `pnpm dev:api` | API en modo desarrollo |
| `pnpm dev:web` | Web en modo desarrollo |
| `pnpm build:api` | Build de producción API |
| `pnpm build:web` | Build de producción Web |
| `pnpm docker:up` | Levantar contenedores |
| `pnpm docker:down` | Detener contenedores |
| `pnpm db:migrate` | Aplicar migraciones Prisma |
| `pnpm db:seed` | Seed de datos iniciales |
| `pnpm db:studio` | Abrir Prisma Studio |
| `pnpm test:api` | Ejecutar tests del API |
| `pnpm lint` | Lint de todo el monorepo |

## Variables de Entorno

### API (services/api/.env)
```
DATABASE_URL=postgresql://deadbot:deadbot_dev_2024@localhost:5432/deadbot
REDIS_URL=redis://localhost:6379
JWT_SECRET=cloned-dev-secret-change-in-production
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=llama3
```

### Web (apps/web/.env)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Android

```bash
cd apps/android
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
.\gradlew.bat assembleDebug
```

APK en: `app/build/outputs/apk/debug/app-debug.apk`

Para cambiar la IP del API: editar `app/build.gradle.kts` → `buildConfigField "API_BASE_URL"`

## Credenciales de Demo

- Email: `demo@cloned.app`
- Password: `password123`
