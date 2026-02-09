# 🤖 AI REVIEW GUIDE - Proyecto Cloned

## 📋 Guía Específica para Revisión Automatizada por IA

Este documento está diseñado específicamente para que IAs (Claude, GPT-4, Copilot, Gemini, etc.) puedan revisar, analizar y depurar el proyecto de manera sistemática.

---

## 🎯 OBJETIVO DE ESTA GUÍA

Proveer a modelos de IA instrucciones claras, estructuradas y ejecutables para:
1. Revisar código automáticamente
2. Detectar bugs y vulnerabilidades
3. Sugerir mejoras y refactorings
4. Generar reportes de calidad
5. Validar implementación contra especificaciones

---

## 📍 INFORMACIÓN DEL PROYECTO

**Nombre:** Cloned (anteriormente Deadbot)  
**Ubicación:** `c:\Users\coook\Desktop\Cloned`  
**Tipo:** Monorepo (pnpm + Turborepo)  
**Stack:** NestJS + Next.js 14 + Kotlin (Android)  
**Estado:** MVP completo (~95% especificaciones)

**Estructura:**
```
Cloned/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── android/      # Kotlin + Jetpack Compose
├── services/
│   └── api/          # NestJS backend
├── packages/
│   └── shared/       # TypeScript shared code
└── infra/
    └── docker-compose.yml
```

---

## 🔍 PROMPTS DE REVISIÓN

### 1️⃣ ANÁLISIS DE ESTRUCTURA

**Prompt para copiar/pegar:**

```
Analiza la estructura del proyecto ubicado en c:\Users\coook\Desktop\Cloned

TAREA 1: Verificar Integridad
- Confirma que existen estos directorios:
  * apps/web
  * apps/android  
  * services/api
  * packages/shared
  * infra

TAREA 2: Contar Archivos
- Cuenta archivos por tipo:
  * TypeScript (.ts, .tsx)
  * Kotlin (.kt)
  * JSON/YAML (.json, .yaml, .yml)
  * Markdown (.md)
  * Otros

TAREA 3: Identificar Archivos Críticos Faltantes
- Verifica que existan:
  * package.json (root y en cada workspace)
  * tsconfig.json (donde corresponda)
  * Prisma schema
  * Docker Compose
  * .env.example files
  * README.md

FORMATO DE SALIDA:
Genera una tabla Markdown con:
| Directorio | Archivos | Estado | Notas |
```

---

### 2️⃣ REVISIÓN DE CÓDIGO BACKEND

**Prompt para copiar/pegar:**

```
Revisa el código del backend NestJS en services/api/src/

ANÁLISIS DE CONTROLADORES:
Para cada archivo *controller.ts:

1. Verifica decoradores:
   - @Controller() presente
   - Rutas HTTP correctas (@Get, @Post, @Put, @Delete)
   - @UseGuards(JwtAuthGuard) en rutas protegidas
   - @Body(), @Param(), @Query() usados correctamente

2. Verifica validación:
   - DTOs con class-validator
   - ValidationPipe configurado
   - Inputs sanitizados

3. Verifica manejo de errores:
   - try-catch en operaciones críticas
   - HttpException con códigos apropiados
   - Mensajes de error descriptivos

ANÁLISIS DE SERVICIOS:
Para cada archivo *service.ts:

1. Verifica inyección de dependencias:
   - @Injectable() presente
   - Constructor injection usado
   - Dependencias tipadas

2. Verifica lógica:
   - Métodos async/await apropiados
   - Transacciones donde sea necesario
   - No lógica de presentación en services

3. Verifica Prisma:
   - Queries optimizadas (no N+1)
   - Índices usados apropiadamente
   - Relaciones loaded correctamente

FORMATO DE SALIDA:
Por cada issue encontrado:
- [CRÍTICO/IMPORTANTE/MENOR] Archivo:línea - Descripción
- Código actual
- Código sugerido
```

---

### 3️⃣ REVISIÓN DE CÓDIGO FRONTEND

**Prompt para copiar/pegar:**

```
Revisa el código del frontend Next.js en apps/web/

ANÁLISIS DE PÁGINAS (app/**/page.tsx):

1. Verifica estructura:
   - Server Components vs Client Components apropiados
   - 'use client' solo cuando necesario
   - Metadata exports correctos
   - Loading states implementados

2. Verifica data fetching:
   - API calls manejados correctamente
   - Error boundaries implementados
   - Loading skeletons presentes
   - Retry logic donde sea apropiado

3. Verifica SEO:
   - Metadata apropiado
   - Semantic HTML
   - Alt text en imágenes

ANÁLISIS DE COMPONENTES (components/**/*.tsx):

1. Verifica hooks:
   - useState/useEffect usados correctamente
   - Cleanup en useEffect
   - Dependencies array completo
   - No hooks condicionales

2. Verifica props:
   - TypeScript interfaces definidas
   - Props destructuradas
   - Default values donde corresponda

3. Verifica performance:
   - useMemo/useCallback donde sea necesario
   - Keys en listas
   - No re-renders innecesarios

FORMATO DE SALIDA:
Tabla con:
| Archivo | Issue | Severidad | Solución |
```

---

### 4️⃣ REVISIÓN DE CÓDIGO ANDROID

**Prompt para copiar/pegar:**

```
Revisa el código Android en apps/android/app/src/main/java/

ANÁLISIS DE VIEWMODELS:

1. Verifica state management:
   - StateFlow/Flow usado correctamente
   - No LiveData (usar Flow)
   - viewModelScope usado apropiadamente
   - No leaking coroutines

2. Verifica lógica:
   - No lógica de UI en ViewModels
   - Separación de concerns
   - Error handling con sealed classes

ANÁLISIS DE COMPOSE SCREENS:

1. Verifica composition:
   - State hoisting correcto
   - remember/rememberSaveable apropiado
   - No side effects en composition
   - Modifiers ordenados apropiadamente

2. Verifica performance:
   - derivedStateOf donde sea necesario
   - LazyColumn para listas
   - No recompositions innecesarias

3. Verifica Material3:
   - Componentes Material3 usados
   - Theme aplicado correctamente
   - Color scheme consistente

ANÁLISIS DE API CLIENT:

1. Verifica Retrofit:
   - Interfaces definidas correctamente
   - DTOs serializables
   - Error handling implementado
   - Timeouts configurados

FORMATO DE SALIDA:
Lista de issues con:
- Ubicación
- Problema detectado
- Impacto (performance/crash/UX)
- Fix recomendado
```

---

### 5️⃣ AUDITORÍA DE SEGURIDAD

**Prompt para copiar/pegar:**

```
Realiza auditoría de seguridad del proyecto Cloned

ANÁLISIS DE AUTENTICACIÓN:

1. JWT Implementation:
   - ¿Secret en .env, no hardcodeado?
   - ¿Expiración configurada?
   - ¿Refresh tokens implementados?
   - ¿Validación de signature?

2. Password Security:
   - ¿Hashing con bcrypt?
   - ¿Salt rounds apropiados? (>= 10)
   - ¿No passwords en logs?

ANÁLISIS DE AUTORIZACIÓN:

1. Guards:
   - ¿Guards en todas las rutas protegidas?
   - ¿Validación de ownership?
   - ¿Role-based access si aplica?

2. Data Isolation:
   - ¿Usuarios solo acceden sus datos?
   - ¿Queries filtradas por userId?
   - ¿No data leakage en responses?

ANÁLISIS DE INPUTS:

1. Validation:
   - ¿class-validator en DTOs?
   - ¿Whitelist de campos?
   - ¿Type checking estricto?

2. Sanitization:
   - ¿Strings sanitizados?
   - ¿Protección XSS?
   - ¿SQL injection prevención? (Prisma hace esto)

ANÁLISIS DE SECRETS:

1. Environment Variables:
   - ¿Secrets en .env?
   - ¿.env en .gitignore?
   - ¿.env.example sin secrets?

2. Hardcoded Values:
   - Busca: passwords, keys, tokens hardcoded
   - Busca: API keys en código
   - Busca: URLs de prod hardcodeadas

ANÁLISIS DE COMUNICACIÓN:

1. HTTPS:
   - ¿Configuración para HTTPS en prod?
   - ¿HSTS headers?
   - ¿Redirect HTTP → HTTPS?

2. CORS:
   - ¿CORS configurado?
   - ¿Origins específicos, no "*"?
   - ¿Credentials permitidos apropiadamente?

3. Rate Limiting:
   - ¿Rate limiting implementado?
   - ¿Límites apropiados?
   - ¿Headers de rate limit expuestos?

FORMATO DE SALIDA:
Por cada vulnerabilidad:
- [CRÍTICO/ALTO/MEDIO/BAJO] Título
- Descripción del riesgo
- Ubicación (archivo:línea)
- Exploit potencial
- Solución detallada con código
```

---

### 6️⃣ ANÁLISIS DE PERFORMANCE

**Prompt para copiar/pegar:**

```
Analiza la performance del proyecto Cloned

BACKEND PERFORMANCE:

1. Database Queries:
   - Busca N+1 queries
   - Verifica índices en BD
   - Identifica queries sin paginación
   - Revisa eager loading excesivo

2. API Endpoints:
   - Identifica endpoints lentos potenciales
   - Verifica timeouts
   - Revisa caching opportunities
   - Busca operaciones síncronas que deberían ser async

3. Memory:
   - Busca memory leaks potenciales
   - Verifica garbage collection issues
   - Revisa tamaño de responses

FRONTEND PERFORMANCE:

1. React Components:
   - Busca re-renders innecesarios
   - Verifica uso de useMemo/useCallback
   - Identifica componentes pesados sin lazy loading
   - Revisa listas sin virtualización

2. Network:
   - Identifica requests innecesarios
   - Verifica caching de API calls
   - Busca requests en serie que podrían ser paralelos
   - Revisa tamaño de payloads

3. Bundle:
   - Analiza imports de librerías grandes
   - Verifica tree shaking
   - Identifica code splitting opportunities

ANDROID PERFORMANCE:

1. Compose:
   - Busca recompositions innecesarias
   - Verifica uso de remember
   - Identifica cálculos pesados en composition
   - Revisa LazyColumn uso

2. Coroutines:
   - Busca coroutines mal canceladas
   - Verifica dispatchers apropiados
   - Identifica operaciones bloqueantes en Main

FORMATO DE SALIDA:
Tabla con:
| Componente | Issue | Impacto | Prioridad | Fix |
```

---

### 7️⃣ ANÁLISIS DE TESTING

**Prompt para copiar/pegar:**

```
Analiza la cobertura de testing en Cloned

IDENTIFICAR ARCHIVOS SIN TESTS:

1. Backend:
   - Lista controllers sin .spec.ts
   - Lista services sin .spec.ts
   - Lista modules críticos sin tests

2. Frontend:
   - Lista components sin .test.tsx
   - Lista pages sin tests
   - Lista utilities sin tests

3. Android:
   - Lista ViewModels sin tests
   - Lista API clients sin tests
   - Lista utilities sin tests

EVALUAR TESTS EXISTENTES:

Si hay tests, verifica:
1. Coverage:
   - ¿Happy paths cubiertos?
   - ¿Edge cases cubiertos?
   - ¿Error cases cubiertos?

2. Quality:
   - ¿Tests independientes?
   - ¿Mocks apropiados?
   - ¿Setup/teardown correctos?
   - ¿Assertions significativas?

3. Maintenance:
   - ¿Tests frágiles?
   - ¿Demasiados mocks?
   - ¿Tests muy acoplados a implementación?

PRIORIZAR TESTS FALTANTES:

Basado en:
- Criticidad del módulo (auth > UI)
- Complejidad del código
- Historial de bugs
- Frecuencia de cambios

FORMATO DE SALIDA:
Roadmap de testing:
## Fase 1 (Crítico - 2 semanas)
- [ ] Test 1
- [ ] Test 2

## Fase 2 (Importante - 3 semanas)
- [ ] Test 3

## Fase 3 (Nice-to-have - 2 semanas)
- [ ] Test 4
```

---

### 8️⃣ ANÁLISIS DE ARQUITECTURA

**Prompt para copiar/pegar:**

```
Evalúa la arquitectura del proyecto Cloned

SEPARACIÓN DE CONCERNS:

1. Backend:
   - ¿Controllers solo manejan HTTP?
   - ¿Services contienen lógica de negocio?
   - ¿Repositories/Prisma aislados?
   - ¿DTOs vs Entities separados?

2. Frontend:
   - ¿Componentes de presentación vs contenedores?
   - ¿Lógica de negocio en services/hooks?
   - ¿State management centralizado?
   - ¿API layer aislado?

3. Android:
   - ¿ViewModels sin lógica de UI?
   - ¿Repository pattern usado?
   - ¿Data layer separado?
   - ¿UI layer independiente?

MODULARIDAD:

1. ¿Módulos bien definidos?
2. ¿Dependencias claras?
3. ¿Acoplamiento bajo?
4. ¿Cohesión alta?

ESCALABILIDAD:

1. ¿Puede manejar más usuarios?
2. ¿Puede agregar features fácilmente?
3. ¿Puede cambiar componentes sin romper otros?
4. ¿Tiene puntos de extensión claros?

MANTENIBILIDAD:

1. ¿Código legible?
2. ¿Naming consistente?
3. ¿Estructura de carpetas lógica?
4. ¿Documentación suficiente?

FORMATO DE SALIDA:
## Fortalezas
- [Lista]

## Debilidades
- [Lista]

## Refactorings Recomendados
1. [Alto impacto, bajo esfuerzo]
2. [Alto impacto, alto esfuerzo]
3. [Bajo impacto, bajo esfuerzo]
```

---

### 9️⃣ ANÁLISIS DE CÓDIGO DUPLICADO

**Prompt para copiar/pegar:**

```
Identifica código duplicado en Cloned

BUSCAR DUPLICACIÓN:

1. Funciones similares:
   - Busca lógica repetida en múltiples archivos
   - Identifica patrones comunes
   - Marca oportunidades de abstracción

2. Componentes UI duplicados:
   - Busca componentes React similares
   - Identifica Compose components duplicados
   - Marca oportunidades de componentización

3. Lógica de negocio:
   - Busca validaciones repetidas
   - Identifica transformaciones de datos similares
   - Marca utilidades potenciales

4. Queries similares:
   - Busca queries Prisma parecidas
   - Identifica oportunidades de repository pattern

PRIORIZAR REFACTORINGS:

Criterios:
- Frecuencia de duplicación (más = mayor prioridad)
- Probabilidad de cambio futuro
- Impacto en bundle size
- Riesgo de bugs por inconsistencia

FORMATO DE SALIDA:
Por cada duplicación:

## [Título de la duplicación]
**Archivos afectados:** [lista]
**Líneas de código duplicadas:** ~[número]
**Frecuencia:** [número] de instancias
**Prioridad:** [Alta/Media/Baja]

**Código actual:**
```[lenguaje]
[código duplicado]
```

**Refactoring sugerido:**
```[lenguaje]
[código refactorizado]
```

**Impacto:**
- Reducción de código: [número] líneas
- Mejora mantenibilidad: [Alta/Media/Baja]
- Riesgo: [Alto/Medio/Bajo]
```

---

### 🔟 ANÁLISIS DE DEPENDENCIAS

**Prompt para copiar/pegar:**

```
Analiza las dependencias del proyecto Cloned

REVISAR package.json (todos los workspaces):

1. Dependencias desactualizadas:
   - Identifica versiones antiguas
   - Marca breaking changes potenciales
   - Sugiere updates seguros

2. Dependencias no usadas:
   - Busca imports en código
   - Identifica packages sin uso
   - Calcula bundle size ahorrado

3. Dependencias vulnerables:
   - Marca CVEs conocidos
   - Prioriza por severidad
   - Sugiere parches/updates

4. Peso de dependencias:
   - Identifica packages pesados
   - Sugiere alternativas ligeras
   - Calcula impacto en bundle

REVISAR build.gradle.kts (Android):

1. Librerías desactualizadas
2. Conflictos de versiones
3. Librerías no usadas
4. APK size impact

FORMATO DE SALIDA:

## Dependencias Críticas
| Package | Versión Actual | Última | Vulnerabilidades | Acción |
|---------|---------------|---------|------------------|---------|
| [name]  | 1.0.0         | 2.0.0   | CVE-2024-XXXX    | Update  |

## Dependencias No Usadas
- [package 1] → Ahorra [size]
- [package 2] → Ahorra [size]

## Alternativas Ligeras
- [package] → usar [alternativa] (ahorra [size])
```

---

## 📊 TEMPLATE DE REPORTE COMPLETO

**Prompt final para generar reporte consolidado:**

```
Genera un reporte completo de revisión del proyecto Cloned, consolidando todos los análisis anteriores.

ESTRUCTURA DEL REPORTE:

# Reporte de Revisión Completa - Proyecto Cloned
**Fecha:** [Fecha actual]
**Revisor:** [Nombre de la IA]
**Versión analizada:** [Si hay git hash/tag]

## 1. Resumen Ejecutivo
- Estado general del proyecto: [Excelente/Bueno/Regular/Necesita atención]
- Puntuación global: [X/10]
- Issues críticos encontrados: [número]
- Recomendaciones top 3

## 2. Análisis por Componente

### 2.1 Backend (NestJS)
- Puntuación: [X/10]
- Archivos revisados: [número]
- Issues: [número] (críticos: X, importantes: Y, menores: Z)
- Top 3 fortalezas
- Top 3 debilidades

### 2.2 Frontend (Next.js)
[Mismo formato]

### 2.3 Android (Kotlin)
[Mismo formato]

### 2.4 Shared Packages
[Mismo formato]

### 2.5 Infrastructure
[Mismo formato]

## 3. Hallazgos Críticos
[Lista detallada de issues CRÍTICOS que bloquean producción]

## 4. Hallazgos Importantes
[Lista de issues que deberían arreglarse pronto]

## 5. Sugerencias de Mejora
[Nice-to-have, no bloqueantes]

## 6. Análisis de Seguridad
- Puntuación: [X/10]
- Vulnerabilidades: [número]
- Resumen de findings

## 7. Análisis de Performance
- Puntuación: [X/10]
- Bottlenecks identificados: [número]
- Optimizaciones sugeridas

## 8. Análisis de Testing
- Cobertura estimada: [X%]
- Tests faltantes: [número]
- Prioridades de testing

## 9. Análisis de Arquitectura
- Puntuación: [X/10]
- Separación de concerns: [Excelente/Bueno/Regular/Pobre]
- Escalabilidad: [Alta/Media/Baja]
- Mantenibilidad: [Alta/Media/Baja]

## 10. Roadmap de Mejoras

### Fase 1: Crítico (inmediato)
- [ ] [Acción 1]
- [ ] [Acción 2]

### Fase 2: Importante (1-2 semanas)
- [ ] [Acción 3]

### Fase 3: Mejoras (1-2 meses)
- [ ] [Acción 4]

## 11. Conclusión
[Párrafo final con assessment general y recomendación]

## 12. Siguiente Revisión
- Fecha sugerida: [fecha]
- Áreas a re-verificar: [lista]

---
*Reporte generado automáticamente por [IA]*
```

---

## 🎯 CHECKLIST DE REVISIÓN RÁPIDA

**Para IA: Usa este checklist para verificación rápida**

```markdown
## ✅ Checklist de Revisión - Proyecto Cloned

### Estructura
- [ ] Monorepo configurado correctamente
- [ ] Todos los workspaces presentes
- [ ] package.json válidos
- [ ] Docker Compose funcional

### Código - Backend
- [ ] Controllers con guards apropiados
- [ ] Services con tipado estricto
- [ ] Prisma schema válido
- [ ] Error handling presente
- [ ] No secrets hardcodeados

### Código - Frontend
- [ ] Server/Client components apropiados
- [ ] Hooks usados correctamente
- [ ] API calls con error handling
- [ ] Loading states implementados
- [ ] TypeScript strict mode

### Código - Android
- [ ] ViewModels sin leaks
- [ ] Compose sin side effects
- [ ] API client con timeouts
- [ ] Permisos en Manifest

### Seguridad
- [ ] JWT validado correctamente
- [ ] Passwords hasheados
- [ ] Inputs validados
- [ ] CORS configurado
- [ ] No SQL injection

### Performance
- [ ] No N+1 queries
- [ ] Índices en BD
- [ ] Caching donde corresponde
- [ ] Bundle size razonable

### Testing
- [ ] Tests críticos presentes
- [ ] Cobertura > 70% en módulos críticos

### Documentación
- [ ] README completo
- [ ] Setup instructions claras
- [ ] API docs presentes
```

---

## 🔄 WORKFLOW DE REVISIÓN SUGERIDO

**Para IA: Sigue estos pasos en orden**

```
1. Análisis de Estructura (5 min)
   ↓
2. Revisión de Seguridad (15 min) ← CRÍTICO
   ↓
3. Revisión de Backend (20 min)
   ↓
4. Revisión de Frontend (15 min)
   ↓
5. Revisión de Android (15 min)
   ↓
6. Análisis de Performance (10 min)
   ↓
7. Análisis de Testing (10 min)
   ↓
8. Análisis de Arquitectura (10 min)
   ↓
9. Código Duplicado (10 min)
   ↓
10. Dependencias (5 min)
    ↓
11. Generar Reporte Consolidado (10 min)

TOTAL: ~2 horas de análisis automatizado
```

---

## 📝 NOTAS FINALES PARA IAs

**Consideraciones al revisar:**

1. **Contexto del proyecto:**
   - Es un MVP completo (~95% especificaciones)
   - Algunos stubs son intencionales (voice cloning, embeddings)
   - Tests no escritos es conocido y está en backlog

2. **Priorización:**
   - CRÍTICO: Seguridad, bugs que rompen funcionalidad
   - IMPORTANTE: Performance, code quality
   - MENOR: Nice-to-have, optimizaciones

3. **Formato de output:**
   - Usa Markdown para reportes
   - Incluye código en bloques ```
   - Usa tablas para datos estructurados
   - Resalta issues críticos con 🔴

4. **Tono del reporte:**
   - Constructivo, no crítico
   - Específico, no vago ("lento" → "endpoint X toma 2s")
   - Priorizado, no exhaustivo
   - Con soluciones, no solo problemas

---

**Este documento debe usarse en conjunto con `DEV_GUIDE.md` para una revisión completa del proyecto.**

---

*Versión: 1.0*  
*Fecha: 2026-02-09*  
*Proyecto: Cloned (Deadbot)*
