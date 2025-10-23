# 🎓 Teleplataforma - Sistema de Gamificación Educativa

<div align="center">

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.158.0-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3.0.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Moodle](https://img.shields.io/badge/Moodle-API-FF6B35?style=for-the-badge&logo=moodle&logoColor=white)](https://moodle.org/)

**Sistema de gamificación completo para la teleplataforma Moodle de la Fundación San Ezequiel Moreno**  
*Desarrollado desde cero.*

[![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-orange?style=for-the-badge)](#)
[![Versión](https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge)](#)
[![Líneas de Código](https://img.shields.io/badge/Líneas%20de%20Código-2500%2B-orange?style=for-the-badge)](#)

</div>

---

## 🎯 Descripción del Proyecto

Una **landing page externa de gamificación** que combina una interfaz 3D inmersiva con un sistema de gamificación robusto, diseñada para complementar y gamificar la experiencia de aprendizaje en la plataforma Moodle existente de la Fundación San Ezequiel Moreno.

### ✨ Características Principales

<table>
<tr>
<td width="50%">

#### 🎮 **Interfaz 3D Inmersiva**
- Navegación mediante drag & drop
- Física realista
- Render optimizado con Three.js

#### 🏆 **Sistema de Gamificación**
- Experiencia, niveles y logros
- Animaciones 8-bit style
- Dashboard pixelart interactivo

</td>
<td width="50%">

#### 📚 **Integraciones**
- Sincronizado con Moodle
- Base de datos externa para la gamificación y permanencia de datos
- Sistema de autenticación integrado con validación bidireccional

#### 🎨 **Diseño Moderno**
- Glassmorphism y animaciones fluidas
- Responsive design
- Optimización de performance

</td>
</tr>
</table>

---

## 🚀 Funcionalidades Implementadas

### ✅ **Completado**

- [x] **Interfaz 3D Interactiva** - Navegación con física realista
- [x] **Sistema de Autenticación** - Integración completa con Moodle
- [x] **Dashboard de Gamificación** - Interfaz pixelart con animaciones
- [x] **Sincronización de Datos** - Moodle ↔ Database en tiempo real
- [x] **Sistema de Migraciones** - Automatización de cambios de DB
- [x] **Responsive Design** - Optimizado a todos los dispositivos
- [x] **Animaciones Avanzadas** - GSAP para transiciones cinematográficas

### 🔄 **En Desarrollo**

- [ ] **Sistema de Items** - Stash y Recompensas
- [ ] **Leaderboard Global** - Rankings
- [ ] **Sistema de Misiones** - Objetivos dinámicos
- [ ] **Analytics Avanzados** - Métricas de aprendizaje

---

## 🎮 Sistema de Gamificación

### 🏆 **Características Implementadas**

- ✅ **Permanencia de datos** - Los puntos de experiencia son permanentes entre sesiones
- ✅ **Cálculo dinámico** - Basado en progreso real de cursos del estudiante
- ✅ **Sistema de EXP** - Fórmula matemática para escalado incremental
- ✅ **Animaciones retro** - Efectos visuales estilo 8-bits
- ✅ **Dashboard interactivo** - Interfaz pixelart con animaciones
- ✅ **Sincronización en tiempo real** - Integración completa con Moodle

---

## 🏗️ Arquitectura del Sistema

```mermaid
graph TB
    A[Usuario] --> B[Interfaz 3D React]
    B --> C[Sistema de Gamificación]
    C --> D[Base de Datos]
    B --> E[API Moodle]
    E --> F[Plataforma Educativa]
    D --> G[Dashboard de Logros]
    C --> H[Trigger de Animaciones GSAP]
```

### 🛠️ Stack Tecnológico

<div align="center">

| **Frontend** | **Backend** | **Integración** |
|:------------:|:-----------:|:---------------:|
| React 18.2.0 | Secret:) | Moodle API |
| TypeScript | PostgreSQL | Web Services |
| Three.js | Migraciones | Autenticación |
| GSAP | Triggers | Sincronización |
| TailwindCSS | Funciones | Validación |

</div>

### 📊 **Métricas del Proyecto**

<div align="center">

| **Métrica** | **Valor** |
|:-----------:|:---------:|
| 📝 Líneas de código | 2,500+ |
| 🧩 Componentes React | 15+ |
| 🗄️ Migraciones SQL | 6 |
| 🔗 APIs | 2 |
| 🛠️ Tecnologías | 8+ |

</div>

---

## 🎯 Casos de Uso

### 👨‍🎓 **Para Estudiantes**
1. **Acceso intuitivo** desde la plataforma Moodle existente
2. **Navegación 3D** mediante drag & drop de tarjetas
3. **Gamificación del aprendizaje y engagement** con puntos y niveles
4. **Progreso visual** con animaciones retro gaming
5. **Experiencia inmersiva** que motiva el aprendizaje

### 👨‍💼 **Para Administradores**
- **Métricas detalladas** de progreso estudiantil
- **Integración transparente** con Moodle existente
- **Dashboard administrativo** para monitoreo
- **Sistema de respaldos** automatizado

---

## 🏆 Logros Técnicos

<div align="center">

### 🎯 **Desafíos Superados**

| **Desafío** | **Solución Implementada** |
|:-----------:|:-------------------------:|
| 🔄 **Integración compleja** | Conexión bidireccional entre Moodle y Database |
| 🎮 **Física realista** | Implementación de Rapier para interacciones 3D |
| ⚡ **Optimización** | Lazy loading y memoización avanzada |
| 🗄️ **Migraciones** | Automatización completa de cambios de BD |
| 🎨 **Animaciones** | GSAP para transiciones profesionales |

</div>

---

## 🎨 Identidad Visual

<div align="center">

| **Elemento** | **Especificación** |
|:------------:|:-----------------:|
| 🎨 **Color principal** | `#5d0008` (Borgoña corporativo) |
| ⚪ **Fondo** | Blanco puro |
| ✨ **Efectos** | Glassmorphism |
| 🎮 **Estilo gaming** | Pixelart retro |

</div>

---

## 📱 Responsive Design

<div align="center">

| **Dispositivo** | **Optimización** |
|:---------------:|:----------------:|
| 📱 **Móvil** | Interfaz adaptativa con touch |
| 💻 **Tablet** | Layout híbrido |
| 🖥️ **Desktop** | Experiencia 3D |
| 📺 **Pantallas grandes** | Escalado automático |

</div>

---

## 🤝 Contribución

Este proyecto es desarrollado por el equipo de Sistemas de la **Fundación San Ezequiel Moreno**. 

Para consultas sobre el proyecto, contactar con el equipo de desarrollo.

---

## 📄 Licencia

Copyright (c) 2025 Fundación San Ezequiel Moreno. Todos los derechos reservados.

---

<div align="center">

### 🚀 **Estado del Proyecto**

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-orange?style=for-the-badge)](#)
[![Última Actualización](https://img.shields.io/badge/Última%20Actualización-Octubre%202025-blue?style=for-the-badge)](#)
[![Versión](https://img.shields.io/badge/Versión-1.0.0-purple?style=for-the-badge)](#)

**Desarrollado por**: Fundación San Ezequiel Moreno - Sistemas: **David Conde Gutierrez.**

</div>