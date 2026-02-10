# 🧠 Como Usar el Razonamiento Cognitivo con Ollama

## ✅ Ya Tienes Todo Funcionando

### **Infraestructura lista**:
- ✅ **Docker**: PostgreSQL + Redis + MinIO corriendo
- ✅ **Backend API**: NestJS en puerto 3001 (health check OK)
- ✅ **Ollama**: Llama3 instalado y funcionando en puerto 11434
- ✅ **Frontend**: Next.js en puerto 3000

---

## 🎯 Cómo Funciona Ahora

### **Modo 1: Local Simple** (actual)
**Ruta**: `/clones/{id}/chat`

**Qué hace**:
- ✅ Matching de keywords en las respuestas guardadas
- ✅ Inferencia por categorías
- ✅ Reproduce grabaciones originales
- ⚠️ **Limitación**: No usa LLM, solo búsqueda semántica simple

**Cuándo usarlo**: 
- Para probar rápido sin backend
- Si Ollama no está disponible
- Modo offline

---

### **Modo 2: Razonamiento LLM con Ollama** (NUEVO 🚀)
**Ruta**: `/clones/{id}/chat-hybrid`

**Qué hace**:
- 🧠 **Usa Ollama** (Llama3) para razonar como la persona
- 📝 Construye un **system prompt cognitivo** con todas las respuestas
- 🔍 El LLM "piensa" cómo respondería esa persona específica
- 💾 Guarda cada interacción en la base de datos
- 🎙️ (Futuro) Sintetiza con voz clonada

**Cuándo usarlo**:
- Cuando quieres respuestas **coherentes y con razonamiento**
- Para que el clon "piense" como la persona
- Conversaciones largas y contextuales

---

## 🚀 Como Probarlo AHORA

### **Paso 1: Verificar que todo esté corriendo**

#### Terminal 1 - Docker (ya está):
```bash
docker ps
# Deberías ver: deadbot-postgres, deadbot-redis, deadbot-minio
```

#### Terminal 2 - API (ya está):
```bash
# Ya está corriendo en puerto 3001
# http://localhost:3001/health debería responder OK
```

#### Terminal 3 - Frontend (ya está):
```bash
# Ya está corriendo en puerto 3000
```

#### Terminal 4 - Ollama:
```bash
ollama list
# Deberías ver: llama3:latest
```

---

### **Paso 2: Crear un perfil y responder preguntas**

1. **Abre**: http://localhost:3000
2. **Crea un clon**: Botón "Nuevo Clon"
3. **Responde al menos 25 preguntas** (mejor si son 50+)
4. **Usa grabaciones de voz** para más autenticidad
5. **Completa el onboarding**

---

### **Paso 3: Probar ambos modos**

#### **Modo Simple (sin LLM)**:
1. Ve al chat normal: `/clones/{id}/chat`
2. Pregunta algo: "¿Cómo eres cuando te enojas?"
3. Responde con **matching de keywords**

#### **Modo LLM (con Ollama)** 🧠:
1. **Clic en el botón morado ⚡** en el header del chat
2. O ve directamente a: `/clones/{id}/chat-hybrid`
3. Pregunta lo mismo: "¿Cómo eres cuando te enojas?"
4. El LLM **razona** usando TODO el perfil cognitivo

**Diferencia**:
- **Simple**: Busca respuesta más cercana
- **LLM**: Analiza el perfil completo y genera respuesta **como pensaría esa persona**

---

## 🔥 Arquitectura del Razonamiento

### **Flujo LLM**:

```
Usuario: "¿Qué opinas del dinero?"
        ↓
Frontend → Backend API
        ↓
ChatService.sendMessage()
        ↓
1. Busca memories relevantes (pgvector)
2. Construye system prompt:
   ```
   Eres {Nombre}. Responde EXACTAMENTE como esta persona.
   
   [PERSONALIDAD]
   - Soy tranquilo pero puedo enojarme rápido
   - Me gusta la honestidad
   
   [VALORES]
   - El dinero es importante pero no lo más importante
   - Prefiero ser feliz que rico
   
   [...]
   ```
3. LLM (Ollama) genera respuesta
        ↓
Backend responde: "Mira, el dinero para mí es una herramienta.
                   No voy a mentirte, me gusta tener para vivir
                   tranquilo, pero jamás sacrificaría mi tiempo
                   con la familia por acumularlo..."
        ↓
Frontend reproduce + TTS
```

---

## 📊 Comparación

| Feature | Modo Simple | Modo LLM |
|---------|-------------|----------|
| Velocidad | ⚡ Instantáneo | 🕐 2-5 seg |
| Coherencia | ⭐⭐ Matching básico | ⭐⭐⭐⭐⭐ Razonamiento real |
| Contexto | ❌ Solo respuesta actual | ✅ Todo el perfil |
| Aprendizaje | ❌ Estático | ✅ Mejora con interacciones |
| Voz real | ✅ Grabaciones originales | ✅ + (futuro) voz clonada |
| Offline | ✅ | ❌ (requiere Ollama) |

---

## 🎓 Por Qué el LLM Es Mejor

### **Ejemplo Real**:

**Perfil Jorge**: 
- Respondió: "Me enojo cuando me mienten"
- Respondió: "Soy tranquilo pero explosivo"
- Respondió: "Valoro mucho la honestidad"

**Pregunta**: "¿Qué harías si tu amigo te mintió?"

#### **Modo Simple**:
Busca keyword "mentir" → encuentra "Me enojo cuando me mienten" → responde textual

**Respuesta**: "Me enojo cuando me mienten"

#### **Modo LLM**:
Lee TODO el perfil → Entiende que:
- Jorge valora honestidad
- Se enoja con mentiras
- Es tranquilo pero puede explotar

**Respuesta**: "Mira, si un amigo me miente, obviamente me va a molestar. Soy muy tranquilo normalmente, pero la honestidad es re importante para mí. Dependiendo de qué tan grave sea, probablemente le diría las cosas claras. No soy de los que explotan al toque, pero sí le haría saber que eso no está bien y que me decepcionó."

**Ver la diferencia**? El LLM:
- ✅ Infiere comportamientos combinando múltiples respuestas
- ✅ Responde con su estilo ("re importante", "al toque")
- ✅ Mantiene coherencia con su personalidad

---

## 🚀 Próximos Pasos

### **Ya implementado**:
- [x] Auto-login sin fricción
- [x] Hook de chat con backend
- [x] System prompt cognitivo
- [x] Toggle entre local/LLM
- [x] Botón ⚡ en chat

### **Para pulir más (opcionales)**:
- [ ] Migrar creación de perfiles al backend (para persistencia)
- [ ] Subir audios a MinIO
- [ ] Voice cloning con ElevenLabs
- [ ] Streaming de respuestas (para que se vea escribiendo)
- [ ] Memoria a largo plazo (guarda conversaciones)

---

## 🐛 Troubleshooting

### **"El modo LLM no responde"**
```bash
# 1. Verifica que Ollama esté corriendo
ollama list

# 2. Verifica que el backend pueda conectarse
curl http://localhost:11434/api/tags

# 3. Chequea logs del backend
# En la terminal del API busca errores
```

### **"Ollama está lento"**
- Llama3 usa ~4.7GB de RAM
- Primera respuesta es más lenta (carga el modelo)
- Respuestas siguientes son más rápidas (modelo en memoria)

### **"Quiero usar GPT-4 en vez de Llama3"**
Edita `.env` del backend:
```bash
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-tu-key-de-openai
LLM_MODEL=gpt-4o-mini
```

---

## 📝 Resumen

### **Modo Simple**: 
Búsqueda rápida, offline, bueno para MVP

### **Modo LLM**: 
Razonamiento real, el clon "piensa" como la persona, mejor experiencia

### **Recomendación**:
Usa **LLM para demos y uso real**. El modo simple queda como fallback.

---

## 🎯 Siguiente Nivel

Cuando quieras que el clon hablé con **su voz real** (no TTS robótico):

1. **ElevenLabs** (fácil, rápido, ~$5/mes)
2. **Coqui TTS** (gratis, open source, requiere GPU)

Ver: `VOICE_CLONING_ROADMAP.md`

---

**Probá ahora**:
1. http://localhost:3000/clones
2. Entra a un clon
3. Clic en ⚡ (botón morado)
4. Preguntale algo complejo
5. Compará con el modo normal

**Vas a ver la diferencia**. 🚀
