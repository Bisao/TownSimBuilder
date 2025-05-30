import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useCallback } from "react";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../stores/useGameStore";
import { useNpcStore } from "../stores/useNpcStore";
import { Controls } from "../types/controls";

// Constants
const CAMERA_CONFIG = {
  MIN_ZOOM: 5,
  MAX_ZOOM: 50,
  ZOOM_SPEED: 0.8,
  MOVE_SPEED: 0.5,
  ROTATE_SPEED: 0.05,
  MOUSE_SENSITIVITY: 0.003,
  PAN_SENSITIVITY: 0.15,
  FOLLOW_DISTANCE: 8,
  FOLLOW_HEIGHT: 5,
  FOCUS_DISTANCE: 8,
  FOCUS_HEIGHT: 6,
} as const;

const CameraControls: React.FC = () => {
  const { camera, gl } = useThree();
  const {
    cameraPosition,
    cameraTarget,
    cameraRotation,
    updateCameraPosition,
    updateCameraTarget,
    updateCameraRotation,
    isManualControl,
    controlledNpcId,
  } = useGameStore();

  const { npcs } = useNpcStore();

  // Refs for camera state
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(...cameraTarget));
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...cameraPosition));
  const rotationRef = useRef<number>(cameraRotation);

  // Mouse control state
  const mouseState = useRef({
    isDragging: false,
    isRotating: false,
    lastPosition: { x: 0, y: 0 },
    cameraAngle: 0,
  });

  // Initialize camera
  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.lookAt(new THREE.Vector3(...cameraTarget));
    console.log("Camera initialized:", { position: cameraPosition, target: cameraTarget });
  }, [camera, cameraPosition, cameraTarget]);

  // NPC focus event handler
  useEffect(() => {
    const handleFocusOnNpc = (event: CustomEvent) => {
      const { position, followMode } = event.detail;
      const [npcX, , npcZ] = position;

      if (followMode) {
        setupFollowMode(npcX, npcZ);
      } else {
        setupFocusMode(npcX, npcZ);
      }
    };

    window.addEventListener('focusOnNpc', handleFocusOnNpc as EventListener);
    return () => window.removeEventListener('focusOnNpc', handleFocusOnNpc as EventListener);
  }, []);

  const setupFollowMode = useCallback((npcX: number, npcZ: number) => {
    const newTarget = new THREE.Vector3(npcX, 1.5, npcZ - 2);
    const newCameraPosition = new THREE.Vector3(npcX, CAMERA_CONFIG.FOLLOW_HEIGHT, npcZ + CAMERA_CONFIG.FOLLOW_DISTANCE);

    targetRef.current.copy(newTarget);
    positionRef.current.copy(newCameraPosition);

    camera.position.copy(newCameraPosition);
    camera.lookAt(newTarget);

    updateCameraTarget([newTarget.x, newTarget.y, newTarget.z]);
    updateCameraPosition([newCameraPosition.x, newCameraPosition.y, newCameraPosition.z]);
  }, [camera, updateCameraTarget, updateCameraPosition]);

  const setupFocusMode = useCallback((npcX: number, npcZ: number) => {
    const newTarget = new THREE.Vector3(npcX, 0, npcZ);
    const angle = Math.PI / 4;
    const newCameraPosition = new THREE.Vector3(
      npcX - CAMERA_CONFIG.FOCUS_DISTANCE * Math.cos(angle),
      CAMERA_CONFIG.FOCUS_HEIGHT,
      npcZ - CAMERA_CONFIG.FOCUS_DISTANCE * Math.sin(angle)
    );

    targetRef.current.copy(newTarget);
    positionRef.current.copy(newCameraPosition);

    camera.position.copy(newCameraPosition);
    camera.lookAt(newTarget);

    updateCameraTarget([newTarget.x, newTarget.y, newTarget.z]);
    updateCameraPosition([newCameraPosition.x, newCameraPosition.y, newCameraPosition.z]);
  }, [camera, updateCameraTarget, updateCameraPosition]);

  // Mouse controls
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      mouseState.current.lastPosition = { x: event.clientX, y: event.clientY };

      if (event.button === 2) {
        mouseState.current.isDragging = true;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - mouseState.current.lastPosition.x;
      const deltaY = event.clientY - mouseState.current.lastPosition.y;

      if (mouseState.current.isDragging) {
        const direction = new THREE.Vector3()
          .subVectors(positionRef.current, targetRef.current)
          .normalize();
        const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0));
        const forward = new THREE.Vector3().crossVectors(right, new THREE.Vector3(0, 1, 0));

        targetRef.current.add(right.multiplyScalar(-deltaX * CAMERA_CONFIG.PAN_SENSITIVITY));
        targetRef.current.add(forward.multiplyScalar(-deltaY * CAMERA_CONFIG.PAN_SENSITIVITY));
      }

      mouseState.current.lastPosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      mouseState.current.isDragging = false;
      mouseState.current.isRotating = false;
    };

    const handleContextMenu = (event: Event) => {
      event.preventDefault();
    };

    const domElement = gl.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    domElement.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('contextmenu', handleContextMenu);
    domElement.addEventListener('mouseleave', handleMouseUp);

    return () => {
      domElement.removeEventListener('mousedown', handleMouseDown);
      domElement.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('contextmenu', handleContextMenu);
      domElement.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [gl]);

  // Zoom controls
  useEffect(() => {
    const handleZoom = (event: WheelEvent) => {
      event.preventDefault();

      const zoomDirection = Math.sign(event.deltaY);
      const currentDistance = positionRef.current.distanceTo(targetRef.current);
      const zoomAmount = zoomDirection * CAMERA_CONFIG.ZOOM_SPEED * (currentDistance / 20);
      const newDistance = THREE.MathUtils.clamp(
        currentDistance + zoomAmount,
        CAMERA_CONFIG.MIN_ZOOM,
        CAMERA_CONFIG.MAX_ZOOM
      );

      const direction = new THREE.Vector3()
        .subVectors(positionRef.current, targetRef.current)
        .normalize();

      const newPosition = new THREE.Vector3()
        .copy(targetRef.current)
        .add(direction.multiplyScalar(newDistance));

      positionRef.current.copy(newPosition);
      camera.position.copy(positionRef.current);
      camera.lookAt(targetRef.current);
    };

    const domElement = gl.domElement;
    domElement.addEventListener('wheel', handleZoom, { passive: false });
    return () => domElement.removeEventListener('wheel', handleZoom);
  }, [gl, camera]);

  // Keyboard controls
  const forward = useKeyboardControls<Controls>((state) => state.forward);
  const backward = useKeyboardControls<Controls>((state) => state.backward);
  const leftward = useKeyboardControls<Controls>((state) => state.leftward);
  const rightward = useKeyboardControls<Controls>((state) => state.rightward);
  const rotateCW = useKeyboardControls<Controls>((state) => state.rotateCW);
  const rotateCCW = useKeyboardControls<Controls>((state) => state.rotateCCW);

  // Frame update
  useFrame(() => {
    const currentTarget = targetRef.current;
    const currentPosition = positionRef.current;
    const currentRotation = rotationRef.current;

    // Follow NPC mode
    if (isManualControl && controlledNpcId) {
      const controlledNpc = npcs.find(npc => npc.id === controlledNpcId);
      if (controlledNpc) {
        const [npcX, , npcZ] = controlledNpc.position;
        const newCameraPosition = new THREE.Vector3(npcX, CAMERA_CONFIG.FOLLOW_HEIGHT, npcZ + CAMERA_CONFIG.FOLLOW_DISTANCE);
        const newTarget = new THREE.Vector3(npcX, 1.5, npcZ - 2);

        currentPosition.lerp(newCameraPosition, 0.15);
        currentTarget.lerp(newTarget, 0.15);

        camera.position.copy(currentPosition);
        camera.lookAt(currentTarget);

        updateCameraPosition([currentPosition.x, currentPosition.y, currentPosition.z]);
        updateCameraTarget([currentTarget.x, currentTarget.y, currentTarget.z]);
        return;
      }
    }

    // Manual camera controls
    if (!isManualControl) {
      // Rotation
      if (rotateCW) rotationRef.current += CAMERA_CONFIG.ROTATE_SPEED;
      if (rotateCCW) rotationRef.current -= CAMERA_CONFIG.ROTATE_SPEED;

      // Movement
      const moveDirection = new THREE.Vector3();
      if (forward) {
        moveDirection.x += Math.sin(currentRotation) * CAMERA_CONFIG.MOVE_SPEED;
        moveDirection.z += Math.cos(currentRotation) * CAMERA_CONFIG.MOVE_SPEED;
      }
      if (backward) {
        moveDirection.x -= Math.sin(currentRotation) * CAMERA_CONFIG.MOVE_SPEED;
        moveDirection.z -= Math.cos(currentRotation) * CAMERA_CONFIG.MOVE_SPEED;
      }
      if (leftward) {
        moveDirection.x += Math.cos(currentRotation) * CAMERA_CONFIG.MOVE_SPEED;
        moveDirection.z += Math.sin(currentRotation) * CAMERA_CONFIG.MOVE_SPEED;
      }
      if (rightward) {
        moveDirection.x -= Math.cos(currentRotation) * CAMERA_CONFIG.MOVE_SPEED;
        moveDirection.z -= Math.sin(currentRotation) * CAMERA_CONFIG.MOVE_SPEED;
      }

      currentTarget.add(moveDirection);
    }

    camera.lookAt(currentTarget);

    // Update store when significant changes occur
    const positionThreshold = 0.1;
    const rotationThreshold = 0.01;

    if (
      Math.abs(currentPosition.x - cameraPosition[0]) > positionThreshold ||
      Math.abs(currentPosition.y - cameraPosition[1]) > positionThreshold ||
      Math.abs(currentPosition.z - cameraPosition[2]) > positionThreshold
    ) {
      updateCameraPosition([currentPosition.x, currentPosition.y, currentPosition.z]);
    }

    if (
      Math.abs(currentTarget.x - cameraTarget[0]) > positionThreshold ||
      Math.abs(currentTarget.y - cameraTarget[1]) > positionThreshold ||
      Math.abs(currentTarget.z - cameraTarget[2]) > positionThreshold
    ) {
      updateCameraTarget([currentTarget.x, currentTarget.y, currentTarget.z]);
    }

    if (Math.abs(currentRotation - cameraRotation) > rotationThreshold) {
      updateCameraRotation(currentRotation);
    }
  });

  return null;
};

export default CameraControls;