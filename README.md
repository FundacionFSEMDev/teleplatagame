# 🎓 EduHubRPG - Sistema de Gamificación Educativa

<div align="center">

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.158.0-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Moodle](https://img.shields.io/badge/Moodle-API-FF6B35?style=for-the-badge&logo=moodle&logoColor=white)](https://moodle.org/)

**Sistema de gamificación completo para plataformas educativas**  
*Desarrollado desde cero por David Conde Gutierrez*

[![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-orange?style=for-the-badge)](#)
[![Versión](https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge)](#)
[![Líneas de Código](https://img.shields.io/badge/Líneas%20de%20Código-2500%2B-orange?style=for-the-badge)](#)

</div>

---

## 🎯 ¿De que va el proyecto?

**EduHubRPG** externaliza la gamificación de plataformas educativas (como Moodle) añadiendo elementos de videojuegos RPG: niveles, experiencia, logros, items virtuales... para que estudiar sea menos aburrido.

Al estar externalizado, se tiene mas flexibilidad a la hora de añadir elementos o módificar los existentes conforme a las necesidades que tengamos.

**El proyecto esta en desarrollo haciendo uso de asistentes de código (Cursor principalmente), debido a la facilidad y rapidez de implementación.**

## 🤔 ¿Por qué?

Todos los cursos que he hecho en plataformas de formación online se ceñían a sistemas de puntuaciones del año de la tana que no motivaban al usuario más allá de conseguir un diploma/certificado.

Añadiéndole el elemento RPG, conseguimos aumentar el % de finalización de los usuarios en los cursos, ya sea motivados por el sentimiento de gratificación de obtener una recompensa útil tras un duro esfuerzo o por el ansia de complecionismo.

La idea surgió de la frustración de ver cómo la educación online se había quedado estancada en interfaces aburridas y sistemas de recompensas que no conectaban con los usuarios. Los videojuegos pueden mantener a la gente enganchada durante horas (y me apasionan), asi que se me ocurrió fusionar ambas cosas.

### ✨ ¿Qué hace exactamente?

<table>
<tr>
<td width="50%">

#### 🎮 **Interfaz 3D Interactiva**
- Navegación drag & drop con físicas realistas (por pulir)
- Renderizado optimizado con Three.js
- Efectos visuales adaptados al estandar visual actual

#### 🏆 **Sistema de Gamificación**
- Experiencia, niveles y logros estilo RPG
- Animaciones y UI 8-bit
- Dashboard que muestra datos diretamente de la plataforma que se configure (via API)

</td>
<td width="50%">

#### 📚 **Integraciones**
- Se conecta con Moodle (o cualquier LMS que soporte API REST)
- Base de datos externa para la permanencia de los datos de gamificación
- Autenticación DB - LMS (Solo lectura, los datos de LMS permanecen intactos siempre)

#### 🎨 **Diseño**
- Glassmorphism y animaciones fluidas
- Responsive 
- Optimizado

</td>
</tr>
</table>

---

## 🚀 ¿Qué se puede hacer?

### ✅ **Funcionalidades implementadas**

- [x] **Interfaz 3D** - Arrastrado de tarjetas con físicas realistas (componente de ReactBits: https://reactbits.dev/)
- [x] **Sistema de autenticación** - Lee directamente de Moodle para identificar al usuario y sus avances. Accede a cualquier dato al que se le dé permiso en el web service.
- [x] **Dashboard** - UI con animaciones (por pulir)
- [x] **Sincronización** - Consulta el LMS al acceder y actualiza la base de datos solo si detecta cambios en los datos del usuario
- [x] **Migraciones** - Sistema automatizado con logs detallados para cada statement SQL ejecutado (desarrollado con Cursor)
- [x] **Responsive** - Funciona en cualquier dispositivo
- [x] **Animaciones** - GSAP para efectos

### 🔄 **Planes a futuro**

- [ ] **Sistema de items, tienda y crafteo** - Stash y recompensas virtuales, tienda para venta/compra, mejora y crafteo de items de la misma rareza
- [ ] **Leaderboards** - Rankings entre estudiantes de la plataforma (se planea que sea de participación opcional para la gente menos competitiva)
- [ ] **Sistema de misiones** - Objetivos dinámicos que añadan metas a corto/medio y largo plazo para asegurar la permanencia del estudiante.
- [ ] **Analytics** - Métricas visuales para gestores en una dashboard adaptada a necesidades realistas. 

---

## 🎮 Gamificación

### 🏆 **La idea inicial es:**

- ✅ **Persistencia** - Datos de gamificación persistentes aun que se desmatricule al usuario 
- ✅ **Cálculo** - Basado en progreso real de los cursos activos del usuario (gestionado por estado is_active:true/false en DB).
- ✅ **Sistema de EXP (tremendo dolor de cabeza)** - Fórmula matemática para escalado progresivo (no se pierde exp). Ratio de 30 puntos cada 10% de curso. Actualmente solo hay 5 niveles.
- ✅ **Sincronización** - Todo se actualiza automáticamente en cada login del sistema.

---

## 🛠️ Stack

### **Frontend**
- **React 18.2.0** con TypeScript
- **Three.js**  3D
- **GSAP** animaciones
- **TailwindCSS** responsividad

### **Backend**
- **PostgreSQL**  base de datos
- **Migraciones automatizadas a través de script** por operatividad
- **Funciones y triggers** personalizados

### **Integración**
- **Moodle API** para sincronización
- **Autenticación bidireccional**
- **Validación de datos** automática

### **Assets**
- **Kenney UI Assets** - AlElementos de interfaz y gráficos (https://kenney.nl/)

---

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Base de datos PostgreSQL (Supabase, por ejemplo: https://supabase.com/)
- Moodle Web Services API o API REST de LMS 

### CLI

```bash
# 1. Clona el repo
git clone https://github.com/superpin9899/EduHubRPG.git

# 2. Instala las dependencias
npm install

# 3. Configurar DB
# Crear archivo config.json con creds (AÑADIR config.json a .gitignore):
{
  "supabase": {
    "url": "https://tu-proyecto.supabase.co",
    "serviceKey": "tu-service-key-aqui"
  },
  "moodle": {
    "url": "https://tu-moodle.com",
    "token": "tu-token-aqui"
  }
}

# 4. Para ejecutar las migraciones
npm run migrate

# 5. Para testing:
npm run dev
```

### Configuración de la DB

El proyecto incluye migraciones automáticas que crean todas las tablas necesarias:

```sql
-- Tablas principales que se crean automáticamente:
users              # Usuarios sincronizados
badges             # Logros disponibles  
user_badges        # Logros desbloqueados
points_history     # Historial de puntos
course_progress    # Progreso en cursos
```

### 📋 **Migraciones disponibles**

El sistema incluye 6 migraciones que **DEBEN ejecutarse en orden secuencial**:

1. **`001_test_connection.sql`** - Verifica que la conexión de cursor a la base de datos funciona
2. **`002_gamification_system.sql`** - Crea las tablas principales del sistema de gamificación
3. **`003_functions_and_triggers.sql`** - Implementa funciones y triggers para el cálculo automático de puntos
4. **`004_add_is_active_column.sql`** - Añade columna `is_active` a la tabla `users`
5. **`005_add_is_active_to_course_progress.sql`** - Añade columna `is_active` a la tabla `course_progress`
6. **`006_update_exp_calculation_logic.sql`** - **⚠️ IMPORTANTE: Arregla un bug crítico derivado de la migración 003**

> **🚨 CRÍTICO**: La migración 006 corrige un error en la lógica de cálculo de experiencia que se introdujo en la migración 003. Es **fundamental** ejecutar todas las migraciones en orden secuencial para evitar dolores de cabeza.

---

## 🎯 Casos de uso

### 👨‍🎓 **Para estudiantes**
1. **Intuitivo** desde tu plataforma educativa (Integrable via <iframe>)
2. **Navegación 3D** arrastrando tarjetas
3. **Gamificación del aprendizaje** con puntos y niveles
4. **Progreso visual** con animaciones retro
5. **Experiencia inmersiva** que motiva a seguir aprendiendo

### 👨‍💼 **Para administradores**
- **Integración transparente, sencilla y segura** con tu plataforma existente (solo lee)

---


---

## 🎨 Personalización

### **Paleta**
- **Color principal**: `#2563eb` (Azul)
- **Fondo**: Blanco puro


---

## 📄 Licencia

El proyecto lo he creado porque me gusta programar y así practico, por lo que, básicamente, puedes hacer lo que quieras con él:

- ✅ Usarlo en proyectos comerciales
- ✅ Modificarlo a tu gusto
- ✅ Distribuirlo libremente
- ✅ Meterle  clone y crear tu propia versión

**Solo pido una cosa**: Si lo usas, nunca viene mal algún consejo o mejora. No cuesta nada y me sirve para mejorar.

---

<div align="center">

### 🚀 **Estado**

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-orange?style=for-the-badge)](#)
[![Última Actualización](https://img.shields.io/badge/Última%20Actualización-Octubre%202025-blue?style=for-the-badge)](#)
[![Versión](https://img.shields.io/badge/Versión-1.0.0-purple?style=for-the-badge)](#)

**Idea, conceptualización y desarrollo inicial por**: **David Conde Gutierrez**


</div>