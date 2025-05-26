
// Definições de itens do mercado
export interface MarketItem {
  id: string;
  name: string;
  description: string;
  category: "seeds" | "tools" | "supplies";
  price: number;
  icon: string; // Classe do ícone Font Awesome
  color: string;
  resourceType?: string; // Tipo de recurso que o item adiciona/remove
  amount?: number; // Quantidade do recurso
}

// Categorias do mercado
export const marketCategories = [
  { id: "seeds", name: "Sementes", icon: "fa-solid fa-seedling" },
  { id: "tools", name: "Ferramentas", icon: "fa-solid fa-screwdriver-wrench" },
  { id: "supplies", name: "Insumos", icon: "fa-solid fa-flask" },
];

// Itens disponíveis no mercado
export const marketItems: Record<string, MarketItem> = {
  // Sementes
  wheatSeeds: {
    id: "wheatSeeds",
    name: "Sementes de Trigo",
    description: "Plante para cultivar trigo em sua fazenda",
    category: "seeds",
    price: 5,
    icon: "fa-solid fa-wheat-awn",
    color: "#f5deb3",
    resourceType: "wheatSeeds",
    amount: 10,
  },
  cornSeeds: {
    id: "cornSeeds",
    name: "Sementes de Milho",
    description: "Plante para cultivar milho em sua fazenda",
    category: "seeds",
    price: 8,
    icon: "fa-solid fa-seedling",
    color: "#ffff00",
    resourceType: "cornSeeds",
    amount: 8,
  },
  carrotSeeds: {
    id: "carrotSeeds",
    name: "Sementes de Cenoura",
    description: "Plante para cultivar cenouras em sua fazenda",
    category: "seeds",
    price: 6,
    icon: "fa-solid fa-carrot",
    color: "#ff8c00",
    resourceType: "carrotSeeds",
    amount: 12,
  },

  // Ferramentas
  hoe: {
    id: "hoe",
    name: "Enxada",
    description: "Melhora a eficiência das fazendas",
    category: "tools",
    price: 25,
    icon: "fa-solid fa-trowel",
    color: "#8b4513",
    resourceType: "tools",
    amount: 1,
  },
  axe: {
    id: "axe",
    name: "Machado",
    description: "Melhora a eficiência das serrarias",
    category: "tools",
    price: 30,
    icon: "fa-solid fa-axe",
    color: "#a0522d",
    resourceType: "tools",
    amount: 1,
  },
  pickaxe: {
    id: "pickaxe",
    name: "Picareta",
    description: "Melhora a eficiência das minas",
    category: "tools",
    price: 35,
    icon: "fa-solid fa-hammer",
    color: "#808080",
    resourceType: "tools",
    amount: 1,
  },

  // Insumos
  fertilizer: {
    id: "fertilizer",
    name: "Fertilizante",
    description: "Aumenta a produção das fazendas",
    category: "supplies",
    price: 15,
    icon: "fa-solid fa-poop",
    color: "#8b4513",
    resourceType: "fertilizer",
    amount: 5,
  },
  wateringCan: {
    id: "wateringCan",
    name: "Regador",
    description: "Reduz o consumo de água nas fazendas",
    category: "supplies",
    price: 12,
    icon: "fa-solid fa-fill-drip",
    color: "#4682b4",
    resourceType: "tools",
    amount: 1,
  },
  pesticide: {
    id: "pesticide",
    name: "Pesticida",
    description: "Protege as plantações de pragas",
    category: "supplies",
    price: 18,
    icon: "fa-solid fa-spray-can",
    color: "#006400",
    resourceType: "pesticide",
    amount: 3,
  },
};
