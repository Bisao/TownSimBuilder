import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GRID_CONFIG } from "../constants/grid";

export type EditorTool = "select" | "terrain_height" | "terrain_paint" | "water" | "road" | "eraser";
export type TerrainType = "grass" | "dirt" | "sand" | "stone" | "water";

export interface TerrainTile {
  x: number;
  z: number;
  type: TerrainType;
  height: number;
}

interface MapEditorState {
  isEditorMode: boolean;
  selectedTool: EditorTool;
  selectedTerrainType: TerrainType;
  brushSize: number;
  brushStrength: number;
  gridSize: number;
  maxHeight: number;
  showGrid: boolean;
  terrain: Record<string, TerrainTile>;

  // Actions
  setEditorMode: (editing: boolean) => void;
  setSelectedTool: (tool: EditorTool) => void;
  setSelectedTerrainType: (type: TerrainType) => void;
  setBrushSize: (size: number) => void;
  setBrushStrength: (strength: number) => void;
  setGridSize: (size: number) => void;
  setMaxHeight: (height: number) => void;
  setShowGrid: (show: boolean) => void;
  updateTerrain: (x: number, z: number, updates: Partial<TerrainTile>) => void;
  getTerrain: (x: number, z: number) => TerrainTile | null;
  clearTerrain: () => void;
  exportMap: () => string;
  importMap: (data: string) => void;
}

export const useMapEditorStore = create<MapEditorState>()(
  subscribeWithSelector((set, get) => ({
    isEditorMode: false,
    selectedTool: "select",
    selectedTerrainType: "grass",
    brushSize: 1,
    brushStrength: 0.5,
    gridSize: GRID_CONFIG.DEFAULT_SIZE,
    maxHeight: 10,
    showGrid: true,
    terrain: {},

    setEditorMode: (editing) => set({ isEditorMode: editing }),

    setSelectedTool: (tool) => set({ selectedTool: tool }),

    setSelectedTerrainType: (type) => set({ selectedTerrainType: type }),

    setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(10, size)) }),

    setBrushStrength: (strength) => set({ brushStrength: Math.max(0.01, Math.min(1, strength)) }),

    setGridSize: (size) => set({ gridSize: Math.max(GRID_CONFIG.EDITOR_MIN_SIZE, Math.min(GRID_CONFIG.EDITOR_MAX_SIZE, size)) }),

    setMaxHeight: (height) => set({ maxHeight: Math.max(1, Math.min(50, height)) }),

    setShowGrid: (show) => set({ showGrid: show }),

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

    clearTerrain: () => set({ terrain: {} }),

    exportMap: () => {
      const state = get();
      return JSON.stringify({
        terrain: state.terrain,
        gridSize: state.gridSize,
        maxHeight: state.maxHeight
      });
    },

    importMap: (data) => {
      try {
        const parsed = JSON.parse(data);
        set({
          terrain: parsed.terrain || {},
          gridSize: parsed.gridSize || 50,
          maxHeight: parsed.maxHeight || 10
        });
      } catch (error) {
        console.error("Erro ao importar mapa:", error);
      }
    }
  }))
);