
export type ResourceType = 'wood' | 'stone' | 'iron' | 'food' | 'water' | 'seeds' | 'tools' | 'coal' | 'gold' | 'gems';

export interface ResourceDefinition {
  id: ResourceType;
  name: string;
  description: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  baseValue: number;
  stackSize: number;
  weight: number;
  category: 'raw' | 'processed' | 'consumable' | 'tool';
  harvestTime: number; // in milliseconds
  respawnTime: number; // in milliseconds
  gatheringSkill?: string;
  minSkillLevel?: number;
}

export const RESOURCE_DEFINITIONS: Record<ResourceType, ResourceDefinition> = {
  wood: {
    id: 'wood',
    name: 'Madeira',
    description: 'Material básico para construção',
    color: '#8B4513',
    rarity: 'common',
    baseValue: 1,
    stackSize: 100,
    weight: 1,
    category: 'raw',
    harvestTime: 2000,
    respawnTime: 30000,
    gatheringSkill: 'lumberjacking',
    minSkillLevel: 1,
  },

  stone: {
    id: 'stone',
    name: 'Pedra',
    description: 'Material resistente para construções',
    color: '#808080',
    rarity: 'common',
    baseValue: 2,
    stackSize: 100,
    weight: 2,
    category: 'raw',
    harvestTime: 3000,
    respawnTime: 45000,
    gatheringSkill: 'mining',
    minSkillLevel: 1,
  },

  iron: {
    id: 'iron',
    name: 'Ferro',
    description: 'Metal versátil para ferramentas e armas',
    color: '#C0C0C0',
    rarity: 'uncommon',
    baseValue: 5,
    stackSize: 50,
    weight: 3,
    category: 'raw',
    harvestTime: 5000,
    respawnTime: 120000,
    gatheringSkill: 'mining',
    minSkillLevel: 10,
  },

  coal: {
    id: 'coal',
    name: 'Carvão',
    description: 'Combustível para forjas e fornalhas',
    color: '#2F2F2F',
    rarity: 'uncommon',
    baseValue: 3,
    stackSize: 100,
    weight: 1,
    category: 'raw',
    harvestTime: 4000,
    respawnTime: 90000,
    gatheringSkill: 'mining',
    minSkillLevel: 5,
  },

  gold: {
    id: 'gold',
    name: 'Ouro',
    description: 'Metal precioso usado como moeda',
    color: '#FFD700',
    rarity: 'rare',
    baseValue: 20,
    stackSize: 25,
    weight: 4,
    category: 'raw',
    harvestTime: 8000,
    respawnTime: 300000,
    gatheringSkill: 'mining',
    minSkillLevel: 25,
  },

  gems: {
    id: 'gems',
    name: 'Gemas',
    description: 'Pedras preciosas raras',
    color: '#9932CC',
    rarity: 'epic',
    baseValue: 50,
    stackSize: 10,
    weight: 1,
    category: 'raw',
    harvestTime: 12000,
    respawnTime: 600000,
    gatheringSkill: 'mining',
    minSkillLevel: 40,
  },

  food: {
    id: 'food',
    name: 'Alimento',
    description: 'Nutre NPCs e mantém energia',
    color: '#228B22',
    rarity: 'common',
    baseValue: 2,
    stackSize: 50,
    weight: 1,
    category: 'consumable',
    harvestTime: 1500,
    respawnTime: 60000,
    gatheringSkill: 'farming',
    minSkillLevel: 1,
  },

  water: {
    id: 'water',
    name: 'Água',
    description: 'Essencial para sobrevivência',
    color: '#1E90FF',
    rarity: 'common',
    baseValue: 1,
    stackSize: 100,
    weight: 1,
    category: 'consumable',
    harvestTime: 1000,
    respawnTime: 15000,
    gatheringSkill: 'gathering',
    minSkillLevel: 1,
  },

  seeds: {
    id: 'seeds',
    name: 'Sementes',
    description: 'Necessárias para agricultura',
    color: '#8FBC8F',
    rarity: 'common',
    baseValue: 3,
    stackSize: 100,
    weight: 0.1,
    category: 'consumable',
    harvestTime: 2500,
    respawnTime: 90000,
    gatheringSkill: 'farming',
    minSkillLevel: 1,
  },

  tools: {
    id: 'tools',
    name: 'Ferramentas',
    description: 'Equipamentos para trabalho especializado',
    color: '#B8860B',
    rarity: 'uncommon',
    baseValue: 10,
    stackSize: 20,
    weight: 5,
    category: 'tool',
    harvestTime: 0,
    respawnTime: 0,
    gatheringSkill: 'crafting',
    minSkillLevel: 15,
  },
};

// Utility functions
export const getResourceDefinition = (resourceId: ResourceType): ResourceDefinition | undefined => {
  return RESOURCE_DEFINITIONS[resourceId];
};

export const getResourcesByCategory = (category: ResourceDefinition['category']): ResourceDefinition[] => {
  return Object.values(RESOURCE_DEFINITIONS).filter(resource => resource.category === category);
};

export const getResourcesByRarity = (rarity: ResourceDefinition['rarity']): ResourceDefinition[] => {
  return Object.values(RESOURCE_DEFINITIONS).filter(resource => resource.rarity === rarity);
};

// Resource spawn rates based on rarity
export const RESOURCE_SPAWN_RATES = {
  common: 0.4,
  uncommon: 0.25,
  rare: 0.15,
  epic: 0.08,
  legendary: 0.02,
} as const;

// Resource node configurations
export const RESOURCE_NODE_CONFIG = {
  maxResourcesPerNode: 5,
  minDistanceBetweenNodes: 3,
  maxNodesPerChunk: 8,
  respawnVariation: 0.2, // ±20% variation in respawn time
} as const;

// Resource gathering multipliers
export const GATHERING_MULTIPLIERS = {
  skill: {
    1: 1.0,
    10: 1.2,
    25: 1.5,
    50: 2.0,
    75: 2.5,
    100: 3.0,
  },
  tool: {
    none: 1.0,
    basic: 1.3,
    advanced: 1.6,
    master: 2.0,
  },
} as const;

// Legacy exports for compatibility
export const resourceTypes = RESOURCE_DEFINITIONS;
export type { ResourceDefinition as ResourceType };
