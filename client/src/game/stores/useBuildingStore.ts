import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { BuildingType, buildingTypes } from "../constants/buildings";
import { useResourceStore } from "./useResourceStore";

// Building instance in the game world
export interface Building {
  id: string;
  type: string;
  position: [number, number]; // Grid position
  rotation: number; // In radians
  lastProduced: number; // Timestamp
}

interface BuildingState {
  buildings: Building[];
  buildingIdCounter: number;
  
  // Methods
  placeBuilding: (type: string, position: [number, number], rotation: number) => boolean;
  removeBuilding: (id: string) => void;
  canPlaceBuilding: (type: string, position: [number, number]) => boolean;
  getOverlappingPositions: (type: string, position: [number, number]) => [number, number][];
  getBuildingAt: (position: [number, number]) => Building | undefined;
  updateProduction: (currentTime: number) => void;
}

export const useBuildingStore = create<BuildingState>()(
  subscribeWithSelector((set, get) => ({
    buildings: [],
    buildingIdCounter: 0,
    
    placeBuilding: (type, position, rotation) => {
      const resourceStore = useResourceStore.getState();
      const buildingType = buildingTypes[type];
      
      // Check if we can place the building and have resources
      if (!buildingType || !get().canPlaceBuilding(type, position)) {
        return false;
      }
      
      // Check if player has enough resources
      for (const [resourceType, amount] of Object.entries(buildingType.cost)) {
        if (resourceStore.resources[resourceType] < amount) {
          return false;
        }
      }
      
      // Deduct resources
      for (const [resourceType, amount] of Object.entries(buildingType.cost)) {
        resourceStore.updateResource(resourceType, -amount);
      }
      
      // Add the building
      const newBuilding: Building = {
        id: `building_${get().buildingIdCounter}`,
        type,
        position,
        rotation,
        lastProduced: Date.now(),
      };
      
      set((state) => ({
        buildings: [...state.buildings, newBuilding],
        buildingIdCounter: state.buildingIdCounter + 1,
      }));
      
      return true;
    },
    
    removeBuilding: (id) => {
      set((state) => ({
        buildings: state.buildings.filter((b) => b.id !== id),
      }));
    },
    
    canPlaceBuilding: (type, position) => {
      const buildingType = buildingTypes[type];
      if (!buildingType) return false;
      
      // Check if the building fits within the grid bounds (50x50)
      const [posX, posZ] = position;
      const [sizeX, sizeZ] = buildingType.size;
      
      if (
        posX < 0 || posX + sizeX > 50 ||
        posZ < 0 || posZ + sizeZ > 50
      ) {
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
    
    updateProduction: (currentTime) => {
      const resourceStore = useResourceStore.getState();
      const updatedBuildings: Building[] = [];
      let resourcesUpdated = false;
      
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
          // Check if required resources are available
          let canProduce = true;
          
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
                resourcesUpdated = true;
              }
            }
            
            // Add produced resource
            resourceStore.updateResource(resourceType, amount);
            resourcesUpdated = true;
            
            // Update last produced time
            updatedBuildings.push({
              ...building,
              lastProduced: currentTime,
            });
          } else {
            updatedBuildings.push(building);
          }
        } else {
          updatedBuildings.push(building);
        }
      }
      
      if (resourcesUpdated || updatedBuildings.length !== get().buildings.length) {
        set({ buildings: updatedBuildings });
      }
    },
  }))
);
