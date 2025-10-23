image.png# 🎓 Teleplataforma - Fundación San Ezequiel Moreno

Plataforma educativa interactiva con interfaz 3D para la Fundación San Ezequiel Moreno. Diseñada para ser incrustada como iframe en Moodle.

## 📋 Descripción General

Landing page interactiva con sistema de navegación mediante tarjetas 3D (lanyards) con física realista. Los usuarios pueden arrastrar y soltar tarjetas para navegar entre tres secciones principales:
- **Lista de cursos**: Catálogo completo de cursos disponibles
- **¿Cómo funciona?**: Información sobre el funcionamiento de la plataforma
- **Soporte**: Formulario de contacto y asistencia

## 🎨 Identidad Visual

### Colores Corporativos
- **Color principal**: `#5d0008` (borgoña/granate oscuro)
- **Fondo**: `#ffffff` (blanco puro)
- **Acento secundario**: `#8b0012` (hover states)

### Logo
- Ubicado en banner superior con efecto glassmorphism
- Archivo: `src/components/logo.png`
- Tamaño: Responsive, se ajusta con el viewport

## 🛠️ Stack Tecnológico

### Core
- **React 18.3.1** con TypeScript
- **Vite 5.4.2** (build tool)
- **TailwindCSS 3.4.1** (estilos)

### 3D y Animaciones
- **Three.js 0.163.0** (renderizado 3D)
- **@react-three/fiber 8.18.0** (React renderer para Three.js)
- **@react-three/drei 9.122.0** (helpers para R3F)
- **@react-three/rapier 1.3.0** (motor de física)
- **GSAP 3.13.0** (animaciones avanzadas)
- **MeshLine 3.3.1** (líneas/cuerdas 3D)

### UI y Utilidades
- **Lucide React 0.344.0** (iconos)
- **EmailJS 4.4.1** (formularios de contacto)
- **Supabase 2.57.4** (backend/database)
- **class-variance-authority** + **clsx** + **tailwind-merge** (gestión de clases)

### Componentes ReactBits
Se han integrado componentes de **reactbits.dev**:
- `Lanyard` (tarjetas 3D con física)
- `Particles` (fondo animado con interacción mouse)
- `AnimatedText` (texto animado con GSAP - SplitText)

## 📁 Estructura del Proyecto

```
TELEPLATAFORMA/
├── src/
│   ├── components/
│   │   ├── Lanyard.tsx                    # Componente principal de tarjetas 3D
│   │   ├── Lanyard.css                    # Estilos del canvas 3D
│   │   ├── card.glb                       # Modelo 3D de la tarjeta
│   │   ├── lanyard.png                    # Textura de la cuerda
│   │   ├── logo.png                       # Logo de la fundación
│   │   ├── Particles.tsx                   # Fondo de partículas animadas
│   │   ├── Particles.jsx/.d.ts            # Definiciones de partículas
│   │   ├── Particles.css                  # Estilos de partículas
│   │   ├── AnimatedText.tsx               # Componente de texto animado (GSAP)
│   │   ├── GamificationCard.tsx           # Card de entrada al sistema de gamificación
│   │   ├── GamificationLogin.tsx          # Modal de login para gamificación
│   │   └── GamificationDashboard.tsx      # Dashboard pixelart de logros
│   ├── App.tsx                            # Componente principal con navegación
│   ├── main.tsx                           # Entry point
│   ├── index.css                          # Estilos globales y animaciones
│   ├── CoursesList.tsx                    # Listado de cursos
│   ├── CourseInterestForm.tsx             # Formulario de interés en cursos
│   ├── Interactive3DModel.tsx             # Modelos 3D interactivos
│   ├── SupportSection.tsx                 # Sección de soporte
│   ├── global.d.ts                        # Declaraciones de tipos globales
│   ├── vite-env.d.ts                     # Tipos de Vite y assets
│   └── lib/
│       └── utils.ts                       # Utilidades (cn helper)
├── migrations/                             # Migraciones de Supabase
│   ├── 001_test_connection.sql            # Prueba de conectividad
│   ├── 002_gamification_system.sql        # Esquema completo de gamificación
│   ├── 003_functions_and_triggers.sql     # Funciones PostgreSQL
│   └── 004_add_is_active_column.sql       # Columna de estado activo
├── scripts/
│   └── migrate.js                          # Script de migración automática
├── public/                                 # Assets públicos
├── dist/                                   # Build de producción
├── config.json                             # Credenciales de Supabase (ignorado por Git)
├── test-moodle-connection.js               # Pruebas de conectividad Moodle
├── check-my-courses.js                     # Verificación de cursos por usuario
├── components.json                         # Configuración de shadcn
├── tailwind.config.js                     # Configuración de Tailwind
├── tsconfig.json                           # Configuración de TypeScript
├── vite.config.ts                          # Configuración de Vite
└── package.json                            # Dependencias y scripts
```

## 🎮 Componentes Principales

### 1. Lanyard Component (`src/components/Lanyard.tsx`)
**Tarjeta 3D con física realista**

#### Características:
- Física de arrastre con gravedad mediante Rapier
- **Límites de arrastre con vibración**: La tarjeta no puede arrastrarse más allá de ciertos límites (MIN_Y = -1.5, MAX_Y = 2) y vibra sutilmente al alcanzarlos
- Modelo 3D (card.glb) con textura personalizada
- Cuerda 3D renderizada con MeshLine
- Iconos personalizados por tipo de tarjeta (Lucide React)
- Texto renderizado en textura del canvas
- Z-index dinámico (tarjeta arrastrada siempre al frente)
- Interacción mediante puntero (drag & drop)

#### Props:
```typescript
interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  cardType?: 'courses' | 'how-it-works' | 'support';
  onRelease?: () => void;
}
```

#### Tipos de tarjeta:
- **courses**: Icono `BookOpen`, texto "Lista de cursos"
- **how-it-works**: Icono `HelpCircle`, texto "¿Cómo funciona?"
- **support**: Icono `Headphones`, texto "Soporte"

#### Configuración de layout (Lanyard.css):
```css
.lanyard-wrapper {
  height: 80vh;           /* Altura fija del canvas */
  transform: scale(0.85); /* Escala del render */
  overflow: visible !important; /* Permite salir del contenedor */
}
```

⚠️ **IMPORTANTE**: No modificar `height` sin ajustar `scale` proporcionalmente para mantener el tamaño visual de las tarjetas.

### 2. Particles Component (`src/components/Particles.tsx`)
**Fondo animado con partículas interactivas**

#### Características:
- Sistema de partículas con OGL (WebGL optimizado)
- Interacción con movimiento del mouse
- Colores configurables (actualmente `#5d0008`)
- Renderizado en segundo plano (z-index bajo)

### 3. AnimatedText Component (`src/components/AnimatedText.tsx`)
**Texto con animación GSAP**

#### Características:
- Utiliza GSAP SplitText
- Animación palabra por palabra
- Configurado para el hint del banner

### 4. App Component (`src/App.tsx`)
**Orquestador principal de la aplicación**

#### Secciones:
```typescript
type Section = 'menu' | 'courses' | 'howto' | 'support'
```

#### Layout principal:
```jsx
- Fondo de partículas (Particles)
- Banner superior con logo + hint animado
  - Glassmorphism effect
  - Full width
  - Bottom align con top de lanyards
- 3 Lanyards en grid (33.3% cada uno)
  - 100vw de ancho total
  - paddingTop: 9vh
  - paddingBottom: 40vh (para iframe en Moodle)
- Secciones renderizadas condicionalmente con animación slideUp
```

## 🎯 Funcionalidades Clave

### Navegación por Lanyards
1. Usuario arrastra una tarjeta
2. Al soltar, se activa `onRelease()`
3. Transición slideUp desde abajo
4. Renderizado de sección correspondiente
5. Botón "Volver" para retornar al menú

### Sistema de Física
- Motor: Rapier 3D
- Gravedad configurable por lanyard
- Colisión esférica en tarjeta
- Joint esférico para simular cuerda
- Damping para movimiento realista

### Responsive Design
- Glassmorphism en banner
- Grid responsive (3 columnas en desktop)
- Viewport heights para adaptabilidad
- Overflow visible para lanyards

## 🎮 Sistema de Gamificación

### Arquitectura General
Sistema externo de gamificación que se conecta con Moodle mediante Web Services API y almacena datos en Supabase para evitar duplicación de autenticación.

#### Componentes Principales:
- **GamificationCard**: Punto de entrada con diseño gaming-like
- **GamificationLogin**: Modal de login con verificación Moodle
- **GamificationDashboard**: Dashboard pixelart con animaciones retro

### Base de Datos (Supabase)
```sql
-- Tablas principales:
users              # Usuarios sincronizados con Moodle
badges             # Logros disponibles
user_badges        # Logros desbloqueados por usuario
points_history     # Historial de puntos ganados
course_progress    # Progreso en cursos de Moodle
```

#### Migraciones:
- `migrations/001_test_connection.sql` - Prueba de conectividad
- `migrations/002_gamification_system.sql` - Esquema completo
- `migrations/003_functions_and_triggers.sql` - Funciones PostgreSQL
- `migrations/004_add_is_active_column.sql` - Columna de estado activo

#### Script de Migración:
```bash
npm run migrate    # Ejecuta la última migración automáticamente
```

### Flujo de Autenticación
1. Usuario introduce email en modal de login
2. Sistema verifica email en Moodle via `core_user_get_users`
3. Si existe en Moodle:
   - Crea/actualiza usuario en Supabase
   - Marca `is_active = true`
   - Acceso al dashboard
4. Si NO existe en Moodle:
   - Marca usuario como `is_active = false` (si existe en Supabase)
   - Muestra modal de error con enlace a cursos

### Dashboard de Logros
#### Características:
- **Estilo pixelart**: NES.css + Press Start 2P font
- **Layout compacto**: 2 columnas en desktop, 1 en móvil
- **Sincronización automática**: Moodle → Supabase
- **Animaciones fluidas**: Barras de progreso animadas
- **Sistema de niveles**: Cálculo basado en XP acumulado

#### Cálculo de XP y Niveles:
```javascript
// Fórmula de nivel: nivel = floor(sqrt(puntos / 100)) + 1
// XP por curso: progreso% * 3 puntos
// Ejemplo: Curso 75% = 225 XP
```

#### Animación de Barra de Experiencia:
1. **Carga inicial**: Muestra progreso anterior de Supabase
2. **Sincronización**: Compara con datos actuales de Moodle
3. **Animación**: Llena barra desde progreso anterior → nuevo progreso
4. **LEVEL UP**: Si sube de nivel, animación especial retro
5. **Timing perfecto**: Solo anima cuando el usuario puede verla

#### Estados de Animación:
```typescript
animatedProgress: number    // Progreso animado actual
previousProgress: number    // Progreso anterior (desde Supabase)
isAnimating: boolean       // Indicador visual ⚡
showLevelUp: boolean       // Overlay LEVEL UP
levelUpFrom: number        // Nivel anterior
levelUpTo: number          // Nivel nuevo
```

### Configuración de APIs
#### Moodle Web Services:
```javascript
MOODLE_URL: 'https://formacion.fundacionsanezequiel.org'
MOODLE_TOKEN: '81ca76859196a70d00b4683c7270e76c'
```

#### Supabase:
```javascript
SUPABASE_URL: 'https://zwmmrhiqbdafkvbxzqig.supabase.co'
SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Archivos de Configuración:
- `config.json` - Credenciales de Supabase (ignorado por Git)
- `scripts/migrate.js` - Script de migración automática
- `test-moodle-connection.js` - Pruebas de conectividad
- `check-my-courses.js` - Verificación de cursos por usuario

## 🎨 Animaciones CSS (index.css)

```css
@keyframes slideUpFromBottom    /* Entrada de secciones */
@keyframes fadeIn               /* Fade in general */
@keyframes cardDrop             /* Drop de tarjetas */
@keyframes contentReveal        /* Reveal de contenido */
@keyframes pulse                /* Pulsación sutil */
```

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo (puerto 5173)

# Build
npm run build        # Compila TypeScript y genera build de producción
npm run preview      # Preview del build de producción

# Linting
npm run lint         # ESLint con reglas de TypeScript
npm run typecheck    # Verificación de tipos sin emitir archivos
```

## 📦 Assets Críticos

### Modelos 3D y Texturas
- `src/components/card.glb` - Modelo 3D de la tarjeta (must have)
- `src/components/lanyard.png` - Textura de la cuerda (color `#5d0008`)
- `src/components/logo.png` - Logo de la fundación

⚠️ **Estos archivos NO deben eliminarse o la aplicación fallará**

### Generación Dinámica de Texturas
Los iconos de las tarjetas se generan dinámicamente mediante:
```typescript
createIconTexture(cardType: CardType)
```
- Renderiza icono Lucide React a SVG
- Dibuja en canvas 1024x1024
- Añade texto con fuente bold
- Invierte verticalmente (por UV mapping del modelo)
- Retorna THREE.Texture

## 🔧 Configuración Específica

### Vite (vite.config.ts)
```typescript
assetsInclude: ['**/*.glb', '**/*.gltf']  // Permite importar modelos 3D
```

### TypeScript (vite-env.d.ts)
Declaraciones para imports de assets:
```typescript
declare module '*.glb'
declare module '*.png'
declare module '*.jpg'
```

### TailwindCSS (tailwind.config.js)
- Plugin: `tailwindcss-animate`
- Colores custom configurables
- Responsive breakpoints

## ⚙️ Variables de Entorno y Configuración

### EmailJS
Configurar en `CourseInterestForm.tsx`:
```typescript
SERVICE_ID: "your_service_id"
TEMPLATE_ID: "your_template_id"
PUBLIC_KEY: "your_public_key"
```

### Supabase (si se usa)
Verificar configuración en archivos que lo importen.

## 🐛 Solución de Problemas Comunes

### Las tarjetas se cortan al arrastrar hacia abajo
- Verificar `paddingBottom` en el contenedor de lanyards en `App.tsx`
- Actualmente: `40vh` (ajustado para iframe de Moodle)
- NO modificar `height` en `Lanyard.css` sin ajustar `scale`

### El canvas 3D no se ve
- Verificar que existen `card.glb` y `lanyard.png`
- Comprobar consola para errores de carga de assets
- Verificar que `@react-three/fiber` y `@react-three/drei` están instalados

### Errores de tipo en .glb/.png
- Verificar que `vite-env.d.ts` incluye las declaraciones de módulos
- Ejecutar `npm run typecheck` para ver errores específicos

### Las partículas no se ven o no reaccionan al mouse
- Verificar que `Particles.tsx` está renderizado con z-index bajo
- Comprobar que `ogl` está instalado
- Verificar consola para errores de WebGL

### El texto animado no funciona
- Verificar que GSAP y @gsap/react están instalados
- Comprobar que SplitText está correctamente configurado
- Ejecutar: `npm install gsap @gsap/react`

## 📱 Consideraciones para iFrame en Moodle

1. **Altura mínima recomendada**: 100vh del contenedor padre
2. **Padding inferior**: Ya configurado en `40vh` para evitar cortes
3. **Overflow**: Todos los contenedores tienen `overflow: visible`
4. **Responsive**: Usa vh/vw para adaptarse al contenedor
5. **Performance**: El canvas 3D puede ser intensivo, considerar dispositivos móviles

## 🔄 Instalación de Componentes ReactBits

Para agregar nuevos componentes de reactbits.dev:

```bash
# 1. Instalar dependencias del componente (si las tiene)
npm install [dependencias]

# 2. Ejecutar comando npx (siempre con --yes para no-interactive)
npx shadcn@latest add https://reactbits.dev/r/[ComponentName] --yes

# 3. Importar y usar en el proyecto
```

Componentes ya instalados:
- ✅ Lanyard
- ✅ Particles
- ✅ SplitText (como AnimatedText)

## 📝 Notas de Desarrollo

### Backups de Lanyards
En caso de necesitar revertir los cambios de límites de arrastre:
- **Backup disponible**: `src/components/Lanyard.tsx.backup`
- **Backup CSS**: `src/components/Lanyard.css.backup`

### Reglas de Memoria del Proyecto
- **Color de marca**: Siempre `#5d0008`
- **Fondo**: Siempre blanco puro
- **No usar posicionamiento absoluto**: Preferir flexbox/grid
- **Comandos**: Ejecutar uno a vez, nunca encadenar con `&&`
- **Responsive**: Todas las pantallas, incluidas extremas
- **Glassmorphism**: Aplicado en elementos UI sobre el fondo
- **Animaciones variadas**: Evitar monotonía, usar diferentes efectos

### Estado Actual
- ✅ Landing page funcional con 3 lanyards
- ✅ Navegación por drag & drop implementada
- ✅ **Límites de arrastre con efecto de vibración** (MIN_Y = -1.5)
- ✅ Fondo de partículas interactivo
- ✅ Banner con logo y hint animado
- ✅ Secciones de contenido con transiciones
- ✅ Sección "Cómo funciona" rediseñada con timeline horizontal animada (GSAP)
- ✅ **Sistema de gamificación completo** con Supabase + Moodle API
- ✅ **Dashboard de logros** con animaciones pixelart retro
- ✅ **Animación de barra de experiencia** con LEVEL UP
- ✅ Preparado para iframe en Moodle


## 🎯 Próximos Pasos Sugeridos

1. Configurar credenciales de EmailJS
2. Configurar Supabase (si se usa para backend)
3. Añadir contenido real a las secciones
4. Optimizar para dispositivos móviles
5. Testing en iframe de Moodle
6. Añadir loading states para modelos 3D
7. Implementar caché de texturas generadas

## 📞 Soporte

Para cualquier duda sobre el proyecto, revisar:
1. Este README
2. Comentarios en el código fuente
3. Documentación de las librerías usadas
4. ReactBits.dev para componentes específicos

---

**Última actualización**: Octubre 2024  
**Versión**: 1.0.0  
**Estado**: En desarrollo activo 🚀

