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
  pauseTime = "pauseTime",
  increaseTimeSpeed = "increaseTimeSpeed",
  decreaseTimeSpeed = "decreaseTimeSpeed",
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

  // Time control
  timeSpeed: number; // Multiplicador de velocidade (0 = pausado, 1 = normal, 2 = 2x, etc.)
  isPaused: boolean;

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
  pauseTime: () => void;
  resumeTime: () => void;
  setTimeSpeed: (speed: number) => void;
  increaseTimeSpeed: () => void;
  decreaseTimeSpeed: () => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set) => ({
    // Initial state
    gameMode: "play",
    timeOfDay: "day",
    dayCount: 1,
    timeCycle: 0.3, // Start at morning

    // Time control
    timeSpeed: 1,
    isPaused: false,

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
      // Se o jogo estiver pausado, não avançar o tempo
      if (state.isPaused) return {};

      // Aplicar multiplicador de velocidade
      const adjustedDelta = delta * state.timeSpeed;

      // Cálculo para 24 horas de jogo = 720 minutos de tempo real
      // 24 horas = 1440 minutos de jogo
      // 720 minutos = 43200 segundos de tempo real
      // Proporção: 1440/43200 = 0.0333 minutos de jogo por segundo real

      // Converter delta (segundos) para fração do ciclo de jogo
      // Ciclo de 720 minutos (43200 segundos) para um dia completo
      const cyclePerSecond = 1 / 43200; // 720 minutos por ciclo completo
      const newTimeCycle = (state.timeCycle + adjustedDelta * cyclePerSecond) % 1;

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

    pauseTime: () => set({ isPaused: true }),

    resumeTime: () => set({ isPaused: false }),

    setTimeSpeed: (speed) => set({ timeSpeed: Math.max(0, speed) }),

    increaseTimeSpeed: () => set((state) => {
      const speeds = [0.25, 0.5, 1, 2, 4, 8, 16];
      const currentIndex = speeds.indexOf(state.timeSpeed);
      const nextIndex = Math.min(currentIndex + 1, speeds.length - 1);
      return { timeSpeed: speeds[nextIndex] };
    }),

    decreaseTimeSpeed: () => set((state) => {
      const speeds = [0.25, 0.5, 1, 2, 4, 8, 16];
      const currentIndex = speeds.indexOf(state.timeSpeed);
      const nextIndex = Math.max(currentIndex - 1, 0);
      return { timeSpeed: speeds[nextIndex] };
    }),
  }))
);