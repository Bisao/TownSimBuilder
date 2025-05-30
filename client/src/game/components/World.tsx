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
  selectedBuildingType?: BuildingType | null;
  onMarketSelect?: (building: any) => void;
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

const World: React.FC<WorldProps> = ({ selectedBuildingType, onMarketSelect }) => {
  const worldRef = useRef<THREE.Group>(null);
  const [isWorldInitialized, setIsWorldInitialized] = useState(false);
  const MAP_SIZE = GRID_CONFIG.DEFAULT_SIZE;

  // Store states
  const { isInitialized, initialize, gameMode, isManualControl, controlledNpcId } = useGameStore();
  const { buildings, placeBuilding } = useBuildingStore();
  const { npcs, spawnNPC } = useNpcStore();
  const { initResources } = useResourceStore();
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

      // Generate natural resources
      generateNaturalResources();

      // Create initial market
      createInitialMarket();

      setIsWorldInitialized(true);
    }
  }, [isInitialized, initialize, initResources]);

  // Natural resources generation disabled
  const generateNaturalResources = () => {
    // Disabled to keep grid clean
    setNaturalResources([]);
    window.naturalResources = [];
  };

  // Initial market creation disabled
  const createInitialMarket = () => {
    // Disabled to keep grid clean
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

  // Training dummy addition disabled to keep grid clean

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

        {/* All grid items removed as requested */}

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