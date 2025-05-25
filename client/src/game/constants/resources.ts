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
    description: "Material básico de construção",
    color: "#8B4513",
    initialAmount: 20,
    maxAmount: 100,
    icon: "fa-solid fa-tree",
  },
  stone: {
    id: "stone",
    name: "Pedra",
    description: "Material de construção resistente",
    color: "#708090",
    initialAmount: 5,
    maxAmount: 100,
    icon: "fa-solid fa-mountain",
  },
  wheat: {
    id: "wheat",
    name: "Trigo",
    description: "Cultura alimentar básica",
    color: "#DAA520",
    initialAmount: 0,
    maxAmount: 50,
    icon: "fa-solid fa-wheat-awn",
  },
  water: {
    id: "water",
    name: "Água",
    description: "Essencial para vida e produção",
    color: "#4682B4",
    initialAmount: 10,
    maxAmount: 50,
    icon: "fa-solid fa-water",
  },
  bread: {
    id: "bread",
    name: "Pão",
    description: "Alimento feito de trigo",
    color: "#D2691E",
    initialAmount: 0,
    maxAmount: 30,
    icon: "fa-solid fa-bread-slice",
  },
  coins: {
    id: "coins",
    name: "Moedas",
    description: "Moeda usada para comércio",
    color: "#FFD700",
    initialAmount: 50,
    maxAmount: 999,
    icon: "fa-solid fa-coins",
  },
};
