# Cloned — Guía de arranque rápido

## Requisitos
- Node.js 18+
- Docker Desktop
- Cuenta en [console.groq.com](https://console.groq.com) (gratis)

## Setup inicial (solo la primera vez)

```powershell
# 1. Instalar dependencias
pnpm install

# 2. Configurar API key de Groq
# Edita services/api/.env y reemplaza REEMPLAZA_CON_TU_GROQ_API_KEY
# con tu key de https://console.groq.com

# 3. Arrancar todo
.\start.ps1
```

## Arranque diario

```powershell
.\start.ps1
```

## URLs

| Servicio | URL |
|----------|-----|
| API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/health |

## Cuenta demo

```
Email:    demo@cloned.app
Password: password123
```

## LLM Provider

El proyecto usa **Groq** por defecto (gratis, rápido).

Para cambiar de provider, edita `services/api/.env`:

```env
# Groq (recomendado)
LLM_BASE_URL="https://api.groq.com/openai/v1"
LLM_API_KEY="gsk_..."
LLM_MODEL="llama-3.3-70b-versatile"

# OpenAI
# LLM_BASE_URL="https://api.openai.com/v1"
# LLM_API_KEY="sk-..."
# LLM_MODEL="gpt-4o-mini"

# Ollama (local, sin internet)
# LLM_BASE_URL="http://localhost:11434/v1"
# LLM_API_KEY="ollama"
# LLM_MODEL="llama3"
```

## Arquitectura del "cerebro"

Cada persona digital tiene 4 capas:

1. **Perfil base** — identidad, nombre, relación
2. **Memorias cognitivas** — respuestas del enrollment vectorizadas por categoría:
   - LINGUISTIC, LOGICAL, MORAL, VALUES, ASPIRATIONS, PREFERENCES, AUTOBIOGRAPHICAL, EMOTIONAL
3. **Historial de chat** — conversaciones que también se convierten en memorias
4. **Documentos** — PDFs/textos que el clon puede referenciar (RAG)

El sistema recupera las memorias más relevantes al mensaje del usuario y las inyecta en el system prompt del LLM.
