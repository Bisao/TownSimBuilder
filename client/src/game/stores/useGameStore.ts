import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Game control enum
export enum Controls {
  forward = "forward",
  backward = "backward",
  leftward = "leftward",
  rightward = "rightward",
  zoomIn = "zoomIn",
  zoomOut = "zoomOut",
  rotateCW = "rotateCW",
  rotateCCW = "rotateCCW",
  place = "place",
  cancel = "cancel",
}

// Game state types
export type GameMode = "play" | "build";
export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

interface GameState {
  // Game state
  gameMode: GameMode;
  timeOfDay: TimeOfDay;
  dayCount: number;
  timeCycle: number; // 0-1 represents a full day cycle

  // Building placement
  selectedBuildingType: string | null;
  placementPosition: [number, number] | null;
  placementValid: boolean;

  // Camera settings
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraRotation: number;

  // Actions
  setGameMode: (mode: GameMode) => void;
  selectBuilding: (buildingType: string | null) => void;
  setPlacementPosition: (position: [number, number] | null) => void;
  setPlacementValid: (valid: boolean) => void;
  updateCameraPosition: (position: [number, number, number]) => void;
  updateCameraTarget: (target: [number, number, number]) => void;
  updateCameraRotation: (rotation: number) => void;
  advanceTime: (delta: number) => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set) => ({
    // Initial state
    gameMode: "play",
    timeOfDay: "day",
    dayCount: 1,
    timeCycle: 0.3, // Start at morning

    selectedBuildingType: null,
    placementPosition: null,
    placementValid: false,

    cameraPosition: [20, 20, 20],
    cameraTarget: [0, 0, 0],
    cameraRotation: 0,

    // Actions
    setGameMode: (mode) => set({ gameMode: mode }),

    selectBuilding: (buildingType) => set({
      selectedBuildingType: buildingType,
      gameMode: buildingType ? "build" : "play",
    }),

    setPlacementPosition: (position) => set({ placementPosition: position }),

    setPlacementValid: (valid) => set({ placementValid: valid }),

    updateCameraPosition: (position) => set({ cameraPosition: position }),

    updateCameraTarget: (target) => set({ cameraTarget: target }),

    updateCameraRotation: (rotation) => set({ cameraRotation: rotation }),

    advanceTime: (delta) => set((state) => {
      // Cálculo para 24 horas de jogo = 120 minutos de tempo real
      // 24 horas = 1440 minutos de jogo
      // 120 minutos = 7200 segundos de tempo real
      // Proporção: 1440/7200 = 0.2 minutos de jogo por segundo real

      // Converter delta (segundos) para fração do ciclo de jogo
      // Ciclo mais lento: 120 minutos (7200 segundos) para um dia completo
      const cyclePerSecond = 1 / 7200; // 120 minutos por ciclo completo
      const newTimeCycle = (state.timeCycle + delta * cyclePerSecond) % 1;

      // Determine time of day based on realistic hours
      // 6h-8h: amanhecer, 8h-18h: dia, 18h-19h: entardecer, 19h-6h: noite
      let timeOfDay: TimeOfDay = state.timeOfDay;
      const hours = newTimeCycle * 24;
      
      if (hours >= 6 && hours < 8) timeOfDay = "dawn"; // 6h-8h: amanhecer
      else if (hours >= 8 && hours < 18) timeOfDay = "day"; // 8h-18h: dia
      else if (hours >= 18 && hours < 19) timeOfDay = "dusk"; // 18h-19h: entardecer  
      else timeOfDay = "night"; // 19h-6h: noite

      // Increment day count when cycling from night to dawn
      const newDayCount = 
        state.timeOfDay === "night" && timeOfDay === "dawn"
          ? state.dayCount + 1
          : state.dayCount;

      return { timeCycle: newTimeCycle, timeOfDay, dayCount: newDayCount };
    }),
  }))
);