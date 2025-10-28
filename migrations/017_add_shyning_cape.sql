-- ================================================
-- MIGRACIÓN 017: Añadir item especial "Capa que brilla"
-- ================================================
-- Fecha: 2025-01-28
-- Descripción: Item personalizado para user_id 1
--              Slot_type: chest (pechera)
--              Stats: +999 a todo
-- ================================================

-- Insertar el item con todas las columnas correctas
INSERT INTO items (
  code, 
  name, 
  description, 
  icon_url, 
  type, 
  rarity, 
  attack, 
  defense, 
  hp, 
  speed, 
  wisdom, 
  crit_chance
) 
VALUES (
  'SHYNING_CAPE', 
  'Capa que brilla', 
  'Una capa muy brillante, que antaño perteneció a un valeroso enano de prominentes orejas. Cuenta la leyenda, que la mujer del enano se enteró de la cantidad de oro que invirtió en esta capa y la enterro en un lugar donde nadie pudiera encontrarla jamas.', 
  'shyning_cape.png',
  'armor',
  'legendary',
  999,
  999,
  999,
  999,
  999,
  999
) ON CONFLICT (code) DO NOTHING;

-- Añadir slot_type (la columna existe desde mig 015)
UPDATE items SET slot_type = 'chest' WHERE code = 'SHYNING_CAPE';

-- Asignar el item al user_id 1
INSERT INTO user_items (user_id, item_id, quantity)
SELECT 
  1 AS user_id,
  id AS item_id,
  1 AS quantity
FROM items
WHERE code = 'SHYNING_CAPE'
ON CONFLICT (user_id, item_id) DO NOTHING;

-- Verificar que se insertó correctamente
DO $$
DECLARE
    item_count INTEGER;
    user_item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO item_count FROM items WHERE code = 'SHYNING_CAPE';
    SELECT COUNT(*) INTO user_item_count FROM user_items WHERE user_id = 1 AND item_id = (SELECT id FROM items WHERE code = 'SHYNING_CAPE');
    
    IF item_count = 1 THEN
        RAISE NOTICE '✅ Item "Capa que brilla" insertado correctamente';
    ELSE
        RAISE WARNING '⚠️ Error al insertar item';
    END IF;
    
    IF user_item_count = 1 THEN
        RAISE NOTICE '✅ Item asignado correctamente al user_id 1';
    ELSE
        RAISE WARNING '⚠️ Error al asignar item al usuario';
    END IF;
END $$;

-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 017 completada: Item "Capa que brilla" añadido y asignado a user_id 1';
END $$;

