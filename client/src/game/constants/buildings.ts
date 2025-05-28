export interface BuildingType {
  id: string;
  name: string;
  description: string;
  size: [number, number]; // [width, depth] in grid cells
  height: number; // Visual height
  cost: Record<string, number>; // Resource costs
  produces?: {
    resourceType: string;
    amount: number;
    interval: number; // seconds
  };
  requires?: Record<string, number>; // Resources required for production
  model: {
    shape: "box" | "cylinder";
    color: string;
  };
}

export const buildingTypes: Record<string, BuildingType> = {
  house: {
    id: "house",
    name: "Casa",
    description: "Uma casa simples para abrigar NPCs",
    size: [1, 1],
    height: 1,
    cost: {
      wood: 10,
      stone: 5,
    },
    model: {
      shape: "box",
      color: "#8B4513",
    },
  },
  farm: {
    id: "farm",
    name: "Fazenda",
    description: "Produz alimentos quando plantada",
    size: [1, 1],
    height: 0.2,
    cost: {
      wood: 5,
      stone: 2,
    },
    model: {
      shape: "box",
      color: "#8B4513",
    },
  },
  waterWell: {
    id: "waterWell",
    name: "Poço",
    description: "Fornece água para a comunidade",
    size: [1, 1],
    height: 1.5,
    cost: {
      stone: 15,
      wood: 8,
    },
    produces: {
      resourceType: "water",
      amount: 5,
      interval: 8,
    },
    model: {
      shape: "cylinder",
      color: "#4682B4",
    },
  },
  silo: {
    id: "silo",
    name: "Silo",
    description: "Armazena grandes quantidades de recursos",
    size: [1, 1],
    height: 2,
    cost: {
      stone: 20,
      wood: 15,
    },
    model: {
      shape: "cylinder",
      color: "#C0C0C0",
    },
  },
};