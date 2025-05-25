import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { buildingTypes } from "../constants/buildings";
import { Building as BuildingType } from "../stores/useBuildingStore";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface BuildingProps {
  building: BuildingType;
}

const Building = ({ building }: BuildingProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const lastProducedRef = useRef<number>(building.lastProduced);
  
  // Get building type definition
  const buildingType = buildingTypes[building.type];
  if (!buildingType) return null;
  
  // Load texture
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Calculate position (centered on grid cell)
  const [posX, posZ] = building.position;
  const [sizeX, sizeZ] = buildingType.size;
  
  // Center position based on building size
  const position = useMemo(() => [
    posX + sizeX / 2 - 0.5,
    buildingType.height / 2,
    posZ + sizeZ / 2 - 0.5
  ], [posX, posZ, sizeX, sizeZ, buildingType.height]);
  
  // Production animation
  useFrame(() => {
    if (!ref.current) return;
    
    if (buildingType.produces) {
      const now = Date.now();
      const timeSinceLastProduction = now - lastProducedRef.current;
      const productionInterval = buildingType.produces.interval * 1000;
      
      // If production happened, update the reference
      if (building.lastProduced !== lastProducedRef.current) {
        lastProducedRef.current = building.lastProduced;
      }
      
      // Pulse effect when producing
      if (timeSinceLastProduction > productionInterval * 0.9) {
        const scale = 1 + Math.sin(now * 0.01) * 0.05;
        ref.current.scale.set(scale, scale, scale);
      } else {
        ref.current.scale.set(1, 1, 1);
      }
    }
  });
  
  return (
    <mesh
      ref={ref}
      position={position as [number, number, number]}
      rotation={[0, building.rotation, 0]}
      castShadow
      receiveShadow
    >
      {buildingType.model.shape === "box" ? (
        <boxGeometry args={[sizeX, buildingType.height, sizeZ]} />
      ) : (
        <cylinderGeometry args={[sizeX/2, sizeX/2, buildingType.height, 16]} />
      )}
      <meshStandardMaterial 
        map={woodTexture}
        color={buildingType.model.color} 
      />
    </mesh>
  );
};

export default Building;
