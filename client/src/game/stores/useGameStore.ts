import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Controls } from "../types/controls";

export interface GameState {
  // Game state
  phase: "login" | "character-creation" | "playing";
  selectedBuildingType: string | null;
  isInitialized: boolean;

  // Time system
  isPaused: boolean;
  timeSpeed: number;
  timeCycle: number;

  // Game modes
  gameMode: "build" | "view";
  isManualControl: boolean;
  controlledNpcId: string | null;
  placementPosition: [number, number] | null;
  placementValid: boolean;

  // Camera state
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraRotation: number;

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
  initialize: () => void;
  setPhase: (phase: "login" | "character-creation" | "playing") => void;
  selectBuildingType: (type: string | null) => void;
  setPlacementPosition: (position: [number, number] | null) => void;
  setPlacementValid: (valid: boolean) => void;

  // Time control methods
  pauseTime: () => void;
  resumeTime: () => void;
  increaseTimeSpeed: () => void;
  decreaseTimeSpeed: () => void;
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

  // Camera methods
  updateCameraPosition: (position: [number, number, number]) => void;
  updateCameraTarget: (target: [number, number, number]) => void;
  updateCameraRotation: (rotation: number) => void;

  setControlledNpc: (npcId: string | null) => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    phase: "login",
    selectedBuildingType: null,
    isInitialized: false,
    placementPosition: null,
    placementValid: false,

    // Time system initial state
    isPaused: false,
    timeSpeed: 1.0,
    timeCycle: 0.25, // Start at 6 AM (0.25 of the day)

    // Game modes initial state
    gameMode: "build",
    isManualControl: false,
    controlledNpcId: null,
    controlledNpcId: null,

    // Camera initial state
    cameraPosition: [0, 10, 10],
    cameraTarget: [0, 0, 0],
    cameraRotation: 0,

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
    initialize: () => {
      console.log("Initializing game store");
      set({ isInitialized: true });
    },

    setPhase: (phase) => set({ phase }),

    // Time control methods
    pauseTime: () => set({ isPaused: true }),
    resumeTime: () => set({ isPaused: false }),
    increaseTimeSpeed: () => set((state) => ({ 
      timeSpeed: Math.min(state.timeSpeed * 2, 8) 
    })),
    decreaseTimeSpeed: () => set((state) => ({ 
      timeSpeed: Math.max(state.timeSpeed / 2, 0.25) 
    })),

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
    setControlledNpc: (npcId) => set({ controlledNpcId: npcId, isManualControl: npcId !== null }),

    // Nova função para ser chamada após o posicionamento bem-sucedido
    onBuildingPlaced: () => {
      set({ 
        selectedBuildingType: null,
        placementPosition: null,
        placementValid: false 
      });
    },

    // Camera methods
    updateCameraPosition: (position) => set({ cameraPosition: position }),
    updateCameraTarget: (target) => set({ cameraTarget: target }),
    updateCameraRotation: (rotation) => set({ cameraRotation: rotation }),
  }))
);