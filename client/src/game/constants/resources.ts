// Resource definitions for the game
export interface ResourceType {
  id: string;
  name: string;
  description: string;
  color: string;
  initialAmount: number;
  maxAmount: number;
  icon: string; // Font Awesome icon class
}

export const resourceTypes: Record<string, ResourceType> = {
  wood: {
    id: "wood",
    name: "Wood",
    description: "Basic building material",
    color: "#8B4513",
    initialAmount: 20,
    maxAmount: 100,
    icon: "fa-solid fa-tree",
  },
  stone: {
    id: "stone",
    name: "Stone",
    description: "Hard building material",
    color: "#708090",
    initialAmount: 5,
    maxAmount: 100,
    icon: "fa-solid fa-mountain",
  },
  wheat: {
    id: "wheat",
    name: "Wheat",
    description: "Basic food crop",
    color: "#DAA520",
    initialAmount: 0,
    maxAmount: 50,
    icon: "fa-solid fa-wheat-awn",
  },
  water: {
    id: "water",
    name: "Water",
    description: "Essential for life and production",
    color: "#4682B4",
    initialAmount: 10,
    maxAmount: 50,
    icon: "fa-solid fa-water",
  },
  bread: {
    id: "bread",
    name: "Bread",
    description: "Food made from wheat",
    color: "#D2691E",
    initialAmount: 0,
    maxAmount: 30,
    icon: "fa-solid fa-bread-slice",
  },
  coins: {
    id: "coins",
    name: "Coins",
    description: "Currency used for trade",
    color: "#FFD700",
    initialAmount: 50,
    maxAmount: 999,
    icon: "fa-solid fa-coins",
  },
};
