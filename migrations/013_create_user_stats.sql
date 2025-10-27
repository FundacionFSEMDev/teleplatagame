-- ================================================
-- MIGRACIÓN 013: Sistema de Stats del Usuario
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Crea la tabla user_stats para gestionar los stats del usuario
--              y añade stats faltantes a la tabla items
-- ================================================

-- ============================================
-- PASO 1: Añadir stats faltantes a items
-- ============================================
-- Los items solo tenían attack, defense y hp_bonus
-- Añadimos speed, wisdom y crit_chance

-- Añadir columna speed
ALTER TABLE items ADD COLUMN IF NOT EXISTS speed INTEGER DEFAULT 0;
COMMENT ON COLUMN items.speed IS 'Bonus de velocidad del item';

-- Añadir columna wisdom
ALTER TABLE items ADD COLUMN IF NOT EXISTS wisdom INTEGER DEFAULT 0;
COMMENT ON COLUMN items.wisdom IS 'Bonus de sabiduría del item';

-- Añadir columna crit_chance
ALTER TABLE items ADD COLUMN IF NOT EXISTS crit_chance INTEGER DEFAULT 0;
COMMENT ON COLUMN items.crit_chance IS 'Bonus de probabilidad de crítico del item (%)';

-- ============================================
-- PASO 2: Renombrar hp_bonus a hp para consistencia
-- ============================================
ALTER TABLE items RENAME COLUMN hp_bonus TO hp;

-- Actualizar comentario
COMMENT ON COLUMN items.hp IS 'Bonus de HP del item';

-- ============================================
-- PASO 3: Crear tabla user_stats
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Stats asignados por el usuario
  attack INTEGER DEFAULT 0 NOT NULL,
  defense INTEGER DEFAULT 0 NOT NULL,
  hp INTEGER DEFAULT 0 NOT NULL,
  speed INTEGER DEFAULT 0 NOT NULL,
  wisdom INTEGER DEFAULT 0 NOT NULL,
  crit_chance INTEGER DEFAULT 0 NOT NULL,
  
  -- Sistema de puntos
  available_points INTEGER DEFAULT 0 NOT NULL,
  total_points_earned INTEGER DEFAULT 0 NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);

-- Comentarios
COMMENT ON TABLE user_stats IS 'Stats y puntos de asignación de cada usuario';
COMMENT ON COLUMN user_stats.attack IS 'Stats de ataque asignados por el usuario';
COMMENT ON COLUMN user_stats.defense IS 'Stats de defensa asignados por el usuario';
COMMENT ON COLUMN user_stats.hp IS 'Stats de HP asignados por el usuario';
COMMENT ON COLUMN user_stats.speed IS 'Stats de velocidad asignados por el usuario';
COMMENT ON COLUMN user_stats.wisdom IS 'Stats de sabiduría asignados por el usuario';
COMMENT ON COLUMN user_stats.crit_chance IS 'Stats de probabilidad de crítico asignados por el usuario (%)';
COMMENT ON COLUMN user_stats.available_points IS 'Puntos disponibles para asignar';
COMMENT ON COLUMN user_stats.total_points_earned IS 'Total de puntos ganados a lo largo del tiempo';

-- ============================================
-- PASO 4: Trigger para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_user_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_updated_at();

-- ============================================
-- PASO 5: Crear registro inicial para usuarios existentes
-- ============================================
INSERT INTO user_stats (user_id, available_points, total_points_earned)
SELECT id, 0, 0
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_stats WHERE user_stats.user_id = users.id
);

-- ============================================
-- PASO 6: Trigger para crear user_stats automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION create_user_stats_on_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, available_points, total_points_earned)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_stats
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats_on_user_creation();

-- Comentario final
DO $$
BEGIN
  RAISE NOTICE 'Migración 013 completada: Sistema de stats del usuario creado';
  RAISE NOTICE '  - Stats añadidos a items: speed, wisdom, crit_chance';
  RAISE NOTICE '  - hp_bonus renombrado a hp para consistencia';
  RAISE NOTICE '  - Tabla user_stats creada con 6 stats';
  RAISE NOTICE '  - Sistema de puntos implementado';
END $$;
