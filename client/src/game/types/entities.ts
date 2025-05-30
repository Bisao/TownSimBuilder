
import { Position, Vector3 } from '../../../shared/types';

export type EntityType = 'building' | 'npc' | 'resource' | 'player' | 'item' | 'projectile' | 'effect';
export type EntityState = 'idle' | 'active' | 'working' | 'moving' | 'dead' | 'destroyed' | 'hidden';

export interface BaseEntity {
  id: string;
  type: EntityType;
  name: string;
  state: EntityState;
  position: Position;
  rotation: number;
  scale: Vector3;
  health: number;
  maxHealth: number;
  isVisible: boolean;
  isSelectable: boolean;
  isInteractable: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface MovableEntity extends BaseEntity {
  velocity: Vector3;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  friction: number;
  path: Position[];
  targetPosition?: Position;
  isMoving: boolean;
  lastMovement: number;
}

export interface LivingEntity extends MovableEntity {
  level: number;
  experience: number;
  energy: number;
  maxEnergy: number;
  satisfaction: number;
  maxSatisfaction: number;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    constitution: number;
    wisdom: number;
    charisma: number;
  };
  skills: Record<string, number>;
  statusEffects: {
    id: string;
    duration: number;
    intensity: number;
  }[];
  needs: {
    hunger: number;
    thirst: number;
    rest: number;
    social: number;
  };
}

export interface WorkerEntity extends LivingEntity {
  job: string | null;
  workEfficiency: number;
  assignedBuilding?: string;
  workProgress: number;
  lastWorkTime: number;
  inventory: {
    items: Record<string, number>;
    capacity: number;
    weight: number;
    maxWeight: number;
  };
  equipment: {
    weapon?: string;
    armor?: string;
    tools: string[];
    accessories: string[];
  };
}

export interface BuildingEntity extends BaseEntity {
  buildingType: string;
  size: [number, number];
  cost: Record<string, number>;
  level: number;
  maxLevel: number;
  upgradeProgress: number;
  isActive: boolean;
  workers: string[];
  maxWorkers: number;
  production: {
    produces: Record<string, number>;
    consumes: Record<string, number>;
    rate: number;
    lastProduction: number;
    progress: number;
  };
  storage: {
    items: Record<string, number>;
    capacity: Record<string, number>;
    maxCapacity: Record<string, number>;
  };
  requirements: Record<string, number>;
  effects: {
    radius: number;
    type: string;
    modifiers: Record<string, number>;
  }[];
}

export interface ResourceEntity extends BaseEntity {
  resourceType: string;
  amount: number;
  maxAmount: number;
  quality: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  harvestTime: number;
  respawnTime: number;
  lastHarvested: number;
  isHarvestable: boolean;
  requiredTool?: string;
  requiredSkillLevel?: number;
  gatheringSkill?: string;
}

export interface ItemEntity extends BaseEntity {
  itemType: string;
  quantity: number;
  quality: number;
  durability: number;
  maxDurability: number;
  value: number;
  weight: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stackable: boolean;
  maxStack: number;
  enchantments: {
    id: string;
    level: number;
    effects: Record<string, number>;
  }[];
  requirements: {
    level?: number;
    stats?: Record<string, number>;
    skills?: Record<string, number>;
  };
  effects: {
    onUse?: Record<string, any>;
    onEquip?: Record<string, any>;
    passive?: Record<string, any>;
  };
}

export interface ProjectileEntity extends MovableEntity {
  damage: number;
  damageType: string;
  range: number;
  distanceTraveled: number;
  source: string;
  target?: string;
  onHit: {
    damage: number;
    effects: string[];
    areaOfEffect?: number;
  };
  trail: {
    enabled: boolean;
    length: number;
    color: string;
  };
}

export interface EffectEntity extends BaseEntity {
  effectType: string;
  duration: number;
  intensity: number;
  target?: string;
  source?: string;
  area?: {
    shape: 'circle' | 'square' | 'line';
    size: number;
    center: Position;
  };
  visual: {
    animation: string;
    color: string;
    scale: number;
    opacity: number;
  };
  sound?: {
    id: string;
    volume: number;
    loop: boolean;
  };
}

// Entity collections
export interface EntityManager {
  entities: Map<string, BaseEntity>;
  entitiesByType: Map<EntityType, Set<string>>;
  spatialIndex: Map<string, Set<string>>; // Grid-based spatial indexing
  
  // Core operations
  addEntity(entity: BaseEntity): void;
  removeEntity(id: string): void;
  getEntity(id: string): BaseEntity | undefined;
  getEntitiesByType(type: EntityType): BaseEntity[];
  getEntitiesInRange(position: Position, range: number): BaseEntity[];
  
  // Queries
  findNearestEntity(position: Position, type?: EntityType): BaseEntity | undefined;
  findEntitiesWithTag(tag: string): BaseEntity[];
  findEntitiesInArea(bounds: { min: Position; max: Position }): BaseEntity[];
  
  // Updates
  updateEntity(id: string, updates: Partial<BaseEntity>): void;
  updateSpatialIndex(entity: BaseEntity): void;
}

// Entity factory
export interface EntityFactory {
  createBuilding(type: string, position: Position): BuildingEntity;
  createNPC(type: string, position: Position): WorkerEntity;
  createResource(type: string, position: Position): ResourceEntity;
  createItem(type: string, quantity: number): ItemEntity;
  createProjectile(source: string, target: Position, damage: number): ProjectileEntity;
  createEffect(type: string, position: Position, duration: number): EffectEntity;
}

// Entity events
export type EntityEvent = {
  type: 'entity_created' | 'entity_destroyed' | 'entity_moved' | 'entity_damaged' | 'entity_healed' | 'entity_state_changed';
  entityId: string;
  timestamp: number;
  data: any;
};

// Utility types
export type EntityQuery = {
  type?: EntityType[];
  state?: EntityState[];
  tags?: string[];
  position?: {
    center: Position;
    radius: number;
  };
  area?: {
    min: Position;
    max: Position;
  };
  filter?: (entity: BaseEntity) => boolean;
};

export type EntityUpdate = {
  id: string;
  changes: Partial<BaseEntity>;
  timestamp: number;
};

// Legacy exports for compatibility
export type { BaseEntity as Entity };
export type { WorkerEntity as NPC };
export type { BuildingEntity as Building };
export type { ResourceEntity as Resource };
export type { ItemEntity as Item };
