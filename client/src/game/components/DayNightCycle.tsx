
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "../stores/useGameStore";
import * as THREE from "three";

// Lighting configuration
const LIGHTING_CONFIG = {
  SUN_DISTANCE: 200,
  SHADOW_MAP_SIZE: 2048,
  SHADOW_CAMERA_SIZE: 150,
  SHADOW_NEAR: 10,
  SHADOW_FAR: 500,
  SHADOW_BIAS: -0.0001,
  SHADOW_RADIUS: 4,
} as const;

const DayNightCycle: React.FC = () => {
  const { timeCycle, timeOfDay } = useGameStore();
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  
  // Memoize light colors to avoid recreating objects
  const lightColors = useMemo(() => ({
    dawn: {
      directional: new THREE.Color(1, 0.8, 0.6),
      ambient: new THREE.Color(0.5, 0.4, 0.6)
    },
    day: {
      directional: new THREE.Color(1, 0.98, 0.95),
      ambient: new THREE.Color(0.6, 0.7, 0.9)
    },
    dusk: {
      directional: new THREE.Color(1, 0.7, 0.4),
      ambient: new THREE.Color(0.6, 0.4, 0.5)
    },
    night: {
      directional: new THREE.Color(0.7, 0.8, 1),
      ambient: new THREE.Color(0.2, 0.2, 0.4)
    }
  }), []);

  const calculateSunPosition = (hours: number) => {
    let sunAngle = 0;
    let sunElevation = 0;
    
    if (hours >= 6 && hours <= 18) {
      // Daytime (6h-18h): visible sun
      const dayProgress = (hours - 6) / 12; // 0 to 1 during day
      sunAngle = dayProgress * Math.PI; // 0 to π (east to west)
      sunElevation = Math.sin(dayProgress * Math.PI) * 0.9; // Sun parabola
    } else {
      // Nighttime: sun below horizon
      sunElevation = -0.3;
      if (hours < 6) {
        sunAngle = ((hours + 18) / 12) * Math.PI;
      } else {
        sunAngle = ((hours - 18) / 12) * Math.PI;
      }
    }
    
    // Calculate 3D position
    const sunX = Math.cos(sunAngle) * LIGHTING_CONFIG.SUN_DISTANCE;
    const sunY = Math.max(sunElevation * LIGHTING_CONFIG.SUN_DISTANCE, -20);
    const sunZ = Math.sin(sunAngle) * LIGHTING_CONFIG.SUN_DISTANCE;
    
    return { x: sunX, y: sunY, z: sunZ, elevation: sunElevation };
  };

  const calculateLightingValues = (timeOfDay: string, hours: number, sunElevation: number) => {
    const sunHeight = Math.max(0, sunElevation);
    const sunIntensity = Math.max(0, sunHeight * 2);
    
    let directionalIntensity = 0;
    let ambientIntensity = 0;
    let lightColor = lightColors.day.directional;
    let ambientColor = lightColors.day.ambient;
    
    switch (timeOfDay) {
      case "dawn":
        const dawnProgress = (hours - 6) / 2; // 0 to 1 during dawn (2 hours)
        directionalIntensity = dawnProgress * sunIntensity * 5.0;
        ambientIntensity = 0.5 + dawnProgress * 0.8;
        lightColor = lightColors.dawn.directional.clone().lerp(lightColors.day.directional, dawnProgress);
        ambientColor = lightColors.dawn.ambient.clone().lerp(lightColors.day.ambient, dawnProgress);
        break;
        
      case "day":
        directionalIntensity = sunIntensity * 6.0;
        ambientIntensity = 1.2;
        lightColor = lightColors.day.directional;
        ambientColor = lightColors.day.ambient;
        break;
        
      case "dusk":
        const duskProgress = (hours - 18) / 1; // 0 to 1 during dusk (1 hour)
        directionalIntensity = (1 - duskProgress) * sunIntensity * 4.0;
        ambientIntensity = 0.8 - duskProgress * 0.4;
        lightColor = lightColors.day.directional.clone().lerp(lightColors.dusk.directional, duskProgress);
        ambientColor = lightColors.day.ambient.clone().lerp(lightColors.dusk.ambient, duskProgress);
        break;
        
      case "night":
      default:
        directionalIntensity = 0.3;
        ambientIntensity = 0.4;
        lightColor = lightColors.night.directional;
        ambientColor = lightColors.night.ambient;
        break;
    }
    
    return { directionalIntensity, ambientIntensity, lightColor, ambientColor };
  };

  const configureShadows = (light: THREE.DirectionalLight) => {
    light.shadow.camera.near = LIGHTING_CONFIG.SHADOW_NEAR;
    light.shadow.camera.far = LIGHTING_CONFIG.SHADOW_FAR;
    light.shadow.camera.left = -LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
    light.shadow.camera.right = LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
    light.shadow.camera.top = LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
    light.shadow.camera.bottom = -LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
    light.shadow.mapSize.width = LIGHTING_CONFIG.SHADOW_MAP_SIZE;
    light.shadow.mapSize.height = LIGHTING_CONFIG.SHADOW_MAP_SIZE;
    light.shadow.bias = LIGHTING_CONFIG.SHADOW_BIAS;
    light.shadow.radius = LIGHTING_CONFIG.SHADOW_RADIUS;
  };
  
  useFrame(() => {
    if (!lightRef.current || !ambientRef.current) return;
    
    const hours = timeCycle * 24;
    const sunPosition = calculateSunPosition(hours);
    const lightingValues = calculateLightingValues(timeOfDay, hours, sunPosition.elevation);
    
    // Update sun position
    lightRef.current.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
    lightRef.current.lookAt(0, 0, 0);
    
    // Update lighting
    lightRef.current.intensity = lightingValues.directionalIntensity;
    lightRef.current.color = lightingValues.lightColor;
    ambientRef.current.intensity = lightingValues.ambientIntensity;
    ambientRef.current.color = lightingValues.ambientColor;
    
    // Configure shadows
    configureShadows(lightRef.current);
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
