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

export const npcTypes: Record<string, NPCType> = {
  farmer: {
    id: "farmer",
    name: "Fazendeiro",
    profession: "Agricultura",
    description: "Trabalha em fazendas para aumentar a produção de trigo",
    speed: 0.15,
    workRadius: 10,
    color: "#006400", // Verde escuro
  },
  lumberjack: {
    id: "lumberjack",
    name: "Lenhador",
    profession: "Extração",
    description: "Trabalha em serrarias para aumentar a produção de madeira",
    speed: 0.12,
    workRadius: 8,
    color: "#8B4513", // Marrom
  },
  baker: {
    id: "baker",
    name: "Padeiro",
    profession: "Produção",
    description: "Trabalha em padarias para aumentar a produção de pão",
    speed: 0.10,
    workRadius: 5,
    color: "#D2691E", // Marrom claro
  },
  miner: {
    id: "miner",
    name: "Minerador",
    profession: "Extração",
    description: "Trabalha em minas para aumentar a produção de pedra",
    speed: 0.11,
    workRadius: 7,
    color: "#708090", // Cinza
  },
};

// Mapeamento de que tipo de NPC trabalha em cada tipo de edifício
export const workplaceMapping: Record<string, string> = {
  farm: "farmer",
  lumberMill: "lumberjack",
  bakery: "baker",
  stoneMine: "miner",
};