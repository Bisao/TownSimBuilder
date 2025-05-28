import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Controls, useGameStore } from "../stores/useGameStore";
import { useNpcStore } from "../stores/useNpcStore";

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

    // Listener para focar na câmera quando NPC for selecionado
    const handleFocusOnNpc = (event: CustomEvent) => {
      const { position, followMode } = event.detail;
      const npcX = position[0];
      const npcZ = position[2];

      if (followMode) {
        // Modo de seguir (controle manual) - posicionar atrás do NPC
        const newTarget = new THREE.Vector3(npcX, 1.5, npcZ - 2);
        const distance = 8; // Distância da câmera ao NPC
        const height = 5; // Altura da câmera

        const newCameraPosition = new THREE.Vector3(
          npcX,
          height,
          npcZ + distance
        );

        // Atualizar referências
        targetRef.current.copy(newTarget);
        positionRef.current.copy(newCameraPosition);

        // Atualizar câmera imediatamente
        camera.position.copy(newCameraPosition);
        camera.lookAt(newTarget);

        console.log(`Câmera em modo de seguir NPC na posição [${npcX}, ${npcZ}]`);
      } else {
        // Modo normal de foco
        const newTarget = new THREE.Vector3(npcX, 0, npcZ);
        const distance = 8; // Distância da câmera ao NPC
        const height = 6; // Altura da câmera
        const angle = Math.PI / 4; // Ângulo de 45 graus

        const newCameraPosition = new THREE.Vector3(
          npcX - distance * Math.cos(angle),
          height,
          npcZ - distance * Math.sin(angle)
        );

        // Atualizar referências
        targetRef.current.copy(newTarget);
        positionRef.current.copy(newCameraPosition);

        // Atualizar câmera imediatamente
        camera.position.copy(newCameraPosition);
        camera.lookAt(newTarget);

        console.log(`Câmera focada no NPC na posição [${npcX}, ${npcZ}]`);
      }

      // Atualizar store
      updateCameraTarget([targetRef.current.x, targetRef.current.y, targetRef.current.z]);
      updateCameraPosition([positionRef.current.x, positionRef.current.y, positionRef.current.z]);
    };

    window.addEventListener('focusOnNpc', handleFocusOnNpc as EventListener);

    return () => {
      window.removeEventListener('focusOnNpc', handleFocusOnNpc as EventListener);
    };
  }, [camera, updateCameraPosition, updateCameraTarget]);

  // Handler de zoom com scroll do mouse
  // Estados para controle da câmera
  const isDragging = useRef(false);
  const isRotating = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const cameraAngle = useRef(0);

  // Configurações de sensibilidade
  const MOUSE_SENSITIVITY = 0.003;
  const PAN_SENSITIVITY = 0.15;

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      lastMousePosition.current = { x: event.clientX, y: event.clientY };

      if (event.button === 2) { // Botão direito - Pan
        isDragging.current = true;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - lastMousePosition.current.x;
      const deltaY = event.clientY - lastMousePosition.current.y;

      if (isDragging.current) { // Pan
        const direction = new THREE.Vector3()
          .subVectors(positionRef.current, targetRef.current)
          .normalize();
        const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0));
        const forward = new THREE.Vector3().crossVectors(right, new THREE.Vector3(0, 1, 0));

        targetRef.current.add(right.multiplyScalar(-deltaX * PAN_SENSITIVITY));
        targetRef.current.add(forward.multiplyScalar(-deltaY * PAN_SENSITIVITY));
      }

      lastMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      isRotating.current = false;
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
    domElement.addEventListener('mouseleave', handleMouseUp);

    return () => {
      domElement.removeEventListener('mousedown', handleMouseDown);
      domElement.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('contextmenu', handleContextMenu);
      domElement.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [gl, camera]);

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

  // Obter estado do controle manual do NPC
  const { isManualControl, controlledNpcId } = useGameStore();
  const { npcs } = useNpcStore();

  // Atualização por frame
  useFrame(() => {
    const currentTarget = targetRef.current;
    const currentPosition = positionRef.current;
    const currentRotation = rotationRef.current;

    // Se estiver em controle manual do NPC, seguir o NPC
    if (isManualControl && controlledNpcId) {
      const controlledNpc = npcs.find(npc => npc.id === controlledNpcId);
      if (controlledNpc) {
        const npcX = controlledNpc.position[0];
        const npcZ = controlledNpc.position[2];

        // Posicionar câmera atrás do NPC
        const distance = 8; // Distância da câmera ao NPC
        const height = 5; // Altura da câmera

        // Nova posição da câmera (atrás do NPC)
        const newCameraPosition = new THREE.Vector3(
          npcX,
          height,
          npcZ + distance
        );

        // Novo alvo da câmera (ligeiramente à frente do NPC)
        const newTarget = new THREE.Vector3(npcX, 1.5, npcZ - 2);

        // Suavizar movimento da câmera
        currentPosition.lerp(newCameraPosition, 0.15);
        currentTarget.lerp(newTarget, 0.15);

        // Atualizar câmera
        camera.position.copy(currentPosition);
        camera.lookAt(currentTarget);

        // Atualizar store
        updateCameraPosition([currentPosition.x, currentPosition.y, currentPosition.z]);
        updateCameraTarget([currentTarget.x, currentTarget.y, currentTarget.z]);

        return; // Sair cedo para não executar a lógica normal
      }
    }

    // Se estiver em modo manual, não processar controles de câmera
    if (isManualControl && controlledNpcId) {
      return;
    }

    // Movimento da câmera baseado nos controles
    const moveSpeed = 0.5;
    const rotSpeed = 0.02;

    // Rotação da câmera (só funciona se não estiver em controle manual do NPC)
    if (!isManualControl) {
      if (rotateCW) {
        rotationRef.current += ROTATE_SPEED;
      }
      if (rotateCCW) {
        rotationRef.current -= ROTATE_SPEED;
      }
    }

    // Movimento da câmera (só funciona se não estiver em controle manual do NPC)
    const moveDirection = new THREE.Vector3();

    if (!isManualControl) {
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
        moveDirection.z -= Math.sin(currentRotation) * MOVE_SPEED;
      }
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