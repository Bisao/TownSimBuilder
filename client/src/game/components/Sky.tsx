import { useTexture } from "@react-three/drei";
import { useGameStore } from "../stores/useGameStore";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export const Sky = () => {
  const { timeOfDay } = useGameStore();
  
  // Load sky texture
  const skyTexture = useTexture("/textures/sky.png");
  
  // Different sky colors based on time of day
  const skyColors = useMemo(() => ({
    dawn: new THREE.Color("#FFA07A"),   // Light salmon
    day: new THREE.Color("#87CEEB"),    // Sky blue
    dusk: new THREE.Color("#FF8C00"),   // Dark orange
    night: new THREE.Color("#191970"),  // Midnight blue
  }), []);
  
  // Update fog color based on time of day
  useEffect(() => {
    const color = skyColors[timeOfDay];
    if (color) {
      skyTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [timeOfDay, skyColors]);

  return (
    <mesh position={[0, 0, 0]}>
      {/* Huge sphere around the scene */}
      <sphereGeometry args={[500, 32, 32]} />
      <meshBasicMaterial 
        map={skyTexture}
        color={skyColors[timeOfDay]}
        side={THREE.BackSide} 
      />
    </mesh>
  );
};
