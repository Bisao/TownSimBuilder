import React from "react";
import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { buildingTypes } from "../constants/buildings";
import { Building as BuildingType } from "../stores/useBuildingStore";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Html } from "@react-three/drei";
import { useNpcStore } from "../stores/useNpcStore";

interface BuildingProps {
  building: BuildingType;
  onClick?: (building: BuildingType) => void;
}

const Building = ({ building, onClick }: BuildingProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const lastProducedRef = useRef<number>(building.lastProduced);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Always call hooks at component level
  const npcs = useNpcStore(state => state.npcs);

  // Get building type definition
  const buildingType = buildingTypes[building.type];

  // Early return AFTER all hooks are called
  if (!buildingType) return null;

  // Memoize house NPCs to prevent unnecessary recalculations
  const houseNpcs = useMemo(() => {
    if (!building.type.includes("House")) return [];
    return npcs.filter(npc => npc.homeId === building.id);
  }, [npcs, building.id, building.type]);

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
      window.dispatchEvent(new CustomEvent('npcHouseClick', { detail: building }));
    } else if (building.type === 'silo') {
      window.dispatchEvent(new CustomEvent('siloClick', { detail: building }));
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
      {/* Ícones de status dos NPCs para casas */}
      {building.type.includes("House") && (
        <group position={[0, buildingType.height + 0.3, 0]}>
          {houseNpcs.map((npc, index) => {
              return (
                <Html
                  key={npc.id}
                  position={[
                    -0.4 + (index * 0.4),
                    0,
                    0
                  ]}
                  occlude
                >
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: npc.isSleeping ? 'lightblue' : 'lightgreen',
                      border: '1px solid black'
                    }}
                    title={npc.name + (npc.isSleeping ? ' (Dormindo)' : ' (Ativo)')}
                  />
                </Html>
              );
            })}
        </group>
      )}
      {/* Renderizar plantação se for uma fazenda */}
      {building.type === 'farm' && building.plantation && (
        <group position={[0, 0.01, 0]}>
          {building.plantation.planted && !building.plantation.harvested && (
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
              <meshStandardMaterial 
                color={building.plantation.ready ? "#32CD32" : "#90EE90"} 
              />
            </mesh>
          )}
          {building.plantation.planted && !building.plantation.harvested && (
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial 
                color={building.plantation.ready ? "#FFD700" : "#ADFF2F"} 
              />
            </mesh>
          )}
        </group>
      )}
    </mesh>
  );
};

export default Building;