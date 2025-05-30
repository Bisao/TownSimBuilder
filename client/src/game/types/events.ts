
export type EventType = 
  | 'game_start' | 'game_end' | 'game_pause' | 'game_resume'
  | 'building_placed' | 'building_destroyed' | 'building_upgraded'
  | 'npc_created' | 'npc_died' | 'npc_level_up' | 'npc_job_assigned'
  | 'resource_gathered' | 'resource_depleted' | 'resource_discovered'
  | 'item_crafted' | 'item_consumed' | 'item_equipped' | 'item_unequipped'
  | 'combat_started' | 'combat_ended' | 'damage_dealt' | 'damage_received'
  | 'skill_learned' | 'skill_upgraded' | 'achievement_unlocked'
  | 'season_changed' | 'weather_changed' | 'day_night_cycle'
  | 'trade_completed' | 'quest_started' | 'quest_completed'
  | 'discovery_made' | 'milestone_reached' | 'disaster_occurred';

export interface BaseGameEvent {
  id: string;
  type: EventType;
  timestamp: number;
  source?: string;
  targets?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'gameplay' | 'ui' | 'audio' | 'network';
  data: Record<string, any>;
  processed: boolean;
  cancelled: boolean;
}

export interface BuildingEvent extends BaseGameEvent {
  type: 'building_placed' | 'building_destroyed' | 'building_upgraded';
  data: {
    buildingId: string;
    buildingType: string;
    position: [number, number];
    level?: number;
    cost?: Record<string, number>;
    owner?: string;
  };
}

export interface NPCEvent extends BaseGameEvent {
  type: 'npc_created' | 'npc_died' | 'npc_level_up' | 'npc_job_assigned';
  data: {
    npcId: string;
    npcType: string;
    position?: [number, number, number];
    level?: number;
    job?: string;
    stats?: Record<string, number>;
    cause?: string;
  };
}

export interface ResourceEvent extends BaseGameEvent {
  type: 'resource_gathered' | 'resource_depleted' | 'resource_discovered';
  data: {
    resourceId?: string;
    resourceType: string;
    amount: number;
    position: [number, number, number];
    gatherer?: string;
    tool?: string;
    skill?: string;
  };
}

export interface CombatEvent extends BaseGameEvent {
  type: 'combat_started' | 'combat_ended' | 'damage_dealt' | 'damage_received';
  data: {
    combatId?: string;
    attacker: string;
    defender: string;
    damage?: number;
    damageType?: string;
    weapon?: string;
    skill?: string;
    critical?: boolean;
    winner?: string;
    duration?: number;
  };
}

export interface SkillEvent extends BaseGameEvent {
  type: 'skill_learned' | 'skill_upgraded';
  data: {
    entityId: string;
    skillId: string;
    previousLevel?: number;
    newLevel: number;
    experience: number;
    cost?: Record<string, number>;
  };
}

export interface WeatherEvent extends BaseGameEvent {
  type: 'weather_changed' | 'season_changed' | 'day_night_cycle';
  data: {
    previousWeather?: string;
    currentWeather?: string;
    previousSeason?: string;
    currentSeason?: string;
    timeOfDay?: number;
    temperature?: number;
    precipitation?: number;
    windSpeed?: number;
  };
}

export interface TradeEvent extends BaseGameEvent {
  type: 'trade_completed';
  data: {
    traderId: string;
    customerId: string;
    items: {
      given: Record<string, number>;
      received: Record<string, number>;
    };
    value: number;
    profit: number;
  };
}

export interface AchievementEvent extends BaseGameEvent {
  type: 'achievement_unlocked' | 'milestone_reached';
  data: {
    achievementId: string;
    title: string;
    description: string;
    rewards?: Record<string, number>;
    progress?: number;
    maxProgress?: number;
  };
}

export interface DiscoveryEvent extends BaseGameEvent {
  type: 'discovery_made';
  data: {
    discoveryType: 'location' | 'resource' | 'secret' | 'lore';
    name: string;
    description: string;
    position?: [number, number, number];
    rewards?: Record<string, number>;
    requirements?: Record<string, any>;
  };
}

export interface DisasterEvent extends BaseGameEvent {
  type: 'disaster_occurred';
  data: {
    disasterType: 'fire' | 'flood' | 'earthquake' | 'plague' | 'invasion';
    severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
    affectedArea: {
      center: [number, number];
      radius: number;
    };
    duration: number;
    damage: {
      buildings: string[];
      npcs: string[];
      resources: Record<string, number>;
    };
    causes?: string[];
  };
}

// Event handling interfaces
export interface EventHandler<T extends BaseGameEvent = BaseGameEvent> {
  id: string;
  eventTypes: EventType[];
  priority: number;
  handle: (event: T) => Promise<void> | void;
  condition?: (event: T) => boolean;
  once?: boolean;
}

export interface EventFilter {
  types?: EventType[];
  source?: string;
  targets?: string[];
  category?: BaseGameEvent['category'];
  priority?: BaseGameEvent['priority'];
  timeRange?: {
    start: number;
    end: number;
  };
  custom?: (event: BaseGameEvent) => boolean;
}

export interface EventSubscription {
  id: string;
  filter: EventFilter;
  callback: (event: BaseGameEvent) => void;
  active: boolean;
  createdAt: number;
}

export interface EventQueue {
  events: BaseGameEvent[];
  maxSize: number;
  processingRate: number;
  paused: boolean;
  
  add: (event: Omit<BaseGameEvent, 'id' | 'timestamp' | 'processed' | 'cancelled'>) => void;
  process: () => Promise<void>;
  clear: () => void;
  pause: () => void;
  resume: () => void;
  getEvents: (filter?: EventFilter) => BaseGameEvent[];
}

export interface EventHistory {
  events: BaseGameEvent[];
  maxSize: number;
  
  add: (event: BaseGameEvent) => void;
  getEvents: (filter?: EventFilter) => BaseGameEvent[];
  getEventsByType: (type: EventType) => BaseGameEvent[];
  getEventsByTimeRange: (start: number, end: number) => BaseGameEvent[];
  clear: () => void;
  export: () => string;
  import: (data: string) => void;
}

export interface EventManager {
  handlers: Map<string, EventHandler>;
  subscriptions: Map<string, EventSubscription>;
  queue: EventQueue;
  history: EventHistory;
  
  // Handler management
  registerHandler: <T extends BaseGameEvent>(handler: EventHandler<T>) => void;
  unregisterHandler: (handlerId: string) => void;
  
  // Event emission
  emit: <T extends BaseGameEvent>(event: Omit<T, 'id' | 'timestamp' | 'processed' | 'cancelled'>) => void;
  emitImmediate: <T extends BaseGameEvent>(event: Omit<T, 'id' | 'timestamp' | 'processed' | 'cancelled'>) => Promise<void>;
  
  // Subscriptions
  subscribe: (filter: EventFilter, callback: (event: BaseGameEvent) => void) => string;
  unsubscribe: (subscriptionId: string) => void;
  
  // Processing
  processEvents: () => Promise<void>;
  processEvent: (event: BaseGameEvent) => Promise<void>;
  
  // Utilities
  createEvent: <T extends BaseGameEvent>(type: EventType, data: T['data'], options?: Partial<T>) => T;
  cancelEvent: (eventId: string) => void;
  getEventHistory: (filter?: EventFilter) => BaseGameEvent[];
}

// Event factory functions
export const createBuildingEvent = (
  type: BuildingEvent['type'],
  data: BuildingEvent['data'],
  options?: Partial<Omit<BuildingEvent, 'type' | 'data'>>
): Omit<BuildingEvent, 'id' | 'timestamp' | 'processed' | 'cancelled'> => ({
  type,
  data,
  priority: 'medium',
  category: 'gameplay',
  ...options,
});

export const createNPCEvent = (
  type: NPCEvent['type'],
  data: NPCEvent['data'],
  options?: Partial<Omit<NPCEvent, 'type' | 'data'>>
): Omit<NPCEvent, 'id' | 'timestamp' | 'processed' | 'cancelled'> => ({
  type,
  data,
  priority: 'medium',
  category: 'gameplay',
  ...options,
});

export const createResourceEvent = (
  type: ResourceEvent['type'],
  data: ResourceEvent['data'],
  options?: Partial<Omit<ResourceEvent, 'type' | 'data'>>
): Omit<ResourceEvent, 'id' | 'timestamp' | 'processed' | 'cancelled'> => ({
  type,
  data,
  priority: 'low',
  category: 'gameplay',
  ...options,
});

export const createCombatEvent = (
  type: CombatEvent['type'],
  data: CombatEvent['data'],
  options?: Partial<Omit<CombatEvent, 'type' | 'data'>>
): Omit<CombatEvent, 'id' | 'timestamp' | 'processed' | 'cancelled'> => ({
  type,
  data,
  priority: 'high',
  category: 'gameplay',
  ...options,
});

// Event utilities
export const isEventType = <T extends BaseGameEvent>(
  event: BaseGameEvent,
  type: T['type']
): event is T => event.type === type;

export const filterEvents = (
  events: BaseGameEvent[],
  filter: EventFilter
): BaseGameEvent[] => {
  return events.filter(event => {
    if (filter.types && !filter.types.includes(event.type)) return false;
    if (filter.source && event.source !== filter.source) return false;
    if (filter.targets && (!event.targets || !filter.targets.some(t => event.targets!.includes(t)))) return false;
    if (filter.category && event.category !== filter.category) return false;
    if (filter.priority && event.priority !== filter.priority) return false;
    if (filter.timeRange && (event.timestamp < filter.timeRange.start || event.timestamp > filter.timeRange.end)) return false;
    if (filter.custom && !filter.custom(event)) return false;
    return true;
  });
};

export const sortEventsByPriority = (events: BaseGameEvent[]): BaseGameEvent[] => {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...events].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Legacy exports for compatibility
export type { BaseGameEvent as GameEvent };
export type { EventManager as GameEventManager };
