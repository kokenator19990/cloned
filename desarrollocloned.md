# Reporte de Desarrollo Técnico: Cloned
**Fecha:** 09 de Febrero de 2026
**Versión:** 1.2.0 (Voice-Centric Beta)

## 1. Resumen Ejecutivo
**Cloned** es una aplicación web progresiva diseñada para crear "Clones Digitales" de alta fidelidad emocional. A diferencia de un chatbot estándar, el valor central de Cloned es la **preservación de la esencia humana** a través de la voz, el razonamiento y las expresiones, capturadas mediante un proceso de entrevista exhaustiva.

El objetivo final es permitir interacciones futuras con seres queridos (o con uno mismo) a través de una interfaz de avatar animado que no solo responde *qué* diría la persona, sino *cómo* lo diría.

---

## 2. Arquitectura del Sistema

### 2.1 Stack Tecnológico
- **Frontend:** Next.js 14 (React), TypeScript, Tailwind CSS.
- **State Management:** Zustland (con persistencia en `localStorage`).
- **Audio Processing:** Web Audio API (MediaRecorder para captura, SpeechSynthesis para TTS).
- **Speech-to-Text (STT):** Web Speech API (reconocimiento nativo del navegador).
- **Persistencia de Datos:** LocalStorage (actualmente Client-Side Only para privacidad y rapidez en MVP).

### 2.2 Estructura de Componentes
El sistema se divide en tres módulos principales:

1.  **Módulo de Ingesta (Interview Engine):**
    *   **Propósito:** Capturar la data cognitiva y biométrica (voz).
    *   **Flujo:** `Pregunta (TTS)` → `Reflexión` → `Respuesta (Voz)` → `Transcripción (STT)`.
    *   **Lógica:** Sistema de profundidad progresiva (Básico → Profundo → Experto).

2.  **Módulo de Simulación (Neural Core - Simulado):**
    *   **Propósito:** Generar respuestas coherentes basadas en la base de conocimiento personal.
    *   **Lógica Actual:** Motor de coincidencia semántica (palabras clave + contexto de categoría) + Fallback probabilístico.
    *   **Capacidad:** Prioriza reproducir grabaciones de voz originales ("Audio de Verdad") sobre TTS sintetizado.

3.  **Módulo de Interfaz (Talking Avatar):**
    *   **Propósito:** Humanizar la interacción mediante feedback visual.
    *   **Componente:** `TalkingAvatar.tsx`.
    *   **Características:** Animaciones CSS de respiración, pulso de voz, anillos de emisión y "blink" de ojos (simulado).

---

## 3. Funcionalidades Actuales (Estado: Funcional)

### ✅ Creación de Perfil "Sin Fricción"
*   Flujo de onboarding instantáneo sin registro (No-Auth).
*   Captura de datos iniciales: Nombre + Foto (Cámara/Upload).

### ✅ Entrevista de Voz Interactiva
*   **Banco de Preguntas:** 500 preguntas curadas en 10 categorías (Valores, Humor, Recuerdos, etc.).
*   **Auto-Entrevistador:** La app "lee" las preguntas en voz alta para generar una atmósfera de conversación.
*   **Captura Híbrida:** Graba el audio real (blob) Y transcribe a texto simultáneamente.
*   **Visualización:** Waveform animado en tiempo real durante la grabación.

### ✅ Sistema de Profundidad (Gamificación)
*   Niveles de fidelidad del clon basados en la cantidad y calidad de data:
    *   🟢 **Básico:** < 50 respuestas.
    *   🔵 **Profundo:** 50-100 respuestas.
    *   🟣 **Experto:** 100-200 respuestas.
    *   🟠 **Maestro:** > 200 respuestas + alta densidad de voz.

### ✅ Chat Inmersivo (Modo "Selfie")
*   Interfaz de videollamada simulada.
*   **Avatar Reactivo:** El avatar crece y "brilla" cuando está hablando.
*   **Dual Mode Playback:**
    1.  Si hay grabación exacta: Reproduce la VOZ REAL del usuario.
    2.  Si es inferencia: Usa TTS (Text-to-Speech) para sintetizar la respuesta.

---

## 4. Funcionalidades Potenciales (Roadmap)

### 🚀 Corto Plazo
*   **Voice Cloning Real (IA):** Integrar ElevenLabs o similar para que el TTS use la voz *clonada* del usuario, no la robótica del navegador.
*   **Exportar/Importar Perfil:** Permitir descargar el "cerebro" (JSON + Audio Blobs) para guardarlo o enviarlo a un familiar.

### 🌟 Mediano Plazo
*   **RAG (Retrieval-Augmented Generation):** Conectar un LLM local (ej. WebLLM) para que razone respuestas nuevas basadas en las transcripciones, en lugar de solo buscar coincidencias.
*   **Análisis de Sentimiento:** Detectar si el usuario está triste al hablar y adaptar el tono del avatar.

### 🔮 Largo Plazo (Visión Completa)
*   **Video Avatar (Deepfake Ético):** Animar la foto estática para que mueva los labios sincronizados con el audio (Lip Sync).
*   **Realidad Aumentada:** Proyectar el avatar en el entorno del usuario.

## 5. Conclusión Técnica
La aplicación ha pivotado exitosamente de un chatbot de texto convencional a una **plataforma de preservación biomecánica**. La arquitectura actual es robusta para el MVP, centrada en la privacidad (Local-First) y la experiencia de usuario (Voice-First UI). La base de código es modular, permitiendo conectar servicios de IA en la nube en el futuro sin reescribir el frontend.
