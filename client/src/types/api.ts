
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
  timestamp: number;
  requestId: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface APIRequest {
  method: HTTPMethod;
  endpoint: string;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface GameSaveData {
  id: string;
  name: string;
  version: string;
  createdAt: number;
  lastSaved: number;
  playtime: number;
  gameState: any;
  metadata: SaveMetadata;
  checksum: string;
}

export interface SaveMetadata {
  playerName: string;
  difficulty: string;
  gameMode: string;
  achievements: string[];
  statistics: Record<string, number>;
  settings: Record<string, any>;
}

export interface WebSocketMessage {
  id: string;
  type: MessageType;
  payload: any;
  timestamp: number;
  senderId?: string;
  targetId?: string;
}

export interface RealtimeUpdate {
  type: UpdateType;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  timestamp: number;
}

export interface SyncData {
  gameState: any;
  timestamp: number;
  version: string;
  conflicts?: SyncConflict[];
}

export interface SyncConflict {
  path: string;
  localValue: any;
  remoteValue: any;
  timestamp: number;
  resolution?: 'local' | 'remote' | 'merge';
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  level: number;
  experience: number;
  achievements: string[];
  statistics: PlayerStatistics;
  preferences: UserPreferences;
  friends: string[];
  createdAt: number;
  lastLogin: number;
}

export interface PlayerStatistics {
  totalPlaytime: number;
  gamesPlayed: number;
  buildingsBuilt: number;
  npcsCreated: number;
  resourcesGathered: Record<string, number>;
  researchCompleted: number;
  achievementsUnlocked: number;
  highScores: Record<string, number>;
}

export interface UserPreferences {
  language: string;
  theme: string;
  soundVolume: number;
  musicVolume: number;
  graphicsQuality: string;
  autoSave: boolean;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  inGame: boolean;
  email: boolean;
  push: boolean;
  achievements: boolean;
  updates: boolean;
  social: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  onlineStatus: boolean;
  shareStatistics: boolean;
  allowFriendRequests: boolean;
}

export interface MultiplayerSession {
  id: string;
  name: string;
  hostId: string;
  players: SessionPlayer[];
  maxPlayers: number;
  gameMode: string;
  settings: SessionSettings;
  status: SessionStatus;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface SessionPlayer {
  id: string;
  username: string;
  role: PlayerRole;
  status: PlayerStatus;
  joinedAt: number;
  score?: number;
  team?: number;
}

export interface SessionSettings {
  isPrivate: boolean;
  password?: string;
  gameSpeed: number;
  difficulty: string;
  allowSpectators: boolean;
  maxIdleTime: number;
  autoKickIdlePlayers: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  score: number;
  category: string;
  achievedAt: number;
  metadata?: Record<string, any>;
}

export interface ServerStatus {
  online: boolean;
  version: string;
  playerCount: number;
  maxPlayers: number;
  uptime: number;
  latency: number;
  region: string;
  maintenance: boolean;
  maintenanceMessage?: string;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type MessageType = 'game_update' | 'chat' | 'system' | 'notification' | 'ping' | 'sync' | 'custom';
export type UpdateType = 'create' | 'update' | 'delete' | 'move' | 'state_change';
export type SessionStatus = 'waiting' | 'starting' | 'active' | 'paused' | 'completed' | 'cancelled';
export type PlayerRole = 'host' | 'player' | 'spectator' | 'moderator';
export type PlayerStatus = 'online' | 'away' | 'busy' | 'offline' | 'in_game';
