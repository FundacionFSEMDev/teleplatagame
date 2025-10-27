-- ================================================
-- MIGRACIÓN 008: Añadir badge "Que empiece la aventura"
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Añade el primer badge personalizado que se desbloquea
--              cuando el usuario tiene 1 o más cursos activos
-- ================================================

-- Insertar el nuevo badge
INSERT INTO badges (code, name, description, icon, points_required, category, rarity) 
VALUES 
  ('START_ADVENTURE', 'Que empiece la aventura', 'Has comenzado tu viaje de aprendizaje con al menos un curso activo', '🌟', 0, 'general', 'common')
ON CONFLICT (code) DO NOTHING;

-- Comentario del badge
COMMENT ON TABLE badges IS 'Catálogo de insignias/logros disponibles. Badge START_ADVENTURE se desbloquea al tener >= 1 curso activo y es permanente.';

-- Verificar que se insertó correctamente
DO $$
DECLARE
    badge_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO badge_count FROM badges WHERE code = 'START_ADVENTURE';
    
    IF badge_count = 1 THEN
        RAISE NOTICE 'Badge START_ADVENTURE insertado correctamente';
    ELSE
        RAISE WARNING 'Error al insertar badge START_ADVENTURE';
    END IF;
END $$;

-- ============================================
-- TRIGGER: Otorgar badge START_ADVENTURE
-- ============================================
-- Se ejecuta cuando se inserta/actualiza un curso activo en course_progress
-- Otorga el badge si el usuario tiene >= 1 curso activo

CREATE OR REPLACE FUNCTION check_and_grant_start_adventure()
RETURNS TRIGGER AS $$
DECLARE
    v_badge_id BIGINT;
    v_active_courses_count INTEGER;
BEGIN
    -- Obtener el ID del badge
    SELECT id INTO v_badge_id FROM badges WHERE code = 'START_ADVENTURE';
    
    -- Si el badge no existe, salir
    IF v_badge_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Contar cursos activos del usuario
    SELECT COUNT(*) INTO v_active_courses_count
    FROM course_progress
    WHERE user_id = NEW.user_id AND is_active = TRUE;
    
    -- Si tiene >= 1 curso activo y no tiene el badge, otorgarlo
    IF v_active_courses_count >= 1 THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (NEW.user_id, v_badge_id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_grant_start_adventure ON course_progress;
CREATE TRIGGER trigger_grant_start_adventure
    AFTER INSERT OR UPDATE ON course_progress
    FOR EACH ROW
    WHEN (NEW.is_active = TRUE)
    EXECUTE FUNCTION check_and_grant_start_adventure();

-- Comentario del trigger
COMMENT ON FUNCTION check_and_grant_start_adventure() IS 'Otorga el badge START_ADVENTURE cuando el usuario tiene >= 1 curso activo. Permanente una vez desbloqueado.';

-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 008 completada: Badge "Que empiece la aventura" añadido con trigger automático';
END $$;
