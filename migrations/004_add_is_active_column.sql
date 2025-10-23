-- ================================================
-- MIGRACIÓN: Agregar columna is_active
-- ================================================
-- Fecha: 2025-10-22
-- Descripción: Agregar columna para marcar usuarios
--              que ya no existen en Moodle
-- ================================================

-- Agregar columna is_active a users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Índice para búsquedas de usuarios activos
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Comentario
COMMENT ON COLUMN users.is_active IS 'FALSE si el usuario fue borrado de Moodle';

