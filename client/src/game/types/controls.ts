
export type InputType = 'keyboard' | 'mouse' | 'touch' | 'gamepad';
export type ActionType = 'press' | 'hold' | 'release' | 'move' | 'scroll' | 'drag';
export type ControlScheme = 'default' | 'wasd' | 'arrows' | 'custom';

export interface KeyBinding {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
  category: string;
}

export interface MouseBinding {
  button: 'left' | 'right' | 'middle' | 'x1' | 'x2';
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
  category: string;
}

export interface TouchGesture {
  type: 'tap' | 'long_press' | 'pinch' | 'swipe' | 'pan' | 'rotate';
  fingers: number;
  action: string;
  description: string;
  sensitivity?: number;
}

export interface GamepadBinding {
  button: string;
  action: string;
  description: string;
  deadzone?: number;
}

export interface ControlSettings {
  scheme: ControlScheme;
  sensitivity: {
    mouse: number;
    camera: number;
    scroll: number;
    touch: number;
  };
  invertY: boolean;
  smoothing: boolean;
  customBindings: {
    keyboard: KeyBinding[];
    mouse: MouseBinding[];
    touch: TouchGesture[];
    gamepad: GamepadBinding[];
  };
}

export interface InputEvent {
  type: InputType;
  action: ActionType;
  key?: string;
  button?: string;
  position?: {
    x: number;
    y: number;
  };
  delta?: {
    x: number;
    y: number;
  };
  modifiers?: string[];
  timestamp: number;
  handled: boolean;
}

export interface CameraControls {
  position: [number, number, number];
  target: [number, number, number];
  rotation: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  bounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  smoothing: {
    enabled: boolean;
    factor: number;
  };
  follow?: {
    target: string;
    offset: [number, number, number];
    smoothing: number;
  };
}

export interface PlayerMovement {
  position: [number, number, number];
  velocity: [number, number, number];
  speed: number;
  maxSpeed: number;
  acceleration: number;
  friction: number;
  isMoving: boolean;
  direction: number;
  targetPosition?: [number, number, number];
  path?: [number, number, number][];
}

export interface InteractionState {
  hoveredObject?: {
    id: string;
    type: string;
    position: [number, number, number];
  };
  selectedObject?: {
    id: string;
    type: string;
    position: [number, number, number];
  };
  dragState?: {
    isDragging: boolean;
    startPosition: [number, number];
    currentPosition: [number, number];
    object?: {
      id: string;
      type: string;
    };
  };
  contextMenu?: {
    visible: boolean;
    position: [number, number];
    target?: {
      id: string;
      type: string;
    };
    options: {
      label: string;
      action: string;
      icon?: string;
      disabled?: boolean;
    }[];
  };
}

export interface UIControls {
  activePanel?: string;
  modalStack: string[];
  tooltips: {
    [key: string]: {
      content: string;
      position: [number, number];
      visible: boolean;
    };
  };
  notifications: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    duration: number;
    timestamp: number;
  }[];
  dragAndDrop?: {
    source: {
      id: string;
      type: string;
      data: any;
    };
    target?: {
      id: string;
      type: string;
    };
    preview?: {
      element: HTMLElement;
      offset: [number, number];
    };
  };
}

export interface ControlsState {
  input: {
    keyboard: Record<string, boolean>;
    mouse: {
      position: [number, number];
      buttons: Record<string, boolean>;
      wheel: number;
    };
    touch: {
      touches: {
        id: number;
        position: [number, number];
        force?: number;
      }[];
      gestures: {
        type: string;
        data: any;
      }[];
    };
    gamepad?: {
      connected: boolean;
      buttons: Record<string, boolean>;
      axes: Record<string, number>;
    };
  };
  camera: CameraControls;
  player: PlayerMovement;
  interaction: InteractionState;
  ui: UIControls;
  settings: ControlSettings;
}

// Action definitions
export interface GameAction {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultBindings: {
    keyboard?: string[];
    mouse?: string[];
    touch?: string[];
    gamepad?: string[];
  };
  context?: string[];
  priority: number;
}

export const DEFAULT_ACTIONS: GameAction[] = [
  {
    id: 'move_forward',
    name: 'Move Forward',
    category: 'Movement',
    description: 'Move the character forward',
    defaultBindings: { keyboard: ['w', 'ArrowUp'] },
    priority: 1,
  },
  {
    id: 'move_backward',
    name: 'Move Backward',
    category: 'Movement',
    description: 'Move the character backward',
    defaultBindings: { keyboard: ['s', 'ArrowDown'] },
    priority: 1,
  },
  {
    id: 'move_left',
    name: 'Move Left',
    category: 'Movement',
    description: 'Move the character left',
    defaultBindings: { keyboard: ['a', 'ArrowLeft'] },
    priority: 1,
  },
  {
    id: 'move_right',
    name: 'Move Right',
    category: 'Movement',
    description: 'Move the character right',
    defaultBindings: { keyboard: ['d', 'ArrowRight'] },
    priority: 1,
  },
  {
    id: 'camera_rotate',
    name: 'Rotate Camera',
    category: 'Camera',
    description: 'Rotate the camera around the target',
    defaultBindings: { mouse: ['right'] },
    priority: 2,
  },
  {
    id: 'camera_zoom',
    name: 'Zoom Camera',
    category: 'Camera',
    description: 'Zoom the camera in or out',
    defaultBindings: { mouse: ['wheel'] },
    priority: 2,
  },
  {
    id: 'select',
    name: 'Select',
    category: 'Interaction',
    description: 'Select an object or character',
    defaultBindings: { mouse: ['left'] },
    priority: 3,
  },
  {
    id: 'context_menu',
    name: 'Context Menu',
    category: 'Interaction',
    description: 'Open context menu',
    defaultBindings: { mouse: ['right'] },
    priority: 3,
  },
];

// Utility functions
export const createDefaultControls = (): ControlsState => ({
  input: {
    keyboard: {},
    mouse: {
      position: [0, 0],
      buttons: {},
      wheel: 0,
    },
    touch: {
      touches: [],
      gestures: [],
    },
  },
  camera: {
    position: [25, 30, 25],
    target: [25, 0, 25],
    rotation: 0,
    zoom: 1,
    minZoom: 0.5,
    maxZoom: 3,
    smoothing: {
      enabled: true,
      factor: 0.1,
    },
  },
  player: {
    position: [25, 0, 25],
    velocity: [0, 0, 0],
    speed: 1,
    maxSpeed: 5,
    acceleration: 10,
    friction: 8,
    isMoving: false,
    direction: 0,
  },
  interaction: {},
  ui: {
    modalStack: [],
    tooltips: {},
    notifications: [],
  },
  settings: {
    scheme: 'default',
    sensitivity: {
      mouse: 1,
      camera: 1,
      scroll: 1,
      touch: 1,
    },
    invertY: false,
    smoothing: true,
    customBindings: {
      keyboard: [],
      mouse: [],
      touch: [],
      gamepad: [],
    },
  },
});
