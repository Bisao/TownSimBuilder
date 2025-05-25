
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
    
    // Calcular posição do sol mais realista
    // O sol nasce no leste (timeCycle = 0.25) e se põe no oeste (timeCycle = 0.75)
    const sunAngle = (timeCycle - 0.25) * Math.PI * 2; // Ajustar para começar no leste
    const sunElevation = Math.sin((timeCycle - 0.25) * Math.PI * 2) * 0.8; // Altura do sol
    
    // Posição do sol no céu
    const sunDistance = 200;
    const sunX = Math.cos(sunAngle) * sunDistance;
    const sunY = Math.max(sunElevation * sunDistance, -20); // Não deixar muito baixo
    const sunZ = Math.sin(sunAngle) * sunDistance;
    
    // Atualizar posição do sol
    lightRef.current.position.set(sunX, sunY, sunZ);
    lightRef.current.lookAt(0, 0, 0);
    
    // Calcular intensidades baseado na altura do sol
    const sunHeight = Math.max(0, sunElevation);
    const isDay = sunHeight > 0;
    const sunIntensity = Math.max(0, sunHeight * 2);
    
    // Intensidades mais realistas
    let directionalIntensity = 0;
    let ambientIntensity = 0;
    let lightColor = new THREE.Color(1, 1, 1);
    let ambientColor = new THREE.Color(0.4, 0.4, 0.6);
    
    if (timeOfDay === "dawn") {
      // Amanhecer - luz dourada suave
      directionalIntensity = sunIntensity * 1.2;
      ambientIntensity = 0.3 + sunIntensity * 0.3;
      lightColor = new THREE.Color(1, 0.8, 0.6); // Dourado
      ambientColor = new THREE.Color(0.6, 0.5, 0.8); // Roxo suave
    } else if (timeOfDay === "day") {
      // Dia - luz branca intensa
      directionalIntensity = sunIntensity * 2.5;
      ambientIntensity = 0.4 + sunIntensity * 0.5;
      lightColor = new THREE.Color(1, 0.95, 0.9); // Branco quente
      ambientColor = new THREE.Color(0.5, 0.6, 0.8); // Azul suave
    } else if (timeOfDay === "dusk") {
      // Entardecer - luz alaranjada
      directionalIntensity = sunIntensity * 1.5;
      ambientIntensity = 0.35 + sunIntensity * 0.4;
      lightColor = new THREE.Color(1, 0.6, 0.3); // Laranja
      ambientColor = new THREE.Color(0.7, 0.4, 0.6); // Rosa suave
    } else {
      // Noite - apenas luz ambiente azulada
      directionalIntensity = 0.1;
      ambientIntensity = 0.15;
      lightColor = new THREE.Color(0.8, 0.8, 1); // Azul da lua
      ambientColor = new THREE.Color(0.2, 0.2, 0.4); // Azul escuro
    }
    
    // Aplicar intensidades e cores
    lightRef.current.intensity = directionalIntensity;
    lightRef.current.color = lightColor;
    ambientRef.current.intensity = ambientIntensity;
    ambientRef.current.color = ambientColor;
    
    // Configurar sombras mais realistas
    lightRef.current.shadow.camera.near = 10;
    lightRef.current.shadow.camera.far = 500;
    lightRef.current.shadow.camera.left = -150;
    lightRef.current.shadow.camera.right = 150;
    lightRef.current.shadow.camera.top = 150;
    lightRef.current.shadow.camera.bottom = -150;
    lightRef.current.shadow.mapSize.width = 2048;
    lightRef.current.shadow.mapSize.height = 2048;
    lightRef.current.shadow.bias = -0.0001;
    
    // Suavizar bordas das sombras
    lightRef.current.shadow.radius = 4;
  });
  
  return (
    <>
      <directionalLight
        ref={lightRef}
        position={[0, 50, 0]}
        intensity={1}
        castShadow
      />
      <ambientLight ref={ambientRef} intensity={0.3} />
    </>
  );
};

export default DayNightCycle;
