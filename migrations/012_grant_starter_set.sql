-- ================================================
-- MIGRACIÓN 012: Otorgar Set de Estudiante
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Otorga el set completo de Estudiante a:
--              1. Usuarios existentes (una sola vez)
--              2. Usuarios futuros (automático via trigger)
-- ================================================

-- ============================================
-- PASO 1: Otorgar set a usuarios existentes
-- ============================================
-- Solo a usuarios que NO tienen items todavía

INSERT INTO user_items (user_id, item_id, quantity)
SELECT 
  u.id AS user_id,
  i.id AS item_id,
  1 AS quantity
FROM users u
CROSS JOIN items i
WHERE i.code IN (
  'STUDENT_HAT', 
  'STUDENT_CHEST', 
  'STUDENT_GLOVES', 
  'STUDENT_PANTS', 
  'STUDENT_BOOTS', 
  'STUDENT_RING', 
  'USED_BOOK'
)
AND NOT EXISTS (
  -- No insertar si el usuario YA tiene ese item
  SELECT 1 FROM user_items 
  WHERE user_id = u.id AND item_id = i.id
)
ON CONFLICT DO NOTHING;

-- Verificar cuántos items se insertaron
DO $$
DECLARE
    items_inserted INTEGER;
    total_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO items_inserted FROM user_items;
    SELECT COUNT(*) INTO total_users FROM users;
    
    RAISE NOTICE '✅ Items otorgados: % (usuarios: %)', items_inserted, total_users;
END $$;

-- ============================================
-- PASO 2: Crear trigger para usuarios futuros
-- ============================================
-- Cuando se crea un nuevo usuario, automáticamente recibe el set

CREATE OR REPLACE FUNCTION grant_starter_set_on_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Otorgar el set completo al nuevo usuario
  INSERT INTO user_items (user_id, item_id, quantity)
  SELECT 
    NEW.id AS user_id,
    i.id AS item_id,
    1 AS quantity
  FROM items i
  WHERE i.code IN (
    'STUDENT_HAT', 
    'STUDENT_CHEST', 
    'STUDENT_GLOVES', 
    'STUDENT_PANTS', 
    'STUDENT_BOOTS', 
    'STUDENT_RING', 
    'USED_BOOK'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_grant_starter_set ON users;
CREATE TRIGGER trigger_grant_starter_set
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION grant_starter_set_on_new_user();

COMMENT ON FUNCTION grant_starter_set_on_new_user() IS 'Otorga automáticamente el set de Estudiante a nuevos usuarios';
COMMENT ON TRIGGER trigger_grant_starter_set ON users IS 'Se ejecuta cuando se crea un nuevo usuario y otorga el set completo';

-- ============================================
-- Verificación final
-- ============================================

DO $$
DECLARE
    total_items_in_game INTEGER;
    users_with_items INTEGER;
BEGIN
    -- Contar items totales en el juego
    SELECT COUNT(*) INTO total_items_in_game FROM items WHERE code LIKE 'STUDENT%' OR code = 'USED_BOOK';
    
    -- Contar usuarios que tienen al menos 1 item
    SELECT COUNT(DISTINCT user_id) INTO users_with_items FROM user_items;
    
    RAISE NOTICE '📊 Verificación:';
    RAISE NOTICE '   - Items del set disponibles: %', total_items_in_game;
    RAISE NOTICE '   - Usuarios con items: %', users_with_items;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Sistema configurado correctamente';
    RAISE NOTICE '   → Usuarios existentes: Ya tienen el set';
    RAISE NOTICE '   → Usuarios futuros: Lo recibirán automáticamente';
END $$;

-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 012 completada: Set de Estudiante otorgado a usuarios y trigger automático creado';
END $$;
