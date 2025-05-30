
export interface Controls {
  // Movement
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  
  // Camera
  cameraUp: boolean;
  cameraDown: boolean;
  cameraLeft: boolean;
  cameraRight: boolean;
  cameraZoomIn: boolean;
  cameraZoomOut: boolean;
  cameraReset: boolean;
  
  // Game Actions
  select: boolean;
  interact: boolean;
  cancel: boolean;
  confirm: boolean;
  menu: boolean;
  inventory: boolean;
  
  // Building
  build: boolean;
  demolish: boolean;
  rotate: boolean;
  copy: boolean;
  paste: boolean;
  
  // UI
  pause: boolean;
  quickSave: boolean;
  quickLoad: boolean;
  screenshot: boolean;
  fullscreen: boolean;
  
  // Debug
  debug: boolean;
  debugStep: boolean;
  debugReset: boolean;
}

export interface InputState {
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad: GamepadState | null;
  touch: TouchState | null;
}

export interface KeyboardState {
  keys: Record<string, boolean>;
  modifiers: KeyboardModifiers;
  lastKeyPressed: string | null;
  lastKeyTime: number;
  repeat: boolean;
}

export interface KeyboardModifiers {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

export interface MouseState {
  position: Position;
  worldPosition: Position;
  deltaPosition: Position;
  buttons: MouseButtons;
  wheel: WheelState;
  isOverUI: boolean;
  isDragging: boolean;
  dragStart: Position | null;
  dragCurrent: Position | null;
}

export interface MouseButtons {
  left: boolean;
  right: boolean;
  middle: boolean;
  button4: boolean;
  button5: boolean;
}

export interface WheelState {
  deltaX: number;
  deltaY: number;
  deltaZ: number;
}

export interface GamepadState {
  id: string;
  connected: boolean;
  buttons: GamepadButtons;
  axes: GamepadAxes;
  vibration: VibrationState;
}

export interface GamepadButtons {
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  lb: boolean;
  rb: boolean;
  lt: number;
  rt: number;
  back: boolean;
  start: boolean;
  ls: boolean;
  rs: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  home: boolean;
}

export interface GamepadAxes {
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
}

export interface VibrationState {
  lowFrequency: number;
  highFrequency: number;
  duration: number;
}

export interface TouchState {
  touches: TouchPoint[];
  gestures: GestureState;
}

export interface TouchPoint {
  id: number;
  position: Position;
  startPosition: Position;
  deltaPosition: Position;
  force: number;
  timestamp: number;
}

export interface GestureState {
  pinching: boolean;
  pinchScale: number;
  pinchCenter: Position;
  panning: boolean;
  panDelta: Position;
  rotating: boolean;
  rotationAngle: number;
  swiping: boolean;
  swipeDirection: SwipeDirection | null;
  tapping: boolean;
  tapCount: number;
}

export interface ControlBinding {
  id: string;
  action: string;
  inputType: InputType;
  key?: string;
  modifiers?: KeyboardModifiers;
  mouseButton?: number;
  gamepadButton?: string;
  touchGesture?: string;
  description: string;
  category: string;
  customizable: boolean;
}

export interface ControlScheme {
  id: string;
  name: string;
  description: string;
  bindings: Record<string, ControlBinding>;
  preset: boolean;
}

export interface InputEvent {
  type: InputEventType;
  timestamp: number;
  source: InputSource;
  data: any;
  consumed: boolean;
  bubbles: boolean;
  target?: string;
}

export interface InputHandler {
  id: string;
  priority: number;
  active: boolean;
  eventTypes: InputEventType[];
  handler: (event: InputEvent) => boolean;
  context?: string;
}

export interface InputContext {
  id: string;
  name: string;
  active: boolean;
  priority: number;
  handlers: InputHandler[];
  exclusive: boolean;
}

export interface InputManager {
  currentContext: string;
  contexts: Record<string, InputContext>;
  globalHandlers: InputHandler[];
  state: InputState;
  settings: InputSettings;
}

export interface InputSettings {
  mouseSensitivity: number;
  gamepadSensitivity: number;
  touchSensitivity: number;
  invertMouseY: boolean;
  invertGamepadY: boolean;
  deadzone: number;
  doubleClickTime: number;
  longPressTime: number;
  repeatDelay: number;
  repeatRate: number;
}

export interface CameraControls {
  position: Vector3D;
  target: Vector3D;
  zoom: number;
  rotation: number;
  pitch: number;
  yaw: number;
  distance: number;
  fov: number;
  near: number;
  far: number;
  bounds: CameraBounds;
  constraints: CameraConstraints;
  smoothing: CameraSmoothing;
}

export interface CameraConstraints {
  minZoom: number;
  maxZoom: number;
  minPitch: number;
  maxPitch: number;
  minDistance: number;
  maxDistance: number;
  boundingBox?: Bounds;
}

export interface CameraSmoothing {
  enabled: boolean;
  positionSmoothing: number;
  rotationSmoothing: number;
  zoomSmoothing: number;
}

export interface ManualControl {
  enabled: boolean;
  target: string;
  speed: number;
  rotationSpeed: number;
  acceleration: number;
  deceleration: number;
  maxSpeed: number;
}

export type InputType = 'keyboard' | 'mouse' | 'gamepad' | 'touch';
export type InputSource = 'keyboard' | 'mouse' | 'gamepad' | 'touch' | 'system';
export type InputEventType = 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'mousemove' | 'wheel' | 'gamepadconnected' | 'gamepaddisconnected' | 'gamepadbutton' | 'gamepadaxis' | 'touchstart' | 'touchmove' | 'touchend' | 'gesture';
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

// Import shared types
export type { Position, Vector3D, Bounds } from './game';
export type { CameraBounds } from './stores';
