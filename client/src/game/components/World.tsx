import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Game components
import Building from "./Building";
import NPC from "./Npc";
import Resource from "./Resource";
import Terrain from "./Terrain";
import Sky from "./Sky";
import DayNightCycle from "./DayNightCycle";
import CameraControls from "./CameraControls";
import PlacementIndicator from "./PlacementIndicator";
import ManualNpcController from "./ManualNpcController";

// Stores
import { useGameStore } from "../stores/useGameStore";
import { useBuildingStore } from "../stores/useBuildingStore";
import { useNpcStore } from "../stores/useNpcStore";
import { useResourceStore } from "../stores/useResourceStore";

// Constants
import { buildingTypes, BuildingType } from "../constants/buildings";
import { resourceTypes } from "../constants/resources";

interface WorldProps {
  onMarketSelect?: (building: BuildingType) => void;
}

// Natural Resources Interface
interface NaturalResource {
  type: string;
  position: [number, number];
  lastCollected?: number;
}

// Global natural resources (accessible by NPCs)
declare global {
  interface Window {
    naturalResources?: NaturalResource[];
  }
}

const World: React.FC<WorldProps> = ({ onMarketSelect }) => {
  const worldRef = useRef<THREE.Group>(null);
  const [isWorldInitialized, setIsWorldInitialized] = useState(false);

  // Store states
  const { isInitialized, initialize, gameMode } = useGameStore();
  const { buildings, placeBuilding } = useBuildingStore();
  const { npcs, spawnNPC } = useNpcStore();
  const { initResources, initializeResources } = useResourceStore();

  // Natural resources state
  const [naturalResources, setNaturalResources] = useState<NaturalResource[]>([]);

  // Initialize world
  useEffect(() => {
    if (!isInitialized) {
      console.log("Initializing game world and resources");

      // Initialize game store
      initialize();

      // Initialize resources
      initResources();
      initializeResources();

      // Generate natural resources
      generateNaturalResources();

      // Create initial market
      createInitialMarket();

      setIsWorldInitialized(true);
    }
  }, [isInitialized, initialize, initResources, initializeResources]);

  // Generate natural resources on the map
  const generateNaturalResources = () => {
    const resources: NaturalResource[] = [];
    const RESOURCE_COUNT = 40;
    const MAP_SIZE = 40;

    // Generate stone resources
    for (let i = 0; i < RESOURCE_COUNT / 2; i++) {
      const x = Math.floor(Math.random() * MAP_SIZE);
      const z = Math.floor(Math.random() * MAP_SIZE);

      resources.push({
        type: "stone",
        position: [x, z]
      });
    }

    // Generate wood resources
    for (let i = 0; i < RESOURCE_COUNT / 2; i++) {
      const x = Math.floor(Math.random() * MAP_SIZE);
      const z = Math.floor(Math.random() * MAP_SIZE);

      resources.push({
        type: "wood",
        position: [x, z]
      });
    }

    setNaturalResources(resources);

    // Make resources available globally for NPCs
    window.naturalResources = resources;

    console.log(`Generated ${resources.length} natural resources`);
  };

  // Create initial market building
  const createInitialMarket = async () => {
    try {
      // Find empty position for market
      let marketPosition: [number, number] = [20, 20];
      let attempts = 0;

      while (attempts < 10) {
        const x = Math.floor(Math.random() * 35) + 5;
        const z = Math.floor(Math.random() * 35) + 5;

        if (!buildings.some(b => 
          Math.abs(b.position[0] - x) < 3 && 
          Math.abs(b.position[1] - z) < 3
        )) {
          marketPosition = [x, z];
          break;
        }
        attempts++;
      }

      const success = await placeBuilding("market", marketPosition, 0, true);
      if (success) {
        console.log(`Mercado inicial criado em [${marketPosition[0]}, ${marketPosition[1]}]`);
      }
    } catch (error) {
      console.error("Erro ao criar mercado inicial:", error);
    }
  };

  // Update natural resources when NPCs collect them
  useFrame(() => {
    if (window.naturalResources) {
      // Update natural resources state if changes occurred
      const updatedResources = window.naturalResources.filter(r => !r.lastCollected);
      if (updatedResources.length !== naturalResources.filter(r => !r.lastCollected).length) {
        setNaturalResources([...window.naturalResources]);
      }
    }
  });

  if (!isWorldInitialized) {
    return null;
  }

  return (
    <>
      {/* Environment */}
      <Sky />
      <DayNightCycle />

      {/* Camera Controls */}
      <CameraControls />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* World container */}
      <group ref={worldRef}>
        {/* Terrain */}
        <Terrain />

        {/* Buildings */}
        {buildings.map((building) => (
          <Building
            key={building.id}
            building={building}
            onMarketSelect={onMarketSelect}
          />
        ))}

        {/* NPCs */}
        {npcs.map((npc) => (
          <NPC key={npc.id} npc={npc} />
        ))}

        {/* Natural Resources - renderiza apenas recursos não coletados */}
        {naturalResources
          .filter(resource => !resource.lastCollected)
          .map((resource, index) => (
            <Resource
              key={`resource-${resource.position[0]}-${resource.position[1]}`}
              type={resource.type}
              position={[resource.position[0], 0, resource.position[1]]}
              color={resourceTypes[resource.type]?.color || "#ffffff"}
              scale={0.8}
            />
          ))}

        {/* Building placement indicator */}
        {gameMode === "build" && <PlacementIndicator />}

        {/* Manual NPC Controller */}
        <ManualNpcController />
      </group>
    </>
  );
};

export default World;