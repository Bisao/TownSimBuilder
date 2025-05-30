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

    switch (building.type) {
      case "house":
        return <HouseModel width={width} length={length} height={height} />;
      case "farmerHouse":
        return <FarmerHouseModel width={width} length={length} height={height} />;
      case "farm":
        return <FarmModel width={width} length={length} height={height} />;
      case "lumberMill":
        return <LumberMillModel width={width} length={length} height={height} />;
      case "waterWell":
        return <WaterWellModel width={width} length={length} height={height} />;
      case "bakery":
        return <BakeryModel width={width} length={length} height={height} />;
      case "stoneMine":
        return <StoneMineModel width={width} length={length} height={height} />;
      case "market":
        return <MarketModel width={width} length={length} height={height} />;
      case "silo":
        return <SiloModel width={width} length={length} height={height} />;
      case "minerHouse":
      case "lumberjackHouse":
        return <SpecializedHouseModel 
          width={width} 
          length={length} 
          height={height} 
          type={building.type} 
        />;
      default:
        return <DefaultBuildingModel 
          width={width} 
          length={length} 
          height={height} 
          color={buildingType.model.color} 
          shape={buildingType.model.shape}
        />;
    }
  }, [buildingType, building.type]);

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

// Sub-components for different building types
const HouseModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => {
  const { scene } = useGLTF('/models/low_poly_house.glb');
  
  // Clone the scene to avoid issues with multiple instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  return (
    <group>
      <primitive 
        object={clonedScene} 
        scale={[0.5, 0.5, 0.5]} 
        position={[0, 0, 0]}
      />
    </group>
  );
};

const FarmerHouseModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial color="#A0522D" flatShading />
    </mesh>
    <mesh position={[0, height + 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[0.8, 0.5, 4]} />
      <meshStandardMaterial color="#DAA520" flatShading />
    </mesh>
    <mesh position={[0.3, height + 0.6, 0.3]}>
      <boxGeometry args={[0.15, 0.6, 0.15]} />
      <meshStandardMaterial color="#696969" flatShading />
    </mesh>
  </group>
);

const FarmModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, 0.05, 0]}>
      <boxGeometry args={[0.9, 0.1, 0.9]} />
      <meshStandardMaterial color="#8B4513" flatShading />
    </mesh>
    {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
      <mesh key={i} position={[x, 0.11, 0]}>
        <boxGeometry args={[0.05, 0.02, 0.8]} />
        <meshStandardMaterial color="#654321" flatShading />
      </mesh>
    ))}
    <mesh position={[0.3, 0.4, 0.3]}>
      <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
      <meshStandardMaterial color="#8B4513" flatShading />
    </mesh>
  </group>
);

const LumberMillModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial color="#8B4513" flatShading />
    </mesh>
    <mesh position={[0, height / 2, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.35, 0.35, 0.03, 16]} />
      <meshStandardMaterial color="#C0C0C0" metalness={0.9} flatShading />
    </mesh>
  </group>
);

const WaterWellModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 0.6, 12]} />
      <meshStandardMaterial color="#696969" flatShading />
    </mesh>
    <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[0.5, 0.4, 4]} />
      <meshStandardMaterial color="#8B0000" flatShading />
    </mesh>
  </group>
);

const BakeryModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial color="#D2691E" flatShading />
    </mesh>
    <mesh position={[0, 0.4, 0.6]}>
      <sphereGeometry args={[0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#8B4513" flatShading />
    </mesh>
  </group>
);

const StoneMineModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, 0.75, 0]}>
      <cylinderGeometry args={[0.6, 0.8, 1.5, 12]} />
      <meshStandardMaterial color="#2F2F2F" flatShading />
    </mesh>
    <mesh position={[0, 1.3, 0]}>
      <boxGeometry args={[1, 0.08, 0.08]} />
      <meshStandardMaterial color="#8B4513" flatShading />
    </mesh>
  </group>
);

const MarketModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial color="#DAA520" flatShading />
    </mesh>
    <mesh position={[0, height + 0.1, 0.3]} rotation={[-Math.PI / 8, 0, 0]}>
      <boxGeometry args={[1.2, 0.05, 0.8]} />
      <meshStandardMaterial color="#FF6347" flatShading />
    </mesh>
  </group>
);

const SiloModel: React.FC<{ width: number; length: number; height: number }> = ({ width, length, height }) => (
  <group>
    <mesh position={[0, height / 2 + 0.15, 0]}>
      <cylinderGeometry args={[0.45, 0.45, height - 0.3, 16]} />
      <meshStandardMaterial color="#C0C0C0" metalness={0.6} flatShading />
    </mesh>
    <mesh position={[0, height + 0.3, 0]}>
      <coneGeometry args={[0.45, 0.6, 12]} />
      <meshStandardMaterial color="#696969" metalness={0.7} flatShading />
    </mesh>
  </group>
);

const SpecializedHouseModel: React.FC<{ 
  width: number; 
  length: number; 
  height: number; 
  type: string 
}> = ({ width, length, height, type }) => {
  const isLumberjack = type === "lumberjackHouse";

  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial color={isLumberjack ? "#8B4513" : "#696969"} flatShading />
      </mesh>
      <mesh position={[0, height + 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.8, 0.6, 4]} />
        <meshStandardMaterial color={isLumberjack ? "#2F4F2F" : "#2F2F2F"} flatShading />
      </mesh>
    </group>
  );
};

const DefaultBuildingModel: React.FC<{ 
  width: number; 
  length: number; 
  height: number; 
  color: string;
  shape: string;
}> = ({ width, length, height, color, shape }) => {
  if (shape === "cylinder") {
    return (
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.4, height, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    );
  }

  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
};

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