import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Terrain from "./Terrain";
import Building from "./Building";
import Npc from "./Npc";
import CameraControls from "./CameraControls";
import PlacementIndicator from "./PlacementIndicator";
import { useBuildingStore } from "../stores/useBuildingStore";
import { useResourceStore } from "../stores/useResourceStore";
import { useGameStore } from "../stores/useGameStore";
import { useNpcStore } from "../stores/useNpcStore";
import { workplaceMapping } from "../constants/npcs";
import { Sky } from "./Sky";
import DayNightCycle from "./DayNightCycle";

const World = () => {
  const { initResources } = useResourceStore();
  const { buildings, updateProduction } = useBuildingStore();
  const { gameMode, advanceTime } = useGameStore();
  const { npcs, updateNPCs, spawnNPC } = useNpcStore();
  const lastUpdateRef = useRef(Date.now());

  // Initialize resources when the game starts
  useEffect(() => {
    console.log("Initializing game world and resources");
    initResources();
  }, []);
  
  // Monitorar novos edifícios de casa de NPC para criar NPCs
  useEffect(() => {
    const farmerHouses = buildings.filter(b => b.type === "farmerHouse");
    
    // Verificar se cada casa de fazendeiro tem um NPC
    for (const house of farmerHouses) {
      // Verificar se já existe um NPC associado a esta casa
      const existingNpc = npcs.find(npc => npc.homeId === house.id);
      
      if (!existingNpc) {
        // Criar um novo fazendeiro para esta casa
        const [posX, posZ] = house.position;
        spawnNPC("farmer", house.id, [posX + 0.5, 0, posZ + 0.5]);
      }
    }
  }, [buildings, npcs]);

  // Game loop - update production, time cycle, and NPCs
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
    
    // Update NPCs
    updateNPCs(deltaTime);
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
      
      {/* NPCs */}
      {npcs.map((npc) => (
        <Npc key={npc.id} npc={npc} />
      ))}
      
      {/* Building placement indicator */}
      {gameMode === "build" && <PlacementIndicator />}
      
      {/* Camera controls */}
      <CameraControls />
    </>
  );
};

export default World;
