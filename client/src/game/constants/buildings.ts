
import { BuildingType } from "../../shared/types";

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
}

export const BUILDING_DEFINITIONS: Record<string, BuildingDefinition> = {
  house: {
    id: 'house',
    name: 'Casa',
    type: 'house',
    cost: { wood: 10, stone: 5 },
    size: [2, 2],
    health: 100,
    description: 'Abrigo básico para NPCs',
    workCapacity: 1,
  },

  farm: {
    id: 'farm',
    name: 'Fazenda',
    type: 'farm',
    cost: { wood: 15, stone: 8, seeds: 5 },
    size: [3, 3],
    health: 80,
    description: 'Produz alimentos através da agricultura',
    production: { food: 2 },
    workCapacity: 2,
  },

  mine: {
    id: 'mine',
    name: 'Mina',
    type: 'mine',
    cost: { wood: 20, stone: 15, iron: 5 },
    size: [2, 3],
    health: 120,
    description: 'Extrai minérios do solo',
    production: { stone: 3, iron: 1 },
    workCapacity: 3,
  },

  lumbermill: {
    id: 'lumbermill',
    name: 'Serraria',
    type: 'lumbermill',
    cost: { wood: 25, stone: 10, iron: 3 },
    size: [3, 2],
    health: 90,
    description: 'Processa madeira de forma eficiente',
    production: { wood: 4 },
    workCapacity: 2,
  },

  well: {
    id: 'well',
    name: 'Poço',
    type: 'well',
    cost: { stone: 20, iron: 10 },
    size: [1, 1],
    health: 150,
    description: 'Fornece água limpa para a comunidade',
    production: { water: 5 },
    workCapacity: 1,
  },

  silo: {
    id: 'silo',
    name: 'Silo',
    type: 'silo',
    cost: { wood: 30, stone: 15, iron: 8 },
    size: [2, 2],
    health: 100,
    description: 'Armazena grandes quantidades de recursos',
    storage: {
      wood: 500,
      stone: 300,
      iron: 200,
      food: 400,
      water: 300,
      seeds: 100,
    },
    workCapacity: 1,
  },

  warehouse: {
    id: 'warehouse',
    name: 'Armazém',
    type: 'warehouse',
    cost: { wood: 40, stone: 20, iron: 15 },
    size: [4, 3],
    health: 110,
    description: 'Grande depósito para múltiplos tipos de recursos',
    storage: {
      wood: 800,
      stone: 500,
      iron: 300,
      food: 600,
      water: 400,
      seeds: 200,
    },
    workCapacity: 2,
  },

  workshop: {
    id: 'workshop',
    name: 'Oficina',
    type: 'workshop',
    cost: { wood: 35, stone: 25, iron: 20 },
    size: [3, 3],
    health: 95,
    description: 'Fabrica ferramentas e equipamentos',
    production: { tools: 1 },
    workCapacity: 3,
  },

  barracks: {
    id: 'barracks',
    name: 'Quartel',
    type: 'barracks',
    cost: { wood: 50, stone: 40, iron: 25 },
    size: [4, 3],
    health: 140,
    description: 'Treina e aloja unidades militares',
    workCapacity: 4,
  },

  training_ground: {
    id: 'training_ground',
    name: 'Campo de Treinamento',
    type: 'training_ground',
    cost: { wood: 30, stone: 20, iron: 10 },
    size: [4, 4],
    health: 80,
    description: 'Local para treinar habilidades de combate',
    workCapacity: 6,
  },
};

// Utility functions
export const getBuildingDefinition = (buildingId: string): BuildingDefinition | undefined => {
  return BUILDING_DEFINITIONS[buildingId];
};

export const getBuildingsByType = (type: BuildingType): BuildingDefinition[] => {
  return Object.values(BUILDING_DEFINITIONS).filter(building => building.type === type);
};

export const canAffordBuilding = (buildingId: string, resources: Record<string, number>): boolean => {
  const building = getBuildingDefinition(buildingId);
  if (!building) return false;

  return Object.entries(building.cost).every(([resource, cost]) => {
    return (resources[resource] || 0) >= cost;
  });
};

export const calculateBuildingCost = (buildingId: string): Record<string, number> => {
  const building = getBuildingDefinition(buildingId);
  return building ? { ...building.cost } : {};
};

// Building categories for UI organization
export const BUILDING_CATEGORIES = {
  BASIC: ['house', 'well'],
  PRODUCTION: ['farm', 'mine', 'lumbermill', 'workshop'],
  STORAGE: ['silo', 'warehouse'],
  MILITARY: ['barracks', 'training_ground'],
} as const;

// Building limits
export const BUILDING_LIMITS = {
  house: 20,
  farm: 10,
  mine: 8,
  lumbermill: 6,
  well: 5,
  silo: 8,
  warehouse: 4,
  workshop: 4,
  barracks: 3,
  training_ground: 2,
} as const;

// Legacy export for compatibility
export const buildingTypes = BUILDING_DEFINITIONS;
