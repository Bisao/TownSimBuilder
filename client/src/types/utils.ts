
// Utility types for better type safety and development experience

// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Make specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Extract the value type from a record/object
export type ValueOf<T> = T[keyof T];

// Extract keys that have specific value type
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Create a union type from array values
export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

// Deep readonly type
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Recursive key paths for nested objects
export type KeyPath<T> = {
  [K in keyof T]: T[K] extends object
    ? K | `${K & string}.${KeyPath<T[K]> & string}`
    : K;
}[keyof T];

// Function type helpers
export type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;
export type SyncFunction<T extends any[], R> = (...args: T) => R;
export type AnyFunction<T extends any[] = any[], R = any> = (...args: T) => R;

// Event handler types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Common callback types
export type Callback<T = void> = () => T;
export type AsyncCallback<T = void> = () => Promise<T>;
export type CallbackWithParam<P, T = void> = (param: P) => T;
export type AsyncCallbackWithParam<P, T = void> = (param: P) => Promise<T>;

// Validation types
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export type Validator<T> = (value: T) => ValidationResult;
export type AsyncValidator<T> = (value: T) => Promise<ValidationResult>;

// State management types
export type StateUpdater<T> = (prevState: T) => T;
export type StateSetter<T> = (value: T | StateUpdater<T>) => void;

// API response wrapper
export type APIResult<T, E = string> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// Optional with default
export type WithDefault<T, D> = T extends undefined ? D : T;

// Branded types for better type safety
export type Brand<T, B> = T & { __brand: B };

// Common branded types
export type ID<T extends string = string> = Brand<string, T>;
export type Timestamp = Brand<number, 'timestamp'>;
export type Duration = Brand<number, 'duration'>;
export type Percentage = Brand<number, 'percentage'>;
export type Angle = Brand<number, 'angle'>;
export type Distance = Brand<number, 'distance'>;

// Resource-specific IDs
export type EntityID = ID<'entity'>;
export type BuildingID = ID<'building'>;
export type NPCID = ID<'npc'>;
export type ResourceID = ID<'resource'>;
export type TaskID = ID<'task'>;
export type EventID = ID<'event'>;
export type UserID = ID<'user'>;

// Coordinate types
export type Coordinate = Brand<number, 'coordinate'>;
export type WorldPosition = {
  x: Coordinate;
  y: Coordinate;
  z?: Coordinate;
};

// Time-related types
export type GameTime = Brand<number, 'game_time'>;
export type RealTime = Brand<number, 'real_time'>;

// Quantity types
export type Quantity = Brand<number, 'quantity'>;
export type Price = Brand<number, 'price'>;
export type Level = Brand<number, 'level'>;
export type Experience = Brand<number, 'experience'>;

// Configuration types
export type Config<T> = {
  readonly [K in keyof T]: T[K];
};

export type MutableConfig<T> = {
  [K in keyof T]: T[K];
};

// Enum-like object type
export type EnumLike<T extends Record<string, string | number>> = T;

// Type guard function
export type TypeGuard<T> = (value: unknown) => value is T;

// Constructor type
export type Constructor<T = any> = new (...args: any[]) => T;

// Abstract constructor type
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;

// Mixin type
export type Mixin<T extends Constructor> = (Base: T) => T;

// Class decorator type
export type ClassDecorator<T extends Constructor> = (target: T) => T | void;

// Method decorator type
export type MethodDecorator<T = any> = (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

// Property decorator type
export type PropertyDecorator = (
  target: any,
  propertyKey: string | symbol
) => void;

// Parameter decorator type
export type ParameterDecorator = (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void;

// Observable-like type
export type Observable<T> = {
  subscribe: (observer: (value: T) => void) => () => void;
};

// Disposable type
export type Disposable = {
  dispose: () => void;
};

// Subscription type
export type Subscription = Disposable & {
  unsubscribe: () => void;
};

// Event emitter type
export type EventEmitter<T extends Record<string, any>> = {
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
};

// Serializable type
export type Serializable = 
  | string
  | number
  | boolean
  | null
  | undefined
  | SerializableObject
  | SerializableArray;

export type SerializableObject = {
  [key: string]: Serializable;
};

export type SerializableArray = Serializable[];

// JSON-compatible type
export type JSONValue = 
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

export type JSONObject = {
  [key: string]: JSONValue;
};

export type JSONArray = JSONValue[];

// Error types
export type ErrorCode = string;
export type ErrorMessage = string;
export type ErrorDetails = Record<string, any>;

export type GameError = {
  code: ErrorCode;
  message: ErrorMessage;
  details?: ErrorDetails;
  timestamp: Timestamp;
  stack?: string;
};

// Logger types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: Timestamp;
  data?: any;
  source?: string;
};

// Performance types
export type PerformanceMetric = {
  name: string;
  value: number;
  unit: string;
  timestamp: Timestamp;
};

export type BenchmarkResult = {
  name: string;
  duration: Duration;
  iterations: number;
  average: Duration;
  min: Duration;
  max: Duration;
};

// Memory management types
export type MemoryInfo = {
  used: number;
  total: number;
  limit: number;
  percentage: Percentage;
};

// Threading types (for Web Workers)
export type WorkerMessage<T = any> = {
  id: string;
  type: string;
  payload: T;
  timestamp: Timestamp;
};

export type WorkerResponse<T = any> = {
  id: string;
  success: boolean;
  result?: T;
  error?: string;
  timestamp: Timestamp;
};

// File system types
export type FileType = 'file' | 'directory' | 'symlink';
export type FilePermissions = {
  read: boolean;
  write: boolean;
  execute: boolean;
};

export type FileInfo = {
  name: string;
  path: string;
  type: FileType;
  size: number;
  permissions: FilePermissions;
  createdAt: Timestamp;
  modifiedAt: Timestamp;
};

// Conditional types for better type inference
export type If<C extends boolean, T, F> = C extends true ? T : F;
export type Not<C extends boolean> = C extends true ? false : true;
export type And<A extends boolean, B extends boolean> = A extends true 
  ? B extends true 
    ? true 
    : false 
  : false;
export type Or<A extends boolean, B extends boolean> = A extends true 
  ? true 
  : B extends true 
    ? true 
    : false;
