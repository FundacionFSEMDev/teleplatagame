-- ================================================
-- MIGRACIÓN DE PRUEBA: Verificar conectividad
-- ================================================
-- Fecha: 2025-10-22
-- Descripción: Tabla simple para probar que las 
--              migraciones funcionan correctamente
-- ================================================

-- Crear una tabla de prueba simple
CREATE TABLE IF NOT EXISTS test_gamification (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar un registro de prueba
INSERT INTO test_gamification (message) 
VALUES ('¡Conexión exitosa! Sistema de gamificación listo para construir.');

-- Comentario en la tabla
COMMENT ON TABLE test_gamification IS 'Tabla de prueba para verificar conectividad. Se puede eliminar después.';

