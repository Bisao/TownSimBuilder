
export interface GameEvent {
  id: string;
  type: EventType;
  category: EventCategory;
  title: string;
  description: string;
  timestamp: number;
  duration?: number;
  priority: EventPriority;
  source: EventSource;
  targets: EventTarget[];
  data: Record<string, any>;
  conditions?: EventCondition[];
  consequences?: EventConsequence[];
  status: EventStatus;
}

export interface EventSource {
  type: 'system' | 'npc' | 'building' | 'player' | 'environment';
  id?: string;
  position?: Position;
}

export interface EventTarget {
  type: 'npc' | 'building' | 'resource' | 'area' | 'global';
  id?: string;
  position?: Position;
  radius?: number;
}

export interface EventCondition {
  type: ConditionType;
  parameter: string;
  operator: ComparisonOperator;
  value: any;
  met: boolean;
}

export interface EventConsequence {
  type: ConsequenceType;
  target: EventTarget;
  effect: any;
  delay?: number;
  duration?: number;
  probability?: number;
}

export interface EventChain {
  id: string;
  name: string;
  description: string;
  events: ChainEvent[];
  currentEventIndex: number;
  status: ChainStatus;
  startConditions: EventCondition[];
  failureConditions?: EventCondition[];
  rewards?: EventReward[];
}

export interface ChainEvent {
  eventId: string;
  delay?: number;
  conditions?: EventCondition[];
  branchConditions?: EventBranch[];
}

export interface EventBranch {
  condition: EventCondition;
  nextEventIndex: number;
  probability?: number;
}

export interface EventReward {
  type: 'resource' | 'experience' | 'skill' | 'item' | 'building' | 'npc' | 'research';
  amount?: number;
  itemId?: string;
  quality?: string;
  target?: string;
}

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  probability: number;
  conditions: EventCondition[];
  minCooldown: number;
  maxCooldown: number;
  lastTriggered?: number;
  outcomes: RandomOutcome[];
  category: EventCategory;
}

export interface RandomOutcome {
  id: string;
  description: string;
  probability: number;
  consequences: EventConsequence[];
  requirements?: EventCondition[];
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  season: SeasonType;
  startDay: number;
  duration: number;
  isActive: boolean;
  effects: SeasonalEffect[];
  specialEvents: string[];
}

export interface SeasonalEffect {
  type: 'weather' | 'production' | 'mood' | 'resource' | 'building';
  target?: string;
  modifier: number;
  operation: 'add' | 'multiply' | 'set';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  requirements: AchievementRequirement[];
  rewards: EventReward[];
  icon: string;
  rarity: AchievementRarity;
  isSecret: boolean;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: Record<string, number>;
}

export interface AchievementRequirement {
  type: RequirementType;
  target: string;
  amount: number;
  current: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  giver?: string;
  objectives: QuestObjective[];
  rewards: EventReward[];
  prerequisites?: string[];
  timeLimit?: number;
  status: QuestStatus;
  startedAt?: number;
  completedAt?: number;
  notes: string[];
}

export interface QuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target?: string;
  amount: number;
  current: number;
  completed: boolean;
  optional: boolean;
}

export interface EventListener {
  id: string;
  eventTypes: EventType[];
  callback: (event: GameEvent) => void;
  priority: number;
  once: boolean;
  conditions?: EventCondition[];
}

export type EventType = 
  | 'npc_created' | 'npc_died' | 'npc_level_up' | 'npc_task_completed' | 'npc_task_failed'
  | 'building_placed' | 'building_completed' | 'building_destroyed' | 'building_upgraded'
  | 'resource_gathered' | 'resource_depleted' | 'resource_discovered'
  | 'research_started' | 'research_completed' | 'technology_unlocked'
  | 'trade_completed' | 'market_fluctuation'
  | 'combat_started' | 'combat_ended' | 'enemy_defeated'
  | 'achievement_unlocked' | 'quest_started' | 'quest_completed'
  | 'weather_changed' | 'season_changed' | 'day_passed'
  | 'disaster' | 'discovery' | 'celebration'
  | 'player_action' | 'system_event';

export type EventCategory = 'economy' | 'social' | 'construction' | 'research' | 'combat' | 'environment' | 'story' | 'system';
export type EventPriority = 'low' | 'normal' | 'high' | 'critical';
export type EventStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';
export type ChainStatus = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
export type ConditionType = 'resource' | 'building' | 'npc' | 'research' | 'time' | 'weather' | 'season' | 'population' | 'custom';
export type ComparisonOperator = 'equals' | 'not_equals' | 'greater' | 'greater_equal' | 'less' | 'less_equal' | 'contains' | 'not_contains';
export type ConsequenceType = 'resource_change' | 'stat_change' | 'spawn_entity' | 'destroy_entity' | 'unlock_feature' | 'trigger_event' | 'custom';
export type AchievementCategory = 'building' | 'economy' | 'social' | 'combat' | 'exploration' | 'research' | 'special';
export type AchievementType = 'count' | 'threshold' | 'completion' | 'discovery' | 'time_based' | 'collection';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type RequirementType = 'build' | 'gather' | 'create' | 'defeat' | 'discover' | 'reach' | 'complete' | 'survive';
export type QuestCategory = 'main' | 'side' | 'daily' | 'weekly' | 'monthly' | 'special' | 'tutorial';
export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'legendary';
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed' | 'expired' | 'locked';
export type ObjectiveType = 'collect' | 'build' | 'craft' | 'kill' | 'reach' | 'talk' | 'discover' | 'survive' | 'escort';

// Import shared types
export type { Position } from './game';
export type { SeasonType } from './game';
