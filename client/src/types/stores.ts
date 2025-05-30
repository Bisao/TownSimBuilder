
export interface StoreState<T = any> {
  data: T;
  loading: boolean;
  error: string | null;
  lastUpdate: number;
  initialized: boolean;
}

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface CacheState<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  stale: boolean;
}

export interface GameStoreState {
  // Game state
  gameState: GameState;
  isInitialized: boolean;
  isPaused: boolean;
  gameSpeed: number;
  
  // Time management
  currentTime: number;
  deltaTime: number;
  totalPlaytime: number;
  
  // Camera state
  camera: CameraState;
  
  // Selection state
  selectedEntity: string | null;
  selectedEntities: string[];
  hoveredEntity: string | null;
  
  // Mode state
  gameMode: GameMode;
  buildMode: boolean;
  placementMode: string | null;
  
  // Debug state
  debugMode: boolean;
  showGrid: boolean;
  showColliders: boolean;
  showPathfinding: boolean;
}

export interface CameraState {
  position: Vector3D;
  target: Vector3D;
  zoom: number;
  rotation: number;
  bounds: CameraBounds;
  following: string | null;
  mode: CameraMode;
}

export interface CameraBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZoom: number;
  maxZoom: number;
}

export interface BuildingStoreState {
  buildings: Record<string, BuildingInstance>;
  constructionSites: Record<string, ConstructionSite>;
  blueprints: Record<string, BuildingBlueprint>;
  selectedBuildingType: string | null;
  placementPosition: Position | null;
  placementValid: boolean;
  placementPreview: BuildingPreview | null;
  buildingLimits: Record<string, number>;
  totalBuildings: Record<string, number>;
}

export interface BuildingPreview {
  buildingType: string;
  position: Position;
  rotation: number;
  valid: boolean;
  cost: Record<string, number>;
  canAfford: boolean;
}

export interface NPCStoreState {
  npcs: Record<string, NPCEntity>;
  selectedNpc: string | null;
  npcTasks: Record<string, NPCTask[]>;
  npcGroups: Record<string, NPCGroup>;
  npcRelationships: Record<string, NPCRelationship[]>;
  workAssignments: Record<string, WorkAssignment>;
  totalPopulation: number;
  populationLimit: number;
  happiness: number;
  productivity: number;
}

export interface WorkAssignment {
  npcId: string;
  buildingId: string;
  role: string;
  efficiency: number;
  startTime: number;
}

export interface ResourceStoreState {
  resources: Record<string, number>;
  resourceNodes: Record<string, ResourceNode>;
  resourceHistory: ResourceTransaction[];
  storageCapacity: Record<string, number>;
  production: Record<string, ProductionRate>;
  consumption: Record<string, ConsumptionRate>;
  marketPrices: Record<string, number>;
}

export interface ProductionRate {
  current: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  sources: ProductionSource[];
}

export interface ProductionSource {
  sourceId: string;
  sourceType: string;
  rate: number;
  efficiency: number;
}

export interface ConsumptionRate {
  current: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  consumers: ConsumptionSource[];
}

export interface ConsumptionSource {
  consumerId: string;
  consumerType: string;
  rate: number;
  priority: number;
}

export interface ResearchStoreState {
  availableResearch: Record<string, ResearchProject>;
  completedResearch: string[];
  currentResearch: string | null;
  researchProgress: number;
  researchPoints: number;
  researchRate: number;
  unlockedTechnologies: string[];
  techTree: TechTreeNode[];
}

export interface ResearchProject {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number;
  requirements: string[];
  unlocks: string[];
  category: string;
  tier: number;
}

export interface TechTreeNode {
  id: string;
  researchId: string;
  position: Position;
  connections: string[];
  status: 'locked' | 'available' | 'researching' | 'completed';
}

export interface CombatStoreState {
  activeCombats: Record<string, CombatInstance>;
  combatHistory: CombatRecord[];
  trainingDummies: Record<string, TrainingDummy>;
  selectedDummy: string | null;
  combatStats: CombatStatistics;
}

export interface CombatRecord {
  id: string;
  participants: string[];
  duration: number;
  victor: string;
  timestamp: number;
  rewards: CombatReward[];
}

export interface CombatStatistics {
  totalCombats: number;
  victories: number;
  defeats: number;
  damageDealt: number;
  damageReceived: number;
  averageCombatDuration: number;
}

export interface EventStoreState {
  activeEvents: Record<string, GameEvent>;
  eventHistory: GameEvent[];
  eventChains: Record<string, EventChain>;
  achievements: Record<string, Achievement>;
  quests: Record<string, Quest>;
  notifications: Notification[];
  randomEvents: Record<string, RandomEvent>;
}

export interface UIStoreState {
  panels: Record<string, PanelState>;
  activePanel: string | null;
  notifications: Notification[];
  modals: Modal[];
  tooltips: Tooltip[];
  contextMenus: ContextMenu[];
  dragState: DragState | null;
  isLoading: boolean;
  loadingMessage: string;
  theme: string;
  layout: UILayout;
  shortcuts: Record<string, KeyboardShortcut>;
}

export interface PlayerStoreState {
  profile: UserProfile;
  preferences: UserPreferences;
  statistics: PlayerStatistics;
  achievements: string[];
  currentSession: PlayerSession | null;
  friends: UserProfile[];
  isOnline: boolean;
}

export interface PlayerSession {
  id: string;
  startTime: number;
  actions: SessionAction[];
  metrics: SessionMetrics;
}

export interface SessionAction {
  type: string;
  timestamp: number;
  data: any;
}

export interface SessionMetrics {
  actionsPerMinute: number;
  efficiency: number;
  focus: number;
  productivity: number;
}

export interface ValidationState {
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  isValid: boolean;
  lastValidation: number;
}

export interface PerformanceState {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  entityCount: number;
  updateTime: number;
  renderTime: number;
  profiling: boolean;
  optimizations: OptimizationState;
}

export interface OptimizationState {
  culling: boolean;
  lod: boolean;
  batching: boolean;
  pooling: boolean;
  compression: boolean;
}

export type GameMode = 'campaign' | 'sandbox' | 'creative' | 'survival' | 'multiplayer' | 'tutorial';
export type CameraMode = 'free' | 'follow' | 'orbit' | 'fixed' | 'cinematic';

// Import shared types
export type {
  GameState,
  Vector3D,
  Position,
  UILayout,
  BuildingInstance,
  ConstructionSite,
  BuildingBlueprint,
  NPCEntity,
  NPCTask,
  NPCGroup,
  NPCRelationship,
  ResourceNode,
  ResourceTransaction,
  GameEvent,
  EventChain,
  Achievement,
  Quest,
  Notification,
  Modal,
  Tooltip,
  ContextMenu,
  DragState,
  KeyboardShortcut,
  UserProfile,
  UserPreferences,
  PlayerStatistics,
  CombatInstance,
  TrainingDummy,
  CombatReward,
  PanelState
} from './index';
