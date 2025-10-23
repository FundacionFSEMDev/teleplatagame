-- Migración 005: Agregar columna is_active a course_progress
-- Para marcar cursos como activos/inactivos sin perder el historial

-- Agregar columna is_active a course_progress
ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Crear índice para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_course_progress_active ON course_progress(is_active);

-- Comentario para la columna
COMMENT ON COLUMN course_progress.is_active IS 'TRUE si el curso está activo en Moodle, FALSE si fue desmatriculado pero se mantiene el historial';

-- Actualizar todos los registros existentes como activos
UPDATE course_progress 
SET is_active = TRUE 
WHERE is_active IS NULL;
