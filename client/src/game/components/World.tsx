import { useEffect, useRef, useState } from "react";
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
import MarketWindow from "../../ui/MarketWindow";
import { Building as BuildingType } from "../stores/useBuildingStore";

const World = () => {
  const { initResources } = useResourceStore();
  const { buildings, updateProduction, placeBuilding } = useBuildingStore();
  const { gameMode, advanceTime } = useGameStore();
  const { npcs, updateNPCs, spawnNPC } = useNpcStore();
  const lastUpdateRef = useRef(Date.now());
  const [showMarketWindow, setShowMarketWindow] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<BuildingType | null>(null);
  const initializedRef = useRef(false);

  // Initialize resources and create initial market when the game starts
  useEffect(() => {
    if (!initializedRef.current) {
      console.log("Initializing game world and resources");
      initResources();

      // Criar um mercado inicial em posição aleatória
      const gridSize = 50; // Tamanho do grid
      const marketSize = 3; // Tamanho do mercado

      // Garantir que o mercado esteja pelo menos a 5 unidades da borda
      const minPos = 5;
      const maxPos = gridSize - marketSize - minPos;

      // Gerar posição aleatória para o mercado
      const marketX = Math.floor(Math.random() * (maxPos - minPos) + minPos);
      const marketZ = Math.floor(Math.random() * (maxPos - minPos) + minPos);

      // Criar o mercado inicial (sem custo)
      const success = placeBuilding("market", [marketX, marketZ], 0, true);

      if (success) {
        console.log(`Mercado inicial criado em [${marketX}, ${marketZ}]`);
      }

      initializedRef.current = true;
    }
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

  // Lidar com clique em edifícios
  const handleBuildingClick = (building: BuildingType) => {
    if (building.type === "market") {
      onMarketSelect?.(building);
    }
  };

  const handleTerrainClick = (e: any) => {
    console.log("Terrain click", e);
  }

  return (
    <>
      <CameraControls />
      <Sky />
      <DayNightCycle />
      <Terrain onTerrainClick={handleTerrainClick} />
      {/* Buildings */}
      {buildings.map((building) => (
        <Building 
          key={building.id} 
          building={building} 
          onClick={handleBuildingClick}
        />
      ))}

      {/* NPCs */}
      {npcs.map((npc) => (
        <Npc key={npc.id} npc={npc} />
      ))}

      {/* Building placement indicator */}
      {gameMode === "build" && <PlacementIndicator />}
    </>
  );
};

export default World;