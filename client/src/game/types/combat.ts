
export type DamageType = 'physical' | 'magical' | 'piercing' | 'slashing' | 'blunt' | 'fire' | 'ice' | 'poison';
export type CombatPhase = 'preparation' | 'active' | 'resolution' | 'ended';
export type CombatAction = 'attack' | 'defend' | 'skill' | 'item' | 'flee';

export interface DamageInfo {
  amount: number;
  type: DamageType;
  isCritical: boolean;
  source: string;
  target: string;
}

export interface CombatStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  evasion: number;
  criticalChance: number;
  criticalMultiplier: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  duration: number;
  maxDuration: number;
  stackable: boolean;
  currentStacks: number;
  maxStacks: number;
  effects: {
    healthRegen?: number;
    energyRegen?: number;
    attackModifier?: number;
    defenseModifier?: number;
    speedModifier?: number;
    damageOverTime?: number;
    damageType?: DamageType;
  };
  description: string;
}

export interface CombatParticipant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'enemy';
  stats: CombatStats;
  statusEffects: StatusEffect[];
  equipment?: {
    weapon?: string;
    armor?: string;
    accessories?: string[];
  };
  position: {
    x: number;
    y: number;
  };
  isAlive: boolean;
  isActive: boolean;
}

export interface CombatAction {
  id: string;
  type: CombatAction;
  participantId: string;
  targetId?: string;
  skillId?: string;
  itemId?: string;
  timestamp: number;
  result?: {
    success: boolean;
    damage?: DamageInfo[];
    statusEffects?: StatusEffect[];
    message: string;
  };
}

export interface CombatTurn {
  turnNumber: number;
  activeParticipantId: string;
  actions: CombatAction[];
  startTime: number;
  endTime?: number;
  timeLimit: number;
}

export interface CombatState {
  id: string;
  phase: CombatPhase;
  participants: CombatParticipant[];
  currentTurn: CombatTurn | null;
  turnOrder: string[];
  currentTurnIndex: number;
  totalTurns: number;
  startTime: number;
  endTime?: number;
  winner?: string;
  rewards?: {
    experience: number;
    gold: number;
    items: string[];
  };
  environment?: {
    terrain: string;
    weather: string;
    timeOfDay: 'day' | 'night';
    modifiers?: {
      visibility: number;
      movementPenalty: number;
      damageModifiers: Record<DamageType, number>;
    };
  };
}

export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  type: 'offensive' | 'defensive' | 'utility';
  energyCost: number;
  cooldown: number;
  range: number;
  targetType: 'self' | 'ally' | 'enemy' | 'area' | 'all';
  effects: {
    damage?: {
      min: number;
      max: number;
      type: DamageType;
    };
    healing?: number;
    statusEffects?: Omit<StatusEffect, 'id' | 'duration'>[];
    specialEffects?: {
      knockback?: number;
      stun?: number;
      disarm?: number;
    };
  };
  requirements?: {
    level?: number;
    weapon?: string[];
    stance?: string;
  };
  animation?: {
    duration: number;
    frames: string[];
  };
}

export interface CombatEvent {
  type: 'combat_start' | 'combat_end' | 'turn_start' | 'turn_end' | 'action_performed' | 'damage_dealt' | 'status_applied';
  timestamp: number;
  data: any;
  participants: string[];
}

// Utility types
export type CombatModifier = {
  type: 'attack' | 'defense' | 'speed' | 'accuracy' | 'damage';
  value: number;
  isPercentage: boolean;
  source: string;
};

export type CombatResult = {
  winner: 'player' | 'enemy' | 'draw';
  duration: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  actionsPerformed: number;
  experience: number;
  rewards: {
    gold: number;
    items: string[];
  };
};

// Legacy compatibility
export type { CombatState as Combat };
