
export interface ResourceDefinition {
  id: ResourceType;
  name: string;
  description: string;
  color: string;
  rarity: ResourceRarity;
  baseValue: number;
  stackSize: number;
  weight: number;
  category: ResourceCategory;
  harvestTime: number;
  respawnTime: number;
  gatheringSkill?: string;
  minSkillLevel?: number;
  texture?: string;
  icon?: string;
}

export interface ResourceNode {
  id: string;
  resourceType: ResourceType;
  position: Position;
  amount: number;
  maxAmount: number;
  quality: ResourceQuality;
  harvestable: boolean;
  lastHarvested: number;
  respawnTimer: number;
  exhausted: boolean;
}

export interface ResourceStorage {
  capacity: Record<ResourceType, number>;
  stored: Record<ResourceType, number>;
  reservations: Record<ResourceType, number>;
}

export interface ResourceTransaction {
  id: string;
  type: 'gather' | 'consume' | 'trade' | 'craft';
  resourceType: ResourceType;
  amount: number;
  source?: string;
  destination?: string;
  timestamp: number;
  npcId?: string;
}

export interface HarvestingResult {
  success: boolean;
  resources: ResourceYield[];
  experience: number;
  skillGain: number;
  toolDamage?: number;
  byproducts?: ResourceYield[];
}

export interface ResourceYield {
  type: ResourceType;
  amount: number;
  quality: ResourceQuality;
  bonusAmount?: number;
}

export interface ResourceMarket {
  prices: Record<ResourceType, number>;
  supply: Record<ResourceType, number>;
  demand: Record<ResourceType, number>;
  trends: Record<ResourceType, PriceTrend>;
  history: PriceHistory[];
}

export interface PriceTrend {
  direction: 'up' | 'down' | 'stable';
  strength: number;
  duration: number;
}

export interface PriceHistory {
  timestamp: number;
  prices: Record<ResourceType, number>;
}

export type ResourceType = 'wood' | 'stone' | 'iron' | 'food' | 'water' | 'seeds' | 'tools' | 'coal' | 'gold' | 'gems';
export type ResourceRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ResourceCategory = 'raw' | 'processed' | 'consumable' | 'tool' | 'luxury';
export type ResourceQuality = 'poor' | 'normal' | 'good' | 'excellent' | 'perfect';

// Import shared types
export type { Position } from './game';
