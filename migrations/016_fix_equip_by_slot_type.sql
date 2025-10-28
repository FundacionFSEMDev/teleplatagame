-- ================================================
-- MIGRACIÓN 016: Corregir limitación de equipamiento
-- ================================================
-- Fecha: 2025-01-28
-- Descripción: Ajusta el trigger para que los usuarios puedan equipar
--              múltiples items simultáneamente, siempre que sean de distinto slot_type
--              (head, chest, gloves, pants, boots, ring, weapon)
-- ================================================

-- Reemplazar función anterior que limitaba por tipo genérico
CREATE OR REPLACE FUNCTION ensure_one_equipped_per_slot()
RETURNS TRIGGER AS $$
DECLARE
  v_slot_type VARCHAR(20);
BEGIN
  -- Solo actuar cuando se equipa un item
  IF NEW.equipped = TRUE AND (OLD.equipped IS NULL OR OLD.equipped = FALSE) THEN
    -- Obtener el slot_type del item que se está equipando
    SELECT slot_type INTO v_slot_type FROM items WHERE id = NEW.item_id;
    
    -- Si hay slot_type, desequipar otros items del MISMO slot_type del usuario
    IF v_slot_type IS NOT NULL THEN
      UPDATE user_items 
      SET equipped = FALSE 
      WHERE user_id = NEW.user_id 
        AND id != NEW.id
        AND equipped = TRUE
        AND item_id IN (
          SELECT id FROM items WHERE slot_type = v_slot_type
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reemplazar el trigger antiguo
DROP TRIGGER IF EXISTS trigger_one_equipped_per_type ON user_items;
DROP TRIGGER IF EXISTS trigger_one_equipped_per_slot ON user_items;

CREATE TRIGGER trigger_one_equipped_per_slot
  BEFORE UPDATE ON user_items
  FOR EACH ROW
  EXECUTE FUNCTION ensure_one_equipped_per_slot();

COMMENT ON FUNCTION ensure_one_equipped_per_slot() IS 'Permite solo 1 item equipado por cada slot_type (head, chest, gloves, pants, boots, ring, weapon), permitiendo equipar múltiples slots a la vez';

-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 016 completada: Trigger de equipamiento corregido para permitir múltiples items (distintos slots) a la vez';
END $$;
