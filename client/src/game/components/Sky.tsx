
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

  // Função para interpolar cores baseado nos horários realistas
  const getCurrentSkyColor = () => {
    const colors = skyColors;
    const hours = timeCycle * 24;
    
    let color1, color2, factor;
    
    if (hours >= 0 && hours < 6) {
      // Noite (0h-6h)
      return colors.night;
    } else if (hours >= 6 && hours < 12) {
      // Amanhecer (6h-12h)
      color1 = colors.dawn;
      color2 = colors.day;
      factor = (hours - 6) / 6;
    } else if (hours >= 12 && hours < 18) {
      // Dia (12h-18h)
      return colors.day;
    } else if (hours >= 18 && hours < 21) {
      // Entardecer (18h-21h)
      color1 = colors.day;
      color2 = colors.dusk;
      factor = (hours - 18) / 3;
    } else {
      // Noite (21h-24h)
      color1 = colors.dusk;
      color2 = colors.night;
      factor = (hours - 21) / 3;
    }
    
    return new THREE.Color().lerpColors(color1, color2, factor);
  };

  const getCurrentFogColor = () => {
    const colors = fogColors;
    const hours = timeCycle * 24;
    
    let color1, color2, factor;
    
    if (hours >= 0 && hours < 6) {
      // Noite (0h-6h)
      return colors.night;
    } else if (hours >= 6 && hours < 12) {
      // Amanhecer (6h-12h)
      color1 = colors.dawn;
      color2 = colors.day;
      factor = (hours - 6) / 6;
    } else if (hours >= 12 && hours < 18) {
      // Dia (12h-18h)
      return colors.day;
    } else if (hours >= 18 && hours < 21) {
      // Entardecer (18h-21h)
      color1 = colors.day;
      color2 = colors.dusk;
      factor = (hours - 18) / 3;
    } else {
      // Noite (21h-24h)
      color1 = colors.dusk;
      color2 = colors.night;
      factor = (hours - 21) / 3;
    }
    
    return new THREE.Color().lerpColors(color1, color2, factor);
  };

  useFrame(() => {
    // Calcular posição do sol baseado nos horários realistas
    const hours = timeCycle * 24;
    
    let sunAngle = 0;
    let sunElevation = 0;
    
    if (hours >= 6 && hours <= 18) {
      // Durante o dia (6h-18h): sol visível
      const dayProgress = (hours - 6) / 12; // 0 a 1 durante o dia
      sunAngle = dayProgress * Math.PI; // 0 a π (leste para oeste)
      sunElevation = Math.sin(dayProgress * Math.PI) * 0.9; // Parábola do sol
    } else {
      // Durante a noite: sol abaixo do horizonte
      sunElevation = -0.3;
    }
    
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
      // Sol visível das 6h às 18h
      sunRef.current.visible = hours >= 6 && hours <= 18;
      
      // Intensidade do brilho do sol baseada na altura
      const sunIntensity = Math.max(0, sunElevation);
      if (sunRef.current.material instanceof THREE.MeshBasicMaterial) {
        sunRef.current.material.opacity = sunIntensity * 0.8 + 0.2;
      }
    }
    
    // Posição da lua (oposta ao sol, visível das 21h às 6h)
    const moonAngle = sunAngle + Math.PI;
    const moonElevation = hours >= 21 || hours <= 6 ? Math.abs(sunElevation) : -0.5;
    const moonX = Math.cos(moonAngle) * sunDistance;
    const moonY = Math.max(moonElevation * sunDistance, -50);
    const moonZ = Math.sin(moonAngle) * sunDistance;
    
    if (moonRef.current) {
      moonRef.current.position.set(moonX, moonY, moonZ);
      // Lua visível das 21h às 6h
      moonRef.current.visible = hours >= 21 || hours <= 6;
      
      // Intensidade do brilho da lua
      const moonIntensity = Math.max(0, moonElevation);
      if (moonRef.current.material instanceof THREE.MeshBasicMaterial) {
        moonRef.current.material.opacity = moonIntensity * 0.6 + 0.3;
      }icMaterial) {
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
