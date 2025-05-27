
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type EditorTool = 
  | "select" 
  | "terrain_height" 
  | "terrain_paint" 
  | "grid_size" 
  | "water" 
  | "road" 
  | "eraser";

export type TerrainType = "grass" | "dirt" | "sand" | "stone" | "water";

export interface TerrainTile {
  x: number;
  z: number;
  height: number;
  type: TerrainType;
  color?: string;
}

interface MapEditorState {
  // Editor state
  isEditorMode: boolean;
  selectedTool: EditorTool;
  brushSize: number;
  brushStrength: number;
  
  // Map properties
  gridSize: number;
  maxHeight: number;
  showGrid: boolean;
  
  // Terrain data
  terrainTiles: Map<string, TerrainTile>;
  
  // Paint settings
  selectedTerrainType: TerrainType;
  
  // Actions
  setEditorMode: (enabled: boolean) => void;
  setSelectedTool: (tool: EditorTool) => void;
  setBrushSize: (size: number) => void;
  setBrushStrength: (strength: number) => void;
  setGridSize: (size: number) => void;
  setMaxHeight: (height: number) => void;
  setShowGrid: (show: boolean) => void;
  setSelectedTerrainType: (type: TerrainType) => void;
  
  // Terrain manipulation
  updateTerrainTile: (x: number, z: number, updates: Partial<TerrainTile>) => void;
  getTerrainTile: (x: number, z: number) => TerrainTile | undefined;
  clearTerrain: () => void;
  
  // Save/Load
  exportMap: () => string;
  importMap: (data: string) => void;
}

export const useMapEditorStore = create<MapEditorState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isEditorMode: false,
    selectedTool: "select",
    brushSize: 1,
    brushStrength: 0.1,
    
    gridSize: 50,
    maxHeight: 10,
    showGrid: true,
    
    terrainTiles: new Map(),
    selectedTerrainType: "grass",
    
    // Actions
    setEditorMode: (enabled) => set({ isEditorMode: enabled }),
    setSelectedTool: (tool) => set({ selectedTool: tool }),
    setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(10, size)) }),
    setBrushStrength: (strength) => set({ brushStrength: Math.max(0.01, Math.min(1, strength)) }),
    setGridSize: (size) => set({ gridSize: Math.max(10, Math.min(200, size)) }),
    setMaxHeight: (height) => set({ maxHeight: Math.max(1, Math.min(50, height)) }),
    setShowGrid: (show) => set({ showGrid: show }),
    setSelectedTerrainType: (type) => set({ selectedTerrainType: type }),
    
    // Terrain manipulation
    updateTerrainTile: (x, z, updates) => set((state) => {
      const key = `${x},${z}`;
      const existingTile = state.terrainTiles.get(key);
      const newTile: TerrainTile = {
        x,
        z,
        height: 0,
        type: "grass",
        ...existingTile,
        ...updates,
      };
      
      const newMap = new Map(state.terrainTiles);
      newMap.set(key, newTile);
      
      return { terrainTiles: newMap };
    }),
    
    getTerrainTile: (x, z) => {
      const key = `${x},${z}`;
      return get().terrainTiles.get(key);
    },
    
    clearTerrain: () => set({ terrainTiles: new Map() }),
    
    // Save/Load
    exportMap: () => {
      const state = get();
      const mapData = {
        gridSize: state.gridSize,
        maxHeight: state.maxHeight,
        terrainTiles: Array.from(state.terrainTiles.entries()),
      };
      return JSON.stringify(mapData, null, 2);
    },
    
    importMap: (data) => {
      try {
        const mapData = JSON.parse(data);
        const terrainMap = new Map(mapData.terrainTiles || []);
        set({
          gridSize: mapData.gridSize || 50,
          maxHeight: mapData.maxHeight || 10,
          terrainTiles: terrainMap,
        });
      } catch (error) {
        console.error("Erro ao importar mapa:", error);
      }
    },
  }))
);
