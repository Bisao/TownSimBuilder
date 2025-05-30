
import { Position, Vector3 } from '../types';
import { GAME_CONFIG } from '../constants/game';

// Position and Distance Utilities
export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateDistance3D(pos1: Vector3, pos2: Vector3): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function isPositionValid(position: Position): boolean {
  return (
    position.x >= 0 &&
    position.x < GAME_CONFIG.GRID_SIZE &&
    position.y >= 0 &&
    position.y < GAME_CONFIG.GRID_SIZE
  );
}

export function snapToGrid(position: Position): Position {
  return {
    x: Math.round(position.x),
    y: Math.round(position.y),
  };
}

export function getAdjacentPositions(position: Position): Position[] {
  const adjacent: Position[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const newPos = { x: position.x + dx, y: position.y + dy };
      if (isPositionValid(newPos)) {
        adjacent.push(newPos);
      }
    }
  }
  return adjacent;
}

// Time Utilities
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getCurrentDayTime(): number {
  const totalCycleTime = GAME_CONFIG.DAY_LENGTH + GAME_CONFIG.NIGHT_LENGTH;
  const currentTime = Date.now() % totalCycleTime;
  return currentTime / totalCycleTime;
}

export function isDayTime(): boolean {
  const dayTime = getCurrentDayTime();
  return dayTime < (GAME_CONFIG.DAY_LENGTH / (GAME_CONFIG.DAY_LENGTH + GAME_CONFIG.NIGHT_LENGTH));
}

// Resource Utilities
export function formatResourceAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

export function calculateResourceValue(resources: Record<string, number>, prices: Record<string, number>): number {
  return Object.entries(resources).reduce((total, [type, amount]) => {
    return total + (amount * (prices[type] || 0));
  }, 0);
}

// Math Utilities
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

// ID Generation
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`;
}

// Validation Utilities
export function isValidResourceType(type: string, validTypes: string[]): boolean {
  return validTypes.includes(type);
}

export function hasRequiredResources(
  available: Record<string, number>,
  required: Record<string, number>
): boolean {
  return Object.entries(required).every(([type, amount]) => {
    return (available[type] || 0) >= amount;
  });
}

// Array Utilities
export function removeFromArray<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Pathfinding Utilities
export function findPath(start: Position, end: Position, obstacles: Position[]): Position[] {
  // Simple A* pathfinding implementation
  const openSet: Position[] = [start];
  const closedSet: Position[] = [];
  const cameFrom = new Map<string, Position>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const getKey = (pos: Position) => `${pos.x},${pos.y}`;
  const heuristic = (a: Position, b: Position) => calculateDistance(a, b);

  gScore.set(getKey(start), 0);
  fScore.set(getKey(start), heuristic(start, end));

  while (openSet.length > 0) {
    const current = openSet.reduce((lowest, pos) => {
      const currentF = fScore.get(getKey(pos)) || Infinity;
      const lowestF = fScore.get(getKey(lowest)) || Infinity;
      return currentF < lowestF ? pos : lowest;
    });

    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path: Position[] = [];
      let pathPos = current;
      while (pathPos) {
        path.unshift(pathPos);
        pathPos = cameFrom.get(getKey(pathPos))!;
      }
      return path;
    }

    removeFromArray(openSet, current);
    closedSet.push(current);

    const neighbors = getAdjacentPositions(current);
    for (const neighbor of neighbors) {
      if (closedSet.some(pos => pos.x === neighbor.x && pos.y === neighbor.y)) continue;
      if (obstacles.some(pos => pos.x === neighbor.x && pos.y === neighbor.y)) continue;

      const tentativeGScore = (gScore.get(getKey(current)) || 0) + 1;

      if (!openSet.some(pos => pos.x === neighbor.x && pos.y === neighbor.y)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= (gScore.get(getKey(neighbor)) || Infinity)) {
        continue;
      }

      cameFrom.set(getKey(neighbor), current);
      gScore.set(getKey(neighbor), tentativeGScore);
      fScore.set(getKey(neighbor), tentativeGScore + heuristic(neighbor, end));
    }
  }

  return []; // No path found
}
