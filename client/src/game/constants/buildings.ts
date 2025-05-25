// Definições de edifícios para o jogo
export interface BuildingType {
  id: string;
  name: string;
  description: string;
  size: [number, number]; // Largura e comprimento em unidades de grade
  height: number; // Altura para renderização
  cost: Record<string, number>; // Recursos necessários para construir
  produces?: {
    resourceType: string;
    amount: number;
    interval: number; // Em segundos
  };
  requires?: Record<string, number>; // Recursos necessários para produção
  model: {
    color: string;
    shape: "box" | "cylinder";
  };
}

export const buildingTypes: Record<string, BuildingType> = {
  house: {
    id: "house",
    name: "Casa",
    description: "Moradia básica para seus cidadãos",
    size: [1, 1],
    height: 2,
    cost: { wood: 10 },
    model: {
      color: "#8B4513",
      shape: "box",
    },
  },
  farmerHouse: {
    id: "farmerHouse",
    name: "Casa do Fazendeiro",
    description: "Moradia para fazendeiros que trabalham nas fazendas",
    size: [1, 1],
    height: 2,
    cost: { wood: 15, stone: 5 },
    model: {
      color: "#A0522D",
      shape: "box",
    },
  },
  farm: {
    id: "farm",
    name: "Fazenda",
    description: "Produz trigo ao longo do tempo",
    size: [1, 1],
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
    name: "Serraria",
    description: "Produz madeira das árvores",
    size: [1, 1],
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
    name: "Poço de Água",
    description: "Fornece água para produção",
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
    name: "Padaria",
    description: "Produz pão a partir do trigo",
    size: [1, 1],
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
    name: "Mina de Pedra",
    description: "Extrai recursos de pedra",
    size: [1, 1],
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
    name: "Mercado",
    description: "Compre sementes, ferramentas e insumos",
    size: [1, 1],
    height: 2,
    cost: { wood: 25, stone: 15 },
    model: {
      color: "#DAA520",
      shape: "box",
    },
  },
  silo: {
    id: "silo",
    name: "Silo",
    description: "Aumenta a capacidade de armazenamento de recursos",
    size: [1, 1],
    height: 3,
    cost: { wood: 20, stone: 30 },
    model: {
      color: "#CD853F",
      shape: "cylinder",
    },
  },
};
