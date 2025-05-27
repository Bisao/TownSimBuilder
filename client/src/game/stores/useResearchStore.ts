
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface Technology {
  id: string;
  name: string;
  description: string;
  cost: number;
  researchTime: number; // in seconds
  requirements: string[]; // other tech IDs
  unlocks: string[]; // building/npc types
}

interface ResearchState {
  availableTech: Technology[];
  researchedTech: string[];
  currentResearch: string | null;
  researchProgress: number;
  researchPoints: number;
  
  // Actions
  startResearch: (techId: string) => boolean;
  updateResearch: (deltaTime: number) => void;
  addResearchPoints: (points: number) => void;
  isTechUnlocked: (techId: string) => boolean;
  canResearch: (techId: string) => boolean;
}

const TECHNOLOGIES: Technology[] = [
  {
    id: "advanced_farming",
    name: "Agricultura Avançada",
    description: "Melhora a eficiência das fazendas em 50%",
    cost: 100,
    researchTime: 120, // 2 minutes
    requirements: [],
    unlocks: ["greenhouse"]
  },
  {
    id: "mining_tools",
    name: "Ferramentas de Mineração",
    description: "Mineradores trabalham 25% mais rápido",
    cost: 150,
    researchTime: 180,
    requirements: [],
    unlocks: ["deep_mine"]
  },
  {
    id: "education",
    name: "Educação",
    description: "Desbloqueia escolas e aumenta felicidade",
    cost: 200,
    researchTime: 240,
    requirements: [],
    unlocks: ["school", "university"]
  },
  {
    id: "medicine",
    name: "Medicina",
    description: "Desbloqueia hospitais e melhora saúde dos NPCs",
    cost: 300,
    researchTime: 300,
    requirements: ["education"],
    unlocks: ["hospital", "clinic"]
  }
];

export const useResearchStore = create<ResearchState>()(
  subscribeWithSelector((set, get) => ({
    availableTech: TECHNOLOGIES,
    researchedTech: [],
    currentResearch: null,
    researchProgress: 0,
    researchPoints: 50,

    startResearch: (techId) => {
      const state = get();
      const tech = state.availableTech.find(t => t.id === techId);
      
      if (!tech || !state.canResearch(techId) || state.researchPoints < tech.cost) {
        return false;
      }

      set({
        currentResearch: techId,
        researchProgress: 0,
        researchPoints: state.researchPoints - tech.cost
      });
      
      return true;
    },

    updateResearch: (deltaTime) => {
      const state = get();
      if (!state.currentResearch) return;

      const tech = state.availableTech.find(t => t.id === state.currentResearch);
      if (!tech) return;

      const newProgress = state.researchProgress + deltaTime;

      if (newProgress >= tech.researchTime) {
        // Research completed
        set({
          researchedTech: [...state.researchedTech, tech.id],
          currentResearch: null,
          researchProgress: 0
        });
        
        console.log(`Research completed: ${tech.name}`);
      } else {
        set({ researchProgress: newProgress });
      }
    },

    addResearchPoints: (points) => {
      set((state) => ({
        researchPoints: state.researchPoints + points
      }));
    },

    isTechUnlocked: (techId) => {
      return get().researchedTech.includes(techId);
    },

    canResearch: (techId) => {
      const state = get();
      const tech = state.availableTech.find(t => t.id === techId);
      
      if (!tech || state.researchedTech.includes(techId)) {
        return false;
      }

      return tech.requirements.every(req => state.researchedTech.includes(req));
    }
  }))
);
