` tags.

```python
# Applying the requested changes to the code.
<replit_final_file>
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
  researchCategories: Record<string, Technology[]>;
  completedResearch: Set<string>;
  currentResearch: string | null;
  researchProgress: number;

  // Actions
  addResearchPoints: (amount: number) => void;
  spendResearchPoints: (amount: number) => boolean;
  startResearch: (technologyId: string) => void;
  completeResearch: (technologyId: string) => void;
  getAvailableResearch: () => Technology[];
  resetResearch: () => void;
}

const DEFAULT_RESEARCH_CATEGORIES: Record<string, Technology[]> = {
  agriculture: [
    {
      id: "improved_farming",
      name: "Agricultura Melhorada",
      description: "Aumenta a produção de culturas em 25%",
      cost: 100,
      category: "agriculture",
      prerequisites: [],
      effects: { farmingEfficiency: 1.25 }
    },
    {
      id: "irrigation",
      name: "Irrigação",
      description: "Permite cultivo em terrenos áridos",
      cost: 150,
      category: "agriculture",
      prerequisites: ["improved_farming"],
      effects: { allowAridFarming: true }
    }
  ],
  construction: [
    {
      id: "advanced_materials",
      name: "Materiais Avançados",
      description: "Reduz custo de construção em 20%",
      cost: 120,
      category: "construction",
      prerequisites: [],
      effects: { buildingCostReduction: 0.8 }
    },
    {
      id: "architecture",
      name: "Arquitetura",
      description: "Desbloqueia novos tipos de edifícios",
      cost: 200,
      category: "construction",
      prerequisites: ["advanced_materials"],
      effects: { newBuildings: ["tower", "bridge"] }
    }
  ],
  economy: [
    {
      id: "trade_routes",
      name: "Rotas Comerciais",
      description: "Aumenta rendimento do comércio em 30%",
      cost: 80,
      category: "economy",
      prerequisites: [],
      effects: { tradeIncomeMultiplier: 1.3 }
    },
    {
      id: "banking",
      name: "Sistema Bancário",
      description: "Gera renda passiva de juros",
      cost: 250,
      category: "economy",
      prerequisites: ["trade_routes"],
      effects: { passiveIncome: 10 }
    }
  ]
};

export const useResearchStore = create<ResearchState>()(
  subscribeWithSelector((set, get) => ({
    researchPoints: 50,
    researchCategories: DEFAULT_RESEARCH_CATEGORIES,
    completedResearch: new Set(),
    currentResearch: null,
    researchProgress: 0,

    // Actions
    addResearchPoints: (amount: number) => void,
    spendResearchPoints: (amount: number) => boolean,
    startResearch: (technologyId: string) => void,
    completeResearch: (technologyId: string) => void,
    getAvailableResearch: () => Technology[];
    resetResearch: () => void
  }))
);