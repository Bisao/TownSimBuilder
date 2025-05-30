
import { useState, useRef, useEffect, useCallback, RefObject } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface DragBounds {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

export interface UseDraggableOptions {
  initialPosition?: Position;
  disabled?: boolean;
  bounds?: DragBounds | 'parent' | 'viewport';
  grid?: [number, number];
  axis?: 'x' | 'y' | 'both';
  handle?: string;
  cancel?: string;
  onDragStart?: (position: Position, event: MouseEvent | TouchEvent) => void;
  onDrag?: (position: Position, event: MouseEvent | TouchEvent) => void;
  onDragEnd?: (position: Position, event: MouseEvent | TouchEvent) => void;
}

export interface UseDraggableReturn {
  dragRef: RefObject<HTMLElement>;
  position: Position;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  setPosition: (position: Position) => void;
  resetPosition: () => void;
}

export const useDraggable = (options: UseDraggableOptions = {}): UseDraggableReturn => {
  const {
    initialPosition = { x: 0, y: 0 },
    disabled = false,
    bounds = 'viewport',
    grid,
    axis = 'both',
    handle,
    cancel,
    onDragStart,
    onDrag,
    onDragEnd
  } = options;

  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLElement>(null);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>({ x: 0, y: 0 });
  const currentEvent = useRef<MouseEvent | TouchEvent | null>(null);

  const snapToGrid = useCallback((pos: Position): Position => {
    if (!grid) return pos;
    
    const [gridX, gridY] = grid;
    return {
      x: Math.round(pos.x / gridX) * gridX,
      y: Math.round(pos.y / gridY) * gridY
    };
  }, [grid]);

  const applyBounds = useCallback((pos: Position): Position => {
    if (!dragRef.current || bounds === undefined) return pos;

    let boundingRect: DOMRect;
    let parentRect: DOMRect | null = null;

    if (bounds === 'viewport') {
      boundingRect = {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0,
        y: 0,
        toJSON: () => ({})
      };
    } else if (bounds === 'parent') {
      parentRect = dragRef.current.parentElement?.getBoundingClientRect() || null;
      if (!parentRect) return pos;
      boundingRect = parentRect;
    } else {
      const elementRect = dragRef.current.getBoundingClientRect();
      boundingRect = {
        left: bounds.left ?? 0,
        top: bounds.top ?? 0,
        right: bounds.right ?? window.innerWidth,
        bottom: bounds.bottom ?? window.innerHeight,
        width: (bounds.right ?? window.innerWidth) - (bounds.left ?? 0),
        height: (bounds.bottom ?? window.innerHeight) - (bounds.top ?? 0),
        x: bounds.left ?? 0,
        y: bounds.top ?? 0,
        toJSON: () => ({})
      };
    }

    const elementRect = dragRef.current.getBoundingClientRect();
    const maxX = boundingRect.right - elementRect.width;
    const maxY = boundingRect.bottom - elementRect.height;

    return {
      x: Math.max(boundingRect.left, Math.min(pos.x, maxX)),
      y: Math.max(boundingRect.top, Math.min(pos.y, maxY))
    };
  }, [bounds]);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || disabled) return;

    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    let newX = elementStartPos.current.x + (axis === 'y' ? 0 : deltaX);
    let newY = elementStartPos.current.y + (axis === 'x' ? 0 : deltaY);

    let newPosition = { x: newX, y: newY };
    newPosition = snapToGrid(newPosition);
    newPosition = applyBounds(newPosition);

    setPosition(newPosition);

    if (onDrag && currentEvent.current) {
      onDrag(newPosition, currentEvent.current);
    }
  }, [isDragging, disabled, axis, snapToGrid, applyBounds, onDrag]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    currentEvent.current = e;
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    currentEvent.current = e;
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [updatePosition]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    if (onDragEnd && currentEvent.current) {
      onDragEnd(position, currentEvent.current);
    }
    currentEvent.current = null;
  }, [position, onDragEnd]);

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  const isValidTarget = useCallback((target: Element): boolean => {
    if (handle) {
      const handleElement = dragRef.current?.querySelector(handle);
      return handleElement?.contains(target) || handleElement === target;
    }

    if (cancel) {
      const cancelElement = dragRef.current?.querySelector(cancel);
      return !(cancelElement?.contains(target) || cancelElement === target);
    }

    return true;
  }, [handle, cancel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || e.button !== 0) return;
    if (!isValidTarget(e.target as Element)) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = position;
    currentEvent.current = e.nativeEvent;

    if (onDragStart) {
      onDragStart(position, e.nativeEvent);
    }
  }, [disabled, position, isValidTarget, onDragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || e.touches.length !== 1) return;
    if (!isValidTarget(e.target as Element)) return;

    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    setIsDragging(true);
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    elementStartPos.current = position;
    currentEvent.current = e.nativeEvent;

    if (onDragStart) {
      onDragStart(position, e.nativeEvent);
    }
  }, [disabled, position, isValidTarget, onDragStart]);

  const resetPosition = useCallback(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  return {
    dragRef,
    position,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    setPosition,
    resetPosition
  };
};

export default useDraggable;
