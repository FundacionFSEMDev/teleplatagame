-- ================================================
-- MIGRACIÓN 009: Añadir badge "Cazabacterias"
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Añade el badge "Cazabacterias" que se desbloquea
--              cuando el curso específico de manipulador de alimentos
--              está al 100% de completado
-- Tiempo: Permanente
-- ================================================

-- Insertar el nuevo badge
INSERT INTO badges (code, name, description, icon, points_required, category, rarity) 
VALUES 
  ('BACTERIA_HUNTER', 'Cazabacterias', 'Has completado al 100% el curso de manipulador de alimentos', '🍽️', 0, 'achievement', 'rare')
ON CONFLICT (code) DO NOTHING;

-- Actualizar la rareza a 'rare' si el badge ya existe
UPDATE badges SET rarity = 'rare' WHERE code = 'BACTERIA_HUNTER';

-- Comentario del badge
COMMENT ON TABLE badges IS 'Catálogo de insignias/logros disponibles. Badge BACTERIA_HUNTER se desbloquea al completar al 100% el curso de manipulador de alimentos y es permanente.';

-- Verificar que se insertó correctamente
DO $$
DECLARE
    badge_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO badge_count FROM badges WHERE code = 'BACTERIA_HUNTER';
    
    IF badge_count = 1 THEN
        RAISE NOTICE 'Badge BACTERIA_HUNTER insertado correctamente';
    ELSE
        RAISE WARNING 'Error al insertar badge BACTERIA_HUNTER';
    END IF;
END $$;

-- ============================================
-- TRIGGER: Otorgar badge BACTERIA_HUNTER
-- ============================================
-- Se ejecuta cuando se actualiza el progreso de un curso
-- Otorga el badge si el curso de manipulador de alimentos está al 100%

CREATE OR REPLACE FUNCTION check_and_grant_bacteria_hunter()
RETURNS TRIGGER AS $$
DECLARE
    v_badge_id BIGINT;
BEGIN
    -- Obtener el ID del badge
    SELECT id INTO v_badge_id FROM badges WHERE code = 'BACTERIA_HUNTER';
    
    -- Si el badge no existe, salir
    IF v_badge_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Verificar si el curso es de manipulador de alimentos y está al 100%
    -- Solo se otorga si:
    -- 1. El progress >= 100 Y
    -- 2. (El course_name contiene "manipulador" Y "alimentos") O
    --    (El moodle_course_id = 3, que debe ser el ID específico del curso de manipulador)
    IF (NEW.progress >= 100 AND (
        (LOWER(COALESCE(NEW.course_name, '')) LIKE '%manipulador%' 
         AND LOWER(COALESCE(NEW.course_name, '')) LIKE '%alimento%')
        OR NEW.moodle_course_id = 3
    )) THEN
        -- Otorgar el badge
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (NEW.user_id, v_badge_id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_grant_bacteria_hunter ON course_progress;
CREATE TRIGGER trigger_grant_bacteria_hunter
    AFTER INSERT OR UPDATE ON course_progress
    FOR EACH ROW
    WHEN (NEW.progress >= 100)
    EXECUTE FUNCTION check_and_grant_bacteria_hunter();

-- Comentario del trigger
COMMENT ON FUNCTION check_and_grant_bacteria_hunter() IS 'Otorga el badge BACTERIA_HUNTER cuando el curso de manipulador de alimentos está al 100% completado. Permanente una vez desbloqueado.';

-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 009 completada: Badge "Cazabacterias" añadido con trigger automático';
END $$;
