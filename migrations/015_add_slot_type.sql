-- ================================================
-- MIGRACIÓN 015: Añadir campo slot_type a items
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Añade campo slot_type para identificar
--              en qué slot de equipo va cada item
-- ================================================

-- Añadir columna slot_type
ALTER TABLE items ADD COLUMN IF NOT EXISTS slot_type VARCHAR(20);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_items_slot_type ON items(slot_type);

-- Comentario
COMMENT ON COLUMN items.slot_type IS 'Tipo de slot donde se equipa: head, chest, gloves, pants, boots, weapon, ring';

-- Actualizar items existentes según su código
UPDATE items SET slot_type = 'head' WHERE code = 'STUDENT_HAT';
UPDATE items SET slot_type = 'chest' WHERE code = 'STUDENT_CHEST';
UPDATE items SET slot_type = 'gloves' WHERE code = 'STUDENT_GLOVES';
UPDATE items SET slot_type = 'pants' WHERE code = 'STUDENT_PANTS';
UPDATE items SET slot_type = 'boots' WHERE code = 'STUDENT_BOOTS';
UPDATE items SET slot_type = 'ring' WHERE code = 'STUDENT_RING';
UPDATE items SET slot_type = 'weapon' WHERE code = 'USED_BOOK';

-- Verificar que se actualizaron correctamente
DO $$
DECLARE
    items_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO items_count FROM items WHERE slot_type IS NOT NULL;
    
    IF items_count >= 7 THEN
        RAISE NOTICE '✅ Campo slot_type añadido y actualizado correctamente';
    ELSE
        RAISE WARNING '⚠️ Solo se actualizaron % items de 7', items_count;
    END IF;
END $$;

-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 015 completada: Campo slot_type añadido a items';
END $$;

