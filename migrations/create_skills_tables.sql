
-- Criar tabela de habilidades
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    max_level INTEGER NOT NULL DEFAULT 100,
    tier INTEGER NOT NULL DEFAULT 1,
    base_cost INTEGER NOT NULL DEFAULT 0,
    prerequisites TEXT DEFAULT '[]',
    unlocks TEXT DEFAULT '[]',
    position TEXT NOT NULL,
    connections TEXT DEFAULT '[]'
);

-- Criar tabela de habilidades do jogador
CREATE TABLE IF NOT EXISTS player_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    skill_id TEXT NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 0,
    current_experience INTEGER NOT NULL DEFAULT 0,
    is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(user_id, skill_id)
);

-- Criar tabela de recursos do jogador
CREATE TABLE IF NOT EXISTS player_resources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    fame_points INTEGER NOT NULL DEFAULT 0,
    silver INTEGER NOT NULL DEFAULT 0
);

-- Inserir habilidades iniciais
INSERT INTO skills (id, name, description, category, max_level, tier, base_cost, prerequisites, unlocks, position, connections) VALUES 
('novice_adventurer', 'Aventureiro Novato', 'Primeiro passo na jornada de aventura', 'adventurer', 100, 1, 0, '[]', '[]', '{"x":1250,"y":640}', '["journeyman_adventurer"]'),
('journeyman_adventurer', 'Aventureiro Oficial', 'Aventureiro com experiência básica', 'adventurer', 100, 1, 50, '["novice_adventurer"]', '[]', '{"x":1250,"y":770}', '["adept_adventurer"]'),
('adept_adventurer', 'Aventureiro Adepto', 'Aventureiro competente - Centro da árvore', 'adventurer', 100, 1, 100, '["journeyman_adventurer"]', '[]', '{"x":1250,"y":900}', '["expert_adventurer","crafting_branch","gathering_branch","farming_branch","combat_branch","refining_branch"]'),
('crafting_branch', 'Ramo da Criação', 'Desbloqueia as habilidades de criação', 'crafting', 100, 1, 100, '["adept_adventurer"]', '[]', '{"x":1137,"y":787}', '["trainee_craftsman"]'),
('gathering_branch', 'Ramo da Coleta', 'Desbloqueia habilidades de coleta', 'gathering', 100, 1, 100, '["adept_adventurer"]', '[]', '{"x":1363,"y":787}', '["lumberjack","miner"]'),
('lumberjack', 'Lenhador', 'Especialista em coleta de madeira', 'gathering', 100, 1, 150, '["gathering_branch"]', '["Coleta de Madeira T4-T8","Bonus: +25% Velocidade de Corte"]', '{"x":1448,"y":702}', '["adept_lumberjack"]'),
('miner', 'Minerador', 'Especialista em mineração', 'gathering', 100, 1, 150, '["gathering_branch"]', '["Mineração T4-T8","Bonus: +25% Velocidade de Mineração"]', '{"x":1413,"y":842}', '["adept_miner"]')
ON CONFLICT (id) DO NOTHING;
