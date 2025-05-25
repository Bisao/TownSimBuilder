import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Terrain from "./Terrain";
import Building from "./Building";
import CameraControls from "./CameraControls";
import PlacementIndicator from "./PlacementIndicator";
import { useBuildingStore } from "../stores/useBuildingStore";
import { useResourceStore } from "../stores/useResourceStore";
import { useGameStore } from "../stores/useGameStore";
import { Sky } from "./Sky";
import DayNightCycle from "./DayNightCycle";

const World = () => {
  const { initResources } = useResourceStore();
  const { buildings, updateProduction } = useBuildingStore();
  const { gameMode, advanceTime } = useGameStore();
  const lastUpdateRef = useRef(Date.now());

  // Initialize resources when the game starts
  useEffect(() => {
    console.log("Initializing game world and resources");
    initResources();
  }, []);

  // Game loop - update production and time cycle
  useFrame(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
    
    // Update production every second
    if (now - lastUpdateRef.current >= 1000) {
      updateProduction(now);
      lastUpdateRef.current = now;
    }
    
    // Advance time cycle
    advanceTime(deltaTime);
  });

  return (
    <>
      {/* Environment */}
      <Sky />
      <DayNightCycle />
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* World elements */}
      <Terrain />
      
      {/* Buildings */}
      {buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
      
      {/* Building placement indicator */}
      {gameMode === "build" && <PlacementIndicator />}
      
      {/* Camera controls */}
      <CameraControls />
    </>
  );
};

export default World;
