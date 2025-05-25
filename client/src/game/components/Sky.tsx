
import { useTexture } from "@react-three/drei";
import { useGameStore } from "../stores/useGameStore";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export const Sky = () => {
  const { timeOfDay, timeCycle } = useGameStore();
  
  const skyTexture = useTexture("/textures/sky.png");
  
  const skyColors = useMemo(() => ({
    dawn: new THREE.Color("#FF6B6B"),  // Rosa suave
    day: new THREE.Color("#87CEEB"),   // Azul céu
    dusk: new THREE.Color("#FF8C42"),  // Laranja suave
    night: new THREE.Color("#1A1A2E"), // Azul muito escuro
  }), []);
  
  const fogColors = useMemo(() => ({
    dawn: new THREE.Color("#FFE5E5"),  // Rosa muito claro
    day: new THREE.Color("#E6F3FF"),   // Azul muito claro
    dusk: new THREE.Color("#FFE0CC"),  // Laranja muito claro
    night: new THREE.Color("#0F0F23"), // Azul escuro
  }), []);

  // Função para interpolar cores baseado no timeCycle
  const getCurrentSkyColor = () => {
    const colors = skyColors;
    const cycle = timeCycle;
    
    let color1, color2, factor;
    
    if (cycle < 0.25) {
      // Noite para amanhecer
      color1 = colors.night;
      color2 = colors.dawn;
      factor = cycle / 0.25;
    } else if (cycle < 0.5) {
      // Amanhecer para dia
      color1 = colors.dawn;
      color2 = colors.day;
      factor = (cycle - 0.25) / 0.25;
    } else if (cycle < 0.75) {
      // Dia para entardecer
      color1 = colors.day;
      color2 = colors.dusk;
      factor = (cycle - 0.5) / 0.25;
    } else {
      // Entardecer para noite
      color1 = colors.dusk;
      color2 = colors.night;
      factor = (cycle - 0.75) / 0.25;
    }
    
    return new THREE.Color().lerpColors(color1, color2, factor);
  };

  const getCurrentFogColor = () => {
    const colors = fogColors;
    const cycle = timeCycle;
    
    let color1, color2, factor;
    
    if (cycle < 0.25) {
      color1 = colors.night;
      color2 = colors.dawn;
      factor = cycle / 0.25;
    } else if (cycle < 0.5) {
      color1 = colors.dawn;
      color2 = colors.day;
      factor = (cycle - 0.25) / 0.25;
    } else if (cycle < 0.75) {
      color1 = colors.day;
      color2 = colors.dusk;
      factor = (cycle - 0.5) / 0.25;
    } else {
      color1 = colors.dusk;
      color2 = colors.night;
      factor = (cycle - 0.75) / 0.25;
    }
    
    return new THREE.Color().lerpColors(color1, color2, factor);
  };

  useEffect(() => {
    const skyColor = getCurrentSkyColor();
    const fogColor = getCurrentFogColor();
    
    if (skyTexture) {
      skyTexture.colorSpace = THREE.SRGBColorSpace;
    }
    
    // Atualizar cor do fog da cena
    const scene = document.querySelector('canvas')?.parentElement;
    if (scene) {
      scene.style.backgroundColor = fogColor.getStyle();
    }
  }, [timeCycle, skyTexture]);

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[800, 32, 32]} />
      <meshBasicMaterial
        map={skyTexture}
        color={getCurrentSkyColor()}
        side={THREE.BackSide}
        fog={false}
      />
    </mesh>
  );
};
