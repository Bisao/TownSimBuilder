
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: number;
  requirements: string[];
  unlocks: string[];
  researched: boolean;
  category: "farming" | "mining" | "construction" | "economy";
}

interface ResearchState {
  researchPoints: number;
  technologies: Record<string, Technology>;
  completedResearch: Set<string>;
  currentResearch: string | null;
  researchProgress: number;

  // Actions
  addResearchPoints: (amount: number) => void;
  spendResearchPoints: (amount: number) => boolean;
  startResearch: (technologyId: string) => void;
  completeResearch: (technologyId: string) => void;
  canResearch: (technologyId: string) => boolean;
  getAvailableResearch: () => Technology[];
  resetResearch: () => void;
}

const DEFAULT_TECHNOLOGIES: Record<string, Technology> = {
  improved_farming: {
    id: "improved_farming",
    name: "Agricultura Melhorada",
    description: "Aumenta a produção de culturas em 25%",
    cost: 100,
    category: "farming",
    requirements: [],
    unlocks: ["irrigation"],
    researched: false
  },
  irrigation: {
    id: "irrigation",
    name: "Irrigação",
    description: "Permite cultivo em terrenos áridos",
    cost: 150,
    category: "farming",
    requirements: ["improved_farming"],
    unlocks: [],
    researched: false
  },
  advanced_materials: {
    id: "advanced_materials",
    name: "Materiais Avançados",
    description: "Reduz custo de construção em 20%",
    cost: 120,
    category: "construction",
    requirements: [],
    unlocks: ["architecture"],
    researched: false
  },
  architecture: {
    id: "architecture",
    name: "Arquitetura",
    description: "Desbloqueia novos tipos de edifícios",
    cost: 200,
    category: "construction",
    requirements: ["advanced_materials"],
    unlocks: [],
    researched: false
  },
  trade_routes: {
    id: "trade_routes",
    name: "Rotas Comerciais",
    description: "Aumenta rendimento do comércio em 30%",
    cost: 80,
    category: "economy",
    requirements: [],
    unlocks: ["banking"],
    researched: false
  },
  banking: {
    id: "banking",
    name: "Sistema Bancário",
    description: "Gera renda passiva de juros",
    cost: 250,
    category: "economy",
    requirements: ["trade_routes"],
    unlocks: [],
    researched: false
  }
};

export const useResearchStore = create<ResearchState>()(
  subscribeWithSelector((set, get) => ({
    researchPoints: 50,
    technologies: DEFAULT_TECHNOLOGIES,
    completedResearch: new Set(),
    currentResearch: null,
    researchProgress: 0,

    addResearchPoints: (amount) => set((state) => ({
      researchPoints: state.researchPoints + amount
    })),

    spendResearchPoints: (amount) => {
      const state = get();
      if (state.researchPoints >= amount) {
        set({ researchPoints: state.researchPoints - amount });
        return true;
      }
      return false;
    },

    startResearch: (technologyId) => {
      const state = get();
      const tech = state.technologies[technologyId];
      
      if (!tech || !get().canResearch(technologyId) || state.currentResearch) {
        return;
      }

      if (get().spendResearchPoints(tech.cost)) {
        set({
          currentResearch: technologyId,
          researchProgress: 0
        });
      }
    },

    completeResearch: (technologyId) => {
      const state = get();
      const tech = state.technologies[technologyId];
      
      if (!tech) return;

      set((state) => ({
        technologies: {
          ...state.technologies,
          [technologyId]: { ...tech, researched: true }
        },
        completedResearch: new Set([...state.completedResearch, technologyId]),
        currentResearch: null,
        researchProgress: 0
      }));
    },

    canResearch: (technologyId) => {
      const state = get();
      const tech = state.technologies[technologyId];
      
      if (!tech || tech.researched) return false;
      
      return tech.requirements.every(req => state.completedResearch.has(req));
    },

    getAvailableResearch: () => {
      const state = get();
      return Object.values(state.technologies).filter(tech => 
        !tech.researched && get().canResearch(tech.id)
      );
    },

    resetResearch: () => set({
      researchPoints: 50,
      technologies: DEFAULT_TECHNOLOGIES,
      completedResearch: new Set(),
      currentResearch: null,
      researchProgress: 0
    })
  }))
);
