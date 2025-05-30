export type SpecializationType = 'farming' | 'mining' | 'lumberjacking' | 'building' | 'crafting' | 'combat' | 'trading' | 'research';

export interface SpecializationDefinition {
  id: SpecializationType;
  name: string;
  description: string;
  icon: string;
  category: 'production' | 'utility' | 'combat' | 'social';
  baseEfficiency: number;
  maxLevel: number;
  primaryStat: 'strength' | 'dexterity' | 'intelligence';
  secondaryStats: ('strength' | 'dexterity' | 'intelligence')[];
  requiredBuildings: string[];
  unlockRequirements: {
    level?: number;
    buildings?: string[];
    population?: number;
    resources?: Record<string, number>;
  };
  levelBenefits: {
    efficiency: number; // multiplier per level
    statBonus: number; // primary stat bonus per level
    specialAbilities?: Record<number, string>; // level -> ability description
  };
  workTypes: string[];
  preferredTools: string[];
}

export const SPECIALIZATION_DEFINITIONS: Record<SpecializationType, SpecializationDefinition> = {
  farming: {
    id: 'farming',
    name: 'Agricultura',
    description: 'Especialização em cultivo de alimentos e manejo de plantas',
    icon: '🌾',
    category: 'production',
    baseEfficiency: 1.0,
    maxLevel: 50,
    primaryStat: 'intelligence',
    secondaryStats: ['strength', 'dexterity'],
    requiredBuildings: ['farm'],
    unlockRequirements: {
      level: 1,
      buildings: ['farm'],
    },
    levelBenefits: {
      efficiency: 0.05, // +5% per level
      statBonus: 0.3,
      specialAbilities: {
        10: 'Colheita Rápida: 20% mais velocidade na colheita',
        25: 'Crescimento Acelerado: Plantas crescem 30% mais rápido',
        40: 'Supersementes: Chance de produzir sementes especiais',
      },
    },
    workTypes: ['farming', 'planting', 'harvesting'],
    preferredTools: ['hoe', 'watering_can', 'sickle'],
  },

  mining: {
    id: 'mining',
    name: 'Mineração',
    description: 'Especialização em extração de minérios e pedras preciosas',
    icon: '⛏️',
    category: 'production',
    baseEfficiency: 1.0,
    maxLevel: 50,
    primaryStat: 'strength',
    secondaryStats: ['dexterity'],
    requiredBuildings: ['mine'],
    unlockRequirements: {
      level: 3,
      buildings: ['mine'],
    },
    levelBenefits: {
      efficiency: 0.04,
      statBonus: 0.4,
      specialAbilities: {
        15: 'Veio Rico: Chance de encontrar minérios raros',
        30: 'Escavação Profunda: Acesso a recursos mais profundos',
        45: 'Mineração Explosiva: Extrai múltiplos recursos por vez',
      },
    },
    workTypes: ['mining', 'excavating', 'prospecting'],
    preferredTools: ['pickaxe', 'mining_helmet', 'explosives'],
  },

  lumberjacking: {
    id: 'lumberjacking',
    name: 'Lenhador',
    description: 'Especialização em corte e processamento de madeira',
    icon: '🪓',
    category: 'production',
    baseEfficiency: 1.0,
    maxLevel: 50,
    primaryStat: 'strength',
    secondaryStats: ['dexterity'],
    requiredBuildings: ['lumbermill'],
    unlockRequirements: {
      level: 2,
      buildings: ['lumbermill'],
    },
    levelBenefits: {
      efficiency: 0.045,
      statBonus: 0.35,
      specialAbilities: {
        12: 'Corte Preciso: Aproveitamento máximo da madeira',
        28: 'Madeira Especial: Chance de obter madeiras raras',
        42: 'Reflorestamento: Plantas árvores automaticamente',
      },
    },
    workTypes: ['lumberjacking', 'woodcutting', 'forestry'],
    preferredTools: ['axe', 'saw', 'measuring_tape'],
  },

  building: {
    id: 'building',
    name: 'Construção',
    description: 'Especialização em construção e arquitetura',
    icon: '🏗️',
    category: 'utility',
    baseEfficiency: 1.0,
    maxLevel: 50,
    primaryStat: 'intelligence',
    secondaryStats: ['strength', 'dexterity'],
    requiredBuildings: ['workshop'],
    unlockRequirements: {
      level: 4,
      buildings: ['workshop'],
      population: 5,
    },
    levelBenefits: {
      efficiency: 0.06,
      statBonus: 0.25,
      specialAbilities: {
        18: 'Construção Rápida: Reduz tempo de construção em 25%',
        35: 'Arquitetura Avançada: Desbloqueia construções especiais',
        48: 'Megaestrutura: Pode construir projetos épicos',
      },
    },
    workTypes: ['building', 'repair', 'planning'],
    preferredTools: ['hammer', 'level', 'blueprint'],
  },

  crafting: {
    id: 'crafting',
    name: 'Artesanato',
    description: 'Especialização em criação de itens e equipamentos',
    icon: '🔨',
    category: 'utility',
    baseEfficiency: 1.0,
    maxLevel: 50,
    primaryStat: 'dexterity',
    secondaryStats: ['intelligence'],
    requiredBuildings: ['workshop'],
    unlockRequirements: {
      level: 5,
      buildings: ['workshop'],
      resources: { tools: 5 },
    },
    levelBenefits: {
      efficiency: 0.055,
      statBonus: 0.3,
      specialAbilities: {
        20: 'Criação Superior: Itens têm qualidade aprimorada',
        38: 'Encantamento Básico: Pode adicionar propriedades mágicas',
        50: 'Obra-prima: Chance de criar itens lendários',
      },
    },
    workTypes: ['crafting', 'smithing', 'enchanting'],
    preferredTools: ['crafting_hammer', 'anvil', 'forge'],
  },

  combat: {
    id: 'combat',
    name: 'Combate',
    description: 'Especialização em artes marciais e táticas de guerra',
    icon: '⚔️',
    category: 'combat',
    baseEfficiency: 1.0,
    maxLevel: 50,
    primaryStat: 'strength',
    secondaryStats: ['dexterity'],
    requiredBuildings: ['barracks'],
    unlockRequirements: {
      level: 6,
      buildings: ['barracks'],
      population: 8,
    },
    levelBenefits: {
      efficiency: 0.07,
      statBonus: 0.4,
      specialAbilities: {
        16: 'Combate Duplo: Chance de atacar duas vezes',
        32: 'Resistência de Batalha: Reduz dano recebido',
        46: 'Fúria Guerreira: Dano massivamente aumentado temporariamente',
      },
    },
    workTypes: ['combat', 'patrol', 'training'],
    preferredTools: ['weapon', 'armor', 'shield'],
  },

  trading: {
    id: 'trading',
    name: 'Comércio',
    description: 'Especialização em negociação e economia',
    icon: '💰',
    category: 'social',
    baseEfficiency: 1.0,
    maxLevel: 50,
    primaryStat: 'intelligence',
    secondaryStats: ['dexterity'],
    requiredBuildings: [],
    unlockRequirements: {
      level: 8,
      population: 12,
      resources: { gold: 50 },
    },
    levelBenefits: {
      efficiency: 0.08,
      statBonus: 0.2,
      specialAbilities: {
        14: 'Negociação Hábil: Melhores preços de compra e venda',
        29: 'Rede Comercial: Acesso a mercadores especiais',
        44: 'Império Comercial: Gera renda passiva',
      },
    },
    workTypes: ['trading', 'negotiation', 'accounting'],
    preferredTools: ['scales', 'ledger', 'counting_board'],
  },

  research: {
    id: 'research',
    name: 'Pesquisa',
    description: 'Especialização em descoberta científica e tecnológica',
    icon: '🔬',
    category: 'utility',
    baseEfficiency: 1.0,
    maxLevel: 50,
    primaryStat: 'intelligence',
    secondaryStats: [],
    requiredBuildings: [],
    unlockRequirements: {
      level: 10,
      population: 15,
      resources: { tools: 10, gems: 5 },
    },
    levelBenefits: {
      efficiency: 0.09,
      statBonus: 0.5,
      specialAbilities: {
        22: 'Eureka: Chance de descoberta acidental',
        36: 'Pesquisa Avançada: Projetos complexos disponíveis',
        50: 'Gênio: Todas as pesquisas são mais rápidas',
      },
    },
    workTypes: ['research', 'analysis', 'experimentation'],
    preferredTools: ['microscope', 'laboratory', 'books'],
  },
};

// Utility functions
export const getSpecializationDefinition = (specializationId: SpecializationType): SpecializationDefinition | undefined => {
  return SPECIALIZATION_DEFINITIONS[specializationId];
};

export const getSpecializationsByCategory = (category: SpecializationDefinition['category']): SpecializationDefinition[] => {
  return Object.values(SPECIALIZATION_DEFINITIONS).filter(spec => spec.category === category);
};

export const canUnlockSpecialization = (specializationId: SpecializationType, character: any, gameState: any): boolean => {
  const spec = getSpecializationDefinition(specializationId);
  if (!spec) return false;

  const { level, buildings, population, resources } = spec.unlockRequirements;

  if (level && character.level < level) return false;
  if (population && gameState.population < population) return false;
  if (buildings && !buildings.every(building => gameState.buildings.includes(building))) return false;
  if (resources) {
    for (const [resource, amount] of Object.entries(resources)) {
      if ((gameState.resources[resource] || 0) < amount) return false;
    }
  }

  return true;
};

export const calculateSpecializationEfficiency = (specializationId: SpecializationType, level: number): number => {
  const spec = getSpecializationDefinition(specializationId);
  if (!spec) return 1.0;

  return spec.baseEfficiency + (spec.levelBenefits.efficiency * level);
};

export const getSpecializationAbility = (specializationId: SpecializationType, level: number): string | undefined => {
  const spec = getSpecializationDefinition(specializationId);
  if (!spec || !spec.levelBenefits.specialAbilities) return undefined;

  const availableAbilities = Object.entries(spec.levelBenefits.specialAbilities)
    .filter(([requiredLevel]) => level >= parseInt(requiredLevel))
    .sort(([a], [b]) => parseInt(b) - parseInt(a)); // Sort descending to get the highest available

  return availableAbilities.length > 0 ? availableAbilities[0][1] : undefined;
};

// Specialization progression costs
export const SPECIALIZATION_COSTS = {
  EXPERIENCE_BASE: 100,
  EXPERIENCE_MULTIPLIER: 1.5,
  RESOURCE_COSTS: {
    // Level thresholds and their resource requirements
    10: { gold: 50, tools: 5 },
    25: { gold: 200, gems: 10, tools: 15 },
    40: { gold: 500, gems: 25, tools: 30 },
    50: { gold: 1000, gems: 50, tools: 50 },
  },
} as const;

// Legacy exports for compatibility
export const specializationTypes = SPECIALIZATION_DEFINITIONS;