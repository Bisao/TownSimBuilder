import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
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
  
  // Camera state
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(...cameraTarget));
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...cameraPosition));
  const rotationRef = useRef<number>(cameraRotation);
  
  // Movement speed config
  const moveSpeed = 0.5;
  const rotateSpeed = 0.05;
  const zoomSpeed = 0.5;
  const scrollZoomSpeed = 1.0; // Velocidade do zoom com scroll
  const minDistance = 5;
  const maxDistance = 50;
  
  // Adicionar event listener para o scroll do mouse
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Prevenir o comportamento padrão de scroll da página
      event.preventDefault();
      
      // Determinar a direção do scroll (negativo para zoom out, positivo para zoom in)
      const direction = Math.sign(event.deltaY);
      
      // Obter as posições atuais
      const currentPosition = positionRef.current;
      const currentTarget = targetRef.current;
      
      // Calcular a distância atual entre a câmera e o alvo
      const distance = currentPosition.distanceTo(currentTarget);
      
      // Calcular a nova distância com base na direção do scroll
      const newDistance = Math.max(
        minDistance, 
        Math.min(maxDistance, distance + direction * scrollZoomSpeed)
      );
      
      // Calcular a direção da câmera para o alvo
      const directionVector = new THREE.Vector3()
        .subVectors(currentPosition, currentTarget)
        .normalize();
      
      // Calcular a nova posição com base na nova distância
      const newPosition = new THREE.Vector3()
        .copy(currentTarget)
        .add(directionVector.multiplyScalar(newDistance));
      
      // Atualizar a posição da câmera mantendo a mesma altura proporcional
      currentPosition.copy(newPosition);
      
      // Atualizar a câmera imediatamente
      camera.position.copy(currentPosition);
      camera.lookAt(currentTarget);
      
      // Registrar o zoom no console
      if (direction > 0) {
        console.log("Zooming out (scroll)");
      } else {
        console.log("Zooming in (scroll)");
      }
    };
    
    // Adicionar o event listener ao canvas do Three.js
    const domElement = gl.domElement;
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    
    // Limpar o event listener quando o componente for desmontado
    return () => {
      domElement.removeEventListener('wheel', handleWheel);
    };
  }, [gl, camera]);
  
  // Get keyboard controls
  const forward = useKeyboardControls<Controls>((state) => state.forward);
  const backward = useKeyboardControls<Controls>((state) => state.backward);
  const leftward = useKeyboardControls<Controls>((state) => state.leftward);
  const rightward = useKeyboardControls<Controls>((state) => state.rightward);
  const zoomIn = useKeyboardControls<Controls>((state) => state.zoomIn);
  const zoomOut = useKeyboardControls<Controls>((state) => state.zoomOut);
  const rotateCW = useKeyboardControls<Controls>((state) => state.rotateCW);
  const rotateCCW = useKeyboardControls<Controls>((state) => state.rotateCCW);
  
  // Initialize camera
  useEffect(() => {
    // Set initial camera position and target
    camera.position.set(...cameraPosition);
    camera.lookAt(new THREE.Vector3(...cameraTarget));
    
    // Log camera setup
    console.log("Camera initialized:", {
      position: cameraPosition,
      target: cameraTarget,
    });
  }, []);
  
  // Update camera on frame
  useFrame(() => {
    // Get current state for calculation
    const currentTarget = targetRef.current;
    const currentPosition = positionRef.current;
    const currentRotation = rotationRef.current;
    
    // Handle camera rotation
    if (rotateCW) {
      rotationRef.current += rotateSpeed;
      console.log("Rotating camera clockwise");
    }
    if (rotateCCW) {
      rotationRef.current -= rotateSpeed;
      console.log("Rotating camera counter-clockwise");
    }
    
    // Calculate movement direction based on camera rotation
    const moveDirection = new THREE.Vector3();
    
    if (forward) {
      moveDirection.x += Math.sin(currentRotation) * moveSpeed;
      moveDirection.z += Math.cos(currentRotation) * moveSpeed;
      console.log("Moving camera forward");
    }
    if (backward) {
      moveDirection.x -= Math.sin(currentRotation) * moveSpeed;
      moveDirection.z -= Math.cos(currentRotation) * moveSpeed;
      console.log("Moving camera backward");
    }
    if (leftward) {
      moveDirection.x -= Math.cos(currentRotation) * moveSpeed;
      moveDirection.z += Math.sin(currentRotation) * moveSpeed;
      console.log("Moving camera left");
    }
    if (rightward) {
      moveDirection.x += Math.cos(currentRotation) * moveSpeed;
      moveDirection.z -= Math.sin(currentRotation) * moveSpeed;
      console.log("Moving camera right");
    }
    
    // Update target position
    currentTarget.add(moveDirection);
    
    // Handle zooming
    let zoomChange = 0;
    if (zoomIn) {
      zoomChange -= zoomSpeed;
      console.log("Zooming in");
    }
    if (zoomOut) {
      zoomChange += zoomSpeed;
      console.log("Zooming out");
    }
    
    // Calculate camera position based on target, rotation and distance
    const distance = currentPosition.distanceTo(currentTarget);
    const newDistance = Math.max(minDistance, Math.min(maxDistance, distance + zoomChange));
    
    // Calculate new camera position
    const cameraOffset = new THREE.Vector3(
      Math.sin(currentRotation) * newDistance,
      newDistance * 0.8, // Height factor
      Math.cos(currentRotation) * newDistance
    );
    
    currentPosition.copy(currentTarget).add(cameraOffset);
    
    // Update camera
    camera.position.copy(currentPosition);
    camera.lookAt(currentTarget);
    
    // Update store if values changed significantly
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
