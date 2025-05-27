import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type TerrainType = "grass" | "water" | "rock" | "sand";

export interface TerrainTile {
  x: number;
  z: number;
  type: TerrainType;
  height: number;
}

interface MapEditorState {
  isEditing: boolean;
  selectedTool: "terrain" | "height" | "resource";
  selectedTerrainType: TerrainType;
  brushSize: number;
  terrain: Record<string, TerrainTile>;

  // Actions
  setEditing: (editing: boolean) => void;
  setSelectedTool: (tool: "terrain" | "height" | "resource") => void;
  setSelectedTerrainType: (type: TerrainType) => void;
  setBrushSize: (size: number) => void;
  updateTerrain: (x: number, z: number, updates: Partial<TerrainTile>) => void;
  getTerrain: (x: number, z: number) => TerrainTile | null;
  resetTerrain: () => void;
}

export const useMapEditorStore = create<MapEditorState>()(
  subscribeWithSelector((set, get) => ({
    isEditing: false,
    selectedTool: "terrain",
    selectedTerrainType: "grass",
    brushSize: 1,
    terrain: {},

    setEditing: (editing) => set({ isEditing: editing }),

    setSelectedTool: (tool) => set({ selectedTool: tool }),

    setSelectedTerrainType: (type) => set({ selectedTerrainType: type }),

    setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(5, size)) }),

    updateTerrain: (x, z, updates) => {
      const key = `${x},${z}`;
      set((state) => ({
        terrain: {
          ...state.terrain,
          [key]: {
            x,
            z,
            type: "grass",
            height: 0,
            ...state.terrain[key],
            ...updates
          }
        }
      }));
    },

    getTerrain: (x, z) => {
      const key = `${x},${z}`;
      return get().terrain[key] || null;
    },

    resetTerrain: () => set({ terrain: {} })
  }))
);