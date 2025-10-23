-- ================================================
-- MIGRACIÓN: Funciones y Triggers
-- ================================================
-- Fecha: 2025-10-22
-- Descripción: Funciones auxiliares y triggers que
--              no se pudieron ejecutar en 002
-- ================================================

-- ============================================
-- FUNCIÓN: Actualizar timestamp automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Actualizar updated_at en users
-- ============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Calcular nivel basado en puntos
-- ============================================
CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
RETURNS INTEGER AS $function$
BEGIN
  RETURN FLOOR(SQRT(points / 100.0)) + 1;
END;
$function$ LANGUAGE plpgsql;

