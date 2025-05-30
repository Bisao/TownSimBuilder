
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { BuildingType, buildingTypes } from "../constants/buildings";
import { GRID_CONFIG, canPlaceBuildingAt } from "../constants/grid";

// Building instance in the game world
export interface Building {
  id: string;
  type: string;
  position: [number, number]; // Grid position
  rotation: number; // In radians
  lastProduced: number; // Timestamp
  plantation?: {
    planted: boolean;
    plantedAt: number;
    growthTime: number; // em segundos
    ready: boolean;
    harvested: boolean;
  };
}

interface BuildingState {
  buildings: Building[];
  buildingIdCounter: number;
  
  // Methods
  placeBuilding: (type: string, position: [number, number], rotation: number, freeOfCharge?: boolean) => Promise<boolean>;
  removeBuilding: (id: string) => void;
  canPlaceBuilding: (type: string, position: [number, number]) => boolean;
  getOverlappingPositions: (type: string, position: [number, number]) => [number, number][];
  getBuildingAt: (position: [number, number]) => Building | undefined;
  updateProduction: (currentTime: number) => void;
  plantSeeds: (buildingId: string) => boolean;
  harvestCrop: (buildingId: string) => boolean;
  updatePlantations: (currentTime: number) => void;
}

export const useBuildingStore = create<BuildingState>()(
  subscribeWithSelector((set, get) => ({
    buildings: [],
    buildingIdCounter: 0,
    
    placeBuilding: async (type, position, rotation, freeOfCharge = false) => {
      const buildingType = buildingTypes[type];
      
      // Check if we can place the building
      if (!buildingType || !get().canPlaceBuilding(type, position)) {
        console.warn(`Cannot place building ${type} at position [${position[0]}, ${position[1]}]`);
        return false;
      }
      
      // Check resources only if not free of charge
      if (!freeOfCharge) {
        try {
          // Dynamic import to avoid circular dependency
          const { useResourceStore } = await import('./useResourceStore');
          const resourceStore = useResourceStore.getState();
          
          // Check if player has enough resources
          for (const [resourceType, amount] of Object.entries(buildingType.cost)) {
            if (resourceStore.resources[resourceType] < amount) {
              console.warn(`Not enough ${resourceType}: need ${amount}, have ${resourceStore.resources[resourceType]}`);
              return false;
            }
          }
          
          // Deduct resources
          for (const [resourceType, amount] of Object.entries(buildingType.cost)) {
            resourceStore.updateResource(resourceType, -amount);
          }
        } catch (error) {
          console.error("Error checking/deducting resources:", error);
          return false;
        }
      }
      
      // Add the building with unique ID
      const uniqueId = `${type}_${get().buildingIdCounter}_${Date.now()}`;
      const newBuilding: Building = {
        id: uniqueId,
        type,
        position,
        rotation,
        lastProduced: Date.now(),
      };
      
      set((state) => ({
        buildings: [...state.buildings, newBuilding],
        buildingIdCounter: state.buildingIdCounter + 1,
      }));
      
      // Notificar o GameStore que um edifício foi posicionado
      try {
        const { useGameStore } = await import('./useGameStore');
        useGameStore.getState().onBuildingPlaced();
      } catch (error) {
        console.error("Error notifying building placement:", error);
      }
      
      console.log(`Building ${type} placed at [${position[0]}, ${position[1]}]`);
      return true;
    },
    
    removeBuilding: (id) => {
      set((state) => ({
        buildings: state.buildings.filter((b) => b.id !== id),
      }));
      console.log(`Building ${id} removed`);
    },
    
    canPlaceBuilding: (type, position) => {
      const buildingType = buildingTypes[type];
      if (!buildingType) return false;
      
      // Check if the building fits within the grid bounds
      const [posX, posZ] = position;
      const [sizeX, sizeZ] = buildingType.size;
      
      if (!canPlaceBuildingAt(posX, posZ, sizeX, sizeZ, GRID_CONFIG.BUILDING_GRID_SIZE)) {
        return false;
      }
      
      // Check if it overlaps with any existing buildings
      const overlappingPositions = get().getOverlappingPositions(type, position);
      for (const overlapPos of overlappingPositions) {
        if (get().getBuildingAt(overlapPos)) {
          return false;
        }
      }
      
      return true;
    },
    
    getOverlappingPositions: (type, position) => {
      const buildingType = buildingTypes[type];
      if (!buildingType) return [];
      
      const [posX, posZ] = position;
      const [sizeX, sizeZ] = buildingType.size;
      
      // Generate all positions the building covers
      const positions: [number, number][] = [];
      for (let x = 0; x < sizeX; x++) {
        for (let z = 0; z < sizeZ; z++) {
          positions.push([posX + x, posZ + z]);
        }
      }
      
      return positions;
    },
    
    getBuildingAt: (position) => {
      const [posX, posZ] = position;
      
      // Check if any building covers this position
      for (const building of get().buildings) {
        const buildingType = buildingTypes[building.type];
        if (!buildingType) continue;
        
        const [buildingPosX, buildingPosZ] = building.position;
        const [sizeX, sizeZ] = buildingType.size;
        
        // Check if position is within building bounds
        if (
          posX >= buildingPosX && posX < buildingPosX + sizeX &&
          posZ >= buildingPosZ && posZ < buildingPosZ + sizeZ
        ) {
          return building;
        }
      }
      
      return undefined;
    },
    
    updateProduction: async (currentTime) => {
      const updatedBuildings: Building[] = [];
      let hasUpdates = false;
      
      for (const building of get().buildings) {
        const buildingType = buildingTypes[building.type];
        if (!buildingType || !buildingType.produces) {
          updatedBuildings.push(building);
          continue;
        }
        
        const { resourceType, amount, interval } = buildingType.produces;
        const timeSinceLastProduction = currentTime - building.lastProduced;
        const intervalMs = interval * 1000;
        
        // Check if it's time to produce
        if (timeSinceLastProduction >= intervalMs) {
          let canProduce = true;
          
          try {
            // Dynamic import to avoid circular dependency
            const { useResourceStore } = await import('./useResourceStore');
            const resourceStore = useResourceStore.getState();
            
            // Check if required resources are available
            if (buildingType.requires) {
              for (const [reqResource, reqAmount] of Object.entries(buildingType.requires)) {
                if (resourceStore.resources[reqResource] < reqAmount) {
                  canProduce = false;
                  break;
                }
              }
            }
            
            if (canProduce) {
              // Consume required resources
              if (buildingType.requires) {
                for (const [reqResource, reqAmount] of Object.entries(buildingType.requires)) {
                  resourceStore.updateResource(reqResource, -reqAmount);
                }
              }
              
              // Add produced resource
              resourceStore.updateResource(resourceType, amount);
              
              // Update last produced time
              updatedBuildings.push({
                ...building,
                lastProduced: currentTime,
              });
              hasUpdates = true;
            } else {
              updatedBuildings.push(building);
            }
          } catch (error) {
            console.error("Error in production update:", error);
            updatedBuildings.push(building);
          }
        } else {
          updatedBuildings.push(building);
        }
      }
      
      if (hasUpdates) {
        set({ buildings: updatedBuildings });
      }
    },

    plantSeeds: (buildingId) => {
      const building = get().buildings.find(b => b.id === buildingId);
      if (!building || building.type !== 'farm') {
        console.warn(`Cannot plant seeds: building ${buildingId} not found or not a farm`);
        return false;
      }
      
      // Verificar se já tem plantação
      if (building.plantation?.planted) {
        console.warn(`Farm ${buildingId} already has crops planted`);
        return false;
      }
      
      const currentTime = Date.now();
      const updatedBuildings = get().buildings.map(b => {
        if (b.id === buildingId) {
          return {
            ...b,
            plantation: {
              planted: true,
              plantedAt: currentTime,
              growthTime: 30, // 30 segundos para crescer
              ready: false,
              harvested: false
            }
          };
        }
        return b;
      });
      
      set({ buildings: updatedBuildings });
      console.log(`Seeds planted in farm ${buildingId}`);
      return true;
    },

    harvestCrop: (buildingId) => {
      const building = get().buildings.find(b => b.id === buildingId);
      if (!building || building.type !== 'farm' || !building.plantation?.ready) {
        console.warn(`Cannot harvest: farm ${buildingId} not ready or not found`);
        return false;
      }
      
      const updatedBuildings = get().buildings.map(b => {
        if (b.id === buildingId) {
          return {
            ...b,
            plantation: {
              ...b.plantation!,
              harvested: true,
              ready: false
            }
          };
        }
        return b;
      });
      
      set({ buildings: updatedBuildings });
      console.log(`Crops harvested from farm ${buildingId}`);
      return true;
    },

    updatePlantations: (currentTime) => {
      const updatedBuildings = get().buildings.map(building => {
        if (building.type === 'farm' && building.plantation?.planted && !building.plantation.ready) {
          const timeSincePlanted = (currentTime - building.plantation.plantedAt) / 1000; // em segundos
          
          if (timeSincePlanted >= building.plantation.growthTime) {
            return {
              ...building,
              plantation: {
                ...building.plantation,
                ready: true
              }
            };
          }
        }
        return building;
      });
      
      set({ buildings: updatedBuildings });
    },
  }))
);
