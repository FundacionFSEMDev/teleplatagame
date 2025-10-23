-- Migración 006: Actualizar lógica de cálculo de EXP
-- Fecha: 2024-12-19
-- Descripción: Implementar nueva lógica de cálculo de EXP basada en cursos nuevos y progreso adicional

-- Comentarios en la tabla course_progress para documentar la nueva lógica
COMMENT ON TABLE course_progress IS 'Registra el progreso de cada curso del usuario. is_active=true si está matriculado, is_active=false si fue desmatriculado (mantiene historial).';

COMMENT ON COLUMN course_progress.progress IS 'Progreso del curso (0-100). Solo puede aumentar, nunca disminuir.';

COMMENT ON COLUMN course_progress.is_active IS 'TRUE si el usuario está matriculado en el curso, FALSE si fue desmatriculado (mantiene historial).';

-- Comentarios en la tabla points_history para documentar la nueva lógica
COMMENT ON TABLE points_history IS 'Registra solo puntos POSITIVOS ganados. Nunca se registran puntos negativos para mantener permanencia infinita.';

COMMENT ON COLUMN points_history.points IS 'Puntos ganados (SIEMPRE POSITIVOS). Se calculan como: cursos nuevos + progreso adicional en cursos existentes.';

-- Función para calcular EXP basado en nueva lógica
CREATE OR REPLACE FUNCTION calculate_user_exp(
    user_id_param INTEGER,
    moodle_courses JSONB
) RETURNS INTEGER AS $$
DECLARE
    existing_courses RECORD;
    course_data JSONB;
    new_points INTEGER := 0;
    progress_points INTEGER := 0;
    total_points INTEGER;
BEGIN
    -- Obtener puntos actuales del usuario
    SELECT total_points INTO total_points FROM users WHERE id = user_id_param;
    
    -- Procesar cada curso de Moodle
    FOR course_data IN SELECT * FROM jsonb_array_elements(moodle_courses)
    LOOP
        -- Buscar si el curso ya existe en course_progress
        SELECT * INTO existing_courses 
        FROM course_progress 
        WHERE user_id = user_id_param 
        AND moodle_course_id = (course_data->>'id')::INTEGER;
        
        IF existing_courses IS NULL THEN
            -- Curso nuevo: sumar todos sus puntos
            new_points := new_points + ((course_data->>'progress')::INTEGER * 3);
        ELSIF (course_data->>'progress')::INTEGER > existing_courses.progress THEN
            -- Curso existente con más progreso: sumar solo la diferencia
            progress_points := progress_points + (((course_data->>'progress')::INTEGER - existing_courses.progress) * 3);
        END IF;
    END LOOP;
    
    -- Retornar puntos totales (actuales + nuevos + progreso adicional)
    RETURN total_points + new_points + progress_points;
END;
$$ LANGUAGE plpgsql;

-- Comentario en la función
COMMENT ON FUNCTION calculate_user_exp(INTEGER, JSONB) IS 'Calcula EXP del usuario basado en cursos nuevos y progreso adicional. Mantiene permanencia infinita de puntos.';

-- Log de migración
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES ('006_update_exp_calculation_logic', NOW(), 'Actualizada lógica de cálculo de EXP para cursos nuevos y progreso adicional');
