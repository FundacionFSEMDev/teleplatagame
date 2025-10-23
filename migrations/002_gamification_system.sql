-- ================================================
-- MIGRACIÓN: Sistema de Gamificación
-- ================================================
-- Fecha: 2025-10-22
-- Descripción: Estructura completa para el sistema
--              de gamificación conectado a Moodle
-- ================================================

-- ============================================
-- TABLA: users
-- ============================================
-- Usuarios sincronizados desde Moodle
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  moodle_id INTEGER UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  firstname TEXT,
  lastname TEXT,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_moodle_id ON users(moodle_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(total_points DESC);

-- Comentarios
COMMENT ON TABLE users IS 'Usuarios sincronizados desde Moodle para gamificación';
COMMENT ON COLUMN users.moodle_id IS 'ID del usuario en Moodle';
COMMENT ON COLUMN users.total_points IS 'Puntos totales acumulados';
COMMENT ON COLUMN users.level IS 'Nivel actual del usuario';

-- ============================================
-- TABLA: badges
-- ============================================
-- Catálogo de insignias/logros disponibles
CREATE TABLE IF NOT EXISTS badges (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points_required INTEGER DEFAULT 0,
  category TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);

-- Comentarios
COMMENT ON TABLE badges IS 'Catálogo de insignias/logros disponibles';
COMMENT ON COLUMN badges.code IS 'Código único del badge (ej: FIRST_COURSE)';
COMMENT ON COLUMN badges.rarity IS 'Rareza: common, rare, epic, legendary';

-- ============================================
-- TABLA: user_badges
-- ============================================
-- Insignias ganadas por cada usuario
CREATE TABLE IF NOT EXISTS user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at DESC);

-- Comentarios
COMMENT ON TABLE user_badges IS 'Insignias ganadas por cada usuario';

-- ============================================
-- TABLA: points_history
-- ============================================
-- Historial de puntos ganados/perdidos
CREATE TABLE IF NOT EXISTS points_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT,
  course_id INTEGER,
  course_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_points_history_user ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created ON points_history(created_at DESC);

-- Comentarios
COMMENT ON TABLE points_history IS 'Historial de puntos ganados o perdidos';
COMMENT ON COLUMN points_history.course_id IS 'ID del curso en Moodle (si aplica)';

-- ============================================
-- TABLA: course_progress
-- ============================================
-- Progreso de usuarios en cursos de Moodle
CREATE TABLE IF NOT EXISTS course_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moodle_course_id INTEGER NOT NULL,
  course_name TEXT,
  progress NUMERIC(5,2) DEFAULT 0.00,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, moodle_course_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_moodle_course ON course_progress(moodle_course_id);

-- Comentarios
COMMENT ON TABLE course_progress IS 'Progreso de usuarios en cursos (sincronizado desde Moodle)';
COMMENT ON COLUMN course_progress.progress IS 'Porcentaje de completitud (0.00 - 100.00)';

-- ============================================
-- FUNCIÓN: Actualizar timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Calcular nivel basado en puntos
-- ============================================
CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Nivel = raíz cuadrada de (puntos / 100) + 1
  -- Ej: 0-99pts = nivel 1, 100-399pts = nivel 2, 400-899pts = nivel 3, etc.
  RETURN FLOOR(SQRT(points / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INSERTAR BADGES INICIALES
-- ============================================
INSERT INTO badges (code, name, description, icon, points_required, category, rarity) VALUES
  ('FIRST_LOGIN', 'Bienvenido', 'Accediste por primera vez al Centro de Logros', '🎉', 0, 'general', 'common'),
  ('FIRST_COURSE', 'Primer Paso', 'Completaste tu primer curso', '🎓', 100, 'courses', 'common'),
  ('PROGRESS_25', 'En Marcha', 'Alcanzaste 25% en un curso', '🚀', 25, 'progress', 'common'),
  ('PROGRESS_50', 'A Mitad de Camino', 'Alcanzaste 50% en un curso', '⚡', 50, 'progress', 'rare'),
  ('PROGRESS_75', 'Casi Allí', 'Alcanzaste 75% en un curso', '🔥', 75, 'progress', 'rare'),
  ('PROGRESS_100', 'Completado', 'Completaste un curso al 100%', '🏆', 100, 'progress', 'epic'),
  ('THREE_COURSES', 'Estudiante Dedicado', 'Completaste 3 cursos', '📚', 300, 'courses', 'rare'),
  ('FIVE_COURSES', 'Maestro del Aprendizaje', 'Completaste 5 cursos', '🎖️', 500, 'courses', 'epic'),
  ('TOP_10', 'Top 10', 'Entraste al top 10 del ranking', '🥇', 0, 'ranking', 'epic'),
  ('TOP_3', 'Élite', 'Entraste al top 3 del ranking', '👑', 0, 'ranking', 'legendary'),
  ('LEVEL_5', 'Nivel 5 Alcanzado', 'Llegaste al nivel 5', '⭐', 0, 'level', 'rare'),
  ('LEVEL_10', 'Nivel 10 Alcanzado', 'Llegaste al nivel 10', '🌟', 0, 'level', 'epic')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (true);  -- Por ahora permitimos lectura a todos (ajustaremos con auth)

CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (true);

-- Políticas para badges
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (true);

-- Políticas para user_badges
CREATE POLICY "Users can view all badges earned"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage user badges"
  ON user_badges FOR ALL
  USING (true);

-- Políticas para points_history
CREATE POLICY "Users can view all points history"
  ON points_history FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage points"
  ON points_history FOR ALL
  USING (true);

-- Políticas para course_progress
CREATE POLICY "Users can view all progress"
  ON course_progress FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage progress"
  ON course_progress FOR ALL
  USING (true);

