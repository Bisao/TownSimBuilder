import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, useGLTF } from '@react-three/drei';
import { Building as BuildingType } from '../stores/useBuildingStore';
import { buildingTypes } from '../constants/buildings';
import { useNpcStore } from "../stores/useNpcStore";

interface BuildingProps {
  building: BuildingType;
  onMarketSelect?: (building: BuildingType) => void;
}

const Building: React.FC<BuildingProps> = ({ building, onMarketSelect }) => {
  const ref = useRef<THREE.Mesh>(null);
  const lastProducedRef = useRef<number>(building.lastProduced);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Get building type definition
  const buildingType = buildingTypes[building.type];

  // Always call hooks first
  const npcs = useNpcStore(state => state.npcs);

  // Early return AFTER hooks
  if (!buildingType) {
    console.warn(`Building type ${building.type} not found`);
    return null;
  }

  // Memoize house NPCs
  const houseNpcs = useMemo(() => {
    const houseTypes = ["house", "farmerHouse", "minerHouse", "lumberjackHouse"];
    const isHouse = houseTypes.includes(building.type) || building.type.includes("House");
    if (!isHouse) return [];
    return npcs.filter(npc => npc.homeId === building.id);
  }, [npcs, building.id, building.type]);

  // Calculate position (centered on grid cell)
  const [posX, posZ] = building.position;
  const [sizeX, sizeZ] = buildingType.size;

  const position = useMemo(() => [
    posX + sizeX / 2 - 0.5,
    buildingType.height / 2 - 0.1,
    posZ + sizeZ / 2 - 0.5
  ] as [number, number, number], [posX, posZ, sizeX, sizeZ, buildingType.height]);

  // Event handlers
  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    if (building.type === "market") {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  }, [building.type]);

  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();

    if (building.type === "market" && onMarketSelect) {
      onMarketSelect(building);
    } else if (houseNpcs.length > 0 || building.type.includes("House")) {
      const houseNpc = houseNpcs[0];
      window.dispatchEvent(new CustomEvent('houseClick', { 
        detail: { 
          building: building,
          npc: houseNpc || null,
          hasNpc: !!houseNpc
        }
      }));
    } else if (building.type === 'silo') {
      window.dispatchEvent(new CustomEvent('siloClick', { detail: building }));
    }
  }, [building, onMarketSelect, houseNpcs]);

  // Production animation
  useFrame(() => {
    if (!ref.current) return;

    if (buildingType.produces) {
      const now = Date.now();
      const timeSinceLastProduction = now - lastProducedRef.current;
      const productionInterval = buildingType.produces.interval * 1000;

      if (building.lastProduced !== lastProducedRef.current) {
        lastProducedRef.current = building.lastProduced;
      }

      if (timeSinceLastProduction > productionInterval * 0.9) {
        const scale = 1 + Math.sin(now * 0.01) * 0.05;
        ref.current.scale.set(scale, scale, scale);
      } else {
        ref.current.scale.set(1, 1, 1);
      }
    }

    if (hovered) {
      const pulseFactor = 1 + Math.sin(Date.now() * 0.005) * 0.05;
      ref.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
  });

  // Building mesh creation
  const createBuildingMesh = useCallback(() => {
    const [width, length] = buildingType.size;
    const height = buildingType.height;

    return <HouseModel width={width} length={length} height={height} />;
  }, [buildingType]);

  return (
    <mesh
      ref={ref}
      position={position}
      rotation={[0, building.rotation, 0]}
      castShadow
      receiveShadow
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
    >
      {createBuildingMesh()}

      {/* NPC Status Icons */}
      {houseNpcs.length > 0 && (
        <group position={[0, buildingType.height + 0.3, 0]}>
          {houseNpcs.map((npc, index) => (
            <Html
              key={npc.id}
              position={[-0.4 + (index * 0.4), 0, 0]}
              occlude
            >
              <div
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  backgroundColor: npc.state === 'resting' ? 'lightblue' : 'lightgreen',
                  border: '1px solid black'
                }}
                title={`${npc.name || npc.type} (${npc.state === 'resting' ? 'Descansando' : 'Ativo'})`}
              />
            </Html>
          ))}
        </group>
      )}

      {/* Farm Plantation */}
      {building.type === 'farm' && building.plantation && (
        <PlantationModel plantation={building.plantation} />
      )}
    </mesh>
  );
};

// House model - now used for all buildings
const HouseModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial color="#E6D3B7" flatShading />
    </mesh>
    <mesh position={[0, height + 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[0.8, 0.6, 4]} />
      <meshStandardMaterial color="#8B0000" flatShading />
    </mesh>
    <mesh position={[0, 0.4, 0.52]}>
      <boxGeometry args={[0.3, 0.8, 0.03]} />
      <meshStandardMaterial color="#654321" flatShading />
    </mesh>
  </group>
);

const PlantationModel: React.FC<{ plantation: any }> = ({ plantation }) => {
  if (!plantation.planted || plantation.harvested) return null;

  return (
    <group position={[0, 0.01, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial 
          color={plantation.ready ? "#32CD32" : "#90EE90"} 
          flatShading
        />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color={plantation.ready ? "#FFD700" : "#ADFF2F"} 
          flatShading
        />
      </mesh>
    </group>
  );
};

// Preload the house model
useGLTF.preload('/models/low_poly_house.glb');

export default Building;