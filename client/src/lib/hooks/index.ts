
// Re-export all custom hooks
export { useAsync } from './useAsync';
export { useClickOutside } from './useClickOutside';
export { useDebounce } from './useDebounce';
export { useDraggable } from './useDraggable';
export { useGameControls } from './useGameControls';
export { useIntersectionObserver } from './useIntersectionObserver';
export { useIsMobile } from './useIsMobile';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { useLocalStorage } from './useLocalStorage';
export { useResizeObserver } from './useResizeObserver';

// Common hook types
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export type DragState = {
  isDragging: boolean;
  position: { x: number; y: number };
  offset: { x: number; y: number };
};

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
};
