
// Game Configuration
export const GAME_CONFIG = {
  GRID_SIZE: 50,
  TILE_SIZE: 1,
  UPDATE_INTERVAL: 16, // ~60 FPS
  SAVE_INTERVAL: 30000, // 30 seconds
  
  // Time Settings
  DAY_LENGTH: 600000, // 10 minutes in milliseconds
  NIGHT_LENGTH: 300000, // 5 minutes in milliseconds
  
  // Camera Settings
  CAMERA_MOVE_SPEED: 10,
  CAMERA_ZOOM_SPEED: 2,
  CAMERA_MIN_DISTANCE: 5,
  CAMERA_MAX_DISTANCE: 50,
  
  // NPC Settings
  NPC_MOVE_SPEED: 2,
  NPC_VISION_RANGE: 5,
  NPC_WORK_RANGE: 2,
  
  // Building Settings
  MAX_BUILDINGS_PER_TYPE: 50,
  BUILDING_HEALTH_REGEN: 1,
  
  // Resource Settings
  RESOURCE_SPAWN_RATE: 0.1,
  MAX_RESOURCES_PER_TILE: 5,
  RESOURCE_RESPAWN_TIME: 120000, // 2 minutes
  
  // Combat Settings
  COMBAT_TURN_TIME: 30000, // 30 seconds per turn
  BASE_ATTACK_DAMAGE: 10,
  BASE_DEFENSE: 5,
  
  // UI Settings
  PANEL_ANIMATION_DURATION: 200,
  NOTIFICATION_DURATION: 3000,
  AUTO_SAVE_NOTIFICATION: true,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_RESOURCES: 'Recursos insuficientes',
  INVALID_POSITION: 'Posição inválida',
  BUILDING_BLOCKED: 'Posição bloqueada',
  NPC_NOT_FOUND: 'NPC não encontrado',
  SKILL_REQUIREMENTS_NOT_MET: 'Requisitos da habilidade não atendidos',
  COMBAT_NOT_ACTIVE: 'Combate não ativo',
  MARKET_ITEM_NOT_FOUND: 'Item do mercado não encontrado',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BUILDING_PLACED: 'Construção colocada com sucesso',
  RESOURCE_COLLECTED: 'Recurso coletado',
  SKILL_UNLOCKED: 'Habilidade desbloqueada',
  RESEARCH_COMPLETED: 'Pesquisa concluída',
  CROP_HARVESTED: 'Colheita realizada',
  MARKET_TRANSACTION: 'Transação realizada',
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#B8860B',
  SECONDARY: '#8B4513',
  ACCENT: '#FFD700',
  DARK: '#2F1B14',
  LIGHT: '#F5DEB3',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  BACKGROUND: 0,
  TERRAIN: 1,
  RESOURCES: 2,
  BUILDINGS: 3,
  NPCS: 4,
  EFFECTS: 5,
  UI_PANELS: 10,
  MODALS: 20,
  TOOLTIPS: 30,
  NOTIFICATIONS: 40,
} as const;
