
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
      const MAP_SIZE = 40; // Match terrain size
      const RESOURCE_COUNT = 45;
      const MARGIN = 5;
      const MIN_DISTANCE = 2;

      // Helper function to check if position is valid
      const isValidPosition = (x: number, z: number, existingResources: Resource[]): boolean => {
        // Check boundaries - ensure resources stay within map
        if (x < -MAP_SIZE/2 + MARGIN || x > MAP_SIZE/2 - MARGIN || 
            z < -MAP_SIZE/2 + MARGIN || z > MAP_SIZE/2 - MARGIN) {
          return false;
        }

        // Check distance from existing resources
        for (const resource of existingResources) {
          const dx = x - resource.x;
          const dz = z - resource.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance < MIN_DISTANCE) {
            return false;
          }
        }
        return true;
      };

      // Generate resources naturally distributed
      let attempts = 0;
      const maxTotalAttempts = RESOURCE_COUNT * 100;

      while (resources.length < RESOURCE_COUNT && attempts < maxTotalAttempts) {
        // Generate position within the entire valid area
        const x = Math.round((Math.random() - 0.5) * (MAP_SIZE - MARGIN * 2));
        const z = Math.round((Math.random() - 0.5) * (MAP_SIZE - MARGIN * 2));
        
        if (isValidPosition(x, z, resources)) {
          const id = `resource-${resources.length}`;
          resources.push({ id, x, z });
        }
        attempts++;
      }
      
      console.log(`Generated ${resources.length} map resources naturally distributed`);
      set({ mapResources: resources });
    },
  }))
);
