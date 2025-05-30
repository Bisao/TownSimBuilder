
import { GAME_CONFIG } from "../../../shared/constants/game";

// Grid configuration
export const GRID_CONFIG = {
  SIZE: GAME_CONFIG.GRID_SIZE,
  TILE_SIZE: GAME_CONFIG.TILE_SIZE,
  TOTAL_TILES: GAME_CONFIG.GRID_SIZE * GAME_CONFIG.GRID_SIZE,
  
  // Visual settings
  LINE_COLOR: '#3A3A3A',
  LINE_OPACITY: 0.3,
  LINE_WIDTH: 0.02,
  HIGHLIGHT_COLOR: '#00FF00',
  INVALID_COLOR: '#FF0000',
  
  // Grid boundaries
  MIN_X: 0,
  MAX_X: GAME_CONFIG.GRID_SIZE - 1,
  MIN_Z: 0,
  MAX_Z: GAME_CONFIG.GRID_SIZE - 1,
  
  // Subdivision settings
  CHUNK_SIZE: 10, // 10x10 chunks for optimization
  CHUNKS_PER_AXIS: Math.ceil(GAME_CONFIG.GRID_SIZE / 10),
} as const;

// Grid utility functions
export const isValidGridPosition = (x: number, z: number): boolean => {
  return x >= GRID_CONFIG.MIN_X && 
         x <= GRID_CONFIG.MAX_X && 
         z >= GRID_CONFIG.MIN_Z && 
         z <= GRID_CONFIG.MAX_Z;
};

export const worldToGrid = (worldX: number, worldZ: number): [number, number] => {
  return [
    Math.floor(worldX / GRID_CONFIG.TILE_SIZE),
    Math.floor(worldZ / GRID_CONFIG.TILE_SIZE)
  ];
};

export const gridToWorld = (gridX: number, gridZ: number): [number, number] => {
  return [
    gridX * GRID_CONFIG.TILE_SIZE + GRID_CONFIG.TILE_SIZE / 2,
    gridZ * GRID_CONFIG.TILE_SIZE + GRID_CONFIG.TILE_SIZE / 2
  ];
};

export const getChunkIndex = (gridX: number, gridZ: number): [number, number] => {
  return [
    Math.floor(gridX / GRID_CONFIG.CHUNK_SIZE),
    Math.floor(gridZ / GRID_CONFIG.CHUNK_SIZE)
  ];
};

export const getGridIndex = (x: number, z: number): number => {
  if (!isValidGridPosition(x, z)) return -1;
  return z * GRID_CONFIG.SIZE + x;
};

export const indexToGrid = (index: number): [number, number] => {
  const z = Math.floor(index / GRID_CONFIG.SIZE);
  const x = index % GRID_CONFIG.SIZE;
  return [x, z];
};

export const getNeighbors = (x: number, z: number, range: number = 1): Array<[number, number]> => {
  const neighbors: Array<[number, number]> = [];
  
  for (let dx = -range; dx <= range; dx++) {
    for (let dz = -range; dz <= range; dz++) {
      if (dx === 0 && dz === 0) continue; // Skip self
      
      const nx = x + dx;
      const nz = z + dz;
      
      if (isValidGridPosition(nx, nz)) {
        neighbors.push([nx, nz]);
      }
    }
  }
  
  return neighbors;
};

export const getAdjacentTiles = (x: number, z: number): Array<[number, number]> => {
  const adjacent: Array<[number, number]> = [];
  const directions = [
    [0, 1],   // North
    [1, 0],   // East
    [0, -1],  // South
    [-1, 0],  // West
  ];
  
  for (const [dx, dz] of directions) {
    const nx = x + dx;
    const nz = z + dz;
    
    if (isValidGridPosition(nx, nz)) {
      adjacent.push([nx, nz]);
    }
  }
  
  return adjacent;
};

export const getDiagonalTiles = (x: number, z: number): Array<[number, number]> => {
  const diagonal: Array<[number, number]> = [];
  const directions = [
    [1, 1],   // Northeast
    [1, -1],  // Southeast
    [-1, -1], // Southwest
    [-1, 1],  // Northwest
  ];
  
  for (const [dx, dz] of directions) {
    const nx = x + dx;
    const nz = z + dz;
    
    if (isValidGridPosition(nx, nz)) {
      diagonal.push([nx, nz]);
    }
  }
  
  return diagonal;
};

export const calculateDistance = (x1: number, z1: number, x2: number, z2: number): number => {
  const dx = x2 - x1;
  const dz = z2 - z1;
  return Math.sqrt(dx * dx + dz * dz);
};

export const calculateManhattanDistance = (x1: number, z1: number, x2: number, z2: number): number => {
  return Math.abs(x2 - x1) + Math.abs(z2 - z1);
};

export const isWithinRange = (x1: number, z1: number, x2: number, z2: number, range: number): boolean => {
  return calculateDistance(x1, z1, x2, z2) <= range;
};

export const getTilesInRadius = (centerX: number, centerZ: number, radius: number): Array<[number, number]> => {
  const tiles: Array<[number, number]> = [];
  const radiusSquared = radius * radius;
  
  const minX = Math.max(GRID_CONFIG.MIN_X, centerX - Math.ceil(radius));
  const maxX = Math.min(GRID_CONFIG.MAX_X, centerX + Math.ceil(radius));
  const minZ = Math.max(GRID_CONFIG.MIN_Z, centerZ - Math.ceil(radius));
  const maxZ = Math.min(GRID_CONFIG.MAX_Z, centerZ + Math.ceil(radius));
  
  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      const distanceSquared = (x - centerX) ** 2 + (z - centerZ) ** 2;
      if (distanceSquared <= radiusSquared) {
        tiles.push([x, z]);
      }
    }
  }
  
  return tiles;
};

export const getRandomGridPosition = (): [number, number] => {
  return [
    Math.floor(Math.random() * GRID_CONFIG.SIZE),
    Math.floor(Math.random() * GRID_CONFIG.SIZE)
  ];
};

export const getRandomEmptyPosition = (occupiedPositions: Set<string>): [number, number] | null => {
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const [x, z] = getRandomGridPosition();
    const key = `${x},${z}`;
    
    if (!occupiedPositions.has(key)) {
      return [x, z];
    }
    
    attempts++;
  }
  
  return null; // No empty position found
};

// Grid area calculations
export const getRectangleArea = (x1: number, z1: number, x2: number, z2: number): Array<[number, number]> => {
  const tiles: Array<[number, number]> = [];
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minZ = Math.min(z1, z2);
  const maxZ = Math.max(z1, z2);
  
  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      if (isValidGridPosition(x, z)) {
        tiles.push([x, z]);
      }
    }
  }
  
  return tiles;
};

// Pathfinding helpers
export const getPathfindingNeighbors = (x: number, z: number, allowDiagonal: boolean = true): Array<[number, number]> => {
  const neighbors = getAdjacentTiles(x, z);
  
  if (allowDiagonal) {
    neighbors.push(...getDiagonalTiles(x, z));
  }
  
  return neighbors;
};

// Grid serialization
export const serializePosition = (x: number, z: number): string => {
  return `${x},${z}`;
};

export const deserializePosition = (positionString: string): [number, number] => {
  const [x, z] = positionString.split(',').map(Number);
  return [x, z];
};

// Export for legacy compatibility
export const GRID_SIZE = GRID_CONFIG.SIZE;
export const TILE_SIZE = GRID_CONFIG.TILE_SIZE;
