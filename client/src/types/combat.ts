
export interface CombatStats {
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  evasion: number;
  criticalChance: number;
  criticalDamage: number;
  blockChance: number;
  resistance: Record<DamageType, number>;
}

export interface CombatAction {
  id: string;
  type: CombatActionType;
  name: string;
  description: string;
  damage?: DamageInfo;
  effects?: CombatEffect[];
  cooldown: number;
  energyCost: number;
  range: number;
  areaOfEffect?: AreaOfEffect;
  animation: string;
  soundEffect?: string;
}

export interface DamageInfo {
  base: number;
  scaling: Record<string, number>;
  type: DamageType;
  penetration: number;
  variance: number;
}

export interface CombatEffect {
  id: string;
  type: EffectType;
  duration: number;
  strength: number;
  stackable: boolean;
  maxStacks?: number;
  tickInterval?: number;
  icon?: string;
}

export interface AreaOfEffect {
  shape: 'circle' | 'cone' | 'line' | 'rectangle';
  size: number;
  angle?: number;
  offset?: Position;
}

export interface CombatInstance {
  id: string;
  participants: CombatParticipant[];
  currentTurn: number;
  turnOrder: string[];
  status: CombatStatus;
  environment: CombatEnvironment;
  startTime: number;
  duration: number;
  victor?: string;
  rewards: CombatReward[];
}

export interface CombatParticipant {
  id: string;
  entityId: string;
  entityType: 'npc' | 'player' | 'monster';
  team: number;
  position: Position;
  stats: CombatStats;
  currentHealth: number;
  maxHealth: number;
  currentEnergy: number;
  maxEnergy: number;
  activeEffects: ActiveEffect[];
  availableActions: string[];
  equipment: CombatEquipment;
  ai?: CombatAI;
}

export interface ActiveEffect {
  effectId: string;
  remainingDuration: number;
  currentStacks: number;
  source: string;
  lastTick: number;
}

export interface CombatEquipment {
  mainHand?: WeaponInfo;
  offHand?: WeaponInfo | ShieldInfo;
  armor: ArmorInfo[];
  accessories: AccessoryInfo[];
}

export interface WeaponInfo {
  id: string;
  name: string;
  type: WeaponType;
  damage: DamageInfo;
  speed: number;
  durability: number;
  maxDurability: number;
  enchantments: string[];
  specialAbilities: string[];
}

export interface ShieldInfo {
  id: string;
  name: string;
  blockChance: number;
  blockDamageReduction: number;
  durability: number;
  maxDurability: number;
  enchantments: string[];
}

export interface ArmorInfo {
  id: string;
  name: string;
  slot: ArmorSlot;
  defense: number;
  resistance: Record<DamageType, number>;
  durability: number;
  maxDurability: number;
  enchantments: string[];
}

export interface AccessoryInfo {
  id: string;
  name: string;
  type: AccessoryType;
  effects: Record<string, number>;
  durability?: number;
  maxDurability?: number;
}

export interface CombatEnvironment {
  terrain: TerrainType;
  weather: WeatherType;
  lighting: LightingLevel;
  hazards: EnvironmentalHazard[];
  visibility: number;
  temperature: number;
}

export interface EnvironmentalHazard {
  id: string;
  type: HazardType;
  position: Position;
  radius: number;
  damage: DamageInfo;
  effects: CombatEffect[];
  duration: number;
}

export interface CombatReward {
  type: 'experience' | 'skill' | 'item' | 'resource';
  amount: number;
  itemId?: string;
  skillType?: string;
}

export interface CombatAI {
  behavior: AIBehaviorType;
  aggressiveness: number;
  defensiveness: number;
  intelligence: number;
  preferredActions: string[];
  avoidedActions: string[];
  targetPriority: TargetPriority[];
}

export interface TargetPriority {
  condition: string;
  weight: number;
}

export interface TrainingDummy {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  damageDealt: number;
  hitsReceived: number;
  lastHit: number;
  trainingStats: TrainingStats;
  difficulty: DifficultyLevel;
}

export interface TrainingStats {
  totalDamage: number;
  highestDamage: number;
  averageDamage: number;
  accuracy: number;
  sessionsCompleted: number;
  timeSpent: number;
}

export type CombatActionType = 'attack' | 'defend' | 'special' | 'magic' | 'item' | 'move' | 'wait';
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'divine' | 'dark' | 'psychic';
export type EffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'stun' | 'slow' | 'blind' | 'poison' | 'regeneration';
export type CombatStatus = 'preparation' | 'active' | 'paused' | 'completed' | 'fled';
export type WeaponType = 'sword' | 'axe' | 'bow' | 'staff' | 'dagger' | 'hammer' | 'spear' | 'crossbow';
export type ArmorSlot = 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'cloak';
export type AccessoryType = 'ring' | 'necklace' | 'bracelet' | 'belt' | 'charm';
export type TerrainType = 'grass' | 'stone' | 'sand' | 'mud' | 'snow' | 'water' | 'lava';
export type LightingLevel = 'bright' | 'normal' | 'dim' | 'dark' | 'pitch_black';
export type HazardType = 'fire' | 'spike' | 'poison_gas' | 'ice' | 'electricity' | 'void';
export type AIBehaviorType = 'aggressive' | 'defensive' | 'balanced' | 'tactical' | 'berserker' | 'coward';

// Import shared types
export type { Position } from './game';
export type { WeatherType, DifficultyLevel } from './game';
