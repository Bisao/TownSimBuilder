// Building definitions for the game
export interface BuildingType {
  id: string;
  name: string;
  description: string;
  size: [number, number]; // Width and length in grid units
  height: number; // Height for rendering
  cost: Record<string, number>; // Resources required to build
  produces?: {
    resourceType: string;
    amount: number;
    interval: number; // In seconds
  };
  requires?: Record<string, number>; // Resources required for production
  model: {
    color: string;
    shape: "box" | "cylinder";
  };
}

export const buildingTypes: Record<string, BuildingType> = {
  house: {
    id: "house",
    name: "House",
    description: "Basic dwelling for your citizens",
    size: [2, 2],
    height: 2,
    cost: { wood: 10 },
    model: {
      color: "#8B4513",
      shape: "box",
    },
  },
  farm: {
    id: "farm",
    name: "Farm",
    description: "Produces wheat over time",
    size: [3, 3],
    height: 0.5,
    cost: { wood: 5 },
    produces: {
      resourceType: "wheat",
      amount: 2,
      interval: 10,
    },
    model: {
      color: "#FFD700",
      shape: "box",
    },
  },
  lumberMill: {
    id: "lumberMill",
    name: "Lumber Mill",
    description: "Produces wood from trees",
    size: [3, 2],
    height: 2.5,
    cost: { wood: 15 },
    produces: {
      resourceType: "wood",
      amount: 3,
      interval: 15,
    },
    model: {
      color: "#8B4513",
      shape: "box",
    },
  },
  waterWell: {
    id: "waterWell",
    name: "Water Well",
    description: "Provides water for production",
    size: [1, 1],
    height: 1.5,
    cost: { wood: 5, stone: 10 },
    produces: {
      resourceType: "water",
      amount: 5,
      interval: 10,
    },
    model: {
      color: "#4682B4",
      shape: "cylinder",
    },
  },
  bakery: {
    id: "bakery",
    name: "Bakery",
    description: "Produces bread from wheat",
    size: [2, 2],
    height: 2,
    cost: { wood: 20, stone: 10 },
    produces: {
      resourceType: "bread",
      amount: 1,
      interval: 5,
    },
    requires: { wheat: 2, water: 1 },
    model: {
      color: "#D2691E",
      shape: "box",
    },
  },
  stoneMine: {
    id: "stoneMine",
    name: "Stone Mine",
    description: "Extracts stone resources",
    size: [2, 3],
    height: 1.5,
    cost: { wood: 15 },
    produces: {
      resourceType: "stone",
      amount: 2,
      interval: 20,
    },
    model: {
      color: "#708090",
      shape: "box",
    },
  },
  market: {
    id: "market",
    name: "Market",
    description: "Sells goods for coins",
    size: [3, 3],
    height: 2,
    cost: { wood: 25, stone: 15 },
    model: {
      color: "#DAA520",
      shape: "box",
    },
  },
};
