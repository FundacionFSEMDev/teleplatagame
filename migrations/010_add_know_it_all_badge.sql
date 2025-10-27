-- ================================================
-- MIGRACIÓN 010: Añadir badge "Sabelotodo"
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Añade el badge "Sabelotodo" que se desbloquea
--              cuando el usuario tiene 15 o más cursos activos
-- Tiempo: Permanente
-- Rareza: Legendary
-- ================================================

-- Insertar el nuevo badge
INSERT INTO badges (code, name, description, icon, points_required, category, rarity) 
VALUES 
  ('KNOW_IT_ALL', 'Sabelotodo', 'Tienes 15 o más cursos activos, eres un verdadero sabelotodo', '👁️', 0, 'achievement', 'legendary')
ON CONFLICT (code) DO NOTHING;

-- Comentario del badge
COMMENT ON TABLE badges IS 'Catálogo de insignias/logros disponibles. Badge KNOW_IT_ALL se desbloquea al tener >= 15 cursos activos y es permanente.';

-- Verificar que se insertó correctamente
DO $$
DECLARE
    badge_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO badge_count FROM badges WHERE code = 'KNOW_IT_ALL';
    
    IF badge_count = 1 THEN
        RAISE NOTICE 'Badge KNOW_IT_ALL insertado correctamente';
    ELSE
        RAISE WARNING 'Error al insertar badge KNOW_IT_ALL';
    END IF;
END $$;

-- ============================================
-- TRIGGER: Otorgar badge KNOW_IT_ALL
-- ============================================
-- Se ejecuta cuando se inserta/actualiza un curso activo en course_progress
-- Otorga el badge si el usuario tiene >= 15 cursos activos

CREATE OR REPLACE FUNCTION check_and_grant_know_it_all()
RETURNS TRIGGER AS $$
DECLARE
    v_badge_id BIGINT;
    v_active_courses_count INTEGER;
BEGIN
    -- Obtener el ID del badge
    SELECT id INTO v_badge_id FROM badges WHERE code = 'KNOW_IT_ALL';
    
    -- Si el badge no existe, salir
    IF v_badge_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Contar cursos activos del usuario
    SELECT COUNT(*) INTO v_active_courses_count
    FROM course_progress
    WHERE user_id = NEW.user_id AND is_active = TRUE;
    
    -- Si tiene >= 15 cursos activos y no tiene el badge, otorgarlo
    IF v_active_courses_count >= 15 THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (NEW.user_id, v_badge_id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_grant_know_it_all ON course_progress;
CREATE TRIGGER trigger_grant_know_it_all
    AFTER INSERT OR UPDATE ON course_progress
    FOR EACH ROW
    WHEN (NEW.is_active = TRUE)
    EXECUTE FUNCTION check_and_grant_know_it_all();

-- Comentario del trigger
COMMENT ON FUNCTION check_and_grant_know_it_all() IS 'Otorga el badge KNOW_IT_ALL cuando el usuario tiene >= 15 cursos activos. Permanente una vez desbloqueado.';
        
-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 010 completada: Badge "Sabelotodo" añadido con trigger automático';
END $$;
