
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  currentExperience: number;
  cost: number;
  requirements: string[];
  category: 'adventurer' | 'crafting' | 'gathering' | 'farming' | 'combat' | 'refining';
  subcategory?: string;
  position: { x: number; y: number };
  connections: string[];
  tier: number;
  unlocks?: string[];
  isUnlocked: boolean;
}

export interface PlayerResources {
  famePoints: number;
  silver: number;
}

export interface SkillProgress {
  skillId: string;
  experienceGained: number;
  leveledUp: boolean;
}

interface SkillState {
  skills: Record<string, SkillNode>;
  playerResources: PlayerResources;
  isLoading: boolean;
  selectedSkill: string | null;
  
  // Actions
  initializeSkills: () => void;
  loadPlayerProgress: (userId: number) => Promise<void>;
  upgradeSkill: (skillId: string) => Promise<boolean>;
  addExperience: (skillId: string, amount: number) => SkillProgress;
  addFamePoints: (amount: number) => void;
  addSilver: (amount: number) => void;
  selectSkill: (skillId: string | null) => void;
  isSkillUnlocked: (skillId: string) => boolean;
  canUpgradeSkill: (skillId: string) => boolean;
  getSkillCost: (skillId: string, level?: number) => number;
  calculateExperienceForLevel: (level: number) => number;
  saveProgress: () => Promise<void>;
}

// Dados iniciais das habilidades baseados no SkillTreePanel
const INITIAL_SKILLS: Record<string, Omit<SkillNode, 'currentLevel' | 'currentExperience' | 'isUnlocked'>> = {
  // AVENTUREIRO - Centro da árvore
  novice_adventurer: {
    id: 'novice_adventurer',
    name: 'Aventureiro Novato',
    description: 'Primeiro passo na jornada de aventura',
    maxLevel: 100,
    cost: 0,
    requirements: [],
    category: 'adventurer',
    position: { x: 1250, y: 640 },
    connections: ['journeyman_adventurer'],
    tier: 1
  },
  journeyman_adventurer: {
    id: 'journeyman_adventurer',
    name: 'Aventureiro Oficial',
    description: 'Aventureiro com experiência básica',
    maxLevel: 100,
    cost: 50,
    requirements: ['novice_adventurer'],
    category: 'adventurer',
    position: { x: 1250, y: 770 },
    connections: ['adept_adventurer'],
    tier: 1
  },
  adept_adventurer: {
    id: 'adept_adventurer',
    name: 'Aventureiro Adepto',
    description: 'Aventureiro competente - Centro da árvore',
    maxLevel: 100,
    cost: 100,
    requirements: ['journeyman_adventurer'],
    category: 'adventurer',
    position: { x: 1250, y: 900 },
    connections: ['expert_adventurer', 'crafting_branch', 'gathering_branch', 'farming_branch', 'combat_branch', 'refining_branch'],
    tier: 1
  },
  expert_adventurer: {
    id: 'expert_adventurer',
    name: 'Aventureiro Expert',
    description: 'Aventureiro experiente',
    maxLevel: 100,
    cost: 200,
    requirements: ['adept_adventurer'],
    category: 'adventurer',
    position: { x: 1250, y: 1030 },
    connections: ['master_adventurer'],
    tier: 1
  },
  master_adventurer: {
    id: 'master_adventurer',
    name: 'Aventureiro Mestre',
    description: 'Aventureiro mestre em sua arte',
    maxLevel: 100,
    cost: 400,
    requirements: ['expert_adventurer'],
    category: 'adventurer',
    position: { x: 1250, y: 1160 },
    connections: ['grandmaster_adventurer'],
    tier: 1
  },
  grandmaster_adventurer: {
    id: 'grandmaster_adventurer',
    name: 'Grão-Mestre Aventureiro',
    description: 'Aventureiro de elite',
    maxLevel: 100,
    cost: 800,
    requirements: ['master_adventurer'],
    category: 'adventurer',
    position: { x: 1250, y: 1290 },
    connections: ['elder_adventurer'],
    tier: 1
  },
  elder_adventurer: {
    id: 'elder_adventurer',
    name: 'Aventureiro Ancião',
    description: 'O mais alto nível de aventureiro',
    maxLevel: 100,
    cost: 1600,
    requirements: ['grandmaster_adventurer'],
    category: 'adventurer',
    position: { x: 1250, y: 1420 },
    connections: [],
    tier: 1
  },

  // CRAFTING BRANCH
  crafting_branch: {
    id: 'crafting_branch',
    name: 'Ramo da Criação',
    description: 'Desbloqueia as habilidades de criação',
    maxLevel: 100,
    cost: 100,
    requirements: ['adept_adventurer'],
    category: 'crafting',
    position: { x: 1137, y: 787 },
    connections: ['trainee_craftsman'],
    tier: 1
  },
  trainee_craftsman: {
    id: 'trainee_craftsman',
    name: 'Artesão Aprendiz',
    description: 'Fundamentos básicos da criação',
    maxLevel: 100,
    cost: 125,
    requirements: ['crafting_branch'],
    category: 'crafting',
    position: { x: 1081, y: 731 },
    connections: ['warrior_forge', 'hunter_lodge', 'mage_tower', 'toolmaker'],
    tier: 1
  },
  warrior_forge: {
    id: 'warrior_forge',
    name: 'Forja do Guerreiro',
    description: 'Criação de equipamentos de guerreiro',
    maxLevel: 100,
    cost: 150,
    requirements: ['trainee_craftsman'],
    category: 'crafting',
    subcategory: 'warrior_forge',
    position: { x: 1052, y: 702 },
    connections: ['plate_armor_crafter'],
    tier: 1,
    unlocks: ['Armaduras de Placa', 'Espadas', 'Machados', 'Maças']
  },
  plate_armor_crafter: {
    id: 'plate_armor_crafter',
    name: 'Criador de Armadura de Placa',
    description: 'Especialista em armaduras pesadas de ferro',
    maxLevel: 100,
    cost: 200,
    requirements: ['warrior_forge'],
    category: 'crafting',
    subcategory: 'warrior_forge',
    position: { x: 972, y: 622 },
    connections: [],
    tier: 1,
    unlocks: ['Armaduras T4-T8', 'Bonus: +20% Eficiência de Criação']
  },

  // GATHERING BRANCH
  gathering_branch: {
    id: 'gathering_branch',
    name: 'Ramo da Coleta',
    description: 'Desbloqueia habilidades de coleta',
    maxLevel: 100,
    cost: 100,
    requirements: ['adept_adventurer'],
    category: 'gathering',
    position: { x: 1363, y: 787 },
    connections: ['lumberjack', 'miner'],
    tier: 1
  },
  lumberjack: {
    id: 'lumberjack',
    name: 'Lenhador',
    description: 'Especialista em coleta de madeira',
    maxLevel: 100,
    cost: 150,
    requirements: ['gathering_branch'],
    category: 'gathering',
    position: { x: 1448, y: 702 },
    connections: ['adept_lumberjack'],
    tier: 1,
    unlocks: ['Coleta de Madeira T4-T8', 'Bonus: +25% Velocidade de Corte']
  },
  adept_lumberjack: {
    id: 'adept_lumberjack',
    name: 'Lenhador Adepto',
    description: 'Lenhador experiente',
    maxLevel: 100,
    cost: 200,
    requirements: ['lumberjack'],
    category: 'gathering',
    position: { x: 1528, y: 622 },
    connections: [],
    tier: 1,
    unlocks: ['Madeira Especial', 'Bonus: +50% Chance de Recurso Raro']
  },
  miner: {
    id: 'miner',
    name: 'Minerador',
    description: 'Especialista em mineração',
    maxLevel: 100,
    cost: 150,
    requirements: ['gathering_branch'],
    category: 'gathering',
    position: { x: 1413, y: 842 },
    connections: ['adept_miner'],
    tier: 1,
    unlocks: ['Mineração T4-T8', 'Bonus: +25% Velocidade de Mineração']
  },
  adept_miner: {
    id: 'adept_miner',
    name: 'Minerador Adepto',
    description: 'Minerador experiente',
    maxLevel: 100,
    cost: 200,
    requirements: ['miner'],
    category: 'gathering',
    position: { x: 1493, y: 902 },
    connections: [],
    tier: 1,
    unlocks: ['Minérios Especiais', 'Bonus: +50% Chance de Minério Raro']
  },

  // FARMING BRANCH
  farming_branch: {
    id: 'farming_branch',
    name: 'Ramo da Agricultura',
    description: 'Habilidades de agricultura e criação',
    maxLevel: 100,
    cost: 100,
    requirements: ['adept_adventurer'],
    category: 'farming',
    position: { x: 1137, y: 1013 },
    connections: ['crop_farmer'],
    tier: 1
  },
  crop_farmer: {
    id: 'crop_farmer',
    name: 'Fazendeiro de Grãos',
    description: 'Especialista em cultivo de grãos',
    maxLevel: 100,
    cost: 150,
    requirements: ['farming_branch'],
    category: 'farming',
    position: { x: 1052, y: 1098 },
    connections: ['adept_crop_farmer'],
    tier: 1,
    unlocks: ['Cultivo T4-T8', 'Bonus: +30% Velocidade de Crescimento']
  },
  adept_crop_farmer: {
    id: 'adept_crop_farmer',
    name: 'Fazendeiro Adepto',
    description: 'Fazendeiro experiente',
    maxLevel: 100,
    cost: 200,
    requirements: ['crop_farmer'],
    category: 'farming',
    position: { x: 972, y: 1178 },
    connections: [],
    tier: 1,
    unlocks: ['Cultivos Especiais', 'Bonus: +100% Rendimento de Colheita']
  },

  // COMBAT BRANCH
  combat_branch: {
    id: 'combat_branch',
    name: 'Ramo do Combate',
    description: 'Habilidades de combate',
    maxLevel: 100,
    cost: 100,
    requirements: ['adept_adventurer'],
    category: 'combat',
    position: { x: 1090, y: 900 },
    connections: ['warrior_combat'],
    tier: 1
  },
  warrior_combat: {
    id: 'warrior_combat',
    name: 'Combate de Guerreiro',
    description: 'Especialização em combate corpo a corpo',
    maxLevel: 100,
    cost: 150,
    requirements: ['combat_branch'],
    category: 'combat',
    position: { x: 970, y: 900 },
    connections: ['plate_fighter'],
    tier: 1,
    unlocks: ['Combate Corpo a Corpo', 'Bonus: +15% Dano Físico']
  },
  plate_fighter: {
    id: 'plate_fighter',
    name: 'Lutador de Placas',
    description: 'Especialista em combate com armadura pesada',
    maxLevel: 100,
    cost: 200,
    requirements: ['warrior_combat'],
    category: 'combat',
    position: { x: 850, y: 900 },
    connections: [],
    tier: 1,
    unlocks: ['Maestria em Armadura Pesada', 'Bonus: +25% Resistência']
  },

  // REFINING BRANCH
  refining_branch: {
    id: 'refining_branch',
    name: 'Ramo do Refinamento',
    description: 'Habilidades de refinamento de recursos',
    maxLevel: 100,
    cost: 100,
    requirements: ['adept_adventurer'],
    category: 'refining',
    position: { x: 1363, y: 1013 },
    connections: ['wood_refiner', 'ore_refiner'],
    tier: 1
  },
  wood_refiner: {
    id: 'wood_refiner',
    name: 'Refinador de Madeira',
    description: 'Especialista em refinar madeira',
    maxLevel: 100,
    cost: 150,
    requirements: ['refining_branch'],
    category: 'refining',
    position: { x: 1448, y: 1098 },
    connections: ['adept_wood_refiner'],
    tier: 1,
    unlocks: ['Refino de Madeira T4-T8', 'Bonus: +20% Eficiência de Refino']
  },
  adept_wood_refiner: {
    id: 'adept_wood_refiner',
    name: 'Refinador de Madeira Adepto',
    description: 'Refinador experiente',
    maxLevel: 100,
    cost: 200,
    requirements: ['wood_refiner'],
    category: 'refining',
    position: { x: 1528, y: 1178 },
    connections: [],
    tier: 1,
    unlocks: ['Madeira Refinada Especial', 'Bonus: +50% Chance de Material Raro']
  },
  ore_refiner: {
    id: 'ore_refiner',
    name: 'Refinador de Minério',
    description: 'Especialista em refinar minérios',
    maxLevel: 100,
    cost: 150,
    requirements: ['refining_branch'],
    category: 'refining',
    position: { x: 1413, y: 958 },
    connections: ['adept_ore_refiner'],
    tier: 1,
    unlocks: ['Refino de Minério T4-T8', 'Bonus: +20% Eficiência de Refino']
  },
  adept_ore_refiner: {
    id: 'adept_ore_refiner',
    name: 'Refinador de Minério Adepto',
    description: 'Refinador experiente',
    maxLevel: 100,
    cost: 200,
    requirements: ['ore_refiner'],
    category: 'refining',
    position: { x: 1493, y: 898 },
    connections: [],
    tier: 1,
    unlocks: ['Metais Refinados Especiais', 'Bonus: +50% Chance de Material Raro']
  }
};

export const useSkillStore = create<SkillState>()(
  subscribeWithSelector((set, get) => ({
    skills: {},
    playerResources: { famePoints: 100, silver: 500 },
    isLoading: false,
    selectedSkill: null,

    initializeSkills: () => {
      const skills: Record<string, SkillNode> = {};
      
      Object.entries(INITIAL_SKILLS).forEach(([id, skillData]) => {
        skills[id] = {
          ...skillData,
          currentLevel: id === 'novice_adventurer' ? 1 : 0,
          currentExperience: 0,
          isUnlocked: id === 'novice_adventurer'
        };
      });

      set({ skills });
    },

    loadPlayerProgress: async (userId: number) => {
      set({ isLoading: true });
      try {
        // TODO: Implementar carregamento do backend
        console.log(`Loading progress for user ${userId}`);
        get().initializeSkills();
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
        get().initializeSkills();
      } finally {
        set({ isLoading: false });
      }
    },

    upgradeSkill: async (skillId: string) => {
      const state = get();
      const skill = state.skills[skillId];
      
      if (!state.canUpgradeSkill(skillId)) {
        return false;
      }

      const cost = state.getSkillCost(skillId);
      if (state.playerResources.famePoints < cost) {
        console.log(`Pontos de Fame insuficientes. Necessário: ${cost}, Atual: ${state.playerResources.famePoints}`);
        return false;
      }

      const newLevel = skill.currentLevel + 1;
      const newSkills = { ...state.skills };
      
      // Atualizar skill
      newSkills[skillId] = {
        ...skill,
        currentLevel: newLevel,
        currentExperience: 0
      };

      // Desbloquear skills conectadas se necessário
      skill.connections.forEach(connectedId => {
        if (newSkills[connectedId] && !newSkills[connectedId].isUnlocked) {
          const connectedSkill = newSkills[connectedId];
          const isUnlocked = connectedSkill.requirements.every(reqId => 
            newSkills[reqId]?.currentLevel > 0
          );
          
          if (isUnlocked) {
            newSkills[connectedId] = {
              ...connectedSkill,
              isUnlocked: true
            };
          }
        }
      });

      set({
        skills: newSkills,
        playerResources: {
          ...state.playerResources,
          famePoints: state.playerResources.famePoints - cost
        }
      });

      console.log(`${skill.name} atualizada para nível ${newLevel}!`);
      return true;
    },

    addExperience: (skillId: string, amount: number) => {
      const state = get();
      const skill = state.skills[skillId];
      
      if (!skill || !skill.isUnlocked) {
        return { skillId, experienceGained: 0, leveledUp: false };
      }

      const newExperience = skill.currentExperience + amount;
      const experienceNeeded = state.calculateExperienceForLevel(skill.currentLevel + 1);
      
      let newLevel = skill.currentLevel;
      let leveledUp = false;
      let remainingExp = newExperience;

      // Verificar se subiu de nível
      if (newExperience >= experienceNeeded && skill.currentLevel < skill.maxLevel) {
        newLevel++;
        remainingExp = newExperience - experienceNeeded;
        leveledUp = true;
      }

      const newSkills = { ...state.skills };
      newSkills[skillId] = {
        ...skill,
        currentLevel: newLevel,
        currentExperience: remainingExp
      };

      set({ skills: newSkills });

      return { skillId, experienceGained: amount, leveledUp };
    },

    addFamePoints: (amount: number) => {
      set((state) => ({
        playerResources: {
          ...state.playerResources,
          famePoints: state.playerResources.famePoints + amount
        }
      }));
    },

    addSilver: (amount: number) => {
      set((state) => ({
        playerResources: {
          ...state.playerResources,
          silver: state.playerResources.silver + amount
        }
      }));
    },

    selectSkill: (skillId: string | null) => {
      set({ selectedSkill: skillId });
    },

    isSkillUnlocked: (skillId: string) => {
      const state = get();
      const skill = state.skills[skillId];
      if (!skill) return false;
      
      if (skill.requirements.length === 0) return true;
      
      return skill.requirements.every(reqId => {
        const reqSkill = state.skills[reqId];
        return reqSkill && reqSkill.currentLevel > 0;
      });
    },

    canUpgradeSkill: (skillId: string) => {
      const state = get();
      const skill = state.skills[skillId];
      
      if (!skill) return false;
      if (!state.isSkillUnlocked(skillId)) return false;
      if (skill.currentLevel >= skill.maxLevel) return false;
      
      return true;
    },

    getSkillCost: (skillId: string, level?: number) => {
      const skill = get().skills[skillId];
      if (!skill) return 0;
      
      const targetLevel = level || skill.currentLevel + 1;
      return Math.floor(skill.cost * Math.pow(1.1, targetLevel - 1));
    },

    calculateExperienceForLevel: (level: number) => {
      return Math.floor(100 * Math.pow(1.2, level - 1));
    },

    saveProgress: async () => {
      const state = get();
      try {
        // TODO: Implementar salvamento no backend
        console.log('Salvando progresso...', {
          skills: Object.values(state.skills).filter(s => s.currentLevel > 0),
          resources: state.playerResources
        });
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
      }
    }
  }))
);
