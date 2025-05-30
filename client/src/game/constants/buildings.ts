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
  BASIC: ['house'],
} as const;

// Building limits
export const BUILDING_LIMITS = {
  house: 20,
} as const;

// Legacy export for compatibility
export const buildingTypes = BUILDING_DEFINITIONS;