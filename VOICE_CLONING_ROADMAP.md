# Roadmap: Razonamiento Cognitivo + Voz Real

## Estado Actual ✅

### Lo que funciona HOY (Local):
- ✅ Creación de perfiles con preguntas de voz
- ✅ Chat con matching semántico mejorado
- ✅ Input por voz (Web Speech API)
- ✅ Reproducción de grabaciones originales
- ✅ TTS fallback (voz del navegador)
- ✅ Motor cognitivo local con inferencia por categorías

### Limitaciones actuales:
- ❌ Voz TTS es robótica (no es la voz clonada)
- ❌ Razonamiento limitado (no usa LLM)
- ❌ Todo en localStorage (no persistente en backend)
- ❌ No hay vector embeddings para búsqueda semántica real

---

## Fase 1: Migración al Backend API (1-2 días)

### 1.1 Conectar autenticación
**Objetivo**: Permitir login/registro para persistir datos en backend

**Tareas**:
- [ ] Agregar pantalla de login/registro en `/auth`
- [ ] Conectar `useAuthStore` con endpoints del backend
- [ ] Persistir token JWT en localStorage
- [ ] Middleware de protección de rutas

**Archivos a modificar**:
- `apps/web/lib/store.ts` (ya existe el store, solo conectar)
- `apps/web/app/auth/login/page.tsx` (crear)
- `apps/web/app/auth/register/page.tsx` (crear)

**API disponible**:
```typescript
POST /auth/register { email, password, displayName }
POST /auth/login { email, password }
GET /auth/me
```

---

### 1.2 Migrar perfiles al backend
**Objetivo**: Crear y gestionar perfiles en la base de datos PostgreSQL

**Flujo**:
1. Usuario crea perfil → POST `/profiles`
2. Responde preguntas → POST `/enrollment/:profileId/answer`
3. Progreso automático → GET `/enrollment/:profileId/progress`
4. Activar perfil → POST `/profiles/:profileId/activate`

**Tareas**:
- [ ] Reemplazar `useLocalStore` por `useProfileStore` (que llama a la API)
- [ ] Subir audios grabados a MinIO via POST `/voice/:profileId/upload`
- [ ] Conectar enrollment con backend

**Beneficios**:
- ✅ Persistencia real (no se pierde al limpiar navegador)
- ✅ Acceso desde múltiples dispositivos
- ✅ Backups automáticos

---

### 1.3 Chat con LLM real
**Objetivo**: Respuestas cognitivas con razonamiento LLM + RAG

**API disponible**:
```typescript
POST /chat/:profileId/sessions          // Crear sesión
POST /chat/sessions/:sessionId/messages // Enviar mensaje
GET /chat/sessions/:sessionId/messages  // Historial
```

**Cómo funciona el backend**:
1. Usuario envía mensaje
2. Backend busca memories relevantes (vector embeddings)
3. Construye system prompt con perfil cognitivo
4. LLM genera respuesta "como la persona"
5. Guarda interacción como nueva memoria

**Tareas**:
- [ ] Crear hook `useChatAPI` que reemplace `generateCognitiveResponse`
- [ ] Conectar con `/chat` endpoints
- [ ] Streaming opcional (SSE)

**Ventajas**:
- ✅ Razonamiento real con LLM (Llama 3, GPT-4, etc)
- ✅ Búsqueda semántica con pgvector
- ✅ Contexto acumulativo (memoria a largo plazo)

---

## Fase 2: Voice Cloning Real (3-5 días)

### 2.1 Entrenamiento de voz con datos grabados
**Objetivo**: Usar las grabaciones del onboarding para entrenar un modelo de voz

**Opciones**:

#### Opción A: ElevenLabs (Más fácil, pago)
```bash
# Instalar en backend
npm install elevenlabs
```

**Backend** (`voice.service.ts`):
```typescript
import { ElevenLabsClient } from 'elevenlabs';

async cloneVoice(profileId: string) {
  const samples = await this.listSamples(profileId);
  
  // Descargar audios de MinIO
  const audioFiles = await Promise.all(
    samples.map(s => this.minioService.getObject(s.storageKey))
  );
  
  // Subir a ElevenLabs
  const voice = await this.elevenlabs.voices.add({
    name: `Cloned_${profileId}`,
    files: audioFiles,
  });
  
  // Guardar voice_id en profile
  await this.prisma.personaProfile.update({
    where: { id: profileId },
    data: { voiceCloneId: voice.voice_id },
  });
  
  return voice;
}

async synthesizeWithClonedVoice(text: string, profileId: string) {
  const profile = await this.prisma.personaProfile.findUnique({
    where: { id: profileId },
  });
  
  const audio = await this.elevenlabs.textToSpeech.convert(
    profile.voiceCloneId,
    {
      text,
      model_id: 'eleven_multilingual_v2',
    }
  );
  
  return audio;
}
```

**Costos**:
- ElevenLabs: ~$5/mo (Starter) o $22/mo (Creator)
- 30,000 caracteres/mes (gratis)

---

#### Opción B: Coqui TTS (Open source, local)
```bash
# Instalar en backend
pip install TTS
```

**Docker** (`services/voice-tts/Dockerfile`):
```dockerfile
FROM python:3.10
RUN pip install TTS torch torchaudio
COPY train_voice.py .
CMD ["python", "train_voice.py"]
```

**Script de entrenamiento**:
```python
from TTS.api import TTS

def train_voice_clone(audio_files, output_path):
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
    
    # Fine-tune con grabaciones
    tts.tts_to_file(
        text="Hola, soy tu clon",
        speaker_wav=audio_files[0],
        language="es",
        file_path=output_path
    )
```

**Pros**: Gratis, open source, local
**Contras**: Requiere GPU, setup más complejo

---

### 2.2 Integrar TTS en el chat
**Objetivo**: Cuando el clon responde, usa su voz clonada

**Backend endpoint nuevo**:
```typescript
POST /voice/tts
Body: { text: string, profileId: string }
Response: { audio: base64, format: 'mp3', duration: number }
```

**Frontend** (`chat/page.tsx`):
```typescript
const speakWithClonedVoice = async (text: string) => {
  const res = await api.post('/voice/tts', { 
    text, 
    profileId: cloneId 
  });
  
  const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
  audio.play();
};
```

**Flujo completo**:
1. Usuario: "Hola, ¿cómo estás?"
2. Backend LLM genera: "Pues aquí, bien. Un poco cansado pero contento."
3. Backend TTS con voz clonada → MP3
4. Frontend reproduce audio

---

## Fase 3: Optimizaciones (1-2 días)

### 3.1 Caché de audio
**Problema**: Regenerar TTS para cada frase es lento

**Solución**:
```typescript
// Backend: Redis cache
const cacheKey = `tts:${profileId}:${hash(text)}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

const audio = await this.synthesize(text, profileId);
await redis.setex(cacheKey, 86400, audio); // 24h cache
```

---

### 3.2 Streaming de audio
**Objetivo**: Empezar a reproducir mientras se genera

**WebSocket** (backend):
```typescript
@SubscribeMessage('chat')
async handleChat(client: Socket, payload: { sessionId, message }) {
  const response = this.llmService.generateResponseStream(...);
  
  for await (const chunk of response) {
    client.emit('chunk', { text: chunk });
    
    // Sintetizar cada frase completa
    if (chunk.endsWith('.')) {
      const audio = await this.voiceService.synthesize(chunk, profileId);
      client.emit('audio', { audio: audio.toString('base64') });
    }
  }
}
```

---

## Checklist de Implementación

### Semana 1: Backend integration
- [ ] Login/registro funcional
- [ ] Perfiles en base de datos
- [ ] Chat con LLM conectado
- [ ] Subida de audios a MinIO

### Semana 2: Voice cloning
- [ ] Elegir provider (ElevenLabs o Coqui)
- [ ] Entrenar voz con grabaciones
- [ ] Endpoint TTS con voz clonada
- [ ] Reproducir en chat

### Semana 3: Polish
- [ ] Caché de audio
- [ ] Streaming de respuestas
- [ ] Mejoras de UX
- [ ] Deploy a producción

---

## Variables de entorno necesarias

**Backend** (`.env`):
```bash
# Ya tienes:
DATABASE_URL=postgresql://deadbot:deadbot_dev_2024@localhost:5432/deadbot
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000

# Agregar:
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxx  # Si usas ElevenLabs
LLM_BASE_URL=http://localhost:11434/v1  # Ollama local o OpenAI
LLM_API_KEY=ollama
LLM_MODEL=llama3  # o gpt-4o-mini
```

**Frontend** (`.env`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## Resultado Final

### Usuario X crea un clon de su abuela:
1. Graba 500 audios respondiendo preguntas
2. El sistema entrena su voz
3. Su nieto pregunta: "Abuela, ¿cómo hacías las tortillas?"
4. El clon responde:
   - **Con su voz real**: "Ay mijo, pues mira..."
   - **Con su razonamiento**: Usa memories de categoría "recuerdos" + "cocina"
   - **Con su personalidad**: Mantiene su forma de hablar, expresiones

### Magia:
- 🎙️ **Voz**: Suena como ella
- 🧠 **Razonamiento**: Piensa como ella
- ❤️ **Esencia**: Se siente como hablar con ella

---

## Próximos pasos INMEDIATOS

1. **Probar el chat mejorado local** (ya está hecho)
2. **Decidir**: ¿Migrar al backend ya o seguir puliendo local?
3. **Voice cloning**: ¿ElevenLabs (rápido) o Coqui (gratis)?

**Recomendación**: 
- Si quieres MVP rápido → ElevenLabs + backend en 1 semana
- Si quieres 100% open source → Coqui + backend en 2-3 semanas
