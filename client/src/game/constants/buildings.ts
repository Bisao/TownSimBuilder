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
    height: 2,
    cost: { wood: 50, stone: 30 },
    maxOccupants: 1,
    description: "Uma casa simples para abrigar um NPC.",
    model: {
      shape: "box" as const,
      color: "#8B4513"
    }
  },
  farm: {
    id: "farm",
    name: "Fazenda",
    size: [3, 3] as [number, number],
    height: 1,
    cost: { wood: 80, stone: 20 },
    description: "Permite plantar e colher culturas.",
    model: {
      shape: "box" as const,
      color: "#228B22"
    }
  },
  market: {
    id: "market",
    name: "Mercado",
    size: [4, 4] as [number, number],
    height: 3,
    cost: { wood: 150, stone: 100, gold: 50 },
    description: "Centro de comércio para comprar e vender recursos.",
    model: {
      shape: "box" as const,
      color: "#DAA520"
    }
  },
  bakery: {
    id: "bakery",
    name: "Padaria",
    size: [3, 2] as [number, number],
    height: 2,
    cost: { wood: 60, stone: 40 },
    description: "Produz pão a partir de trigo.",
    model: {
      shape: "box" as const,
      color: "#D2691E"
    }
  },
  mine: {
    id: "mine",
    name: "Mina",
    size: [2, 2] as [number, number],
    height: 2,
    cost: { wood: 40, stone: 80 },
    description: "Extrai pedra do solo.",
    model: {
      shape: "box" as const,
      color: "#696969"
    }
  },
  lumberyard: {
    id: "lumberyard",
    name: "Serraria",
    size: [3, 2] as [number, number],
    height: 2,
    cost: { wood: 100, stone: 20 },
    description: "Processa madeira de forma eficiente.",
    model: {
      shape: "box" as const,
      color: "#8B4513"
    }
  },
  silo: {
    id: "silo",
    name: "Silo",
    size: [2, 2] as [number, number],
    height: 3,
    cost: { wood: 60, stone: 60 },
    description: "Armazena recursos coletados pelos NPCs.",
    model: {
      shape: "cylinder" as const,
      color: "#A0A0A0"
    }
  },
  training_dummy: {
    id: "training_dummy",
    name: "Dummy de Treinamento",
    size: [1, 1] as [number, number],
    height: 2,
    cost: { wood: 30, stone: 10 },
    description: "Dummy para treino de combate.",
    model: {
      shape: "box" as const,
      color: "#DEB887"
    }
  }
} as const;