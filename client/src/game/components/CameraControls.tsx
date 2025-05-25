import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Controls, useGameStore } from "../stores/useGameStore";

const CameraControls = () => {
  const { camera, gl } = useThree();
  const {
    cameraPosition,
    cameraTarget,
    cameraRotation,
    updateCameraPosition,
    updateCameraTarget,
    updateCameraRotation,
  } = useGameStore();

  // Referências para posição e alvo da câmera
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(...cameraTarget));
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...cameraPosition));
  const rotationRef = useRef<number>(cameraRotation);

  // Configurações de câmera
  const MIN_ZOOM = 5;
  const MAX_ZOOM = 50;
  const ZOOM_SPEED = 0.8;
  const MOVE_SPEED = 0.5;
  const ROTATE_SPEED = 0.05;

  // Configuração inicial da câmera
  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.lookAt(new THREE.Vector3(...cameraTarget));
    console.log("Camera initialized:", {
      position: cameraPosition,
      target: cameraTarget,
    });
  }, []);

  // Handler de zoom com scroll do mouse
  // Estado para controlar se o botão direito está pressionado
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 2) { // Botão direito
        event.preventDefault();
        isDragging.current = true;
        lastMousePosition.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = event.clientX - lastMousePosition.current.x;
        const deltaY = event.clientY - lastMousePosition.current.y;
        
        // Atualizar posição do alvo
        targetRef.current.x += deltaX * 0.1;
        targetRef.current.z += deltaY * 0.1;
        
        lastMousePosition.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleContextMenu = (event: Event) => {
      event.preventDefault();
    };

    // Adicionar event listeners
    const domElement = gl.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    domElement.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      domElement.removeEventListener('mousedown', handleMouseDown);
      domElement.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gl]);

  useEffect(() => {
    const handleZoom = (event: WheelEvent) => {
      event.preventDefault();

      const zoomDirection = Math.sign(event.deltaY);
      const currentDistance = positionRef.current.distanceTo(targetRef.current);

      // Calcular nova distância com easing
      const zoomAmount = zoomDirection * ZOOM_SPEED * (currentDistance / 20);
      const newDistance = THREE.MathUtils.clamp(
        currentDistance + zoomAmount,
        MIN_ZOOM,
        MAX_ZOOM
      );

      // Calcular nova posição mantendo o ângulo atual
      const direction = new THREE.Vector3()
        .subVectors(positionRef.current, targetRef.current)
        .normalize();

      const newPosition = new THREE.Vector3()
        .copy(targetRef.current)
        .add(direction.multiplyScalar(newDistance));

      // Atualizar posição sem suavização
      positionRef.current.copy(newPosition);
      camera.position.copy(positionRef.current);
      camera.lookAt(targetRef.current);

      console.log(zoomDirection > 0 ? "Zooming out" : "Zooming in");
    };

    const domElement = gl.domElement;
    domElement.addEventListener('wheel', handleZoom, { passive: false });
    return () => domElement.removeEventListener('wheel', handleZoom);
  }, [gl, camera]);

  // Controles de teclado
  const forward = useKeyboardControls<Controls>((state) => state.forward);
  const backward = useKeyboardControls<Controls>((state) => state.backward);
  const leftward = useKeyboardControls<Controls>((state) => state.leftward);
  const rightward = useKeyboardControls<Controls>((state) => state.rightward);
  const rotateCW = useKeyboardControls<Controls>((state) => state.rotateCW);
  const rotateCCW = useKeyboardControls<Controls>((state) => state.rotateCCW);

  // Atualização por frame
  useFrame(() => {
    const currentTarget = targetRef.current;
    const currentPosition = positionRef.current;
    const currentRotation = rotationRef.current;

    // Rotação da câmera
    if (rotateCW) {
      rotationRef.current += ROTATE_SPEED;
    }
    if (rotateCCW) {
      rotationRef.current -= ROTATE_SPEED;
    }

    // Movimento da câmera
    const moveDirection = new THREE.Vector3();

    if (forward) {
      moveDirection.x += Math.sin(currentRotation) * MOVE_SPEED;
      moveDirection.z += Math.cos(currentRotation) * MOVE_SPEED;
    }
    if (backward) {
      moveDirection.x -= Math.sin(currentRotation) * MOVE_SPEED;
      moveDirection.z -= Math.cos(currentRotation) * MOVE_SPEED;
    }
    if (leftward) {
      moveDirection.x += Math.cos(currentRotation) * MOVE_SPEED;
      moveDirection.z += Math.sin(currentRotation) * MOVE_SPEED;
    }
    if (rightward) {
      moveDirection.x -= Math.cos(currentRotation) * MOVE_SPEED;
      moveDirection.z += Math.sin(currentRotation) * MOVE_SPEED;
    }

    // Atualizar posição do alvo
    currentTarget.add(moveDirection);

    // Atualizar câmera apenas para olhar para o alvo
    camera.lookAt(currentTarget);

    // Atualizar store apenas quando houver mudanças significativas
    if (
      Math.abs(currentPosition.x - cameraPosition[0]) > 0.1 ||
      Math.abs(currentPosition.y - cameraPosition[1]) > 0.1 ||
      Math.abs(currentPosition.z - cameraPosition[2]) > 0.1
    ) {
      updateCameraPosition([
        currentPosition.x,
        currentPosition.y,
        currentPosition.z,
      ]);
    }

    if (
      Math.abs(currentTarget.x - cameraTarget[0]) > 0.1 ||
      Math.abs(currentTarget.y - cameraTarget[1]) > 0.1 ||
      Math.abs(currentTarget.z - cameraTarget[2]) > 0.1
    ) {
      updateCameraTarget([
        currentTarget.x,
        currentTarget.y,
        currentTarget.z,
      ]);
    }

    if (Math.abs(currentRotation - cameraRotation) > 0.01) {
      updateCameraRotation(currentRotation);
    }
  });

  return null;
};

export default CameraControls;