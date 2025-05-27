import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { resourceTypes } from "../constants/resources";

interface Resource {
  id: string;
  x: number;
  z: number;
}

interface ResourceState {
  resources: Record<string, number>;
  mapResources: Resource[]; // Added to store resources placed on the map

  // Methods
  initResources: () => void;
  updateResource: (type: string, amount: number) => boolean;
  hasEnoughResources: (requirements: Record<string, number>) => boolean;
  getStorageCapacity: () => Promise<number>;
  initializeResources: () => void; // Added initializeResources
}

const BASE_STORAGE_CAPACITY = 100;
const SILO_STORAGE_BONUS = 200; // Capacidade extra por silo

export const useResourceStore = create<ResourceState>()(
  subscribeWithSelector((set, get) => ({
    resources: {},
    mapResources: [], // Initialize the mapResources array

    initResources: () => {
      const initialResources: Record<string, number> = {};

      // Set initial amounts for all resources
      Object.values(resourceTypes).forEach((resource) => {
        initialResources[resource.id] = resource.initialAmount;
      });

      set({ resources: initialResources });
    },

    updateResource: (type, amount) => {
      if (!resourceTypes[type]) return false;

      const currentAmount = get().resources[type] || 0;
      const newAmount = currentAmount + amount;

      // Don't allow negative resources
      if (newAmount < 0) return false;

      // Don't exceed max amount
      const maxAmount = resourceTypes[type].maxAmount;
      const clampedAmount = Math.min(newAmount, maxAmount);

      set((state) => ({
        resources: {
          ...state.resources,
          [type]: clampedAmount,
        },
      }));

      return true;
    },

    hasEnoughResources: (requirements) => {
      for (const [resourceType, amount] of Object.entries(requirements)) {
        const currentAmount = get().resources[resourceType] || 0;
        if (currentAmount < amount) {
          return false;
        }
      }
      return true;
    },

    getStorageCapacity: async () => {
      // Importação dinâmica para evitar dependência circular
      const { useBuildingStore } = await import('./useBuildingStore');
      const buildings = useBuildingStore.getState().buildings;
      const siloCount = buildings.filter(b => b.type === 'silo').length;
      return BASE_STORAGE_CAPACITY + (siloCount * SILO_STORAGE_BONUS);
    },
    initializeResources: () => {
      const resources: Resource[] = [];
      const MAP_SIZE = 50;
      const RESOURCE_COUNT = 30;

      for (let i = 0; i < RESOURCE_COUNT; i++) {
        // Distribuir recursos mais uniformemente, evitando as extremidades
        const margin = 10; // margem das bordas
        const x = (Math.random() * (MAP_SIZE - margin * 2) - (MAP_SIZE - margin * 2) / 2);
        const z = (Math.random() * (MAP_SIZE - margin * 2) - (MAP_SIZE - margin * 2) / 2);

        // Generate a unique ID for each resource
        const id = `resource-${i}`;

        resources.push({ id, x, z });
      }
      set({ mapResources: resources }); // Store generated map resources in state
    },
  }))
);