-- ================================================
-- MIGRACIÓN 007: Limpiar datos de badges
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Limpia todos los datos de badges y user_badges
--              para empezar con logros custom desde cero
-- ================================================

-- Limpiar todos los registros de user_badges
DELETE FROM user_badges WHERE id IS NOT NULL;

-- Limpiar todos los registros de badges
DELETE FROM badges WHERE id IS NOT NULL;

-- Resetear secuencia de badges (por si acaso)
ALTER SEQUENCE badges_id_seq RESTART WITH 1;

-- Resetear secuencia de user_badges (por si acaso)
ALTER SEQUENCE user_badges_id_seq RESTART WITH 1;

-- Verificar que las tablas están vacías
DO $$
DECLARE
    badges_count INTEGER;
    user_badges_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO badges_count FROM badges;
    SELECT COUNT(*) INTO user_badges_count FROM user_badges;
    
    RAISE NOTICE 'badges restantes: %', badges_count;
    RAISE NOTICE 'user_badges restantes: %', user_badges_count;
    
    IF badges_count = 0 AND user_badges_count = 0 THEN
        RAISE NOTICE 'Tablas limpiadas correctamente';
    ELSE
        RAISE WARNING 'Algo salió mal al limpiar las tablas';
    END IF;
END $$;

-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 007 completada: Datos de badges limpiados correctamente';
END $$;
