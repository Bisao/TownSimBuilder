
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "../stores/useGameStore";
import * as THREE from "three";

const DayNightCycle = () => {
  const { timeCycle, timeOfDay } = useGameStore();
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  
  useFrame(() => {
    if (!lightRef.current || !ambientRef.current) return;
    
    // Calcular posição do sol baseado nos horários realistas
    const hours = timeCycle * 24;
    
    // Mapear horário para ângulo do sol (6h = nascente, 12h = pino, 18h = poente)
    let sunAngle = 0;
    let sunElevation = 0;
    
    if (hours >= 6 && hours <= 18) {
      // Durante o dia (6h-18h): sol visível
      const dayProgress = (hours - 6) / 12; // 0 a 1 durante o dia (12 horas de sol)
      sunAngle = dayProgress * Math.PI; // 0 a π (leste para oeste)
      sunElevation = Math.sin(dayProgress * Math.PI) * 0.9; // Parábola do sol
    } else {
      // Durante a noite: sol abaixo do horizonte
      sunElevation = -0.3;
      if (hours < 6) {
        sunAngle = ((hours + 18) / 12) * Math.PI; // Continua movimento noturno
      } else {
        sunAngle = ((hours - 18) / 12) * Math.PI; // Movimento após pôr do sol
      }
    }
    
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
    const sunIntensity = Math.max(0, sunHeight * 2);
    
    // Intensidades mais realistas
    let directionalIntensity = 0;
    let ambientIntensity = 0;
    let lightColor = new THREE.Color(1, 1, 1);
    let ambientColor = new THREE.Color(0.4, 0.4, 0.6);
    
    if (timeOfDay === "dawn") {
      // Amanhecer (6h-8h) - luz dourada crescente
      const dawnProgress = (hours - 6) / 2; // 0 a 1 durante amanhecer (2 horas)
      directionalIntensity = dawnProgress * sunIntensity * 5.0;
      ambientIntensity = 0.5 + dawnProgress * 0.8;
      lightColor = new THREE.Color(1, 0.8 + dawnProgress * 0.15, 0.6 + dawnProgress * 0.3);
      ambientColor = new THREE.Color(0.5 + dawnProgress * 0.1, 0.4 + dawnProgress * 0.2, 0.6 + dawnProgress * 0.2);
    } else if (timeOfDay === "day") {
      // Dia (8h-18h) - luz intensa e branca
      directionalIntensity = sunIntensity * 6.0;
      ambientIntensity = 1.2;
      lightColor = new THREE.Color(1, 0.98, 0.95); // Branco solar
      ambientColor = new THREE.Color(0.6, 0.7, 0.9); // Azul céu
    } else if (timeOfDay === "dusk") {
      // Entardecer (18h-19h) - luz alaranjada decrescente  
      const duskProgress = (hours - 18) / 1; // 0 a 1 durante entardecer (1 hora)
      directionalIntensity = (1 - duskProgress) * sunIntensity * 4.0;
      ambientIntensity = 0.8 - duskProgress * 0.4;
      lightColor = new THREE.Color(1, 0.7 - duskProgress * 0.2, 0.4 - duskProgress * 0.2);
      ambientColor = new THREE.Color(0.6 - duskProgress * 0.4, 0.4 - duskProgress * 0.2, 0.5 + duskProgress * 0.1);
    } else {
      // Noite (19h-6h) - luz lunar mais intensa
      directionalIntensity = 0.3;
      ambientIntensity = 0.4;
      lightColor = new THREE.Color(0.7, 0.8, 1); // Azul lunar
      ambientColor = new THREE.Color(0.2, 0.2, 0.4); // Azul noturno mais claro
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
      <ambientLight ref={ambientRef} intensity={0.5} />
    </>
  );
};

export default DayNightCycle;>
    </>
  );
};

export default DayNightCycle;
