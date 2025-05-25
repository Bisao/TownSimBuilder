
import { useTexture } from "@react-three/drei";
import { useGameStore } from "../stores/useGameStore";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export const Sky = () => {
  const { timeOfDay, timeCycle } = useGameStore();
  const sunRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  
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

  useFrame(() => {
    // Calcular posição do sol e da lua
    const sunAngle = (timeCycle - 0.25) * Math.PI * 2;
    const sunElevation = Math.sin((timeCycle - 0.25) * Math.PI * 2) * 0.8;
    
    const sunDistance = 400;
    const sunX = Math.cos(sunAngle) * sunDistance;
    const sunY = Math.max(sunElevation * sunDistance, -50);
    const sunZ = Math.sin(sunAngle) * sunDistance;
    
    // Posição da lua (oposta ao sol)
    const moonAngle = sunAngle + Math.PI;
    const moonElevation = -sunElevation;
    const moonX = Math.cos(moonAngle) * sunDistance;
    const moonY = Math.max(moonElevation * sunDistance, -50);
    const moonZ = Math.sin(moonAngle) * sunDistance;
    
    // Atualizar posições
    if (sunRef.current) {
      sunRef.current.position.set(sunX, sunY, sunZ);
      // Sol só visível durante o dia
      sunRef.current.visible = sunElevation > -0.1;
      
      // Intensidade do brilho do sol baseada na altura
      const sunIntensity = Math.max(0, sunElevation + 0.1);
      if (sunRef.current.material instanceof THREE.MeshBasicMaterial) {
        sunRef.current.material.opacity = sunIntensity;
      }
    }
    
    if (moonRef.current) {
      moonRef.current.position.set(moonX, moonY, moonZ);
      // Lua só visível durante a noite
      moonRef.current.visible = moonElevation > -0.1;
      
      // Intensidade do brilho da lua
      const moonIntensity = Math.max(0, moonElevation + 0.1);
      if (moonRef.current.material instanceof THREE.MeshBasicMaterial) {
        moonRef.current.material.opacity = moonIntensity * 0.8; // Lua menos brilhante
      }
    }
  });

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
    <>
      {/* Céu */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[800, 32, 32]} />
        <meshBasicMaterial
          map={skyTexture}
          color={getCurrentSkyColor()}
          side={THREE.BackSide}
          fog={false}
        />
      </mesh>
      
      {/* Sol */}
      <mesh ref={sunRef} position={[0, 100, 0]}>
        <sphereGeometry args={[15, 16, 16]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={1}
        />
        {/* Halo do sol */}
        <mesh scale={[2, 2, 2]}>
          <sphereGeometry args={[15, 16, 16]} />
          <meshBasicMaterial
            color="#FFFF99"
            transparent
            opacity={0.3}
          />
        </mesh>
      </mesh>
      
      {/* Lua */}
      <mesh ref={moonRef} position={[0, 100, 0]}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial
          color="#F0F0F0"
          transparent
          opacity={0.8}
        />
        {/* Halo da lua */}
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[12, 16, 16]} />
          <meshBasicMaterial
            color="#E6E6FA"
            transparent
            opacity={0.2}
          />
        </mesh>
      </mesh>
    </>
  );
};
