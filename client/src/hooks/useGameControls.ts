
import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../game/stores/useGameStore';
import { useKeyboardControls } from '@react-three/drei';
import { useIsMobile } from './useIsMobile';

interface GameControlsConfig {
  moveSpeed?: number;
  rotationSpeed?: number;
  zoomSpeed?: number;
  enableTouch?: boolean;
  enableKeyboard?: boolean;
  enableMouse?: boolean;
}

export const useGameControls = (config: GameControlsConfig = {}) => {
  const {
    moveSpeed = 1,
    rotationSpeed = 0.1,
    zoomSpeed = 0.1,
    enableTouch = true,
    enableKeyboard = true,
    enableMouse = true
  } = config;

  const { isMobile } = useIsMobile();
  const { updateCameraPosition, updateCameraTarget, cameraPosition } = useGameStore();
  
  const [, get] = useKeyboardControls();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard controls
  const handleKeyboardControls = useCallback(() => {
    if (!enableKeyboard) return;

    const { forward, backward, left, right, up, down } = get();
    
    if (forward || backward || left || right || up || down) {
      const [x, y, z] = cameraPosition;
      let newX = x;
      let newY = y;
      let newZ = z;

      if (forward) newZ -= moveSpeed;
      if (backward) newZ += moveSpeed;
      if (left) newX -= moveSpeed;
      if (right) newX += moveSpeed;
      if (up) newY += moveSpeed;
      if (down) newY -= moveSpeed;

      updateCameraPosition([newX, newY, newZ]);
    }
  }, [enableKeyboard, get, cameraPosition, moveSpeed, updateCameraPosition]);

  // Mouse controls
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enableMouse || !event.buttons) return;

    const deltaX = event.movementX * rotationSpeed;
    const deltaY = event.movementY * rotationSpeed;

    const [x, y, z] = cameraPosition;
    updateCameraPosition([x + deltaX, y - deltaY, z]);
  }, [enableMouse, rotationSpeed, cameraPosition, updateCameraPosition]);

  const handleWheel = useCallback((event: WheelEvent) => {
    if (!enableMouse) return;

    event.preventDefault();
    const delta = event.deltaY * zoomSpeed * 0.01;
    const [x, y, z] = cameraPosition;
    
    // Zoom by moving camera closer/further
    const factor = 1 + delta;
    updateCameraPosition([x * factor, y * factor, z * factor]);
  }, [enableMouse, zoomSpeed, cameraPosition, updateCameraPosition]);

  // Touch controls
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enableTouch || !isMobile || event.touches.length !== 1) return;

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enableTouch, isMobile]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enableTouch || !isMobile || event.touches.length !== 1) return;
    if (!touchStartRef.current || !lastTouchRef.current) return;

    event.preventDefault();
    const touch = event.touches[0];
    const deltaX = (touch.clientX - lastTouchRef.current.x) * rotationSpeed * 0.1;
    const deltaY = (touch.clientY - lastTouchRef.current.y) * rotationSpeed * 0.1;

    const [x, y, z] = cameraPosition;
    updateCameraPosition([x + deltaX, y - deltaY, z]);

    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enableTouch, isMobile, rotationSpeed, cameraPosition, updateCameraPosition]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    lastTouchRef.current = null;
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (enableMouse) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    if (enableTouch && isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    enableMouse,
    enableTouch,
    isMobile,
    handleMouseMove,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  ]);

  // Keyboard controls loop
  useEffect(() => {
    if (!enableKeyboard) return;

    const interval = setInterval(handleKeyboardControls, 16); // ~60fps
    return () => clearInterval(interval);
  }, [enableKeyboard, handleKeyboardControls]);

  return {
    isTouch: isMobile && enableTouch,
    isKeyboard: enableKeyboard,
    isMouse: enableMouse
  };
};

export default useGameControls;
