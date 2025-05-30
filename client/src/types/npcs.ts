
export interface NPCDefinition {
  id: string;
  name: string;
  type: NPCType;
  specialization?: NPCSpecialization;
  baseStats: NPCBaseStats;
  skills: Record<string, number>;
  preferences: NPCPreferences;
  equipment?: NPCEquipment;
  description: string;
  unlockRequirements?: UnlockRequirements;
  appearanceOptions: AppearanceOptions;
  voiceLines?: VoiceLines;
}

export interface NPCBaseStats {
  health: number;
  energy: number;
  satisfaction: number;
  speed: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  workEfficiency: number;
}

export interface NPCPreferences {
  workTypes: string[];
  restTime: number;
  socialNeed: number;
  preferredWeather: WeatherType[];
  favoriteActivities: string[];
  dislikedTasks: string[];
}

export interface NPCEquipment {
  weapon?: string;
  armor?: string;
  tools?: string[];
  accessories?: string[];
}

export interface UnlockRequirements {
  buildings?: string[];
  research?: string[];
  population?: number;
  resources?: Record<string, number>;
  achievements?: string[];
}

export interface AppearanceOptions {
  skinTones: string[];
  hairColors: string[];
  hairStyles: string[];
  eyeColors: string[];
  outfits: string[];
  accessories: string[];
}

export interface VoiceLines {
  greeting: string[];
  working: string[];
  idle: string[];
  happy: string[];
  sad: string[];
  tired: string[];
  task_complete: string[];
  task_failed: string[];
}

export interface NPCBehavior {
  personality: PersonalityTraits;
  socialBehavior: SocialBehavior;
  workBehavior: WorkBehavior;
  combatBehavior?: CombatBehavior;
}

export interface PersonalityTraits {
  extroversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}

export interface SocialBehavior {
  friendliness: number;
  chattiness: number;
  helpfulness: number;
  gossipTendency: number;
  leadershipAbility: number;
}

export interface WorkBehavior {
  workEthic: number;
  innovation: number;
  teamwork: number;
  independence: number;
  qualityFocus: number;
  speedFocus: number;
}

export interface CombatBehavior {
  aggression: number;
  defensive: number;
  tactical: number;
  reckless: number;
  protectiveness: number;
}

export interface NPCTask {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  assignedNpc?: string;
  target?: string | Position;
  parameters: Record<string, any>;
  progress: number;
  status: TaskStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  deadline?: number;
  dependencies: string[];
  rewards: TaskReward[];
}

export interface TaskReward {
  type: 'experience' | 'skill' | 'resource' | 'relationship';
  amount: number;
  target?: string;
}

export interface NPCRelationship {
  npcId: string;
  otherNpcId: string;
  type: RelationshipType;
  strength: number;
  history: RelationshipEvent[];
  lastInteraction: number;
}

export interface RelationshipEvent {
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  impact: number;
  timestamp: number;
}

export interface NPCGroup {
  id: string;
  name: string;
  type: GroupType;
  members: string[];
  leader?: string;
  purpose: string;
  formation: number;
  cohesion: number;
  activities: string[];
}

export type NPCType = 'villager' | 'worker' | 'guard' | 'merchant' | 'specialist' | 'leader' | 'child' | 'elder';
export type NPCSpecialization = 'farmer' | 'miner' | 'lumberjack' | 'builder' | 'crafter' | 'hunter' | 'researcher' | 'trader' | 'healer';
export type TaskType = 'gather' | 'build' | 'craft' | 'transport' | 'patrol' | 'research' | 'socialize' | 'rest' | 'maintain';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type RelationshipType = 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'enemy' | 'rival' | 'romantic' | 'family';
export type GroupType = 'work_crew' | 'family' | 'friends' | 'guild' | 'military_unit' | 'research_team';

// Import shared types
export type { Position } from './game';
export type { WeatherType } from './game';
export type { Task } from './entities';
