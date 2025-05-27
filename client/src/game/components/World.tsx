import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import CameraControls from "./CameraControls";
import Sky from "./Sky";
import DayNightCycle from "./DayNightCycle";
import Building from "./Building";
import Resource from "./Resource";
import Npc from "./Npc";
import Terrain from "./Terrain";
import TerrainEditor from "./TerrainEditor";
import PlacementIndicator from "./PlacementIndicator";
import ManualNpcController from "./ManualNpcController";
import Sky from "./Sky";
import { useGameStore } from "../stores/useGameStore";
import { useNpcStore } from "../stores/useNpcStore";
import { useResourceStore } from "../stores/useResourceStore";
import { useBuildingStore, Building as BuildingType } from "../stores/useBuildingStore";
import { workplaceMapping } from "../constants/npcs";
import { resourceTypes } from "../constants/resources";
import MarketWindow from "../../ui/MarketWindow";

interface WorldProps {
  onMarketSelect?: (BuildingType) => void;
}

const World = ({ onMarketSelect }: WorldProps) => {
  const { initResources } = useResourceStore();
  const { buildings, updateProduction, placeBuilding } = useBuildingStore();
  const { gameMode, advanceTime } = useGameStore();
  const { npcs, updateNPCs, spawnNPC } = useNpcStore();
  const lastUpdateRef = useRef(Date.now());
  const [showMarketWindow, setShowMarketWindow] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<BuildingType | null>(null);
  const initializedRef = useRef(false);
  const [naturalResources, setNaturalResources] = useState<Array<{
    type: string;
    position: [number, number];
    lastCollected?: number;
  }>>([]);

  // Função para respawn de recursos
  useEffect(() => {
    const respawnInterval = setInterval(() => {
      setNaturalResources(current => {
        return current.map(resource => {
          if (resource.lastCollected && Date.now() - resource.lastCollected >= 300000) { // 5 minutos
            return { ...resource, lastCollected: undefined };
          }
          return resource;
        });
      });
    }, 10000); // Verificar a cada 10 segundos

    return () => clearInterval(respawnInterval);
  }, []);

  // Função para gerar posições aleatórias para recursos naturais
  const generateNaturalResources = () => {
    const gridSize = 50;
    const numTrees = 20;
    const numStones = 15;
    const usedPositions = new Set<string>();
    const resources: Array<{
      type: string;
      position: [number, number];
      lastCollected?: number;
    }> = [];

    // Gerar árvores
    for (let i = 0; i < numTrees; i++) {
      let position: [number, number];
      let positionKey: string;

      do {
        position = [
          Math.floor(Math.random() * gridSize),
          Math.floor(Math.random() * gridSize)
        ];
        positionKey = `${position[0]},${position[1]}`;
      } while (usedPositions.has(positionKey));

      usedPositions.add(positionKey);
      resources.push({
        type: 'wood',
        position
      });
    }

    // Gerar pedras
    for (let i = 0; i < numStones; i++) {
      let position: [number, number];
      let positionKey: string;

      do {
        position = [
          Math.floor(Math.random() * gridSize),
          Math.floor(Math.random() * gridSize)
        ];
        positionKey = `${position[0]},${position[1]}`;
      } while (usedPositions.has(positionKey));

      usedPositions.add(positionKey);
      resources.push({
        type: 'stone',
        position
      });
    }

    return resources;
  };

  // Função para coletar recurso natural
  const collectNaturalResource = (position: [number, number]) => {
    setNaturalResources(current => {
      return current.map(resource => {
        if (resource.position[0] === position[0] && resource.position[1] === position[1]) {
          return { ...resource, lastCollected: Date.now() };
        }
        return resource;
      });
    });
  };

  // Expose collectNaturalResource to window for NPC access
  useEffect(() => {
    (window as any).collectNaturalResource = collectNaturalResource;
    return () => {
      delete (window as any).collectNaturalResource;
    };
  }, []);


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

      // Gerar recursos naturais
      const resources = generateNaturalResources();
      setNaturalResources(resources);

      initializedRef.current = true;
    }
  }, []);

   // Expose naturalResources to window for NPC access
   useEffect(() => {
    (window as any).naturalResources = naturalResources;
    return () => {
      delete (window as any).naturalResources;
    };
  }, [naturalResources]);

  // Monitorar novos edifícios de casa de NPC para criar NPCs
  useEffect(() => {
    const workerHouses = buildings.filter(b => 
      b.type === "farmerHouse" || 
      b.type === "lumberjackHouse" || 
      b.type === "minerHouse"
    );

    // Verificar se cada casa tem um NPC
    for (const house of workerHouses) {
      // Verificar se já existe um NPC associado a esta casa
      const existingNpc = npcs.find(npc => npc.homeId === house.id);

      if (!existingNpc) {
        // Criar um novo NPC baseado no tipo da casa
        const npcType = house.type === "farmerHouse" ? "farmer" :
                       house.type === "lumberjackHouse" ? "lumberjack" :
                       "miner";

        const [posX, posZ] = house.position;
        spawnNPC(npcType, house.id, [posX + 0.5, 0, posZ + 0.5]);
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

      {/* Terrain */}
      <Terrain />

      {/* Terrain Editor */}
      <TerrainEditor />

      {/* Sky */}
      <Sky />
      <DayNightCycle />
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
      <ManualNpcController />
    </>
  );
};

export default World;