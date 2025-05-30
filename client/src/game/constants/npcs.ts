
export type NPCType = 'villager' | 'worker' | 'guard' | 'merchant' | 'specialist';
export type NPCSpecialization = 'farmer' | 'miner' | 'lumberjack' | 'builder' | 'crafter' | 'hunter' | 'researcher';

export interface NPCDefinition {
  id: string;
  name: string;
  type: NPCType;
  specialization?: NPCSpecialization;
  baseStats: {
    health: number;
    energy: number;
    satisfaction: number;
    speed: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    workEfficiency: number;
  };
  skills: Record<string, number>;
  preferences: {
    workTypes: string[];
    restTime: number;
    socialNeed: number;
  };
  equipment?: {
    weapon?: string;
    armor?: string;
    tools?: string[];
  };
  description: string;
  unlockRequirements?: {
    buildings?: string[];
    research?: string[];
    population?: number;
  };
}

export const NPC_DEFINITIONS: Record<string, NPCDefinition> = {
  basic_villager: {
    id: 'basic_villager',
    name: 'Aldeão',
    type: 'villager',
    baseStats: {
      health: 100,
      energy: 100,
      satisfaction: 100,
      speed: 1.0,
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      workEfficiency: 1.0,
    },
    skills: {
      gathering: 5,
      farming: 3,
      building: 2,
    },
    preferences: {
      workTypes: ['gathering', 'farming', 'building'],
      restTime: 8,
      socialNeed: 50,
    },
    description: 'Trabalhador básico capaz de realizar tarefas simples',
  },

  farmer: {
    id: 'farmer',
    name: 'Fazendeiro',
    type: 'worker',
    specialization: 'farmer',
    baseStats: {
      health: 110,
      energy: 120,
      satisfaction: 100,
      speed: 0.9,
      strength: 12,
      dexterity: 8,
      intelligence: 12,
      workEfficiency: 1.3,
    },
    skills: {
      farming: 15,
      gathering: 10,
      animal_care: 8,
    },
    preferences: {
      workTypes: ['farming', 'gathering'],
      restTime: 6,
      socialNeed: 40,
    },
    equipment: {
      tools: ['hoe', 'watering_can'],
    },
    description: 'Especialista em agricultura e cultivo de alimentos',
    unlockRequirements: {
      buildings: ['farm'],
      population: 3,
    },
  },

  miner: {
    id: 'miner',
    name: 'Minerador',
    type: 'worker',
    specialization: 'miner',
    baseStats: {
      health: 130,
      energy: 110,
      satisfaction: 100,
      speed: 0.8,
      strength: 16,
      dexterity: 6,
      intelligence: 8,
      workEfficiency: 1.4,
    },
    skills: {
      mining: 18,
      geology: 10,
      strength: 12,
    },
    preferences: {
      workTypes: ['mining'],
      restTime: 8,
      socialNeed: 30,
    },
    equipment: {
      tools: ['pickaxe', 'mining_helmet'],
    },
    description: 'Especialista em extração de minérios e pedras',
    unlockRequirements: {
      buildings: ['mine'],
      population: 5,
    },
  },

  lumberjack: {
    id: 'lumberjack',
    name: 'Lenhador',
    type: 'worker',
    specialization: 'lumberjack',
    baseStats: {
      health: 120,
      energy: 115,
      satisfaction: 100,
      speed: 1.0,
      strength: 14,
      dexterity: 10,
      intelligence: 8,
      workEfficiency: 1.3,
    },
    skills: {
      lumberjacking: 16,
      forestry: 8,
      strength: 10,
    },
    preferences: {
      workTypes: ['lumberjacking'],
      restTime: 7,
      socialNeed: 35,
    },
    equipment: {
      tools: ['axe', 'saw'],
    },
    description: 'Especialista em corte e processamento de madeira',
    unlockRequirements: {
      buildings: ['lumbermill'],
      population: 4,
    },
  },

  builder: {
    id: 'builder',
    name: 'Construtor',
    type: 'worker',
    specialization: 'builder',
    baseStats: {
      health: 115,
      energy: 110,
      satisfaction: 100,
      speed: 0.9,
      strength: 13,
      dexterity: 12,
      intelligence: 11,
      workEfficiency: 1.5,
    },
    skills: {
      building: 20,
      engineering: 12,
      planning: 8,
    },
    preferences: {
      workTypes: ['building', 'repair'],
      restTime: 6,
      socialNeed: 45,
    },
    equipment: {
      tools: ['hammer', 'measuring_tape', 'level'],
    },
    description: 'Especialista em construção e reparos',
    unlockRequirements: {
      buildings: ['workshop'],
      population: 6,
    },
  },

  crafter: {
    id: 'crafter',
    name: 'Artesão',
    type: 'specialist',
    specialization: 'crafter',
    baseStats: {
      health: 100,
      energy: 105,
      satisfaction: 100,
      speed: 0.8,
      strength: 8,
      dexterity: 16,
      intelligence: 14,
      workEfficiency: 1.6,
    },
    skills: {
      crafting: 22,
      smithing: 15,
      tailoring: 10,
      enchanting: 5,
    },
    preferences: {
      workTypes: ['crafting', 'smithing'],
      restTime: 5,
      socialNeed: 50,
    },
    equipment: {
      tools: ['crafting_hammer', 'anvil', 'needle'],
    },
    description: 'Especialista em criação de itens e equipamentos',
    unlockRequirements: {
      buildings: ['workshop'],
      population: 8,
    },
  },

  guard: {
    id: 'guard',
    name: 'Guarda',
    type: 'guard',
    baseStats: {
      health: 150,
      energy: 120,
      satisfaction: 100,
      speed: 1.1,
      strength: 15,
      dexterity: 13,
      intelligence: 9,
      workEfficiency: 1.2,
    },
    skills: {
      combat: 20,
      tactics: 12,
      vigilance: 15,
      leadership: 8,
    },
    preferences: {
      workTypes: ['patrol', 'defense'],
      restTime: 6,
      socialNeed: 40,
    },
    equipment: {
      weapon: 'sword',
      armor: 'leather_armor',
      tools: ['shield'],
    },
    description: 'Protetor da comunidade, especialista em combate',
    unlockRequirements: {
      buildings: ['barracks'],
      population: 10,
    },
  },

  merchant: {
    id: 'merchant',
    name: 'Mercador',
    type: 'merchant',
    baseStats: {
      health: 90,
      energy: 100,
      satisfaction: 100,
      speed: 1.0,
      strength: 8,
      dexterity: 10,
      intelligence: 16,
      workEfficiency: 1.4,
    },
    skills: {
      trading: 25,
      negotiation: 20,
      appraisal: 15,
      economics: 12,
    },
    preferences: {
      workTypes: ['trading', 'negotiation'],
      restTime: 4,
      socialNeed: 70,
    },
    equipment: {
      tools: ['scales', 'ledger'],
    },
    description: 'Especialista em comércio e negociações',
    unlockRequirements: {
      population: 15,
    },
  },

  researcher: {
    id: 'researcher',
    name: 'Pesquisador',
    type: 'specialist',
    specialization: 'researcher',
    baseStats: {
      health: 80,
      energy: 90,
      satisfaction: 100,
      speed: 0.7,
      strength: 6,
      dexterity: 8,
      intelligence: 20,
      workEfficiency: 1.8,
    },
    skills: {
      research: 30,
      analysis: 25,
      experimentation: 20,
      documentation: 15,
    },
    preferences: {
      workTypes: ['research', 'analysis'],
      restTime: 3,
      socialNeed: 20,
    },
    equipment: {
      tools: ['magnifying_glass', 'notebooks', 'instruments'],
    },
    description: 'Especialista em pesquisa e desenvolvimento',
    unlockRequirements: {
      population: 20,
    },
  },
};

// NPC behavior constants
export const NPC_BEHAVIOR = {
  WORK_HOURS: {
    START: 6,
    END: 18,
  },
  NEEDS: {
    ENERGY_DRAIN_RATE: 0.1,
    SATISFACTION_DRAIN_RATE: 0.05,
    HUNGER_RATE: 0.08,
    THIRST_RATE: 0.12,
  },
  PATHFINDING: {
    MAX_ATTEMPTS: 50,
    STUCK_THRESHOLD: 3.0,
    RECALCULATE_INTERVAL: 5000,
  },
  SOCIAL: {
    INTERACTION_RANGE: 3.0,
    CONVERSATION_DURATION: 30000,
    FRIENDSHIP_GAIN: 1,
  },
} as const;

// Utility functions
export const getNPCDefinition = (npcId: string): NPCDefinition | undefined => {
  return NPC_DEFINITIONS[npcId];
};

export const getNPCsByType = (type: NPCType): NPCDefinition[] => {
  return Object.values(NPC_DEFINITIONS).filter(npc => npc.type === type);
};

export const getNPCsBySpecialization = (specialization: NPCSpecialization): NPCDefinition[] => {
  return Object.values(NPC_DEFINITIONS).filter(npc => npc.specialization === specialization);
};

export const canUnlockNPC = (npcId: string, gameState: any): boolean => {
  const npc = getNPCDefinition(npcId);
  if (!npc || !npc.unlockRequirements) return true;

  const { buildings, research, population } = npc.unlockRequirements;

  if (population && gameState.population < population) return false;
  if (buildings && !buildings.every(building => gameState.buildings.includes(building))) return false;
  if (research && !research.every(tech => gameState.completedResearch.includes(tech))) return false;

  return true;
};

// Work types definition
export const workTypes = {
  miner: {
    id: 'miner',
    name: 'Minerador',
    icon: 'fa-pickaxe',
    description: 'Extrai minérios e pedras',
    requiredBuildings: ['mine'],
    resources: ['stone', 'iron', 'coal'],
  },
  lumberjack: {
    id: 'lumberjack',
    name: 'Lenhador',
    icon: 'fa-tree',
    description: 'Corta árvores e coleta madeira',
    requiredBuildings: ['lumbermill'],
    resources: ['wood'],
  },
  farmer: {
    id: 'farmer',
    name: 'Fazendeiro',
    icon: 'fa-seedling',
    description: 'Cultiva plantas e cuida dos animais',
    requiredBuildings: ['farm'],
    resources: ['food', 'wheat', 'vegetables'],
  },
  baker: {
    id: 'baker',
    name: 'Padeiro',
    icon: 'fa-bread-slice',
    description: 'Produz pães e alimentos processados',
    requiredBuildings: ['bakery'],
    resources: ['bread', 'pastries'],
  },
  builder: {
    id: 'builder',
    name: 'Construtor',
    icon: 'fa-hammer',
    description: 'Constrói e repara edificações',
    requiredBuildings: ['workshop'],
    resources: [],
  },
  guard: {
    id: 'guard',
    name: 'Guarda',
    icon: 'fa-shield',
    description: 'Protege a comunidade',
    requiredBuildings: ['barracks'],
    resources: [],
  },
} as const;

// Legacy exports for compatibility
export const npcTypes = NPC_DEFINITIONS;
