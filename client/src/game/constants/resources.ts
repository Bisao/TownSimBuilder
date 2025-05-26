// Definições de recursos para o jogo
export interface ResourceType {
  id: string;
  name: string;
  description: string;
  color: string;
  initialAmount: number;
  maxAmount: number;
  icon: string; // Classe do ícone Font Awesome
}

export const resourceTypes: Record<string, ResourceType> = {
  wood: {
    id: "wood",
    name: "Madeira",
    description: "Material básico para construção",
    color: "#8B4513",
    icon: "fa-solid fa-tree",
    initialAmount: 20,
    maxAmount: 500,
  },
  stone: {
    id: "stone",
    name: "Pedra",
    description: "Material resistente para construções avançadas",
    color: "#708090",
    icon: "fa-solid fa-mountain",
    initialAmount: 10,
    maxAmount: 300,
  },
  wheat: {
    id: "wheat",
    name: "Trigo",
    description: "Grão usado para fazer pão",
    color: "#FFD700",
    icon: "fa-solid fa-wheat-awn",
    initialAmount: 5,
    maxAmount: 200,
  },
  seeds: {
    id: "seeds",
    name: "Sementes",
    description: "Sementes para plantar trigo",
    color: "#8FBC8F",
    icon: "fa-solid fa-seedling",
    initialAmount: 0,
    maxAmount: 100,
  },
  bread: {
    id: "bread",
    name: "Pão",
    description: "Alimento processado a partir do trigo",
    color: "#DEB887",
    icon: "fa-solid fa-bread-slice",
    initialAmount: 0,
    maxAmount: 100,
  },
  water: {
    id: "water",
    name: "Água",
    description: "Essencial para a vida e produção",
    color: "#4682B4",
    icon: "fa-solid fa-droplet",
    initialAmount: 10,
    maxAmount: 150,
  },
  coins: {
    id: "coins",
    name: "Moedas",
    description: "Moeda do jogo para compras",
    color: "#FFD700",
    icon: "fa-solid fa-coins",
    initialAmount: 100,
    maxAmount: 9999,
  },
};