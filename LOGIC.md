# LÓGICA DEL SISTEMA DE GAMIFICACIÓN

## 🎯 OBJETIVO PRINCIPAL
Los puntos de EXP siempre se guarden independientemente de si el alumno está o no matriculado y que su experiencia vaya aumentando conforme hace puntos.

## 📋 SUPUESTOS CLAVE
- ✅ Los alumnos NO pueden reducir su % de completación de un curso
- ✅ Los alumnos NO pueden ser rematriculados en el mismo curso (son versiones del mismo curso creados en cursos nuevos con nomenclaturas distintas)

## 🔧 LÓGICA DE CÁLCULO DE EXP

### Paso a paso:

1. **Usuario entra** → Lee cursos activos de Moodle
2. **Obtiene cursos de Supabase** → Todos los cursos del usuario (activos + inactivos)
3. **Identifica cursos nuevos** → Cursos que NO están en Supabase
4. **Identifica cursos con progreso** → Cursos existentes con progreso mayor
5. **Calcula EXP total** → Cursos nuevos + progreso adicional
6. **Suma al total** → `totalPoints = oldSupabasePoints + newPoints + progressPoints`

### Implementación:

```typescript
// 1. Obtener cursos activos de Moodle
const coursesData = moodleData.map(course => ({
  id: course.id,
  progress: course.progress || 0
}));

// 2. Obtener TODOS los cursos del usuario en Supabase
const allUserCourses = await fetch(
  `${SUPABASE_URL}/rest/v1/course_progress?user_id=eq.${userData.id}&select=*`
);
const existingCourses = await allUserCourses.json();

// 3. Filtrar cursos nuevos (no están en Supabase)
const newCourses = coursesData.filter(course => {
  return !existingCourses.find(ec => ec.moodle_course_id === course.id);
});

// 4. Filtrar cursos con progreso adicional (existen pero con más progreso)
const coursesWithProgress = coursesData.filter(course => {
  const existing = existingCourses.find(ec => ec.moodle_course_id === course.id);
  return existing && course.progress > existing.progress;
});

// 5. Calcular EXP de cursos nuevos
const newPoints = newCourses.reduce((sum, course) => {
  return sum + Math.floor(course.progress * 3);
}, 0);

// 6. Calcular EXP de progreso adicional
const progressPoints = coursesWithProgress.reduce((sum, course) => {
  const existing = existingCourses.find(ec => ec.moodle_course_id === course.id);
  const additionalProgress = course.progress - existing.progress;
  return sum + Math.floor(additionalProgress * 3);
}, 0);

// 7. Calcular total
const totalPoints = oldSupabasePoints + newPoints + progressPoints;
```

## 📊 EJEMPLOS DE FUNCIONAMIENTO

### Escenario 1: Usuario nuevo
- `oldSupabasePoints = 0`
- `newCourses = [{progress: 10}]` (curso nuevo 10%)
- `coursesWithProgress = []` (no hay cursos existentes)
- `totalPoints = 0 + 30 + 0 = 30` ✅

### Escenario 2: Usuario con curso desmatriculado
- `oldSupabasePoints = 100` (curso anterior completado)
- `newCourses = [{progress: 10}]` (curso nuevo 10%)
- `coursesWithProgress = []` (curso anterior no está en Moodle)
- `totalPoints = 100 + 30 + 0 = 130` ✅

### Escenario 3: Usuario completa curso existente
- `oldSupabasePoints = 100` (curso al 50%)
- `newCourses = []` (curso ya existe)
- `coursesWithProgress = [{progress: 100}]` (curso del 50% al 100%)
- `totalPoints = 100 + 0 + 150 = 250` ✅

### Escenario 4: Usuario sin cambios
- `oldSupabasePoints = 100`
- `newCourses = []` (no hay cursos nuevos)
- `coursesWithProgress = []` (no hay progreso adicional)
- `totalPoints = 100 + 0 + 0 = 100` ✅

## ✅ VENTAJAS DE ESTA LÓGICA

- ✅ **Solo suma progreso real nuevo**: No duplica puntos
- ✅ **Mantiene puntos acumulados**: Cursos desmatriculados conservan sus puntos
- ✅ **Suma progreso adicional**: Detecta avances en cursos existentes
- ✅ **Funciona con historial completo**: Mantiene todos los cursos del usuario
- ✅ **Respeto a los supuestos**: No permite reducción de progreso ni rematriculación

## 🗂️ CONFIGURACIÓN DE `is_active`

- **`is_active: true`** → Usuario matriculado en el curso
- **`is_active: false`** → Usuario desmatriculado del curso (pero mantiene historial)

## 🎮 FLUJO DE ANIMACIÓN

1. **Usuario entra** → Lee puntos de Supabase → Establece estado inicial de la barra
2. **Si hay cambios reales** → `hasRealChanges = true` → Animación
3. **Si no hay cambios** → `hasRealChanges = false` → Estado estático
4. **Animación**: Solo cuando hay cambios reales (barra avanza desde estado Supabase → estado Moodle)
5. **LEVEL UP**: Se dispara cuando la barra llega al 100%

## 📈 FÓRMULA DE CÁLCULO DE NIVEL

```typescript
const calculateLevel = (points: number): number => {
  return Math.floor(Math.sqrt(points / 100)) + 1;
};
```

- Nivel 1: 0-99 EXP
- Nivel 2: 100-399 EXP  
- Nivel 3: 400-899 EXP
- Nivel 4: 900-1599 EXP
- etc.
