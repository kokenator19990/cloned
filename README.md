# Deadbot - Cognitive Identity Simulation Platform

Build persistent cognitive profiles through conversation. Preserve reasoning patterns, values, emotions, and speech style to create a conversational identity that endures.

## Architecture

```
deadbot/
├── apps/
│   ├── web/          # Next.js 14 web app (App Router + Tailwind)
│   └── android/      # Kotlin + Jetpack Compose Android app
├── services/
│   └── api/          # NestJS backend API
├── packages/
│   └── shared/       # Shared TypeScript types and utilities
└── infra/
    └── docker-compose.yml  # PostgreSQL, Redis, MinIO
```

### Tech Stack
- **Backend**: Node.js + NestJS, PostgreSQL (Prisma ORM), Redis, MinIO (S3)
- **Web**: Next.js 14 (App Router), Tailwind CSS, Zustand, Socket.IO
- **Android**: Kotlin, Jetpack Compose, Retrofit, Material3
- **AI**: OpenAI-compatible API (works with Ollama, OpenAI, etc.)
- **Realtime**: WebSocket for streaming chat responses

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Docker** and **Docker Compose**
- **Android Studio** (for Android development, optional)
- **An LLM endpoint** (Ollama recommended for local dev)

## Quick Start

### 1. Clone and install

```bash
cd deadbot
pnpm install
```

### 2. Start infrastructure

```bash
docker-compose -f infra/docker-compose.yml up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- MinIO on port 9000 (console on 9001)

### 3. Configure environment

```bash
cp services/api/.env.example services/api/.env
cp apps/web/.env.example apps/web/.env
```

### 4. Set up database

```bash
cd services/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

### 5. Start LLM (Ollama recommended)

```bash
# Install Ollama from https://ollama.com
ollama pull llama3
ollama serve
```

### 6. Start the API

```bash
cd services/api
pnpm dev
```

API runs on http://localhost:3001
Swagger docs at http://localhost:3001/api/docs

### 7. Start the web app

```bash
cd apps/web
pnpm dev
```

Web app runs on http://localhost:3000

### 8. Demo credentials

```
Email: demo@deadbot.app
Password: password123
```

## Environment Variables

### API (services/api/.env)

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://deadbot:deadbot_dev_2024@localhost:5432/deadbot | PostgreSQL connection |
| REDIS_URL | redis://localhost:6379 | Redis connection |
| JWT_SECRET | deadbot-dev-secret | JWT signing secret |
| JWT_EXPIRY | 7d | Token expiration |
| MINIO_ENDPOINT | localhost | MinIO/S3 endpoint |
| MINIO_PORT | 9000 | MinIO/S3 port |
| MINIO_ACCESS_KEY | deadbot | S3 access key |
| MINIO_SECRET_KEY | deadbot_dev_2024 | S3 secret key |
| LLM_BASE_URL | http://localhost:11434/v1 | OpenAI-compatible endpoint |
| LLM_API_KEY | ollama | API key for LLM |
| LLM_MODEL | llama3 | Model name |
| PORT | 3001 | API port |

### Web (apps/web/.env)

| Variable | Default | Description |
|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:3001 | Backend API URL |
| NEXT_PUBLIC_WS_URL | ws://localhost:3001 | WebSocket URL |

## How It Works

### Cognitive Enrollment

Like building a fingerprint pattern, Deadbot builds a "cognitive fingerprint" through guided conversation:

1. **Minimum 50 interactions** required before a profile activates
2. Questions cover 8 cognitive categories:
   - Linguistic Style
   - Logical Reasoning
   - Moral Framework
   - Core Values
   - Dreams & Goals
   - Preferences
   - Life Story
   - Emotional World
3. Questions are generated dynamically by the LLM based on coverage gaps
4. Fallback questions available when LLM is not configured
5. Profile gets a **Coverage Map** showing which areas are explored
6. Profile gets a **Consistency Score** measuring coherence

### Chat (Post-Enrollment)

Once activated, you can chat with the persona. The system:
1. Loads the persona's cognitive profile and relevant memories
2. Builds a character-specific system prompt
3. Generates responses conditioned on the persona's reasoning style
4. Stores new interactions as ongoing learning
5. Displays in a video-call style UI with avatar

### Voice

- Record voice samples (Web Audio API / MediaRecorder)
- Consent recording required before voice modeling
- STT/TTS interface ready (pluggable providers)

### Avatar

- Upload base photo
- Choose skin: default, hoodie, suit, casual, dark, neon
- Set mood: neutral, happy, serious, angry, sad, excited
- Add accessories: cap, hood, glasses, headphones

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| GET | /auth/me | Get current user |
| GET | /profiles | List profiles |
| POST | /profiles | Create profile |
| GET | /profiles/:id | Get profile |
| DELETE | /profiles/:id | Delete profile (hard delete) |
| POST | /profiles/:id/activate | Activate profile |
| POST | /profiles/:id/export | Export all data |
| POST | /enrollment/:id/start | Start enrollment |
| GET | /enrollment/:id/next-question | Get next question |
| POST | /enrollment/:id/answer | Submit answer |
| GET | /enrollment/:id/progress | Get progress |
| POST | /chat/:profileId/sessions | Create chat session |
| GET | /chat/:profileId/sessions | List sessions |
| GET | /chat/sessions/:id/messages | Get messages |
| POST | /chat/sessions/:id/messages | Send message |
| POST | /voice/:profileId/upload | Upload voice sample |
| POST | /voice/:profileId/consent | Record consent |
| GET | /voice/:profileId/samples | List samples |
| GET | /avatar/:profileId/config | Get avatar config |
| PUT | /avatar/:profileId/config | Update avatar |
| POST | /avatar/:profileId/upload | Upload photo |

## Android

The Android project is in `apps/android/`. To build:

1. Open `apps/android/` in Android Studio
2. Sync Gradle
3. Update `ApiClient.kt` BASE_URL if needed (default: `http://10.0.2.2:3001`)
4. Run on emulator or device

## Ethics & Safety

- **Simulation banner** displayed at all times during chat
- **Consent recording** required before voice modeling
- **Data export** available for all profile data (JSON)
- **Hard delete** removes all data permanently
- **Not a replacement** for therapeutic support or grief counseling

## Roadmap

### MVP (Current)
- [x] Auth + profiles
- [x] Cognitive enrollment with dynamic questions
- [x] Coverage map + consistency scoring
- [x] Chat with persona (text)
- [x] Voice recording + STT/TTS stubs
- [x] Avatar + skins + moods
- [x] Web UI (video-call style)
- [x] Android app

### Beta
- [ ] RAG: upload documents as knowledge base
- [ ] Embedding-based memory retrieval
- [ ] WebSocket streaming for chat
- [ ] Voice cloning integration (Coqui/XTTS)
- [ ] Cognitive timeline visualization

### v1
- [ ] Gmail/email connector (opt-in)
- [ ] Social media import (with consent)
- [ ] Observer mode (passive learning)
- [ ] LLM-as-judge consistency evaluation
- [ ] Multi-language support
- [ ] End-to-end encryption
