import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { buildingTypes } from "../constants/buildings";
import { Building as BuildingType } from "../stores/useBuildingStore";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface BuildingProps {
  building: BuildingType;
  onClick?: (building: BuildingType) => void;
}

const Building = ({ building, onClick }: BuildingProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const lastProducedRef = useRef<number>(building.lastProduced);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

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
    buildingType.height / 2 - 0.1,
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

    // Efeito de destaque quando o mouse está sobre o edifício
    if (hovered) {
      // Efeito de pulso suave ao passar o mouse
      const pulseFactor = 1 + Math.sin(Date.now() * 0.005) * 0.05;
      ref.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
  });

  // Lidar com interações do mouse
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (building.type === "market") {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (building.type === "market" && onClick) {
      onClick(building);
    } else if (building.type.includes("House")) {
      // Encontrar o NPC associado a esta casa
      const npc = window.dispatchEvent(new CustomEvent('npcHouseClick', { detail: building }));
    }
  };

  return (
    <mesh
      ref={ref}
      position={position as [number, number, number]}
      rotation={[0, building.rotation, 0]}
      castShadow
      receiveShadow
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
    >
      {buildingType.model.shape === "box" ? (
        <boxGeometry args={[sizeX, buildingType.height, sizeZ]} />
      ) : (
        <cylinderGeometry args={[sizeX / 2, sizeX / 2, buildingType.height, 16]} />
      )}
      <meshStandardMaterial
        map={woodTexture}
        color={buildingType.model.color}
        emissive={hovered ? new THREE.Color(0x555555) : undefined}
      />
    </mesh>
  );
};

export default Building;