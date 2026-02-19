# REPORTE 3.0: Proyecto "Cloned" (Digital Permanence)

**Versión del Reporte**: 3.0 (Final Release Candidate)
**Fecha**: 19 de Febrero, 2026
**Autor**: Antigravity (Google DeepMind) & User (Lead Engineer)

---

## 1. Resumen Ejecutivo
**Cloned** es una plataforma de "Preservación Digital Cognitiva". Su objetivo es capturar la esencia, recuerdos, voz y patrones de pensamiento de una persona para crear una **IA Eterna (Clon Digital)** con la que familiares y amigos puedan interactuar en el futuro.

La aplicación permite a los usuarios:
1.  **Crear Perfiles**: Definir a quién quieren clonar (ellos mismos, familiares, amigos).
2.  **Entrenamiento (Enrollment)**: Responder preguntas profundas para que la IA aprenda su personalidad y recuerdos (RAG - Retrieval Augmented Generation).
3.  **Chat en Tiempo Real**: Conversar con el clon, que responde usando su memoria cognitiva y voz sintética.
4.  **Compartir Legado**: Hacer públicos los perfiles para compartirlos mediante enlaces únicos.

---

## 2. Arquitectura Técnica
El proyecto es un **Monorepo** moderno construido con TypeScript de punta a punta.

### Estructura del Proyecto
- `apps/web`: Frontend (Next.js 14, React, TailwindCSS).
- `services/api`: Backend (NestJS, Prisma ORM, Websockets).
- `packages/shared`: (Opcional) Tipos compartidos.

### Tech Stack Principal
| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 | App Router, SSR, Server Components. |
| **Estilos** | TailwindCSS | Diseño utility-first, animaciones custom. |
| **Backend** | NestJS | Framework modular, inyección de dependencias. |
| **Base de Datos** | PostgreSQL | Persistencia relacional. |
| **ORM** | Prisma | Esquema declarativo y migraciones seguras. |
| **LLM** | Groq (Llama-3) | Motor de inferencia ultra-rápido. |
| **Voz (TTS)** | Web Speech API | Síntesis de voz nativa del navegador (gratis, baja latencia). |
| **Voz (STT)** | OpenAI Whisper | Transcripción de audio (backup). |
| **Cache/Queue** | Redis | (Opcional) Manejo de sesiones y jobs. |

---

## 3. Funcionalidades Clave (Core Features)

### A. Sistema de Autenticación (`/auth`)
- **Registro/Login**: JWT (JSON Web Tokens).
- **Seguridad**: Passwords hasheadas con bcrypt.
- **Guard**: `JwtAuthGuard` protege endpoints privados.

### B. Gestión de Perfiles (`/profiles`)
- **CRUD Completo**: Crear, leer, actualizar y borrar perfiles.
- **Estado**: `ENROLLING` (entrenando) -> `ACTIVE` (listo para chat).
- **Privacidad**:
    - **Privado**: Solo el dueño puede ver/chatear.
    - **Público**: Genera un `shareCode` único. Cualquiera con el link puede chatear (modo Guest).
- **Endpoints Clave**:
    - `POST /profiles/:id/share`: Generar link público.
    - `GET /profiles/explore`: Listar perfiles públicos.

### C. Sistema de Enrollment Cognitivo (`/enrollment`)
- **Motor de Preguntas**: La IA genera preguntas dinámicas basadas en lo que *no sabe* todavía (cobertura de temas).
- **Categorías**: Infancia, Valores, Emociones, Lógica, etc.
- **Memoria Vectorial**: Las respuestas se guardan como `CognitiveMemory` y se usan para el contexto del chat.

### D. Chat System (RAG) (`/chat`)
- **Contexto**: Al recibir un mensaje, el sistema busca memorias relevantes en la DB.
- **Prompt Engineering**: Se contruye un "System Prompt" que inyecta la personalidad y recuerdos recuperados.
- **Streaming**: Respuesta token por token para UX fluida (vía HTTP chunked o Sockets).

### E. Voz y Audio (`/voice`)
- **TTS (Text-to-Speech)**: El frontend usa `window.speechSynthesis` para leer las respuestas de la IA.
- **STT (Speech-to-Text)**: Se puede usar el micrófono para hablarle al clon.
- **Voice Clone (Futuro)**: Infraestructura lista para clonar voz real con ElevenLabs/OpenAI si se desea pagar API.

---

## 4. Base de Datos (Schema Prisma)

Las tablas principales en `schema.prisma`:

1.  **User**: Dueño de la cuenta.
2.  **PersonaProfile**: El "clon". Tiene campos `isPublic`, `shareCode`, `voiceConfig`.
3.  **EnrollmentQuestion**: Historial de preguntas respondidas.
4.  **CognitiveMemory**: Fragmentos de memoria (ej: "Me gustan los helados de vainilla").
5.  **ChatSession**: Conversaciones (pueden ser de Guests).
6.  **ChatMessage**: Mensajes individuales (USER vs PERSONA).

---

## 5. Guía para Desarrolladores

### Requisitos Previos
- Node.js v18+
- PostgreSQL (Local o Docker)
- Claves de API: `GROQ_API_KEY`, `OPENAI_API_KEY` (opcional para Whisper).

### Cómo Ejecutar (Local)

1.  **Clonar Repo**:
    ```bash
    git clone https://github.com/kokenator19990/cloned.git
    cd cloned
    ```

2.  **Backend (`services/api`)**:
    ```bash
    cd services/api
    npm install
    # Configurar .env con DATABASE_URL y GROQ_API_KEY
    npx prisma migrate dev  # Crear tablas
    npm run dev             # Inicia en localhost:3001
    ```

3.  **Frontend (`apps/web`)**:
    ```bash
    cd apps/web
    npm install
    # Configurar .env con NEXT_PUBLIC_API_URL=http://localhost:3001
    npm run dev             # Inicia en localhost:3000
    ```

4.  **Acceder**:
    - Web App: `http://localhost:3000`
    - API Docs (Swagger): `http://localhost:3001/api/docs`

---

## 6. Github & Control de Versiones

**Repositorio Actual**: [https://github.com/kokenator19990/cloned](https://github.com/kokenator19990/cloned)

### Ramas (Branches)
- `main`: Código estable (producción).
- `feature/landing-page`: Última versión con diseño premium (actualmente la más avanzada).

### Flujo de Trabajo Recomendado
1.  Crear rama para nueva feature (`git checkout -b feature/nueva-cosa`).
2.  Desarrollar y probar.
3.  Commit (`git commit -m "feat: descripción"`).
4.  Push (`git push origin feature/nueva-cosa`).
5.  Pull Request en GitHub para mergear a `main`.

---

## 7. Próximos Pasos (Roadmap Sugerido)
- [ ] **Voice Cloning Real**: Integrar ElevenLabs para que la voz sea *idéntica* a la real.
- [ ] **Deployment**: Subir a Vercel (Frontend) y Railway/Render (Backend).
- [ ] **Mobile App**: Empaquetar el frontend con Capacitor o React Native.
- [ ] **Upload de Archivos**: Permitir subir PDFs/Chats de WhatsApp para entrenar al clon automáticamente.

---
*Este documento sirve como "Biblia del Proyecto" para cualquier IA o ingeniero que continúe el trabajo.*
