import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Game components
import Building from "./Building";
import NPC from "./Npc";
import Resource from "./Resource";
import Terrain from "./Terrain";
import TrainingDummy from './TrainingDummy';
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
import { useDummyStore } from '../stores/useDummyStore';

// Constants
import { buildingTypes, BuildingType } from "../constants/buildings";
import { resourceTypes } from "../constants/resources";
import { GRID_CONFIG } from "../constants/grid";

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
  const MAP_SIZE = GRID_CONFIG.DEFAULT_SIZE;

  // Store states
  const { isInitialized, initialize, gameMode, isManualControl, controlledNpcId } = useGameStore();
  const { buildings, placeBuilding } = useBuildingStore();
  const { npcs, spawnNPC } = useNpcStore();
  const { initResources, initializeResources } = useResourceStore();
  const { addDummy } = useDummyStore();

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
    const MAP_SIZE = GRID_CONFIG.DEFAULT_SIZE;
    const STONE_COUNT = 20;
    const WOOD_COUNT = 20;
    const MIN_DISTANCE = GRID_CONFIG.MIN_RESOURCE_DISTANCE;
    const MARGIN = GRID_CONFIG.RESOURCE_MARGIN;

    // Helper function to check if position is valid (not too close to existing resources)
    const isValidPosition = (x: number, z: number, existingResources: NaturalResource[]): boolean => {
      // Check boundaries - use grid coordinates
      if (x < MARGIN || x > MAP_SIZE - MARGIN || 
          z < MARGIN || z > MAP_SIZE - MARGIN) {
        return false;
      }

      // Check distance from existing resources
      for (const resource of existingResources) {
        const dx = x - resource.position[0];
        const dz = z - resource.position[1];
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < MIN_DISTANCE) {
          return false;
        }
      }
      return true;
    };

    // Generate stone resources randomly across the map
    for (let i = 0; i < STONE_COUNT; i++) {
      let attempts = 0;
      const maxAttempts = 100;

      while (attempts < maxAttempts) {
        // Generate random position in grid coordinates (0 to MAP_SIZE)
        const x = Math.floor(Math.random() * (MAP_SIZE - MARGIN * 2)) + MARGIN;
        const z = Math.floor(Math.random() * (MAP_SIZE - MARGIN * 2)) + MARGIN;

        if (isValidPosition(x, z, resources)) {
          resources.push({
            type: "stone",
            position: [x, z]
          });
          break;
        }
        attempts++;
      }
    }

    // Generate wood resources randomly across the map
    for (let i = 0; i < WOOD_COUNT; i++) {
      let attempts = 0;
      const maxAttempts = 100;

      while (attempts < maxAttempts) {
        // Generate random position in grid coordinates (0 to MAP_SIZE)
        const x = Math.floor(Math.random() * (MAP_SIZE - MARGIN * 2)) + MARGIN;
        const z = Math.floor(Math.random() * (MAP_SIZE - MARGIN * 2)) + MARGIN;

        if (isValidPosition(x, z, resources)) {
          resources.push({
            type: "wood",
            position: [x, z]
          });
          break;
        }
        attempts++;
      }
    }

    setNaturalResources(resources);

    // Make resources available globally for NPCs
    window.naturalResources = resources;

    console.log(`Generated ${resources.length} natural resources distributed across the map`);
  };

  // Create initial market building
  const createInitialMarket = () => {
    const marketExists = buildings.some(b => b.type === 'market');
    if (!marketExists) {
      // Try different positions within the valid grid
      const positions = [
        [25, 25], [20, 20], [30, 30], [15, 25], [35, 25],
        [25, 15], [25, 35], [20, 30], [30, 20], [10, 10]
      ];

      for (const pos of positions) {
        const success = useBuildingStore.getState().placeBuilding('market', pos as [number, number], 0, true);
        if (success) {
          console.log(`Market placed successfully at [${pos[0]}, ${pos[1]}]`);
          break;
        }
      }
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

  const handleBuildingClick = (building: BuildingType) => {
    if (onMarketSelect) {
      onMarketSelect(building);
    }
  };

  useEffect(() => {
    // Adicionar dummy de treinamento ao store
    addDummy([10, 0, 10]);
  }, [addDummy]);

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
        {buildings.map((building) => {
        try {
          return (
            <Building
              key={building.id}
              building={building}
              onMarketSelect={onMarketSelect}
            />
          );
        } catch (error) {
          console.error(`Error rendering building ${building.id}:`, error);
          return null;
        }
      })}

        {/* NPCs */}
        {npcs.map((npc) => (
          <NPC key={npc.id} npc={npc} />
        ))}

        {/* Training Dummy para teste de combate */}
        <TrainingDummy 
          id="training_dummy_1"
          position={[10, 0, 10]} 
        />

        {/* Natural Resources - renderiza apenas recursos não coletados */}
        {naturalResources
          .filter(resource => !resource.lastCollected)
          .map((resource, index) => (
            <Resource
              key={`resource-${resource.type}-${resource.position[0]}-${resource.position[1]}-${index}`}
              type={resource.type}
              position={[resource.position[0] - MAP_SIZE/2, 0, resource.position[1] - MAP_SIZE/2]}
              color={resourceTypes[resource.type]?.color || "#ffffff"}
              scale={0.8}
            />
          ))}

        {/* Building placement indicator */}
        {gameMode === "build" && <PlacementIndicator />}

        {/* Manual NPC Controller */}
        {isManualControl && controlledNpcId && (
          <ManualNpcController npcId={controlledNpcId} />
        )}
      </group>
    </>
  );
};

export default World;