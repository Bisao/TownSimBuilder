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

export const buildingTypes = {
  house: {
    id: "house",
    name: "Casa",
    size: [2, 2] as [number, number],
    cost: { wood: 50, stone: 30 },
    color: "#8B4513",
    maxOccupants: 1,
    description: "Uma casa simples para abrigar um NPC."
  },
  farm: {
    id: "farm",
    name: "Fazenda",
    size: [3, 3] as [number, number],
    cost: { wood: 80, stone: 20 },
    color: "#228B22",
    description: "Permite plantar e colher culturas."
  },
  market: {
    id: "market",
    name: "Mercado",
    size: [4, 4] as [number, number],
    cost: { wood: 150, stone: 100, gold: 50 },
    color: "#DAA520",
    description: "Centro de comércio para comprar e vender recursos."
  },
  bakery: {
    id: "bakery",
    name: "Padaria",
    size: [3, 2] as [number, number],
    cost: { wood: 60, stone: 40 },
    color: "#D2691E",
    description: "Produz pão a partir de trigo."
  },
  mine: {
    id: "mine",
    name: "Mina",
    size: [2, 2] as [number, number],
    cost: { wood: 40, stone: 80 },
    color: "#696969",
    description: "Extrai pedra do solo."
  },
  lumberyard: {
    id: "lumberyard",
    name: "Serraria",
    size: [3, 2] as [number, number],
    cost: { wood: 100, stone: 20 },
    color: "#8B4513",
    description: "Processa madeira de forma eficiente."
  },
  silo: {
    id: "silo",
    name: "Silo",
    size: [2, 2] as [number, number],
    cost: { wood: 60, stone: 60 },
    color: "#A0A0A0",
    description: "Armazena recursos coletados pelos NPCs."
  },
  training_dummy: {
    id: "training_dummy",
    name: "Dummy de Treinamento",
    size: [1, 1] as [number, number],
    cost: { wood: 30, stone: 10 },
    color: "#DEB887",
    description: "Dummy para treino de combate."
  }
} as const;