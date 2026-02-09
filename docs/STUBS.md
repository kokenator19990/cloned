# Cloned — Stubs & Servicios Externos

## Servicios con Stub (funcionan sin dependencia externa)

### LLM (Ollama / OpenAI Compatible)
- **Archivo**: `services/api/src/llm/llm.service.ts`
- **Qué hace**: Genera respuestas de chat basadas en el perfil cognitivo
- **Config**: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`
- **Stub behavior**: Si Ollama no está corriendo, el endpoint de chat devuelve un error 500. Para desarrollo sin LLM, se puede mockear el servicio.
- **Para activar**: Instalar Ollama, ejecutar `ollama pull llama3`

### Embeddings (nomic-embed-text)
- **Archivo**: `services/api/src/memory/memory.service.ts`
- **Qué hace**: Genera vectores de 768 dimensiones para búsqueda semántica
- **Config**: `EMBEDDING_MODEL`, `EMBEDDINGS_ENABLED`
- **Stub behavior**: Si `EMBEDDINGS_ENABLED=false`, las operaciones de embedding se saltan silenciosamente
- **Para activar**: `ollama pull nomic-embed-text`, set `EMBEDDINGS_ENABLED=true`

### Voice TTS (Text-to-Speech)
- **Archivo**: `services/api/src/voice/voice.service.ts`
- **Qué hace**: Genera audio a partir de texto
- **Config**: `TTS_API_URL`
- **Stub behavior**: El endpoint `/voice/:profileId/synthesize` devuelve 501 (Not Implemented) si el servicio no está disponible
- **Para activar**: Configurar un servicio TTS compatible con OpenAI API

### Voice STT (Speech-to-Text)
- **Archivo**: `services/api/src/voice/voice.service.ts`
- **Qué hace**: Transcribe audio a texto
- **Config**: `STT_API_URL`
- **Stub behavior**: Similar a TTS, devuelve 501 si no disponible
- **Para activar**: Configurar un servicio STT compatible con OpenAI Whisper API

### Voice Cloning
- **Config**: `VOICE_CLONING_ENABLED=false` (deshabilitado por defecto)
- **Qué hace**: Clona la voz del perfil para generar audio personalizado
- **Stub behavior**: Completamente deshabilitado, las muestras de voz se guardan pero no se procesan

## Servicios que Funcionan Completos

| Servicio | Dependencia | Estado |
|---|---|---|
| Auth (JWT) | Ninguna | ✅ Completo |
| Profiles CRUD | PostgreSQL | ✅ Completo |
| Enrollment | PostgreSQL | ✅ Completo |
| Chat (sin LLM) | PostgreSQL | ✅ Completo (guarda mensajes) |
| Avatar config | PostgreSQL + MinIO | ✅ Completo |
| Document upload | MinIO | ✅ Completo |
| Voice upload | MinIO | ✅ Completo |
| Memory (pgvector) | PostgreSQL | ✅ Completo (storage + search) |
