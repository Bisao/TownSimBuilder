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
  showNpcMetrics: boolean;
  showSeedSelection: boolean;
  showSiloPanel: boolean;
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
  setIsManualControl: (manual: boolean) => void;
}

interface GameStore extends GameState {
  // UI State
  selectedBuildingType: string | null;
  isPlacingBuilding: boolean;
  selectedResource: string | null;
  showGrid: boolean;

  // Camera State
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];

  // Panel States
  panels: {
    building: boolean;
    resource: boolean;
    npc: boolean;
    research: boolean;
    inventory: boolean;
    market: boolean;
    skills: boolean;
    combat: boolean;
    economy: boolean;
  };

  // Methods
  setPaused: (paused: boolean) => void;
  setGameSpeed: (speed: number) => void;
  togglePause: () => void;

  setSelectedBuildingType: (type: string | null) => void;
  setIsPlacingBuilding: (placing: boolean) => void;
  setSelectedResource: (resource: string | null) => void;
  setShowGrid: (show: boolean) => void;

  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;

  // Panel methods
  togglePanel: (panel: keyof GameStore['panels']) => void;
  openPanel: (panel: keyof GameStore['panels']) => void;
  closePanel: (panel: keyof GameStore['panels']) => void;
  closeAllPanels: () => void;

  // Game time methods
  updateGameTime: (deltaTime: number) => void;
  resetGame: () => void;
}

import { useNotificationStore } from '../../lib/stores/useNotificationStore';
import { GAME_CONFIG } from '../../../../shared/constants/game';

export const useGameStore = create<GameStore>()(
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

    // Camera initial state
    cameraPosition: [25, 30, 25],
    cameraTarget: [25, 0, 25],
    cameraRotation: 0,

    // UI state
    showBuildingPanel: false,
    showNpcPanel: false,
    showResourcePanel: true,
    showNpcMetrics: false,
    showSeedSelection: false,
    showSiloPanel: false,
    selectedNpc: null,
    selectedBuilding: null,
    selectedSilo: null,

    // Game State
    gameSpeed: 1,
    currentTime: Date.now(),
    dayNightCycle: {
      timeOfDay: 0,
      dayLength: GAME_CONFIG.DAY_LENGTH,
    },
    weather: {
      type: 'sunny',
      intensity: 0.5,
    },

    // UI State
    selectedResource: null,
    showGrid: false,

    // Panel States
    panels: {
      building: false,
      resource: false,
      npc: false,
      research: false,
      inventory: false,
      market: false,
      skills: false,
      combat: false,
      economy: false,
    },

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
    toggleNpcMetrics: () => set((state) => ({ showNpcMetrics: !state.showNpcMetrics })),
    toggleSeedSelection: () => set((state) => ({ showSeedSelection: !state.showSeedSelection })),
    toggleSiloPanel: () => set((state) => ({ showSiloPanel: !state.showSiloPanel })),

    setSelectedNpc: (npcId) => set({ selectedNpc: npcId }),
    setSelectedBuilding: (building) => set({ selectedBuilding: building }),
    setSelectedSilo: (silo) => set({ selectedSilo: silo }),
    setControlledNpc: (npcId) => {
      console.log(`setControlledNpc called with: ${npcId}`);
      set({ 
        controlledNpcId: npcId, 
        isManualControl: npcId !== null 
      });
    },
    setIsManualControl: (manual) => set({ isManualControl: manual }),

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
    updateCameraRotation: (rotation: number) => set({ cameraRotation: rotation }),

     // Game control methods
    setPaused: (paused) => {
      set({ isPaused: paused });
      const { showInfo } = useNotificationStore.getState();
      showInfo(paused ? 'Jogo pausado' : 'Jogo retomado');
    },

    setGameSpeed: (speed) => {
      const clampedSpeed = Math.max(0.1, Math.min(speed, 5));
      set({ gameSpeed: clampedSpeed });
      const { showInfo } = useNotificationStore.getState();
      showInfo(`Velocidade: ${clampedSpeed}x`);
    },

    togglePause: () => {
      const { isPaused } = get();
      get().setPaused(!isPaused);
    },

    // Building methods
    setSelectedBuildingType: (type) => {
      set({ 
        selectedBuildingType: type,
        isPlacingBuilding: type !== null 
      });
    },

    setIsPlacingBuilding: (placing) => {
      set({ 
        isPlacingBuilding: placing,
        selectedBuildingType: placing ? get().selectedBuildingType : null
      });
    },

    setSelectedResource: (resource) => set({ selectedResource: resource }),
    setShowGrid: (show) => set({ showGrid: show }),

    // Panel methods
    togglePanel: (panel) => {
      set(state => ({
        panels: {
          ...state.panels,
          [panel]: !state.panels[panel]
        }
      }));
    },

    openPanel: (panel) => {
      set(state => ({
        panels: {
          ...state.panels,
          [panel]: true
        }
      }));
    },

    closePanel: (panel) => {
      set(state => ({
        panels: {
          ...state.panels,
          [panel]: false
        }
      }));
    },

    closeAllPanels: () => {
      set(state => ({
        panels: Object.keys(state.panels).reduce((acc, key) => {
          acc[key as keyof typeof state.panels] = false;
          return acc;
        }, {} as typeof state.panels)
      }));
    },

    // Game time methods
    updateGameTime: (deltaTime) => {
      if (get().isPaused) return;

      const { gameSpeed } = get();
      const adjustedDelta = deltaTime * gameSpeed;

      set(state => {
        const newTime = state.currentTime + adjustedDelta;
        const cycleLength = state.dayNightCycle.dayLength + GAME_CONFIG.NIGHT_LENGTH;
        const timeOfDay = (newTime % cycleLength) / cycleLength;

        return {
          currentTime: newTime,
          dayNightCycle: {
            ...state.dayNightCycle,
            timeOfDay
          }
        };
      });
    },

    resetGame: () => {
      set({
        isPaused: false,
        gameSpeed: 1,
        currentTime: Date.now(),
        selectedBuildingType: null,
        isPlacingBuilding: false,
        selectedResource: null,
        dayNightCycle: {
          timeOfDay: 0,
          dayLength: GAME_CONFIG.DAY_LENGTH,
        },
        weather: {
          type: 'sunny',
          intensity: 0.5,
        },
        panels: {
          building: false,
          resource: false,
          npc: false,
          research: false,
          inventory: false,
          market: false,
          skills: false,
          combat: false,
          economy: false,
        }
      });

      const { showSuccess } = useNotificationStore.getState();
      showSuccess('Jogo reiniciado');
    },

    // Camera methods
    setCameraPosition: (position) => set({ cameraPosition: position }),
    setCameraTarget: (target) => set({ cameraTarget: target }),
  }))
);