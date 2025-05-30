
export interface BuildingDefinition {
  id: string;
  name: string;
  type: BuildingType;
  cost: Record<string, number>;
  size: [number, number];
  health: number;
  description: string;
  requirements?: Record<string, number>;
  production?: Record<string, number>;
  storage?: Record<string, number>;
  workCapacity?: number;
  upgrades?: BuildingUpgrade[];
  category: BuildingCategory;
  tier: number;
  constructionTime: number;
  maintenanceCost?: Record<string, number>;
  specialFeatures?: string[];
}

export interface BuildingUpgrade {
  id: string;
  name: string;
  description: string;
  cost: Record<string, number>;
  requirements?: Record<string, number>;
  effects: UpgradeEffect[];
  tier: number;
}

export interface UpgradeEffect {
  type: 'production' | 'storage' | 'efficiency' | 'capacity' | 'unlock';
  target: string;
  value: number;
  operation: 'add' | 'multiply' | 'set';
}

export interface BuildingInstance {
  id: string;
  definitionId: string;
  position: Position;
  rotation: number;
  health: number;
  maxHealth: number;
  constructionProgress: number;
  isConstructed: boolean;
  workers: NPCAssignment[];
  production: ProductionState;
  storage: BuildingStorage;
  upgrades: string[];
  efficiency: number;
  lastUpdate: number;
  maintenance: MaintenanceState;
}

export interface NPCAssignment {
  npcId: string;
  role: WorkRole;
  efficiency: number;
  startTime: number;
  productivity: number;
}

export interface ProductionState {
  isActive: boolean;
  currentRecipe?: string;
  progress: number;
  outputQueue: ResourceYield[];
  inputBuffer: Record<string, number>;
  cyclesCompleted: number;
  lastCycle: number;
}

export interface BuildingStorage {
  capacity: Record<string, number>;
  stored: Record<string, number>;
  reserved: Record<string, number>;
  inputSlots: StorageSlot[];
  outputSlots: StorageSlot[];
}

export interface StorageSlot {
  id: string;
  resourceType?: ResourceType;
  amount: number;
  capacity: number;
  locked: boolean;
}

export interface MaintenanceState {
  condition: number;
  lastMaintenance: number;
  maintenanceNeeded: boolean;
  repairCost: Record<string, number>;
  degradationRate: number;
}

export interface BuildingBlueprint {
  id: string;
  name: string;
  description: string;
  buildings: BlueprintBuilding[];
  totalCost: Record<string, number>;
  size: [number, number];
  category: string;
}

export interface BlueprintBuilding {
  buildingId: string;
  position: Position;
  rotation: number;
}

export interface ConstructionSite {
  id: string;
  buildingId: string;
  position: Position;
  progress: number;
  workers: string[];
  materialsDelivered: Record<string, number>;
  materialsRequired: Record<string, number>;
  startTime: number;
  estimatedCompletion: number;
}

export type BuildingType = 'house' | 'farm' | 'mine' | 'lumbermill' | 'well' | 'silo' | 'warehouse' | 'workshop' | 'barracks' | 'training_ground';
export type BuildingCategory = 'residential' | 'production' | 'storage' | 'military' | 'utility' | 'special';
export type WorkRole = 'worker' | 'supervisor' | 'specialist' | 'guard' | 'researcher';

// Import shared types
export type { Position } from './game';
export type { ResourceType, ResourceYield } from './resources';
