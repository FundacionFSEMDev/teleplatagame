-- ================================================
-- MIGRACIÓN 011: Sistema de Items e Inventario
-- ================================================
-- Fecha: 2025-01-XX
-- Descripción: Sistema completo de items, inventario y equipamiento
--              Set inicial: Equipamiento de Estudiante (Beginner)
-- ================================================

-- ============================================
-- TABLA: items
-- ============================================
-- Catálogo de items disponibles
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  
  -- Tipo y rareza
  type VARCHAR(20) NOT NULL CHECK (type IN ('weapon', 'armor', 'consumable', 'material', 'jewelry')),
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Stats del item
  attack INTEGER DEFAULT 0,
  defense INTEGER DEFAULT 0,
  hp_bonus INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);

-- Comentarios
COMMENT ON TABLE items IS 'Catálogo de items disponibles en el juego';
COMMENT ON COLUMN items.code IS 'Código único del item (ej: STUDENT_HAT)';
COMMENT ON COLUMN items.type IS 'Tipo: weapon, armor, consumable, material, jewelry';
COMMENT ON COLUMN items.rarity IS 'Rareza: common, rare, epic, legendary';
COMMENT ON COLUMN items.attack IS 'Bonus de ataque del item';
COMMENT ON COLUMN items.defense IS 'Bonus de defensa del item';
COMMENT ON COLUMN items.hp_bonus IS 'Bonus de HP del item';

-- ============================================
-- TABLA: user_items
-- ============================================
-- Inventario del usuario (items en posesión)
CREATE TABLE IF NOT EXISTS user_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  equipped BOOLEAN DEFAULT FALSE,
  
  UNIQUE(user_id, item_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_items_user ON user_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_items_item ON user_items(item_id);
CREATE INDEX IF NOT EXISTS idx_user_items_equipped ON user_items(user_id, equipped) WHERE equipped = TRUE;

-- Comentarios
COMMENT ON TABLE user_items IS 'Inventario de items de cada usuario';
COMMENT ON COLUMN user_items.quantity IS 'Cantidad del item que posee el usuario';
COMMENT ON COLUMN user_items.equipped IS 'Si el item está equipado actualmente';

-- ============================================
-- TRIGGER: Solo 1 item equipado por tipo
-- ============================================
-- Asegura que el usuario solo tenga 1 item equipado de cada tipo

CREATE OR REPLACE FUNCTION ensure_one_equipped_per_type()
RETURNS TRIGGER AS $$
DECLARE
  item_type VARCHAR;
BEGIN
  -- Si se está equipando un item
  IF NEW.equipped = TRUE AND (OLD.equipped IS NULL OR OLD.equipped = FALSE) THEN
    -- Obtener el tipo del item que se está equipando
    SELECT type INTO item_type FROM items WHERE id = NEW.item_id;
    
    -- Si es weapon o armor (solo permitir 1 de cada tipo)
    IF item_type IN ('weapon', 'armor', 'jewelry') THEN
      -- Desequipar otros items del mismo tipo del usuario
      UPDATE user_items 
      SET equipped = FALSE 
      WHERE user_id = NEW.user_id 
        AND id != NEW.id
        AND equipped = TRUE
        AND item_id IN (
          SELECT id FROM items WHERE type = item_type
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_one_equipped_per_type ON user_items;
CREATE TRIGGER trigger_one_equipped_per_type
  BEFORE UPDATE ON user_items
  FOR EACH ROW
  EXECUTE FUNCTION ensure_one_equipped_per_type();

COMMENT ON FUNCTION ensure_one_equipped_per_type() IS 'Asegura que el usuario solo tenga 1 item equipado de cada tipo (weapon, armor, jewelry)';

-- ============================================
-- INSERTAR ITEMS DEL SET DE ESTUDIANTE
-- ============================================

-- 1. Gorro de Estudiante (Armor - Common)
INSERT INTO items (code, name, description, icon_url, type, rarity, attack, defense, hp_bonus) 
VALUES (
  'STUDENT_HAT', 
  'Gorro de Estudiante', 
  'Un gorro cómodo que te mantiene concentrado en tus estudios.',
  'hat.png',
  'armor',
  'common',
  0,
  5,
  10
) ON CONFLICT (code) DO NOTHING;

-- 2. Pechera de Estudiante (Armor - Common)
INSERT INTO items (code, name, description, icon_url, type, rarity, attack, defense, hp_bonus) 
VALUES (
  'STUDENT_CHEST', 
  'Pechera de Estudiante', 
  'Una pechera resistente que te protege en tus aventuras académicas.',
  'chest.png',
  'armor',
  'common',
  0,
  10,
  15
) ON CONFLICT (code) DO NOTHING;

-- 3. Guantes de Estudiante (Armor - Common)
INSERT INTO items (code, name, description, icon_url, type, rarity, attack, defense, hp_bonus) 
VALUES (
  'STUDENT_GLOVES', 
  'Guantes de Estudiante', 
  'Guantes que mejoran tu precisión al escribir y tomar notas.',
  'gloves.png',
  'armor',
  'common',
  3,
  5,
  5
) ON CONFLICT (code) DO NOTHING;

-- 4. Pantalones de Estudiante (Armor - Common)
INSERT INTO items (code, name, description, icon_url, type, rarity, attack, defense, hp_bonus) 
VALUES (
  'STUDENT_PANTS', 
  'Pantalones de Estudiante', 
  'Pantalones cómodos perfectos para largas sesiones de estudio.',
  'pants.png',
  'armor',
  'common',
  0,
  8,
  10
) ON CONFLICT (code) DO NOTHING;

-- 5. Botas de Estudiante (Armor - Common)
INSERT INTO items (code, name, description, icon_url, type, rarity, attack, defense, hp_bonus) 
VALUES (
  'STUDENT_BOOTS', 
  'Botas de Estudiante', 
  'Botas resistentes que te permiten llegar a tiempo a todas tus clases.',
  'boots.png',
  'armor',
  'common',
  0,
  5,
  5
) ON CONFLICT (code) DO NOTHING;

-- 6. Anillo de Estudiante (Jewelry - Common)
INSERT INTO items (code, name, description, icon_url, type, rarity, attack, defense, hp_bonus) 
VALUES (
  'STUDENT_RING', 
  'Anillo de Estudiante', 
  'Un anillo que aumenta tu capacidad de retención de conocimientos.',
  'ring.png',
  'jewelry',
  'common',
  5,
  5,
  15
) ON CONFLICT (code) DO NOTHING;

-- 7. Libro Usado (Weapon - Common)
INSERT INTO items (code, name, description, icon_url, type, rarity, attack, defense, hp_bonus) 
VALUES (
  'USED_BOOK', 
  'Libro Usado', 
  'Un libro viejo pero efectivo. El conocimiento es tu mejor arma.',
  'book.png',
  'weapon',
  'common',
  15,
  2,
  5
) ON CONFLICT (code) DO NOTHING;

-- Verificar que se insertaron correctamente
DO $$
DECLARE
    items_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO items_count FROM items;
    
    IF items_count >= 7 THEN
        RAISE NOTICE '✅ Items del set de Estudiante insertados correctamente';
    ELSE
        RAISE WARNING '⚠️ Solo se insertaron % items de 7', items_count;
    END IF;
END $$;

-- Comentario de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Migración 011 completada: Sistema de items creado con 7 items del set de Estudiante (Beginner)';
END $$;
