
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface Research {
  id: string;
  name: string;
  description: string;
  cost: number;
  requirements: string[];
  unlocks: string[];
  completed: boolean;
  progress: number;
}

interface ResearchState {
  researches: Record<string, Research>;
  currentResearch: string | null;
  researchPoints: number;

  // Actions
  initResearches: () => void;
  startResearch: (researchId: string) => boolean;
  updateResearch: (deltaTime: number) => void;
  completeResearch: (researchId: string) => void;
  addResearchPoints: (amount: number) => void;
  canResearch: (researchId: string) => boolean;
}

const DEFAULT_RESEARCHES: Record<string, Research> = {
  farming: {
    id: "farming",
    name: "Agricultura Avançada",
    description: "Melhora a eficiência das fazendas",
    cost: 100,
    requirements: [],
    unlocks: ["irrigation"],
    completed: false,
    progress: 0
  },
  irrigation: {
    id: "irrigation",
    name: "Sistema de Irrigação",
    description: "Fazendas crescem 50% mais rápido",
    cost: 200,
    requirements: ["farming"],
    unlocks: ["greenhouse"],
    completed: false,
    progress: 0
  },
  mining: {
    id: "mining",
    name: "Mineração Avançada",
    description: "Mineiros coletam mais recursos",
    cost: 150,
    requirements: [],
    unlocks: ["steel"],
    completed: false,
    progress: 0
  },
  steel: {
    id: "steel",
    name: "Produção de Aço",
    description: "Desbloqueia construções avançadas",
    cost: 300,
    requirements: ["mining"],
    unlocks: [],
    completed: false,
    progress: 0
  }
};

export const useResearchStore = create<ResearchState>()(
  subscribeWithSelector((set, get) => ({
    researches: {},
    currentResearch: null,
    researchPoints: 50,

    initResearches: () => {
      set({ researches: { ...DEFAULT_RESEARCHES } });
    },

    startResearch: (researchId) => {
      const state = get();
      const research = state.researches[researchId];
      
      if (!research || !state.canResearch(researchId) || state.currentResearch) {
        return false;
      }

      if (state.researchPoints < research.cost) {
        return false;
      }

      set({
        currentResearch: researchId,
        researchPoints: state.researchPoints - research.cost
      });

      return true;
    },

    updateResearch: (deltaTime) => {
      const state = get();
      if (!state.currentResearch) return;

      const research = state.researches[state.currentResearch];
      if (!research || research.completed) return;

      const newProgress = Math.min(1, research.progress + deltaTime * 0.1);
      
      set((state) => ({
        researches: {
          ...state.researches,
          [state.currentResearch!]: {
            ...research,
            progress: newProgress
          }
        }
      }));

      if (newProgress >= 1) {
        get().completeResearch(state.currentResearch);
      }
    },

    completeResearch: (researchId) => {
      const state = get();
      const research = state.researches[researchId];
      
      if (!research) return;

      set((state) => ({
        researches: {
          ...state.researches,
          [researchId]: {
            ...research,
            completed: true,
            progress: 1
          }
        },
        currentResearch: null
      }));

      console.log(`Pesquisa ${research.name} concluída!`);
    },

    addResearchPoints: (amount) => {
      set((state) => ({
        researchPoints: state.researchPoints + amount
      }));
    },

    canResearch: (researchId) => {
      const state = get();
      const research = state.researches[researchId];
      
      if (!research || research.completed) return false;

      return research.requirements.every(req => 
        state.researches[req]?.completed
      );
    }
  }))
);
