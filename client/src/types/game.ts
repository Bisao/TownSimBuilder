
// Core game state and configuration types
export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  gameSpeed: number;
  currentTime: number;
  dayNightCycle: DayNightState;
  weather: WeatherState;
  season: SeasonType;
  difficulty: DifficultyLevel;
  settings: GameSettings;
}

export interface GameSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  effectsVolume: number;
  musicVolume: number;
  graphicsQuality: GraphicsQuality;
  debugMode: boolean;
}

export interface DayNightState {
  currentHour: number;
  timeMultiplier: number;
  isDaytime: boolean;
  lightIntensity: number;
  ambientColor: string;
  sunPosition: [number, number, number];
}

export interface WeatherState {
  type: WeatherType;
  intensity: number;
  duration: number;
  temperature: number;
  humidity: number;
}

export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert';
export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface GameMetrics {
  totalPlayTime: number;
  buildingsBuilt: number;
  npcsCreated: number;
  resourcesGathered: Record<string, number>;
  researchCompleted: string[];
  achievementsUnlocked: string[];
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Bounds {
  min: Position;
  max: Position;
}

export interface GameCamera {
  position: Vector3D;
  target: Vector3D;
  zoom: number;
  rotation: number;
  bounds: Bounds;
}
