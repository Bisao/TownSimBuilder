import { useFrame } from "@react-three/fiber";
import { useGameStore } from "../stores/useGameStore";
import { useRef } from "react";
import * as THREE from "three";

const DayNightCycle = () => {
  const { timeCycle, timeOfDay } = useGameStore();
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame(() => {
    if (!lightRef.current) return;
    
    // Calculate sun position based on time cycle (0-1)
    const angle = Math.PI * 2 * timeCycle - Math.PI / 2;
    const radius = 50;
    const height = Math.sin(angle) * radius;
    const horizontalPosition = Math.cos(angle) * radius;
    
    // Update sun position
    lightRef.current.position.set(horizontalPosition, height, 0);
    
    // Change light intensity based on time of day
    if (timeOfDay === "day") {
      lightRef.current.intensity = 1;
    } else if (timeOfDay === "dawn" || timeOfDay === "dusk") {
      lightRef.current.intensity = 0.5;
    } else {
      lightRef.current.intensity = 0.1;
    }
    
    // Update shadow camera
    lightRef.current.shadow.camera.updateProjectionMatrix();
  });
  
  return (
    <directionalLight
      ref={lightRef}
      position={[0, 20, 0]}
      intensity={1}
      castShadow
      shadow-mapSize={[2048, 2048]}
    />
  );
};

export default DayNightCycle;
