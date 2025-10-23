# 🎓 Teleplataforma - Fundación San Ezequiel Moreno

> *"Cuando nació este código solo Dios y yo sabíamos lo que estábamos haciendo. Ahora solo Dios lo sabe."*

Una plataforma educativa interactiva que combina la elegancia de una interfaz 3D con la potencia de un sistema de gamificación. Diseñada para revolucionar la experiencia de aprendizaje en la Fundación San Ezequiel Moreno.

## 🎮 ¿Qué es esto exactamente?

Imagínate que tienes que crear una plataforma educativa moderna, pero en lugar de hacer algo aburrido como todos los demás, decides que tus estudiantes merecen algo distinto. Pues un poco eso

### ✨ Características Principales

- **🎯 Navegación 3D Intuitiva**: Arrastra y suelta tarjetas con física realista
- **🏆 Sistema de Gamificación**: Experiencia, niveles y logros estilo 8-bits
- **📚 Catálogo de Cursos**: Lista completa de formaciones disponibles
- **🎨 Diseño Glassmorphism**: Interfaz moderna
- **📱 Totalmente Responsive**: Funciona en cualquier dispositivo
- **⚡ Animaciones Fluidas**: GSAP para transiciones cinematográficas

## 🎨 Visuales

### Colores Corporativos
- **Color principal**: `#5d0008`
- **Fondo**: Blanco puro 
- **Efectos**: Glassmorphism 

### Interfaz 3D
Espacio 3D con físicas realistas (a veces). 

## 🎮 Sistema de Gamificación



### ¿Por qué gamificar la educación?

Aprender debería ser tan adictivo como un videojuego, pero sin los efectos secundarios de quedarte despierto hasta las 3 AM teniendo que trabajar al día siguiente.

### Características del Sistema

- **📊 Permanencia**: Los puntos se guardan en DB externa 
- **🏅 Sistema de Niveles**: Del 1 al 5 de momento
- **🎯 Logros Desbloqueables**: Para los complecionistas
- **📈 Progreso Visual**: Barras de progreso animadas (poca broma el dolor de cabeza que ha dado esto)
- **🎊 LEVEL UP**: Animaciones retro.

### Técnicismos

El sistema esta conectado directamente con Moodle para sincronizar el progreso real de los estudiantes, pero almacena toda la información de gamificación en DB externa. De esta manera se bypassean las restricciones de diseño de moodle pudiendo acceder directamente a datos reales de producción.

Que si revientas el sistema no pasa nada, vamos. Solo lee datos de prod.

## 🛠️ Stack Tecnológico

- **React + TypeScript**
- **Three.js**
- **TailwindCSS**
- **GSAP**
- **Supabase**
- **Moodle API**

## 🚀 ¿Cómo Funciona?

### Para Estudiantes
1. **Accede** a la landpage desde el enlace Moodle
2. **Arrastra** las tarjetas 3D para navegar o accede a la plataforma en si
3. **Explora** cursos y el achievement hub si lo desea
4. **Gana** experiencia y sube de nivel completando ejercicios de cursos reales
5. **Disfruta** de una experiencia de aprendizaje única

### Para Administradores

No cambia gran cosa, a futuro si me queda pelo a lo mejor meto métricas menos rígidas que las de moodle.

## 📱 Responsivo

Funciona en cualquier dispositivo, desde el móvil más pequeño hasta el monitor más grande. 

## 🎯 Casos de Uso

- **Formación Corporativa**: Gamifica el aprendizaje en empresas
- **Capacitación Profesional**: Convierte la formación en una experiencia más gratificante

## 🔮 ROADMAP

El proyecto se encuentra actualmente en desarrollo y con bastantes bugs, pero el plan inicial es el siguiente:

### Próximas Características

#### 🎮 Sistema de Items y Economía Virtual
- **🎲Sistema de Misiones**: Recompensas por completar actividades y cursos
- **🎒 Sistema de Inventario**: Stash personal donde guardar los items
- **🏪 Tienda Virtual y crafting**: Vender items del stash y craftear nuevos
- **💎 Items Únicos**: Objetos especiales desbloqueables solo por logros específicos
- **🔄 Sistema de Intercambio**: Canjeo de items por matriculaciones en cursos

#### 🏆 Competitividad y Social
- **📊 Leaderboard Global**
- **👥 Rankings por Categorías**
- **🤝 Sistema de Mentores**

#### 🎯 Gamificación Avanzada
- **🎖️ Logros Dinámicos**
- **⚡ Streaks de Aprendizaje**
- **🎪 Eventos Especiales**

#### 🔄 Integración con el Mundo Real 
- **🏢 Conexión con Empresas**: Mayor oportunidad laboral con mayor cantidad de puntos (DISCLAIMER: es un plan, no una afirmación)

#### 🎨 Personalización y Experiencia
- **👤 Avatares**

#### 🤖 Tecnología del Futuro
- **🤖 Asistente IA Personal**: Tutor virtual integrado con acceso a tus progresos Moodle
- **📊 Analytics Predictivos**: El sistema sugiere qué estudiar antes de que lo necesites

#### 🌍 Expansión Global
- **🌐 Multiidioma**
- **📱 App Móvil Nativa**




**Última actualización**: Octubre 2025

**Estado**: En desarrollo activo (pls send help)
