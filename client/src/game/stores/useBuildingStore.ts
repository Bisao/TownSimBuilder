
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { buildingTypes, BuildingType } from '../constants/buildings';
import { useResourceStore } from './useResourceStore';
import { useNotificationStore } from '../../lib/stores/useNotificationStore';
import { GAME_CONFIG } from '../../../../shared/constants/game';

// Types
export interface Building {
  id: string;
  type: BuildingType;
  position: [number, number];
  health: number;
  maxHealth: number;
  level: number;
  isWorking: boolean;
  lastProductionTime: number;
  production?: {
    input: Record<string, number>;
    output: Record<string, number>;
    rate: number; // items per second
    efficiency: number; // 0-1
  };
  workers: string[]; // NPC IDs
  maxWorkers: number;
  upgrades: string[];
  constructionTime?: number;
  isConstructed: boolean;
}

interface BuildingState {
  buildings: Record<string, Building>;
  selectedBuilding: string | null;
  constructionQueue: string[];
  totalBuildings: number;
  buildingStats: Record<BuildingType, number>;
}

interface BuildingActions {
  // Building Management
  placeBuilding: (type: BuildingType, position: [number, number]) => boolean;
  removeBuilding: (buildingId: string) => boolean;
  selectBuilding: (buildingId: string | null) => void;
  
  // Production
  updateProduction: (currentTime: number) => void;
  startProduction: (buildingId: string) => boolean;
  stopProduction: (buildingId: string) => boolean;
  
  // Workers
  assignWorker: (buildingId: string, npcId: string) => boolean;
  removeWorker: (buildingId: string, npcId: string) => boolean;
  
  // Upgrades
  upgradeBuilding: (buildingId: string) => boolean;
  canUpgradeBuilding: (buildingId: string) => boolean;
  
  // Maintenance
  repairBuilding: (buildingId: string) => boolean;
  
  // Utilities
  getBuildingAt: (position: [number, number]) => Building | null;
  getBuildingsByType: (type: BuildingType) => Building[];
  canPlaceBuilding: (type: BuildingType, position: [number, number]) => boolean;
  
  // State Management
  reset: () => void;
  initialize: () => void;
}

type BuildingStore = BuildingState & BuildingActions;

// Initial state
const initialState: BuildingState = {
  buildings: {},
  selectedBuilding: null,
  constructionQueue: [],
  totalBuildings: 0,
  buildingStats: {
    house: 0,
    farm: 0,
    warehouse: 0,
    mine: 0,
    lumbermill: 0,
    smithy: 0,
    market: 0,
    well: 0,
    silo: 0,
    workshop: 0,
  },
};

// Store implementation
export const useBuildingStore = create<BuildingStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Building Management
    placeBuilding: (type: BuildingType, position: [number, number]) => {
      const { canPlaceBuilding, buildings } = get();
      
      if (!canPlaceBuilding(type, position)) {
        console.warn(`Cannot place building ${type} at position ${position}`);
        return false;
      }

      const buildingDef = buildingTypes[type];
      if (!buildingDef) {
        console.error(`Building type ${type} not found`);
        return false;
      }

      // Check resources
      const resourceStore = useResourceStore.getState();
      const hasResources = Object.entries(buildingDef.cost).every(([resource, amount]) => {
        return (resourceStore.resources[resource] || 0) >= amount;
      });

      if (!hasResources) {
        useNotificationStore.getState().addNotification({
          type: 'error',
          title: 'Recursos insuficientes',
          message: 'Você não tem recursos suficientes para construir este edifício',
        });
        return false;
      }

      // Consume resources
      Object.entries(buildingDef.cost).forEach(([resource, amount]) => {
        resourceStore.spendResource(resource, amount);
      });

      // Create building
      const buildingId = `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newBuilding: Building = {
        id: buildingId,
        type,
        position,
        health: buildingDef.health,
        maxHealth: buildingDef.health,
        level: 1,
        isWorking: false,
        lastProductionTime: Date.now(),
        workers: [],
        maxWorkers: buildingDef.maxWorkers || 0,
        upgrades: [],
        isConstructed: buildingDef.constructionTime ? false : true,
        constructionTime: buildingDef.constructionTime,
      };

      // Add production if building produces resources
      if (buildingDef.production) {
        newBuilding.production = {
          input: buildingDef.production.input || {},
          output: buildingDef.production.output || {},
          rate: buildingDef.production.rate || 1,
          efficiency: 1.0,
        };
      }

      set((state) => ({
        buildings: { ...state.buildings, [buildingId]: newBuilding },
        totalBuildings: state.totalBuildings + 1,
        buildingStats: {
          ...state.buildingStats,
          [type]: state.buildingStats[type] + 1,
        },
      }));

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Edifício construído',
        message: `${buildingDef.name} foi construído com sucesso`,
      });

      console.log(`Building ${type} placed at ${position}`);
      return true;
    },

    removeBuilding: (buildingId: string) => {
      const { buildings } = get();
      const building = buildings[buildingId];
      
      if (!building) {
        console.warn(`Building ${buildingId} not found`);
        return false;
      }

      set((state) => {
        const { [buildingId]: removed, ...remainingBuildings } = state.buildings;
        return {
          buildings: remainingBuildings,
          totalBuildings: state.totalBuildings - 1,
          buildingStats: {
            ...state.buildingStats,
            [building.type]: Math.max(0, state.buildingStats[building.type] - 1),
          },
          selectedBuilding: state.selectedBuilding === buildingId ? null : state.selectedBuilding,
        };
      });

      console.log(`Building ${buildingId} removed`);
      return true;
    },

    selectBuilding: (buildingId: string | null) => {
      set({ selectedBuilding: buildingId });
    },

    // Production
    updateProduction: (currentTime: number) => {
      const { buildings } = get();
      const resourceStore = useResourceStore.getState();
      
      Object.values(buildings).forEach((building) => {
        if (!building.isWorking || !building.production || !building.isConstructed) return;

        const timeDelta = currentTime - building.lastProductionTime;
        const productionInterval = 1000 / building.production.rate; // Convert rate to interval

        if (timeDelta >= productionInterval) {
          const cycles = Math.floor(timeDelta / productionInterval);
          
          // Check if we have input resources
          const hasInputs = Object.entries(building.production.input).every(([resource, amount]) => {
            return (resourceStore.resources[resource] || 0) >= amount * cycles;
          });

          if (hasInputs) {
            // Consume inputs
            Object.entries(building.production.input).forEach(([resource, amount]) => {
              resourceStore.spendResource(resource, amount * cycles);
            });

            // Produce outputs
            Object.entries(building.production.output).forEach(([resource, amount]) => {
              const producedAmount = amount * cycles * building.production!.efficiency;
              resourceStore.addResource(resource, producedAmount);
            });

            // Update last production time
            set((state) => ({
              buildings: {
                ...state.buildings,
                [building.id]: {
                  ...building,
                  lastProductionTime: currentTime,
                },
              },
            }));
          }
        }
      });
    },

    startProduction: (buildingId: string) => {
      const { buildings } = get();
      const building = buildings[buildingId];
      
      if (!building || !building.production || !building.isConstructed) {
        return false;
      }

      set((state) => ({
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...building,
            isWorking: true,
            lastProductionTime: Date.now(),
          },
        },
      }));

      return true;
    },

    stopProduction: (buildingId: string) => {
      const { buildings } = get();
      const building = buildings[buildingId];
      
      if (!building) return false;

      set((state) => ({
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...building,
            isWorking: false,
          },
        },
      }));

      return true;
    },

    // Workers
    assignWorker: (buildingId: string, npcId: string) => {
      const { buildings } = get();
      const building = buildings[buildingId];
      
      if (!building || building.workers.length >= building.maxWorkers) {
        return false;
      }

      if (building.workers.includes(npcId)) {
        return false; // Already assigned
      }

      set((state) => ({
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...building,
            workers: [...building.workers, npcId],
          },
        },
      }));

      return true;
    },

    removeWorker: (buildingId: string, npcId: string) => {
      const { buildings } = get();
      const building = buildings[buildingId];
      
      if (!building) return false;

      set((state) => ({
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...building,
            workers: building.workers.filter(id => id !== npcId),
          },
        },
      }));

      return true;
    },

    // Upgrades
    upgradeBuilding: (buildingId: string) => {
      const { buildings, canUpgradeBuilding } = get();
      const building = buildings[buildingId];
      
      if (!building || !canUpgradeBuilding(buildingId)) {
        return false;
      }

      const buildingDef = buildingTypes[building.type];
      const upgradeCost = buildingDef.upgradeCost?.[building.level] || {};
      
      // Check and consume resources
      const resourceStore = useResourceStore.getState();
      const hasResources = Object.entries(upgradeCost).every(([resource, amount]) => {
        return (resourceStore.resources[resource] || 0) >= amount;
      });

      if (!hasResources) return false;

      Object.entries(upgradeCost).forEach(([resource, amount]) => {
        resourceStore.spendResource(resource, amount);
      });

      set((state) => ({
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...building,
            level: building.level + 1,
            maxHealth: building.maxHealth * 1.2,
            health: building.health * 1.2,
          },
        },
      }));

      return true;
    },

    canUpgradeBuilding: (buildingId: string) => {
      const { buildings } = get();
      const building = buildings[buildingId];
      
      if (!building || !building.isConstructed) return false;

      const buildingDef = buildingTypes[building.type];
      const maxLevel = buildingDef.maxLevel || 5;
      
      return building.level < maxLevel;
    },

    // Maintenance
    repairBuilding: (buildingId: string) => {
      const { buildings } = get();
      const building = buildings[buildingId];
      
      if (!building || building.health >= building.maxHealth) {
        return false;
      }

      const repairCost = Math.floor((building.maxHealth - building.health) * 0.1);
      const resourceStore = useResourceStore.getState();
      
      if ((resourceStore.resources.iron || 0) < repairCost) {
        return false;
      }

      resourceStore.spendResource('iron', repairCost);

      set((state) => ({
        buildings: {
          ...state.buildings,
          [buildingId]: {
            ...building,
            health: building.maxHealth,
          },
        },
      }));

      return true;
    },

    // Utilities
    getBuildingAt: (position: [number, number]) => {
      const { buildings } = get();
      return Object.values(buildings).find(
        (building) => building.position[0] === position[0] && building.position[1] === position[1]
      ) || null;
    },

    getBuildingsByType: (type: BuildingType) => {
      const { buildings } = get();
      return Object.values(buildings).filter((building) => building.type === type);
    },

    canPlaceBuilding: (type: BuildingType, position: [number, number]) => {
      const { getBuildingAt } = get();
      const [x, z] = position;

      // Check if building type exists
      const buildingDef = buildingTypes[type];
      if (!buildingDef) {
        console.warn(`Building type ${type} not found in buildingTypes`);
        return false;
      }

      // Check if position is within bounds
      if (x < 0 || x >= GAME_CONFIG.GRID_SIZE || z < 0 || z >= GAME_CONFIG.GRID_SIZE) {
        return false;
      }

      // Check if position is occupied
      if (getBuildingAt(position)) {
        return false;
      }

      // Check building-specific restrictions
      if (buildingDef.restrictions) {
        // Add custom restriction logic here
      }

      return true;
    },

    // State Management
    reset: () => {
      set(initialState);
    },

    initialize: () => {
      console.log('Building store initialized');
    },
  }))
);

// Selectors
export const useBuildingSelectors = {
  getBuilding: (id: string) => useBuildingStore((state) => state.buildings[id]),
  getSelectedBuilding: () => useBuildingStore((state) => 
    state.selectedBuilding ? state.buildings[state.selectedBuilding] : null
  ),
  getBuildingStats: () => useBuildingStore((state) => state.buildingStats),
  getTotalBuildings: () => useBuildingStore((state) => state.totalBuildings),
  getWorkingBuildings: () => useBuildingStore((state) => 
    Object.values(state.buildings).filter(b => b.isWorking)
  ),
};
