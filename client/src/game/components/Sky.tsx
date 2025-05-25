
import { useTexture } from "@react-three/drei";
import { useGameStore } from "../stores/useGameStore";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export const Sky = () => {
  const { timeOfDay } = useGameStore();
  
  const skyTexture = useTexture("/textures/sky.png");
  
  const skyColors = useMemo(() => ({
    dawn: new THREE.Color("#FF7F50"),  // Coral
    day: new THREE.Color("#87CEEB"),   // Sky blue
    dusk: new THREE.Color("#FF4500"),  // Orange red
    night: new THREE.Color("#191970"), // Midnight blue
  }), []);
  
  const fogColors = useMemo(() => ({
    dawn: new THREE.Color("#FFB6C1"),  // Light pink
    day: new THREE.Color("#F0F8FF"),   // Alice blue
    dusk: new THREE.Color("#DEB887"),  // Burlywood
    night: new THREE.Color("#000080"), // Navy
  }), []);

  useEffect(() => {
    const color = skyColors[timeOfDay];
    const fogColor = fogColors[timeOfDay];
    
    if (color) {
      skyTexture.colorSpace = THREE.SRGBColorSpace;
    }
    
    // Atualizar cor do fog da cena
    const scene = document.querySelector('canvas')?.parentElement;
    if (scene) {
      scene.style.backgroundColor = fogColor.getStyle();
    }
  }, [timeOfDay, skyColors, fogColors]);

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1000, 32, 32]} />
      <meshBasicMaterial
        map={skyTexture}
        color={skyColors[timeOfDay]}
        side={THREE.BackSide}
        fog={true}
      />
    </mesh>
  );
};
