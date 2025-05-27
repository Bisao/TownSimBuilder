
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface Technology {
  id: string;
  name: string;
  description: string;
  cost: number; // research points needed
  unlocks: string[]; // building types or features
  prerequisites: string[]; // required tech IDs
  researched: boolean;
}

interface ResearchState {
  researchPoints: number;
  technologies: Record<string, Technology>;
  currentResearch: string | null;
  researchProgress: number;
  
  // Actions
  addResearchPoints: (amount: number) => void;
  startResearch: (techId: string) => boolean;
  updateResearch: (deltaTime: number) => void;
  canResearch: (techId: string) => boolean;
  isUnlocked: (buildingType: string) => boolean;
}

const TECHNOLOGIES: Record<string, Technology> = {
  agriculture: {
    id: "agriculture",
    name: "Agricultura Avançada",
    description: "Melhora a eficiência das fazendas",
    cost: 50,
    unlocks: ["advanced_farm"],
    prerequisites: [],
    researched: false,
  },
  mining: {
    id: "mining",
    name: "Técnicas de Mineração",
    description: "Permite construir minas mais eficientes",
    cost: 75,
    unlocks: ["advanced_mine"],
    prerequisites: [],
    researched: false,
  },
  storage: {
    id: "storage",
    name: "Sistemas de Armazenamento",
    description: "Desbloqueia silos e armazéns grandes",
    cost: 100,
    unlocks: ["large_silo"],
    prerequisites: ["agriculture"],
    researched: false,
  },
  automation: {
    id: "automation",
    name: "Automação",
    description: "NPCs trabalham mais eficientemente",
    cost: 150,
    unlocks: ["automation_bonus"],
    prerequisites: ["mining", "agriculture"],
    researched: false,
  },
};

export const useResearchStore = create<ResearchState>()(
  subscribeWithSelector((set, get) => ({
    researchPoints: 0,
    technologies: { ...TECHNOLOGIES },
    currentResearch: null,
    researchProgress: 0,

    addResearchPoints: (amount) => {
      set((state) => ({
        researchPoints: state.researchPoints + amount
      }));
    },

    startResearch: (techId) => {
      const state = get();
      const tech = state.technologies[techId];
      
      if (!tech || !state.canResearch(techId) || state.currentResearch) {
        return false;
      }

      set({
        currentResearch: techId,
        researchProgress: 0
      });

      return true;
    },

    updateResearch: (deltaTime) => {
      const state = get();
      
      if (!state.currentResearch) return;

      const tech = state.technologies[state.currentResearch];
      if (!tech) return;

      const researchSpeed = 1; // points per second
      const newProgress = state.researchProgress + deltaTime * researchSpeed;

      if (newProgress >= tech.cost) {
        // Research completed
        set((state) => ({
          technologies: {
            ...state.technologies,
            [tech.id]: { ...tech, researched: true }
          },
          currentResearch: null,
          researchProgress: 0,
          researchPoints: state.researchPoints - tech.cost
        }));

        console.log(`Research completed: ${tech.name}`);
      } else {
        set({ researchProgress: newProgress });
      }
    },

    canResearch: (techId) => {
      const state = get();
      const tech = state.technologies[techId];
      
      if (!tech || tech.researched) return false;
      
      // Check prerequisites
      for (const prereqId of tech.prerequisites) {
        const prereq = state.technologies[prereqId];
        if (!prereq || !prereq.researched) return false;
      }

      return state.researchPoints >= tech.cost;
    },

    isUnlocked: (buildingType) => {
      const state = get();
      
      // Basic buildings are always unlocked
      const basicBuildings = ["house", "farm", "bakery", "market", "silo"];
      if (basicBuildings.includes(buildingType)) return true;

      // Check if any researched technology unlocks this building
      return Object.values(state.technologies).some(
        tech => tech.researched && tech.unlocks.includes(buildingType)
      );
    },
  }))
);
