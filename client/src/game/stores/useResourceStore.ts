
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
  mapResources: Resource[];

  // Methods
  initResources: () => void;
  updateResource: (type: string, amount: number) => boolean;
  hasEnoughResources: (requirements: Record<string, number>) => boolean;
  getStorageCapacity: () => number;
  initializeResources: () => void;
}

const BASE_STORAGE_CAPACITY = 1000;

export const useResourceStore = create<ResourceState>()(
  subscribeWithSelector((set, get) => ({
    resources: {},
    mapResources: [],

    initResources: () => {
      const initialResources: Record<string, number> = {};

      // Set initial amounts for all resources
      Object.values(resourceTypes).forEach((resource) => {
        initialResources[resource.id] = resource.initialAmount;
      });

      console.log("Resources initialized:", initialResources);
      set({ resources: initialResources });
    },

    updateResource: (type, amount) => {
      if (!resourceTypes[type]) {
        console.warn(`Unknown resource type: ${type}`);
        return false;
      }

      const state = get();
      const currentAmount = state.resources[type] || 0;
      const newAmount = currentAmount + amount;

      // Don't allow negative resources
      if (newAmount < 0) {
        console.warn(`Cannot have negative ${type}: ${newAmount}`);
        return false;
      }

      // Check storage capacity
      const maxAmount = resourceTypes[type].maxAmount;
      const storageCapacity = state.getStorageCapacity();
      const clampedAmount = Math.min(newAmount, Math.min(maxAmount, storageCapacity));

      if (clampedAmount !== newAmount) {
        console.warn(`Resource ${type} clamped from ${newAmount} to ${clampedAmount} (storage limit)`);
      }

      set((state) => ({
        resources: {
          ...state.resources,
          [type]: clampedAmount,
        },
      }));

      return true;
    },

    hasEnoughResources: (requirements) => {
      const state = get();
      for (const [resourceType, amount] of Object.entries(requirements)) {
        const currentAmount = state.resources[resourceType] || 0;
        if (currentAmount < amount) {
          return false;
        }
      }
      return true;
    },

    getStorageCapacity: () => {
      // Base capacity - will be enhanced when buildings are available
      return BASE_STORAGE_CAPACITY;
    },

    initializeResources: () => {
      const resources: Resource[] = [];
      const MAP_SIZE = 50;
      const RESOURCE_COUNT = 30;
      const MARGIN = 8; // Margem das bordas para evitar extremidades
      const USABLE_SIZE = MAP_SIZE - (MARGIN * 2); // Área utilizável

      for (let i = 0; i < RESOURCE_COUNT; i++) {
        // Gera posições mais distribuídas pelo grid, evitando extremidades
        const x = (Math.random() * USABLE_SIZE) - (USABLE_SIZE / 2);
        const z = (Math.random() * USABLE_SIZE) - (USABLE_SIZE / 2);

        // Generate a unique ID for each resource
        const id = `resource-${i}`;

        resources.push({ id, x, z });
      }
      
      console.log(`Generated ${resources.length} map resources with improved distribution`);
      set({ mapResources: resources });
    },
  }))
);
