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
  technologies: Record<string, Technology>;
  researchPoints: number;
  pointsPerSecond: number;

  // Actions
  researchTechnology: (id: string) => boolean;
  addResearchPoints: (points: number) => void;
  canResearch: (id: string) => boolean;
  getAvailableTechnologies: () => Technology[];
}

export const useResearchStore = create<ResearchState>()(
  subscribeWithSelector((set, get) => ({
    researchPoints: 50,
    pointsPerSecond: 1,

    technologies: {
      "advanced_farming": {
        id: "advanced_farming",
        name: "Agricultura Avançada",
        description: "Aumenta a produção de fazendas em 25%",
        cost: 100,
        requirements: [],
        unlocks: ["irrigation"],
        researched: false,
        category: "farming"
      },
      "irrigation": {
        id: "irrigation",
        name: "Irrigação",
        description: "Permite fazendas produzirem em terrenos secos",
        cost: 150,
        requirements: ["advanced_farming"],
        unlocks: ["greenhouse"],
        researched: false,
        category: "farming"
      },
      "improved_tools": {
        id: "improved_tools",
        name: "Ferramentas Melhoradas",
        description: "NPCs trabalham 20% mais rápido",
        cost: 75,
        requirements: [],
        unlocks: ["advanced_tools"],
        researched: false,
        category: "mining"
      },
      "stone_masonry": {
        id: "stone_masonry",
        name: "Alvenaria",
        description: "Desbloqueia construções de pedra",
        cost: 120,
        requirements: [],
        unlocks: ["reinforced_buildings"],
        researched: false,
        category: "construction"
      },
      "market_expansion": {
        id: "market_expansion",
        name: "Expansão do Mercado",
        description: "Aumenta preços de venda em 15%",
        cost: 90,
        requirements: [],
        unloks: ["trade_routes"],
        researched: false,
        category: "economy"
      }
    },

    // Actions
    researchTechnology: (id) => {
      const state = get();
      const tech = state.technologies[id];

      if (!tech || tech.researched || !state.canResearch(id) || state.researchPoints < tech.cost) {
        return false;
      }

      set((state) => ({
        researchPoints: state.researchPoints - tech.cost,
        technologies: {
          ...state.technologies,
          [id]: { ...tech, researched: true }
        }
      }));

      return true;
    },

    addResearchPoints: (points) => set((state) => ({
      researchPoints: state.researchPoints + points
    })),

    canResearch: (id) => {
      const state = get();
      const tech = state.technologies[id];

      if (!tech || tech.researched) return false;

      return tech.requirements.every(reqId => 
        state.technologies[reqId]?.researched || false
      );
    },

    getAvailableTechnologies: () => {
      const state = get();
      return Object.values(state.technologies).filter(tech => 
        !tech.researched && state.canResearch(tech.id)
      );
    }
  }))
);