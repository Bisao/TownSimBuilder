
// Base entity interface
export interface BaseEntity {
  id: string;
  type: string;
  position: Position;
  rotation: number;
  health: number;
  maxHealth: number;
  isActive: boolean;
  createdAt: number;
  lastUpdate: number;
}

// Building entity
export interface BuildingEntity extends BaseEntity {
  type: 'building';
  buildingType: BuildingType;
  size: [number, number];
  cost: Record<string, number>;
  constructionProgress: number;
  isConstructed: boolean;
  workers: string[];
  production?: Record<string, number>;
  storage?: Record<string, number>;
  workCapacity: number;
  efficiency: number;
  upgrades: string[];
  maintenanceCost: Record<string, number>;
}

// NPC entity
export interface NPCEntity extends BaseEntity {
  type: 'npc';
  npcType: NPCType;
  name: string;
  stats: NPCStats;
  skills: Record<string, number>;
  specialization?: NPCSpecialization;
  currentTask?: Task;
  taskQueue: Task[];
  inventory: InventoryItem[];
  equipment: Equipment;
  relationships: Record<string, number>;
  mood: MoodState;
  needs: NPCNeeds;
  pathfinding: PathfindingState;
}

// Resource entity
export interface ResourceEntity extends BaseEntity {
  type: 'resource';
  resourceType: ResourceType;
  amount: number;
  maxAmount: number;
  respawnTime: number;
  lastHarvested: number;
  gatheringDifficulty: number;
  requiredTool?: string;
  requiredSkillLevel: number;
}

export interface NPCStats {
  health: number;
  energy: number;
  satisfaction: number;
  speed: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  workEfficiency: number;
  experience: number;
  level: number;
}

export interface NPCNeeds {
  hunger: number;
  thirst: number;
  rest: number;
  social: number;
  entertainment: number;
}

export interface MoodState {
  happiness: number;
  stress: number;
  motivation: number;
  factors: MoodFactor[];
}

export interface MoodFactor {
  source: string;
  impact: number;
  duration: number;
  timestamp: number;
}

export interface PathfindingState {
  target?: Position;
  path: Position[];
  currentIndex: number;
  isMoving: boolean;
  stuck: boolean;
  stuckTimer: number;
  recalculateTimer: number;
}

export interface Equipment {
  weapon?: InventoryItem;
  armor?: InventoryItem;
  tools: InventoryItem[];
  accessories: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  type: string;
  name: string;
  quantity: number;
  quality: ItemQuality;
  durability: number;
  maxDurability: number;
  attributes: Record<string, number>;
  enchantments: string[];
}

export type ItemQuality = 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Import types from shared
export type { Position } from './game';
export type { BuildingType, NPCType, NPCSpecialization, ResourceType } from '../../shared/types';
