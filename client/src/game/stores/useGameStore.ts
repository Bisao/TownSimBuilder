
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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

export type GameMode = "view" | "build";

interface ManualControlKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  sprint: boolean;
}

interface GameState {
  // Game State
  isInitialized: boolean;
  gameMode: GameMode;
  selectedBuildingType: string | null;
  buildingRotation: number;
  
  // Time System
  isPaused: boolean;
  timeSpeed: number;
  timeCycle: number; // 0-1 representing 24 hours
  realTimeStart: number;
  
  // Camera
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  
  // Manual Control
  isManualControl: boolean;
  controlledNpcId: string | null;
  manualControlKeys: ManualControlKeys;
  
  // Actions
  initialize: () => void;
  setGameMode: (mode: GameMode) => void;
  setSelectedBuildingType: (type: string | null) => void;
  setBuildingRotation: (rotation: number) => void;
  rotateBuildingCW: () => void;
  rotateBuildingCCW: () => void;
  
  // Time Controls
  pauseTime: () => void;
  resumeTime: () => void;
  increaseTimeSpeed: () => void;
  decreaseTimeSpeed: () => void;
  updateTime: (deltaTime: number) => void;
  
  // Camera Controls
  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  
  // Manual Control
  startManualControl: (npcId: string) => void;
  stopManualControl: () => void;
  updateManualControlKeys: (keys: Partial<ManualControlKeys>) => void;
}

const TIME_SPEEDS = [0.5, 1, 2, 4, 8];

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    isInitialized: false,
    gameMode: "view",
    selectedBuildingType: null,
    buildingRotation: 0,
    
    // Time System
    isPaused: false,
    timeSpeed: 1,
    timeCycle: 0.25, // Start at 6 AM
    realTimeStart: Date.now(),
    
    // Camera
    cameraPosition: [20, 20, 20],
    cameraTarget: [0, 0, 0],
    
    // Manual Control
    isManualControl: false,
    controlledNpcId: null,
    manualControlKeys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      action: false,
      sprint: false,
    },
    
    // Actions
    initialize: () => {
      console.log("Initializing game store");
      set({ 
        isInitialized: true,
        realTimeStart: Date.now(),
        timeCycle: 0.25 // 6 AM
      });
    },
    
    setGameMode: (mode) => {
      set({ gameMode: mode });
      if (mode !== "build") {
        set({ selectedBuildingType: null });
      }
    },
    
    setSelectedBuildingType: (type) => {
      set({ 
        selectedBuildingType: type,
        gameMode: type ? "build" : "view"
      });
    },
    
    setBuildingRotation: (rotation) => {
      set({ buildingRotation: rotation });
    },
    
    rotateBuildingCW: () => {
      const currentRotation = get().buildingRotation;
      set({ buildingRotation: (currentRotation + Math.PI / 2) % (Math.PI * 2) });
    },
    
    rotateBuildingCCW: () => {
      const currentRotation = get().buildingRotation;
      set({ buildingRotation: (currentRotation - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2) });
    },
    
    // Time Controls
    pauseTime: () => {
      console.log("Time paused");
      set({ isPaused: true });
    },
    
    resumeTime: () => {
      console.log("Time resumed");
      set({ isPaused: false });
    },
    
    increaseTimeSpeed: () => {
      const currentSpeed = get().timeSpeed;
      const currentIndex = TIME_SPEEDS.indexOf(currentSpeed);
      if (currentIndex < TIME_SPEEDS.length - 1) {
        const newSpeed = TIME_SPEEDS[currentIndex + 1];
        console.log(`Time speed increased to ${newSpeed}x`);
        set({ timeSpeed: newSpeed });
      }
    },
    
    decreaseTimeSpeed: () => {
      const currentSpeed = get().timeSpeed;
      const currentIndex = TIME_SPEEDS.indexOf(currentSpeed);
      if (currentIndex > 0) {
        const newSpeed = TIME_SPEEDS[currentIndex - 1];
        console.log(`Time speed decreased to ${newSpeed}x`);
        set({ timeSpeed: newSpeed });
      }
    },
    
    updateTime: (deltaTime) => {
      const { isPaused, timeSpeed, timeCycle } = get();
      if (isPaused) return;
      
      // Time progresses: 1 real second = 1 minute in game at 1x speed
      // Full day cycle (24 hours) = 24 minutes at 1x speed
      const timeIncrement = (deltaTime * timeSpeed) / (24 * 60); // Convert to cycle units
      const newTimeCycle = (timeCycle + timeIncrement) % 1;
      
      set({ timeCycle: newTimeCycle });
    },
    
    // Camera Controls
    setCameraPosition: (position) => {
      set({ cameraPosition: position });
    },
    
    setCameraTarget: (target) => {
      set({ cameraTarget: target });
    },
    
    // Manual Control
    startManualControl: (npcId) => {
      console.log(`Starting manual control for NPC: ${npcId}`);
      set({
        isManualControl: true,
        controlledNpcId: npcId,
        manualControlKeys: {
          forward: false,
          backward: false,
          left: false,
          right: false,
          action: false,
          sprint: false,
        }
      });
    },
    
    stopManualControl: () => {
      console.log("Stopping manual control");
      set({
        isManualControl: false,
        controlledNpcId: null,
        manualControlKeys: {
          forward: false,
          backward: false,
          left: false,
          right: false,
          action: false,
          sprint: false,
        }
      });
    },
    
    updateManualControlKeys: (keys) => {
      set((state) => ({
        manualControlKeys: { ...state.manualControlKeys, ...keys }
      }));
    },
  }))
);

// Auto-update time
let lastTimeUpdate = Date.now();
setInterval(() => {
  const now = Date.now();
  const deltaTime = (now - lastTimeUpdate) / 1000; // Convert to seconds
  lastTimeUpdate = now;
  
  useGameStore.getState().updateTime(deltaTime);
}, 16); // ~60 FPS
