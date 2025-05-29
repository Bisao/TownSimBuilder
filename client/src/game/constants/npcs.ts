// Definições de NPCs para o jogo
export interface NPCType {
  id: string;
  name: string;
  profession: string;
  description: string;
  speed: number; // Velocidade de movimento
  workRadius: number; // Raio de trabalho a partir da casa
  color: string; // Cor para renderização
}

// Tipos de trabalho disponíveis para os NPCs
export interface WorkType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gathering' | 'crafting' | 'farming' | 'refining';
  resourceType?: string;
  buildingType?: string;
  experienceMultiplier: number;
}

export const npcTypes: Record<string, NPCType> = {
  villager: {
    id: "villager",
    name: "Aldeão",
    profession: "Geral",
    description: "Um habitante comum da vila, versátil em tarefas básicas",
    speed: 0.12,
    workRadius: 8,
    color: "#808080", // Cinza
  }
};

// Tipos de trabalho disponíveis
export const workTypes: Record<string, WorkType> = {
  farmer: {
    id: "farmer",
    name: "Fazendeiro",
    description: "Cultiva plantas e colhe recursos agrícolas",
    icon: "fa-wheat-awn",
    category: "farming",
    buildingType: "farm",
    experienceMultiplier: 1.0
  },
  lumberjack: {
    id: "lumberjack", 
    name: "Lenhador",
    description: "Coleta madeira das árvores",
    icon: "fa-tree",
    category: "gathering",
    resourceType: "wood",
    experienceMultiplier: 1.0
  },
  miner: {
    id: "miner",
    name: "Minerador", 
    description: "Extrai pedra e minérios",
    icon: "fa-helmet-safety",
    category: "gathering",
    resourceType: "stone",
    experienceMultiplier: 1.0
  },
  baker: {
    id: "baker",
    name: "Padeiro",
    description: "Produz pães e outros alimentos",
    icon: "fa-bread-slice",
    category: "crafting",
    buildingType: "bakery",
    experienceMultiplier: 1.2
  },
  refiner: {
    id: "refiner",
    name: "Refinador",
    description: "Refina recursos brutos em materiais processados",
    icon: "fa-cog",
    category: "refining",
    experienceMultiplier: 1.5
  }
};

// Mapeamento de que tipo de trabalho funciona em cada tipo de edifício
export const workplaceMapping: Record<string, string> = {
  farm: "farmer",
  lumberMill: "lumberjack",
  bakery: "baker",
  stoneMine: "miner",
  silo: "refiner"
};