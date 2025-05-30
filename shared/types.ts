
// Core Game Types
export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Resource Types
export interface Resource {
  id: string;
  name: string;
  type: string;
  amount: number;
  maxAmount?: number;
  position?: Position;
  tier?: number;
}

export interface ResourceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'basic' | 'refined' | 'special';
  tier: number;
}

// Building Types
export interface Building {
  id: string;
  type: string;
  position: [number, number];
  rotation: number;
  health: number;
  maxHealth: number;
  level: number;
  isActive: boolean;
  lastProduction?: number;
  plantedCrop?: string;
  plantTime?: number;
  growthTime?: number;
  seeds?: number;
}

export interface BuildingType {
  id: string;
  name: string;
  description: string;
  size: [number, number];
  cost: Record<string, number>;
  requirements?: string[];
  category: 'production' | 'storage' | 'military' | 'special';
  produces?: Record<string, number>;
  productionTime?: number;
  maxHealth: number;
}

// NPC Types
export interface NPC {
  id: string;
  name: string;
  type: string;
  position: Vector3;
  targetPosition?: Vector3;
  health: number;
  maxHealth: number;
  level: number;
  currentTask?: NPCTask;
  taskQueue: NPCTask[];
  speed: number;
  skills: Record<string, number>;
  equipment: NPCEquipment;
  state: 'idle' | 'moving' | 'working' | 'combat' | 'dead';
  lastUpdate: number;
}

export interface NPCTask {
  id: string;
  type: 'gather' | 'build' | 'move' | 'combat' | 'transport';
  target?: string | Position;
  resourceType?: string;
  amount?: number;
  priority: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: number;
}

export interface NPCEquipment {
  weapon?: string;
  armor?: string;
  tools?: string[];
}

// Combat Types
export interface CombatEntity {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  position: Vector3;
  equipment: NPCEquipment;
  spells: string[];
  effects: CombatEffect[];
}

export interface CombatEffect {
  id: string;
  type: string;
  duration: number;
  value: number;
  appliedAt: number;
}

export interface Combat {
  id: string;
  participants: string[];
  currentTurn: string;
  turnOrder: string[];
  round: number;
  status: 'active' | 'completed';
  startedAt: number;
}

// Skill Types
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  tier: number;
  maxLevel: number;
  cost: number;
  requirements: string[];
  connections: string[];
  position: Position;
  unlocks?: string[];
}

export interface PlayerSkill {
  skillId: string;
  level: number;
  experience: number;
  experienceToNext: number;
  unlockedAt?: number;
}

// Game State Types
export interface GameState {
  isPaused: boolean;
  gameSpeed: number;
  currentTime: number;
  dayNightCycle: {
    timeOfDay: number;
    dayLength: number;
  };
  weather: {
    type: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
    intensity: number;
  };
}

// UI Types
export interface PanelState {
  isOpen: boolean;
  position: Position;
  size?: { width: number; height: number };
  isDragging?: boolean;
}

export interface DragState {
  isDragging: boolean;
  offset: Position;
  startPosition: Position;
}

// Market system removed
