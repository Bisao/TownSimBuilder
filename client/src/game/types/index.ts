
// Core game types
export * from './entities';
export * from './combat';
export * from './controls';
export * from './ui';
export * from './events';

// Re-export shared types for convenience
export type {
  Position,
  Vector3,
  Resource,
  ResourceType,
  Building,
  BuildingType,
} from '../../../shared/types';

// Re-export game constants
export {
  GAME_CONFIG,
  ERROR_MESSAGES,
} from '../../../shared/constants/game';

// Type utilities
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Generic game state type
export interface GameState {
  phase: 'login' | 'loading' | 'playing' | 'paused' | 'ended';
  currentTime: number;
  gameSpeed: number;
  isInitialized: boolean;
  
  // Game world state
  world: {
    seed: number;
    size: [number, number];
    terrain: string[][];
    weather: {
      type: string;
      intensity: number;
      duration: number;
    };
    dayNightCycle: {
      timeOfDay: number;
      dayLength: number;
      currentPhase: 'dawn' | 'day' | 'dusk' | 'night';
    };
  };
  
  // Player state
  player: {
    id: string;
    name: string;
    level: number;
    experience: number;
    position: [number, number, number];
    stats: Record<string, number>;
    skills: Record<string, number>;
    inventory: Record<string, number>;
    equipment: Record<string, string>;
  };
  
  // Game entities
  entities: {
    buildings: Record<string, any>;
    npcs: Record<string, any>;
    resources: Record<string, any>;
    items: Record<string, any>;
  };
  
  // Game systems
  systems: {
    combat: any;
    economy: any;
    crafting: any;
    research: any;
  };
  
  // UI state
  ui: {
    activePanel?: string;
    openPanels: string[];
    selectedEntity?: string;
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
  };
  
  // Game settings
  settings: {
    graphics: Record<string, any>;
    audio: Record<string, any>;
    controls: Record<string, any>;
    gameplay: Record<string, any>;
  };
}

// Game action types
export type GameAction = 
  | { type: 'INITIALIZE_GAME'; payload: Partial<GameState> }
  | { type: 'UPDATE_GAME_TIME'; payload: { currentTime: number; deltaTime: number } }
  | { type: 'SET_GAME_SPEED'; payload: { speed: number } }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'SAVE_GAME'; payload: { slot?: string } }
  | { type: 'LOAD_GAME'; payload: { slot: string } }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_PLAYER'; payload: Partial<GameState['player']> }
  | { type: 'ADD_ENTITY'; payload: { type: string; entity: any } }
  | { type: 'REMOVE_ENTITY'; payload: { type: string; id: string } }
  | { type: 'UPDATE_ENTITY'; payload: { type: string; id: string; updates: any } }
  | { type: 'SET_WEATHER'; payload: GameState['world']['weather'] }
  | { type: 'UPDATE_DAY_NIGHT_CYCLE'; payload: Partial<GameState['world']['dayNightCycle']> }
  | { type: 'OPEN_PANEL'; payload: { panel: string } }
  | { type: 'CLOSE_PANEL'; payload: { panel: string } }
  | { type: 'SELECT_ENTITY'; payload: { entityId: string } }
  | { type: 'UPDATE_CAMERA'; payload: { position?: [number, number, number]; target?: [number, number, number] } }
  | { type: 'UPDATE_SETTINGS'; payload: { category: string; settings: Record<string, any> } };

// Game store type
export interface GameStore extends GameState {
  // Actions
  dispatch: (action: GameAction) => void;
  
  // Getters
  getEntity: (type: string, id: string) => any;
  getEntitiesByType: (type: string) => any[];
  getSelectedEntity: () => any | undefined;
  
  // Utilities
  serialize: () => string;
  deserialize: (data: string) => void;
  reset: () => void;
}

// Validation types
export interface ValidationRule<T = any> {
  name: string;
  validator: (value: T) => boolean | string;
  message?: string;
}

export interface ValidationSchema<T = any> {
  [key: string]: ValidationRule<T>[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Error types
export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public category: 'system' | 'gameplay' | 'ui' | 'network' = 'system',
    public data?: any
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export interface ErrorInfo {
  error: Error;
  timestamp: number;
  category: string;
  context?: any;
  stack?: string;
}

// Configuration types
export interface GameConfig {
  // Game settings
  gameSettings: {
    autoSave: boolean;
    autoSaveInterval: number;
    maxSaveSlots: number;
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert';
    debugMode: boolean;
  };
  
  // Performance settings
  performance: {
    targetFPS: number;
    maxEntities: number;
    cullingDistance: number;
    lodLevels: number;
    useWorkers: boolean;
  };
  
  // Graphics settings
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    shadows: boolean;
    reflections: boolean;
    particles: boolean;
    postProcessing: boolean;
    antiAliasing: boolean;
  };
  
  // Audio settings
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
    ambientVolume: number;
    muted: boolean;
  };
  
  // Control settings
  controls: {
    mouseSensitivity: number;
    invertY: boolean;
    keyBindings: Record<string, string>;
    gamepadEnabled: boolean;
    touchControls: boolean;
  };
  
  // Network settings
  network: {
    serverUrl: string;
    timeout: number;
    retryAttempts: number;
    compression: boolean;
    encryption: boolean;
  };
}

// Default configurations
export const DEFAULT_GAME_CONFIG: GameConfig = {
  gameSettings: {
    autoSave: true,
    autoSaveInterval: 60000,
    maxSaveSlots: 10,
    difficultyLevel: 'normal',
    debugMode: false,
  },
  performance: {
    targetFPS: 60,
    maxEntities: 1000,
    cullingDistance: 100,
    lodLevels: 3,
    useWorkers: true,
  },
  graphics: {
    quality: 'medium',
    shadows: true,
    reflections: true,
    particles: true,
    postProcessing: true,
    antiAliasing: true,
  },
  audio: {
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    voiceVolume: 0.9,
    ambientVolume: 0.4,
    muted: false,
  },
  controls: {
    mouseSensitivity: 1.0,
    invertY: false,
    keyBindings: {},
    gamepadEnabled: true,
    touchControls: true,
  },
  network: {
    serverUrl: 'ws://localhost:3001',
    timeout: 10000,
    retryAttempts: 3,
    compression: true,
    encryption: false,
  },
};
