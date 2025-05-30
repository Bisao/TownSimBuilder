
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useNotificationStore } from '../../lib/stores/useNotificationStore';
import { usePlayerStore } from './usePlayerStore';
import { GAME_CONFIG } from '../../../../shared/constants/game';

// Types
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: SkillCategory;
  level: number;
  experience: number;
  experienceToNext: number;
  maxLevel: number;
  
  // Unlock requirements
  requirements: {
    level?: number;
    skills?: Record<string, number>;
    items?: string[];
    achievements?: string[];
  };
  
  // Effects
  effects: {
    passive?: SkillEffect[];
    active?: SkillEffect[];
  };
  
  // Metadata
  unlocked: boolean;
  learnable: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface SkillEffect {
  type: 'stat_bonus' | 'resource_bonus' | 'craft_bonus' | 'combat_bonus' | 'special';
  target: string;
  value: number;
  duration?: number; // for temporary effects
  condition?: string; // when the effect applies
}

export type SkillCategory = 
  | 'combat' 
  | 'crafting' 
  | 'gathering' 
  | 'building' 
  | 'magic' 
  | 'leadership' 
  | 'survival'
  | 'trade';

interface SkillTreeNode {
  skillId: string;
  position: [number, number];
  connections: string[]; // connected skill IDs
  tier: number;
}

interface SkillState {
  skills: Record<string, Skill>;
  skillTrees: Record<SkillCategory, SkillTreeNode[]>;
  learnedSkills: string[];
  activeSkills: string[]; // currently equipped active skills
  skillPoints: number;
  totalExperience: Record<SkillCategory, number>;
  
  // UI State
  selectedCategory: SkillCategory;
  selectedSkill: string | null;
  showSkillDetails: boolean;
}

interface SkillActions {
  // Skill Management
  learnSkill: (skillId: string) => boolean;
  upgradeSkill: (skillId: string) => boolean;
  canLearnSkill: (skillId: string) => boolean;
  canUpgradeSkill: (skillId: string) => boolean;
  
  // Experience & Points
  gainSkillExperience: (skillId: string, amount: number) => void;
  gainCategoryExperience: (category: SkillCategory, amount: number) => void;
  addSkillPoints: (amount: number) => void;
  spendSkillPoints: (amount: number) => boolean;
  
  // Active Skills
  equipActiveSkill: (skillId: string, slot: number) => boolean;
  unequipActiveSkill: (slot: number) => boolean;
  useActiveSkill: (skillId: string) => boolean;
  
  // Skill Effects
  getSkillEffects: (category?: SkillCategory) => SkillEffect[];
  getStatBonuses: () => Record<string, number>;
  applySkillEffects: () => void;
  
  // Skill Trees
  getAvailableSkills: (category: SkillCategory) => Skill[];
  getSkillPath: (skillId: string) => string[];
  isSkillUnlocked: (skillId: string) => boolean;
  
  // UI Management
  setSelectedCategory: (category: SkillCategory) => void;
  setSelectedSkill: (skillId: string | null) => void;
  toggleSkillDetails: () => void;
  
  // Utilities
  getSkillLevel: (skillId: string) => number;
  getTotalSkillPoints: () => number;
  getSkillsByCategory: (category: SkillCategory) => Skill[];
  exportSkillData: () => string;
  importSkillData: (data: string) => boolean;
  
  // State Management
  reset: () => void;
  initialize: () => void;
}

type SkillStore = SkillState & SkillActions;

// Skill definitions
const SKILL_DEFINITIONS: Record<string, Omit<Skill, 'level' | 'experience' | 'experienceToNext' | 'unlocked' | 'learnable'>> = {
  // Combat Skills
  basic_combat: {
    id: 'basic_combat',
    name: 'Combate Básico',
    description: 'Conhecimentos fundamentais de combate corpo a corpo',
    icon: 'fas fa-sword',
    category: 'combat',
    maxLevel: 10,
    requirements: {},
    effects: {
      passive: [{
        type: 'stat_bonus',
        target: 'attackPower',
        value: 2,
      }],
    },
    rarity: 'common',
  },
  
  weapon_mastery: {
    id: 'weapon_mastery',
    name: 'Maestria em Armas',
    description: 'Maior proficiência com armas de combate',
    icon: 'fas fa-crossed-swords',
    category: 'combat',
    maxLevel: 15,
    requirements: {
      skills: { basic_combat: 5 },
    },
    effects: {
      passive: [{
        type: 'combat_bonus',
        target: 'criticalChance',
        value: 0.02,
      }],
    },
    rarity: 'uncommon',
  },

  // Crafting Skills
  basic_crafting: {
    id: 'basic_crafting',
    name: 'Artesanato Básico',
    description: 'Conhecimentos básicos de criação de itens',
    icon: 'fas fa-hammer',
    category: 'crafting',
    maxLevel: 10,
    requirements: {},
    effects: {
      passive: [{
        type: 'craft_bonus',
        target: 'success_rate',
        value: 0.05,
      }],
    },
    rarity: 'common',
  },

  advanced_smithing: {
    id: 'advanced_smithing',
    name: 'Ferraria Avançada',
    description: 'Técnicas avançadas de forja de metais',
    icon: 'fas fa-anvil',
    category: 'crafting',
    maxLevel: 20,
    requirements: {
      skills: { basic_crafting: 8 },
      level: 10,
    },
    effects: {
      passive: [{
        type: 'craft_bonus',
        target: 'quality_bonus',
        value: 0.1,
      }],
    },
    rarity: 'rare',
  },

  // Gathering Skills
  resource_gathering: {
    id: 'resource_gathering',
    name: 'Coleta de Recursos',
    description: 'Maior eficiência na coleta de recursos naturais',
    icon: 'fas fa-leaf',
    category: 'gathering',
    maxLevel: 15,
    requirements: {},
    effects: {
      passive: [{
        type: 'resource_bonus',
        target: 'gathering_speed',
        value: 0.1,
      }],
    },
    rarity: 'common',
  },

  // Building Skills
  construction: {
    id: 'construction',
    name: 'Construção',
    description: 'Conhecimentos em construção de edifícios',
    icon: 'fas fa-building',
    category: 'building',
    maxLevel: 12,
    requirements: {},
    effects: {
      passive: [{
        type: 'resource_bonus',
        target: 'building_speed',
        value: 0.15,
      }],
    },
    rarity: 'common',
  },

  // Magic Skills
  basic_magic: {
    id: 'basic_magic',
    name: 'Magia Básica',
    description: 'Fundamentos das artes arcanas',
    icon: 'fas fa-magic',
    category: 'magic',
    maxLevel: 10,
    requirements: {
      level: 5,
    },
    effects: {
      passive: [{
        type: 'stat_bonus',
        target: 'magicPower',
        value: 3,
      }],
    },
    rarity: 'uncommon',
  },

  // Leadership Skills
  leadership: {
    id: 'leadership',
    name: 'Liderança',
    description: 'Capacidade de comandar e inspirar NPCs',
    icon: 'fas fa-crown',
    category: 'leadership',
    maxLevel: 8,
    requirements: {
      level: 8,
    },
    effects: {
      passive: [{
        type: 'special',
        target: 'npc_efficiency',
        value: 0.2,
      }],
    },
    rarity: 'rare',
  },
};

// Skill trees configuration
const SKILL_TREES: Record<SkillCategory, SkillTreeNode[]> = {
  combat: [
    { skillId: 'basic_combat', position: [0, 0], connections: ['weapon_mastery'], tier: 1 },
    { skillId: 'weapon_mastery', position: [1, 0], connections: [], tier: 2 },
  ],
  crafting: [
    { skillId: 'basic_crafting', position: [0, 0], connections: ['advanced_smithing'], tier: 1 },
    { skillId: 'advanced_smithing', position: [1, 0], connections: [], tier: 2 },
  ],
  gathering: [
    { skillId: 'resource_gathering', position: [0, 0], connections: [], tier: 1 },
  ],
  building: [
    { skillId: 'construction', position: [0, 0], connections: [], tier: 1 },
  ],
  magic: [
    { skillId: 'basic_magic', position: [0, 0], connections: [], tier: 1 },
  ],
  leadership: [
    { skillId: 'leadership', position: [0, 0], connections: [], tier: 1 },
  ],
  survival: [],
  trade: [],
};

// Initial state
const initialState: SkillState = {
  skills: {},
  skillTrees: SKILL_TREES,
  learnedSkills: [],
  activeSkills: [],
  skillPoints: 3,
  totalExperience: {
    combat: 0,
    crafting: 0,
    gathering: 0,
    building: 0,
    magic: 0,
    leadership: 0,
    survival: 0,
    trade: 0,
  },
  selectedCategory: 'combat',
  selectedSkill: null,
  showSkillDetails: false,
};

// Store implementation
export const useSkillStore = create<SkillStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Skill Management
    learnSkill: (skillId: string) => {
      const { skills, canLearnSkill, spendSkillPoints } = get();
      
      if (!canLearnSkill(skillId)) return false;

      const skillDef = SKILL_DEFINITIONS[skillId];
      if (!skillDef) return false;

      const skillPointCost = 1;
      if (!spendSkillPoints(skillPointCost)) return false;

      const newSkill: Skill = {
        ...skillDef,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        unlocked: true,
        learnable: true,
      };

      set((state) => ({
        skills: {
          ...state.skills,
          [skillId]: newSkill,
        },
        learnedSkills: [...state.learnedSkills, skillId],
      }));

      get().applySkillEffects();

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Habilidade aprendida!',
        message: `Você aprendeu: ${skillDef.name}`,
      });

      return true;
    },

    upgradeSkill: (skillId: string) => {
      const { skills, canUpgradeSkill, spendSkillPoints } = get();
      const skill = skills[skillId];
      
      if (!skill || !canUpgradeSkill(skillId)) return false;

      const skillPointCost = skill.level;
      if (!spendSkillPoints(skillPointCost)) return false;

      const newLevel = skill.level + 1;
      const newExperienceToNext = newLevel * 100;

      set((state) => ({
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            level: newLevel,
            experience: 0,
            experienceToNext: newExperienceToNext,
          },
        },
      }));

      get().applySkillEffects();

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Habilidade aprimorada!',
        message: `${skill.name} está agora no nível ${newLevel}`,
      });

      return true;
    },

    canLearnSkill: (skillId: string) => {
      const { skills, skillPoints, isSkillUnlocked } = get();
      
      if (skills[skillId]) return false; // Already learned
      if (skillPoints < 1) return false; // Not enough skill points
      if (!isSkillUnlocked(skillId)) return false; // Prerequisites not met

      return true;
    },

    canUpgradeSkill: (skillId: string) => {
      const { skills, skillPoints } = get();
      const skill = skills[skillId];
      
      if (!skill) return false; // Skill not learned
      if (skill.level >= skill.maxLevel) return false; // Max level reached
      if (skillPoints < skill.level) return false; // Not enough skill points

      return true;
    },

    // Experience & Points
    gainSkillExperience: (skillId: string, amount: number) => {
      const { skills } = get();
      const skill = skills[skillId];
      
      if (!skill) return;

      const newExperience = skill.experience + amount;
      let newLevel = skill.level;
      let experienceToNext = skill.experienceToNext;

      // Check for level up
      if (newExperience >= experienceToNext && newLevel < skill.maxLevel) {
        newLevel++;
        experienceToNext = newLevel * 100;
        
        // Add skill point on level up
        get().addSkillPoints(1);
        
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Habilidade evoluiu!',
          message: `${skill.name} subiu para o nível ${newLevel}`,
        });
      }

      set((state) => ({
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            level: newLevel,
            experience: newExperience >= experienceToNext ? 0 : newExperience,
            experienceToNext,
          },
        },
      }));

      if (newLevel > skill.level) {
        get().applySkillEffects();
      }
    },

    gainCategoryExperience: (category: SkillCategory, amount: number) => {
      set((state) => ({
        totalExperience: {
          ...state.totalExperience,
          [category]: state.totalExperience[category] + amount,
        },
      }));

      // Gain experience for all learned skills in this category
      const { skills } = get();
      Object.values(skills).forEach(skill => {
        if (skill.category === category) {
          get().gainSkillExperience(skill.id, Math.floor(amount * 0.1));
        }
      });
    },

    addSkillPoints: (amount: number) => {
      set((state) => ({
        skillPoints: state.skillPoints + amount,
      }));
    },

    spendSkillPoints: (amount: number) => {
      const { skillPoints } = get();
      if (skillPoints < amount) return false;

      set((state) => ({
        skillPoints: state.skillPoints - amount,
      }));

      return true;
    },

    // Active Skills
    equipActiveSkill: (skillId: string, slot: number) => {
      const { skills, activeSkills } = get();
      const skill = skills[skillId];
      
      if (!skill || !skill.effects.active) return false;

      const newActiveSkills = [...activeSkills];
      newActiveSkills[slot] = skillId;

      set({ activeSkills: newActiveSkills });
      return true;
    },

    unequipActiveSkill: (slot: number) => {
      const { activeSkills } = get();
      const newActiveSkills = [...activeSkills];
      newActiveSkills[slot] = '';

      set({ activeSkills: newActiveSkills });
      return true;
    },

    useActiveSkill: (skillId: string) => {
      const { skills } = get();
      const skill = skills[skillId];
      
      if (!skill || !skill.effects.active) return false;

      // TODO: Implement active skill usage logic
      console.log(`Using active skill: ${skill.name}`);
      return true;
    },

    // Skill Effects
    getSkillEffects: (category?: SkillCategory) => {
      const { skills } = get();
      const effects: SkillEffect[] = [];

      Object.values(skills).forEach(skill => {
        if (!category || skill.category === category) {
          if (skill.effects.passive) {
            effects.push(...skill.effects.passive.map(effect => ({
              ...effect,
              value: effect.value * skill.level,
            })));
          }
        }
      });

      return effects;
    },

    getStatBonuses: () => {
      const effects = get().getSkillEffects();
      const bonuses: Record<string, number> = {};

      effects.forEach(effect => {
        if (effect.type === 'stat_bonus') {
          bonuses[effect.target] = (bonuses[effect.target] || 0) + effect.value;
        }
      });

      return bonuses;
    },

    applySkillEffects: () => {
      const bonuses = get().getStatBonuses();
      
      // Apply stat bonuses to player
      const playerStore = usePlayerStore.getState();
      // This would typically be handled by the player store listening to skill changes
      console.log('Applying skill bonuses:', bonuses);
    },

    // Skill Trees
    getAvailableSkills: (category: SkillCategory) => {
      const { skills } = get();
      
      return Object.values(SKILL_DEFINITIONS)
        .filter(skillDef => skillDef.category === category)
        .map(skillDef => {
          const existingSkill = skills[skillDef.id];
          return existingSkill || {
            ...skillDef,
            level: 0,
            experience: 0,
            experienceToNext: 100,
            unlocked: get().isSkillUnlocked(skillDef.id),
            learnable: get().canLearnSkill(skillDef.id),
          };
        });
    },

    getSkillPath: (skillId: string) => {
      // TODO: Implement pathfinding through skill tree
      return [skillId];
    },

    isSkillUnlocked: (skillId: string) => {
      const skillDef = SKILL_DEFINITIONS[skillId];
      if (!skillDef) return false;

      const { skills } = get();
      const playerStats = usePlayerStore.getState().stats;

      // Check level requirement
      if (skillDef.requirements.level && playerStats.level < skillDef.requirements.level) {
        return false;
      }

      // Check skill requirements
      if (skillDef.requirements.skills) {
        for (const [requiredSkillId, requiredLevel] of Object.entries(skillDef.requirements.skills)) {
          const requiredSkill = skills[requiredSkillId];
          if (!requiredSkill || requiredSkill.level < requiredLevel) {
            return false;
          }
        }
      }

      // Check achievement requirements
      if (skillDef.requirements.achievements) {
        const playerAchievements = usePlayerStore.getState().achievements;
        for (const achievementId of skillDef.requirements.achievements) {
          if (!playerAchievements.includes(achievementId)) {
            return false;
          }
        }
      }

      return true;
    },

    // UI Management
    setSelectedCategory: (category: SkillCategory) => {
      set({ selectedCategory: category });
    },

    setSelectedSkill: (skillId: string | null) => {
      set({ selectedSkill: skillId });
    },

    toggleSkillDetails: () => {
      set((state) => ({
        showSkillDetails: !state.showSkillDetails,
      }));
    },

    // Utilities
    getSkillLevel: (skillId: string) => {
      const { skills } = get();
      return skills[skillId]?.level || 0;
    },

    getTotalSkillPoints: () => {
      const { skills } = get();
      return Object.values(skills).reduce((total, skill) => total + skill.level, 0);
    },

    getSkillsByCategory: (category: SkillCategory) => {
      const { skills } = get();
      return Object.values(skills).filter(skill => skill.category === category);
    },

    exportSkillData: () => {
      const { skills, learnedSkills, skillPoints, totalExperience } = get();
      return JSON.stringify({
        skills,
        learnedSkills,
        skillPoints,
        totalExperience,
      });
    },

    importSkillData: (data: string) => {
      try {
        const skillData = JSON.parse(data);
        
        set((state) => ({
          ...state,
          ...skillData,
        }));

        get().applySkillEffects();
        return true;
      } catch (error) {
        console.error('Failed to import skill data:', error);
        return false;
      }
    },

    // State Management
    reset: () => {
      set({ ...initialState });
    },

    initialize: () => {
      // Initialize with basic skills available
      const updatedSkills: Record<string, Skill> = {};
      
      Object.entries(SKILL_DEFINITIONS).forEach(([skillId, skillDef]) => {
        updatedSkills[skillId] = {
          ...skillDef,
          level: 0,
          experience: 0,
          experienceToNext: 100,
          unlocked: get().isSkillUnlocked(skillId),
          learnable: false,
        };
      });

      set({ skills: updatedSkills });
      console.log('Skill store initialized');
    },
  }))
);

// Selectors
export const useSkillSelectors = {
  getSkill: (id: string) => useSkillStore((state) => state.skills[id]),
  getSkillsByCategory: (category: SkillCategory) => useSkillStore((state) => 
    Object.values(state.skills).filter(skill => skill.category === category)
  ),
  getLearnedSkills: () => useSkillStore((state) => state.learnedSkills),
  getSkillPoints: () => useSkillStore((state) => state.skillPoints),
  getActiveSkills: () => useSkillStore((state) => state.activeSkills),
  getSelectedSkill: () => useSkillStore((state) => 
    state.selectedSkill ? state.skills[state.selectedSkill] : null
  ),
  getTotalExperience: (category: SkillCategory) => useSkillStore((state) => 
    state.totalExperience[category]
  ),
};
