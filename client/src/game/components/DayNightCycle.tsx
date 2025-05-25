
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "../stores/useGameStore";
import { useRef } from "react";
import * as THREE from "three";

const DayNightCycle = () => {
  const { timeCycle, timeOfDay } = useGameStore();
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  
  useFrame(() => {
    if (!lightRef.current || !ambientRef.current) return;
    
    // Calcular posição do sol
    const angle = Math.PI * 2 * timeCycle - Math.PI / 2;
    const radius = 100;
    const height = Math.sin(angle) * radius;
    const horizontalPosition = Math.cos(angle) * radius;
    
    // Atualizar posição do sol
    lightRef.current.position.set(horizontalPosition, height, horizontalPosition);
    
    // Ajustar intensidade baseado no período
    let directionalIntensity = 0;
    let ambientIntensity = 0;
    
    switch(timeOfDay) {
      case "day":
        directionalIntensity = 1.5;
        ambientIntensity = 0.8;
        break;
      case "dawn":
        directionalIntensity = 1.2;
        ambientIntensity = 0.6;
        break;
      case "dusk":
        directionalIntensity = 0.8;
        ambientIntensity = 0.4;
        break;
      case "night":
        directionalIntensity = 0.2;
        ambientIntensity = 0.3;
        break;
    }
    
    lightRef.current.intensity = directionalIntensity;
    ambientRef.current.intensity = ambientIntensity;
    
    // Configurar sombras
    lightRef.current.shadow.camera.near = 1;
    lightRef.current.shadow.camera.far = 1000;
    lightRef.current.shadow.camera.left = -100;
    lightRef.current.shadow.camera.right = 100;
    lightRef.current.shadow.camera.top = 100;
    lightRef.current.shadow.camera.bottom = -100;
    lightRef.current.shadow.mapSize.width = 4096;
    lightRef.current.shadow.mapSize.height = 4096;
  });
  
  return (
    <>
      <directionalLight
        ref={lightRef}
        position={[0, 50, 0]}
        intensity={1}
        castShadow
      />
      <ambientLight ref={ambientRef} intensity={0.5} />
    </>
  );
};

export default DayNightCycle;
