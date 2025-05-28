import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  place: boolean;
  cancel: boolean;
  up: boolean;
  down: boolean;
}

interface GameState {
  // Game state
  phase: "login" | "character-creation" | "playing";
  selectedBuildingType: string | null;
  placementPosition: [number, number] | null;
  placementValid: boolean;

  // UI state
  showBuildingPanel: boolean;
  showNpcPanel: boolean;
  showResourcePanel: boolean;
  showMarketWindow: boolean;
  showNpcMetrics: boolean;
  showSeedSelection: boolean;
  showSiloPanel: boolean;
  showMapEditor: boolean;
  showResearchPanel: boolean;
  showEconomyPanel: boolean;
  showEventPanel: boolean;
  selectedNpc: string | null;
  selectedBuilding: any | null;
  selectedSilo: any | null;

  // Methods
  setPhase: (phase: "login" | "character-creation" | "playing") => void;
  selectBuildingType: (type: string | null) => void;
  setPlacementPosition: (position: [number, number] | null) => void;
  setPlacementValid: (valid: boolean) => void;
  toggleBuildingPanel: () => void;
  toggleNpcPanel: () => void;
  toggleResourcePanel: () => void;
  toggleMarketWindow: () => void;
  toggleNpcMetrics: () => void;
  toggleSeedSelection: () => void;
  toggleSiloPanel: () => void;
  toggleMapEditor: () => void;
  toggleResearchPanel: () => void;
  toggleEconomyPanel: () => void;
  toggleEventPanel: () => void;
  setSelectedNpc: (npcId: string | null) => void;
  setSelectedBuilding: (building: any | null) => void;
  setSelectedSilo: (silo: any | null) => void;
  onBuildingPlaced: () => void; // Nova função para ser chamada após posicionamento
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    phase: "login",
    selectedBuildingType: null,
    placementPosition: null,
    placementValid: false,

    // UI state
    showBuildingPanel: false,
    showNpcPanel: false,
    showResourcePanel: true,
    showMarketWindow: false,
    showNpcMetrics: false,
    showSeedSelection: false,
    showSiloPanel: false,
    showMapEditor: false,
    showResearchPanel: false,
    showEconomyPanel: false,
    showEventPanel: false,
    selectedNpc: null,
    selectedBuilding: null,
    selectedSilo: null,

    // Methods
    setPhase: (phase) => set({ phase }),

    selectBuildingType: (type) => {
      set({ 
        selectedBuildingType: type,
        placementPosition: null,
        placementValid: false 
      });
    },

    setPlacementPosition: (position) => set({ placementPosition: position }),
    setPlacementValid: (valid) => set({ placementValid: valid }),

    toggleBuildingPanel: () => set((state) => ({ 
      showBuildingPanel: !state.showBuildingPanel,
      // Se estamos abrindo o painel e há uma estrutura selecionada, limpe a seleção
      selectedBuildingType: !state.showBuildingPanel ? null : state.selectedBuildingType
    })),

    toggleNpcPanel: () => set((state) => ({ showNpcPanel: !state.showNpcPanel })),
    toggleResourcePanel: () => set((state) => ({ showResourcePanel: !state.showResourcePanel })),
    toggleMarketWindow: () => set((state) => ({ showMarketWindow: !state.showMarketWindow })),
    toggleNpcMetrics: () => set((state) => ({ showNpcMetrics: !state.showNpcMetrics })),
    toggleSeedSelection: () => set((state) => ({ showSeedSelection: !state.showSeedSelection })),
    toggleSiloPanel: () => set((state) => ({ showSiloPanel: !state.showSiloPanel })),
    toggleMapEditor: () => set((state) => ({ showMapEditor: !state.showMapEditor })),
    toggleResearchPanel: () => set((state) => ({ showResearchPanel: !state.showResearchPanel })),
    toggleEconomyPanel: () => set((state) => ({ showEconomyPanel: !state.showEconomyPanel })),
    toggleEventPanel: () => set((state) => ({ showEventPanel: !state.showEventPanel })),

    setSelectedNpc: (npcId) => set({ selectedNpc: npcId }),
    setSelectedBuilding: (building) => set({ selectedBuilding: building }),
    setSelectedSilo: (silo) => set({ selectedSilo: silo }),

    // Nova função para ser chamada após o posicionamento bem-sucedido
    onBuildingPlaced: () => {
      set({ 
        selectedBuildingType: null,
        placementPosition: null,
        placementValid: false 
      });
    },
  }))
);