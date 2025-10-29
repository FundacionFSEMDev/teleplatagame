# 🔐 Auditoría de Uso de Tokens Sensibles

**Fecha:** Enero 2025  
**Objetivo:** Identificar todas las operaciones que usan tokens sensibles para planificar migración a funciones serverless

---

## 📋 Tokens Sensibles Encontrados

### 1. **SUPABASE_SERVICE_KEY**
- **Ubicaciones:** 
  - `src/components/GamificationDashboard.tsx` (línea 46)
  - `src/components/Inventory.tsx` (línea 94)
  - `src/components/Badges.tsx` (línea 30)

- **Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg
```

### 2. **SUPABASE_URL**
- **Ubicaciones:**
  - `src/components/GamificationDashboard.tsx` (línea 45)
  - `src/components/Inventory.tsx` (línea 93)
  - `src/components/Badges.tsx` (línea 29)

- **URL:**
```
https://zwmmrhiqbdafkvbxzqig.supabase.co
```

### 3. **MOODLE_TOKEN**
- **Ubicación:**
  - `src/components/GamificationDashboard.tsx` (línea 44)

- **Token:**
```
81ca76859196a70d00b4683c7270e76c
```

### 4. **MOODLE_URL**
- **Ubicación:**
  - `src/components/GamificationDashboard.tsx` (línea 43)

- **URL:**
```
https://formacion.fundacionsanezequiel.org
```

---

## 🔍 Operaciones por Archivo

### **`GamificationDashboard.tsx`**

#### **LECTURAS (Podrían usar ANON_KEY con RLS):**
1. **Líneas 97-104:** Leer `users` (total_points, level)
   ```typescript
   GET /rest/v1/users?id=eq.${userData.id}&select=total_points,level
   ```

2. **Líneas 111-118:** Leer `course_progress` (todos los cursos del usuario)
   ```typescript
   GET /rest/v1/course_progress?user_id=eq.${userData.id}&select=*
   ```

3. **Líneas 305-312:** Leer `course_progress` (cursos activos)
   ```typescript
   GET /rest/v1/course_progress?user_id=eq.${userData.id}&is_active=eq.true
   ```

4. **Líneas 349-355:** Leer `badges` (todos los badges activos)
   ```typescript
   GET /rest/v1/badges?is_active=eq.true
   ```

5. **Líneas 358-366:** Leer `user_badges` (badges desbloqueados del usuario)
   ```typescript
   GET /rest/v1/user_badges?user_id=eq.${userData.id}&select=badge_id
   ```

6. **Líneas 467-474:** Leer `users` (total_points, level) - segunda vez
   ```typescript
   GET /rest/v1/users?id=eq.${userData.id}&select=total_points,level
   ```

7. **Líneas 707-725:** Leer `user_badges` y `badges` (para mostrar en UI)
   ```typescript
   GET /rest/v1/user_badges?user_id=eq.${userData.id}
   GET /rest/v1/badges?id=in.(${badgeIds})
   ```

8. **Línea 479-484:** Consultar Moodle API (cursos del usuario)
   ```typescript
   GET ${MOODLE_URL}/webservice/rest/server.php?wstoken=${MOODLE_TOKEN}&...
   ```

#### **ESCRITURAS (Necesitan SERVICE_KEY → Funciones serverless):**
1. **Líneas 159-174:** Crear `points_history`
   ```typescript
   POST /rest/v1/points_history
   Body: { user_id, points, reason, course_id, course_name }
   ```

2. **Líneas 193-205:** Actualizar `users` (total_points, level, last_sync_at)
   ```typescript
   PATCH /rest/v1/users?id=eq.${userData.id}
   Body: { total_points, level, last_sync_at }
   ```

3. **Líneas 221-228:** Leer `course_progress` (verificar si existe curso)
   ```typescript
   GET /rest/v1/course_progress?user_id=eq.${userData.id}&moodle_course_id=eq.${course.id}
   ```

4. **Líneas 243-258:** Actualizar `course_progress` (progreso de curso existente)
   ```typescript
   PATCH /rest/v1/course_progress?id=eq.${existing[0].id}
   Body: { progress, course_name, last_synced_at, is_active }
   ```

5. **Líneas 270-286:** Crear `course_progress` (nuevo curso)
   ```typescript
   POST /rest/v1/course_progress
   Body: { user_id, moodle_course_id, course_name, progress, last_synced_at, is_active }
   ```

6. **Líneas 325-338:** Actualizar `course_progress` (marcar cursos como inactivos)
   ```typescript
   PATCH /rest/v1/course_progress?id=eq.${course.id}
   Body: { is_active: false, last_synced_at }
   ```

7. **Líneas 416-428:** Crear `user_badges` (desbloquear badge)
   ```typescript
   POST /rest/v1/user_badges
   Body: { user_id, badge_id }
   ```

---

### **`Inventory.tsx`**

#### **LECTURAS (Podrían usar ANON_KEY con RLS):**
1. **Líneas 177-186:** Leer `user_items` con joins a `items`
   ```typescript
   GET /rest/v1/user_items?user_id=eq.${userData.id}&select=*,items(*)&order=equipped.desc
   ```

2. **Líneas 198-205:** Leer `user_stats`
   ```typescript
   GET /rest/v1/user_stats?user_id=eq.${userData.id}
   ```

#### **ESCRITURAS (Necesitan SERVICE_KEY → Funciones serverless):**
1. **Líneas 217-226:** Actualizar `user_items` (equipar/desequipar)
   ```typescript
   PATCH /rest/v1/user_items?id=eq.${itemId}
   Body: { equipped: true/false }
   ```

2. **Líneas 660-674:** Actualizar `user_items` (arrastrar y soltar - equipar)
   ```typescript
   PATCH /rest/v1/user_items?id=eq.${dragged.id}
   Body: { equipped: true/false }
   ```

---

### **`Badges.tsx`**

#### **LECTURAS (Podrían usar ANON_KEY con RLS):**
1. **Líneas 42-49:** Leer `badges` (todos los badges)
   ```typescript
   GET /rest/v1/badges?select=*&order=id.asc
   ```

2. **Líneas 54-61:** Leer `user_badges` (badges desbloqueados)
   ```typescript
   GET /rest/v1/user_badges?user_id=eq.${userData.id}&select=badge_id
   ```

---

## 📊 Resumen por Tipo de Operación

### **LECTURAS (27 operaciones)**
**Pueden migrar a ANON_KEY + RLS:**
- ✅ `users` → Solo lectura de `total_points` y `level` del usuario actual
- ✅ `course_progress` → Solo lectura de cursos del usuario actual
- ✅ `badges` → Lectura pública (cualquiera puede ver badges disponibles)
- ✅ `user_badges` → Solo lectura de badges del usuario actual
- ✅ `user_items` → Solo lectura de items del usuario actual
- ✅ `user_stats` → Solo lectura de stats del usuario actual
- ✅ Moodle API → Solo lectura de cursos del usuario

**Total: 14 lecturas a Supabase + 1 a Moodle**

### **ESCRITURAS (11 operaciones)**
**DEBEN migrar a FUNCIONES SERVERLESS:**
- 🔒 `points_history` → Crear registros de puntos ganados
- 🔒 `users` → Actualizar `total_points`, `level`, `last_sync_at`
- 🔒 `course_progress` → Crear/Actualizar progreso de cursos
- 🔒 `user_badges` → Crear badges desbloqueados
- 🔒 `user_items` → Actualizar estado `equipped` de items

---

## 🎯 Plan de Migración Propuesto

### **OPCIÓN A: Híbrida (Recomendada para rendimiento)**
**Lecturas → ANON_KEY + RLS | Escrituras → Funciones Serverless**

### **FASE 1: Migrar Lecturas a ANON_KEY + RLS**
**Objetivo:** Eliminar SERVICE_KEY de todas las operaciones de lectura

**Ventajas:**
- ✅ Más rápido: el frontend accede directamente a Supabase
- ✅ Menos carga en funciones serverless
- ✅ Menos costos (menos invocaciones de funciones)

**Cambios necesarios:**
1. Configurar Row Level Security (RLS) en Supabase para:
   - `users`: Solo lectura de tu propio usuario
   - `course_progress`: Solo lectura de tus propios cursos
   - `badges`: Lectura pública
   - `user_badges`: Solo lectura de tus propios badges
   - `user_items`: Solo lectura de tus propios items
   - `user_stats`: Solo lectura de tus propios stats

2. Cambiar en frontend:
   - Usar `ANON_KEY` en lugar de `SERVICE_KEY` para todas las lecturas
   - Las URLs de Supabase pueden seguir iguales

### **FASE 2: Migrar Escrituras a Funciones Serverless**
**Objetivo:** Eliminar SERVICE_KEY completamente del frontend

**Funciones serverless necesarias:**
1. **`syncUserProgress.ts`**
   - Crear/actualizar `course_progress`
   - Crear `points_history`
   - Actualizar `users` (total_points, level)

2. **`unlockBadge.ts`**
   - Crear `user_badges`

3. **`updateItemEquipped.ts`**
   - Actualizar `user_items.equipped`

4. **`getMoodleCourses.ts`** (opcional, puede seguir en frontend)
   - Consultar Moodle API (token también sensible)

---

### **OPCIÓN B: Todo en Serverless (Recomendada para máxima seguridad)**
**TODAS las operaciones → Funciones Serverless**

**Ventajas:**
- ✅ Máxima seguridad: ningún token en frontend
- ✅ Control total: validaciones en backend
- ✅ Más fácil de auditar: todo centralizado

**Desventajas:**
- ⚠️ Más lento: cada lectura pasa por función serverless
- ⚠️ Más costos: más invocaciones de funciones
- ⚠️ Más complejidad: más funciones que mantener

**Funciones serverless necesarias:**

#### **Lecturas:**
1. **`getUserData.ts`**
   - Leer `users` (total_points, level)

2. **`getUserCourses.ts`**
   - Leer `course_progress` del usuario

3. **`getUserBadges.ts`**
   - Leer `badges` y `user_badges`

4. **`getUserItems.ts`**
   - Leer `user_items` con joins a `items`

5. **`getUserStats.ts`**
   - Leer `user_stats`

6. **`getMoodleCourses.ts`**
   - Consultar Moodle API

#### **Escrituras:**
1. **`syncUserProgress.ts`**
   - Crear/actualizar `course_progress`
   - Crear `points_history`
   - Actualizar `users` (total_points, level)

2. **`unlockBadge.ts`**
   - Crear `user_badges`

3. **`updateItemEquipped.ts`**
   - Actualizar `user_items.equipped`

---

## ⚠️ Consideraciones

### **MOODLE_TOKEN**
- También está expuesto en el frontend
- Si queremos ocultarlo completamente, necesitamos función serverless para consultar Moodle
- Alternativa: Mantenerlo en frontend si Moodle tiene restricciones de dominio/CORS

### **SUPABASE_URL**
- No es sensible, puede quedarse en frontend
- Se puede usar `import.meta.env.VITE_SUPABASE_URL`

### **Variables de Entorno**
- `VITE_*` se incrustan en el bundle (visibles en frontend)
- Para ocultar completamente: usar funciones serverless
- Las funciones serverless acceden a `process.env.*` (no visibles en frontend)

---

## 📝 Checklist de Migración

- [ ] **FASE 1: Lecturas**
  - [ ] Configurar RLS en Supabase
  - [ ] Cambiar SERVICE_KEY → ANON_KEY en lecturas
  - [ ] Mover URLs a variables de entorno `VITE_*`
  - [ ] Probar que lecturas funcionan con ANON_KEY

- [ ] **FASE 2: Escrituras**
  - [ ] Crear función `syncUserProgress.ts`
  - [ ] Crear función `unlockBadge.ts`
  - [ ] Crear función `updateItemEquipped.ts`
  - [ ] (Opcional) Crear función `getMoodleCourses.ts`
  - [ ] Configurar variables de entorno en Netlify
  - [ ] Actualizar frontend para llamar a funciones serverless
  - [ ] Eliminar SERVICE_KEY del código frontend
  - [ ] Probar todas las escrituras

- [ ] **Limpieza Final**
  - [ ] Buscar y eliminar todas las referencias a SERVICE_KEY
  - [ ] Verificar que no quedan tokens hardcodeados
  - [ ] Actualizar documentación

---

**Total de operaciones identificadas: 38**
- **27 lecturas** → ANON_KEY + RLS
- **11 escrituras** → Funciones serverless

