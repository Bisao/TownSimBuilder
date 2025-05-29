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
    const MAP_SIZE = 50;
    const STONE_COUNT = 15;
    const WOOD_COUNT = 15;
    const MIN_DISTANCE = 3; // Distância mínima entre recursos
    const MARGIN = 8; // Margem das bordas

    // Helper function to check if position is valid (not too close to existing resources)
    const isValidPosition = (x: number, z: number, existingResources: NaturalResource[]): boolean => {
      // Check boundaries
      if (x < -MAP_SIZE/2 + MARGIN || x > MAP_SIZE/2 - MARGIN || 
          z < -MAP_SIZE/2 + MARGIN || z > MAP_SIZE/2 - MARGIN) {
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

    // Helper function to generate cluster around a center point
    const generateCluster = (centerX: number, centerZ: number, type: string, count: number): NaturalResource[] => {
      const cluster: NaturalResource[] = [];
      const CLUSTER_RADIUS = 4;

      for (let i = 0; i < count; i++) {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
          // Generate position within cluster radius
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * CLUSTER_RADIUS;
          const x = Math.round(centerX + Math.cos(angle) * radius);
          const z = Math.round(centerZ + Math.sin(angle) * radius);

          if (isValidPosition(x, z, [...resources, ...cluster])) {
            cluster.push({
              type,
              position: [x, z]
            });
            break;
          }
          attempts++;
        }
      }
      return cluster;
    };

    // Generate stone clusters
    const stoneClusterCenters = [
      [-15, -10], [10, -15], [-8, 12], [18, 8]
    ];

    stoneClusterCenters.forEach(([centerX, centerZ]) => {
      const clusterResources = generateCluster(centerX, centerZ, "stone", Math.floor(STONE_COUNT / stoneClusterCenters.length));
      resources.push(...clusterResources);
    });

    // Generate wood clusters
    const woodClusterCenters = [
      [-12, 15], [15, -8], [5, 18], [-18, -5]
    ];

    woodClusterCenters.forEach(([centerX, centerZ]) => {
      const clusterResources = generateCluster(centerX, centerZ, "wood", Math.floor(WOOD_COUNT / woodClusterCenters.length));
      resources.push(...clusterResources);
    });

    // Fill remaining resources randomly if needed
    const remainingStone = STONE_COUNT - resources.filter(r => r.type === "stone").length;
    const remainingWood = WOOD_COUNT - resources.filter(r => r.type === "wood").length;

    // Add remaining stone resources
    for (let i = 0; i < remainingStone; i++) {
      let attempts = 0;
      const maxAttempts = 100;

      while (attempts < maxAttempts) {
        const x = Math.round((Math.random() - 0.5) * (MAP_SIZE - MARGIN * 2));
        const z = Math.round((Math.random() - 0.5) * (MAP_SIZE - MARGIN * 2));

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

    // Add remaining wood resources
    for (let i = 0; i < remainingWood; i++) {
      let attempts = 0;
      const maxAttempts = 100;

      while (attempts < maxAttempts) {
        const x = Math.round((Math.random() - 0.5) * (MAP_SIZE - MARGIN * 2));
        const z = Math.round((Math.random() - 0.5) * (MAP_SIZE - MARGIN * 2));

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

    console.log(`Generated ${resources.length} natural resources`);
  };

  // Create initial market building
  const createInitialMarket = () => {
      const marketExists = buildings.some(b => b.type === 'market');
      if (!marketExists) {
        // Try different positions until we find a valid one
        const positions = [[32, 9], [30, 9], [34, 9], [32, 7], [32, 11]];
        for (const pos of positions) {
          try {
            useBuildingStore.getState().placeBuilding('market', pos as [number, number], 0);
            break;
          } catch (error) {
            console.log(`Cannot place market at ${pos}, trying next position`);
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
              key={`resource-${resource.type}-${resource.position[0]}-${resource.position[1]}-${index}`}
              type={resource.type}
              position={[resource.position[0], 0, resource.position[1]]}
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