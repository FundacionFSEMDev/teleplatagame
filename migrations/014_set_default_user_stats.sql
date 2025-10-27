-- ================================================
-- MIGRACIÓN 014: Establecer Stats Base a 1
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Establece el valor base de todas las stats de usuarios a 1
--              y actualiza usuarios existentes
-- ================================================

-- ============================================
-- PASO 1: Actualizar usuarios existentes
-- ============================================
-- Todos los usuarios existentes deben tener stats base de 1

UPDATE user_stats 
SET 
  attack = 1,
  defense = 1,
  hp = 1,
  speed = 1,
  wisdom = 1,
  crit_chance = 1
WHERE attack = 0 OR defense = 0 OR hp = 0 OR speed = 0 OR wisdom = 0 OR crit_chance = 0;

-- Verificar cuántos usuarios se actualizaron
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count 
  FROM user_stats 
  WHERE attack = 1 AND defense = 1 AND hp = 1 AND speed = 1 AND wisdom = 1 AND crit_chance = 1;
  
  RAISE NOTICE 'Usuarios con stats base de 1: %', updated_count;
END $$;

-- ============================================
-- PASO 2: Cambiar valores por defecto de las columnas
-- ============================================
-- Cambiar el valor por defecto de INTEGER DEFAULT 0 a INTEGER DEFAULT 1

ALTER TABLE user_stats ALTER COLUMN attack SET DEFAULT 1;
ALTER TABLE user_stats ALTER COLUMN defense SET DEFAULT 1;
ALTER TABLE user_stats ALTER COLUMN hp SET DEFAULT 1;
ALTER TABLE user_stats ALTER COLUMN speed SET DEFAULT 1;
ALTER TABLE user_stats ALTER COLUMN wisdom SET DEFAULT 1;
ALTER TABLE user_stats ALTER COLUMN crit_chance SET DEFAULT 1;

-- ============================================
-- PASO 3: Actualizar trigger para nuevos usuarios
-- ============================================
-- Actualizar el trigger que crea user_stats para nuevos usuarios

CREATE OR REPLACE FUNCTION create_user_stats_on_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, attack, defense, hp, speed, wisdom, crit_chance, available_points, total_points_earned)
  VALUES (NEW.id, 1, 1, 1, 1, 1, 1, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentario final
DO $$
BEGIN
  RAISE NOTICE 'Migración 014 completada: Stats base establecidos a 1';
  RAISE NOTICE '  - Valores por defecto cambiados de 0 a 1';
  RAISE NOTICE '  - Usuarios existentes actualizados';
END $$;
