
export interface ResourceType {
  id: string;
  name: string;
  color: string;
  initialAmount: number;
  maxAmount: number;
  category: "raw" | "processed" | "food" | "tool" | "seed";
  description?: string;
}

export const resourceTypes: Record<string, ResourceType> = {
  wood: {
    id: "wood",
    name: "Madeira",
    color: "#8B4513",
    initialAmount: 50,
    maxAmount: 999,
    category: "raw",
    description: "Material básico para construção"
  },
  stone: {
    id: "stone",
    name: "Pedra",
    color: "#708090",
    initialAmount: 30,
    maxAmount: 999,
    category: "raw",
    description: "Material resistente para construção"
  },
  water: {
    id: "water",
    name: "Água",
    color: "#4169E1",
    initialAmount: 100,
    maxAmount: 999,
    category: "raw",
    description: "Essencial para vida e produção"
  },
  wheat: {
    id: "wheat",
    name: "Trigo",
    color: "#DAA520",
    initialAmount: 20,
    maxAmount: 999,
    category: "food",
    description: "Cereal básico para alimentação"
  },
  bread: {
    id: "bread",
    name: "Pão",
    color: "#DEB887",
    initialAmount: 5,
    maxAmount: 999,
    category: "food",
    description: "Alimento processado nutritivo"
  },
  seeds: {
    id: "seeds",
    name: "Sementes",
    color: "#228B22",
    initialAmount: 15,
    maxAmount: 999,
    category: "seed",
    description: "Sementes básicas para plantio"
  },
  potato_seeds: {
    id: "potato_seeds",
    name: "Sementes de Batata",
    color: "#8B7355",
    initialAmount: 10,
    maxAmount: 999,
    category: "seed",
    description: "Sementes de batata para plantio"
  },
  carrot_seeds: {
    id: "carrot_seeds",
    name: "Sementes de Cenoura",
    color: "#FF4500",
    initialAmount: 10,
    maxAmount: 999,
    category: "seed",
    description: "Sementes de cenoura para plantio"
  },
  potatoes: {
    id: "potatoes",
    name: "Batatas",
    color: "#D2B48C",
    initialAmount: 0,
    maxAmount: 999,
    category: "food",
    description: "Tubérculos nutritivos"
  },
  carrots: {
    id: "carrots",
    name: "Cenouras",
    color: "#FF8C00",
    initialAmount: 0,
    maxAmount: 999,
    category: "food",
    description: "Vegetais ricos em vitaminas"
  },
  tools: {
    id: "tools",
    name: "Ferramentas",
    color: "#696969",
    initialAmount: 5,
    maxAmount: 100,
    category: "tool",
    description: "Ferramentas para trabalho"
  },
  gold: {
    id: "gold",
    name: "Ouro",
    color: "#FFD700",
    initialAmount: 100,
    maxAmount: 9999,
    category: "raw",
    description: "Moeda para comércio"
  }
};

// Função para obter recursos por categoria
export const getResourcesByCategory = (category: ResourceType["category"]) => {
  return Object.values(resourceTypes).filter(resource => resource.category === category);
};

// Função para verificar se um tipo de recurso existe
export const isValidResourceType = (type: string): boolean => {
  return type in resourceTypes;
};
