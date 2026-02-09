# Cloned — Design System

## Filosofía Visual

Cloned es una plataforma de **preservación de memorias cognitivas**. El diseño busca transmitir:
- **Calidez**: tonos tierra, crema y marrón
- **Respeto**: tipografía serif para títulos, sans-serif para cuerpo
- **Claridad**: fondos claros, bordes suaves, sombras sutiles
- **Emoción**: microinteracciones (float, pulse), emojis como categorías

## Paleta de Colores

| Token | Hex | Uso |
|---|---|---|
| `cloned-bg` | `#FDFAF6` | Fondo principal (crema cálido) |
| `cloned-card` | `#FFFFFF` | Tarjetas y superficies |
| `cloned-card-alt` | `#F8F2EB` | Fondo alternativo |
| `cloned-border` | `#E8DFD3` | Bordes |
| `cloned-accent` | `#C08552` | Color principal (marrón cálido) |
| `cloned-accent-light` | `#D4A574` | Acento claro |
| `cloned-accent-dark` | `#9A6B3E` | Acento oscuro (hover) |
| `cloned-text` | `#2D2A26` | Texto principal |
| `cloned-muted` | `#8C8279` | Texto secundario |
| `cloned-soft` | `#F5EDE3` | Fondos suaves |
| `cloned-success` | `#5A8A5E` | Estados positivos |
| `cloned-danger` | `#C25B4A` | Estados de error |
| `cloned-hero` | `#FDF5EC` | Fondo hero/CTA |

## Tipografía

| Nivel | Fuente | Uso |
|---|---|---|
| `font-display` | Georgia, serif | Títulos, headings, copy emocional |
| `font-body` | Inter, sans-serif | Cuerpo, UI, formularios |

## Componentes

### Button
- `primary`: bg-cloned-accent, text-white, rounded-xl, shadow-sm
- `secondary`: bg-white, border, rounded-xl
- `danger`: bg-cloned-danger, text-white
- `ghost`: hover:bg-cloned-soft

### Card
- bg-white, border-cloned-border, rounded-2xl, p-6, shadow-sm
- Hover: border-cloned-accent/40, shadow-md

### Input
- bg-white, border-cloned-border, rounded-xl, px-4, py-2.5
- Focus: border-cloned-accent, ring-2 ring-cloned-accent/10

### Badge (Status)
- ENROLLING: bg-amber-50, text-amber-700
- ACTIVE: bg-emerald-50, text-emerald-700
- ARCHIVED: bg-gray-50, text-gray-500

### ChatBubble
- User: bg-cloned-accent, text-white, rounded-br-md
- Persona: bg-white, border, rounded-bl-md
- System: bg-amber-50, text-amber-800, italic

## Animaciones

- `animate-float`: translateY oscilante (3s) — logo en hero
- `animate-pulse-ring`: scale+opacity (1.5s) — avatar hablando
- `animate-spin`: rotación — loading spinners
- `animate-bounce`: rebote — chat typing dots

## Android

Material3 light theme con misma paleta:
- Primary: `#C08552`
- OnPrimary: `#FFFFFF`
- Background: `#FDFAF6`
- Surface: `#FFFFFF`
- OnSurface: `#2D2A26`
