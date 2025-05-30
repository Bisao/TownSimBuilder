
// Device and Interaction Hooks
export { default as useIsMobile } from './useIsMobile';
export { default as useDraggable } from './useDraggable';
export { default as useClickOutside } from './useClickOutside';
export { default as useKeyboardShortcuts } from './useKeyboardShortcuts';

// Performance and Optimization Hooks
export { default as useDebounce, useDebouncedCallback } from './useDebounce';
export { default as useResizeObserver } from './useResizeObserver';
export { default as useIntersectionObserver } from './useIntersectionObserver';

// State Management Hooks
export { default as useLocalStorage } from './useLocalStorage';
export { default as useAsync } from './useAsync';

// Game-specific Hooks
export { default as useGameControls } from './useGameControls';

// Type exports
export type { Position, DragBounds, UseDraggableOptions, UseDraggableReturn } from './useDraggable';
export type { UseIsMobileReturn } from './useIsMobile';
