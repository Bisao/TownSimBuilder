import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { resourceTypes } from "../constants/resources";
import { useBuildingStore } from "./useBuildingStore";

interface ResourceState {
  resources: Record<string, number>;

  // Methods
  initResources: () => void;
  updateResource: (type: string, amount: number) => boolean;
  hasEnoughResources: (requirements: Record<string, number>) => boolean;
  getStorageCapacity: () => number;
}

const BASE_STORAGE_CAPACITY = 100;
const SILO_STORAGE_BONUS = 200; // Capacidade extra por silo

export const useResourceStore = create<ResourceState>()(
  subscribeWithSelector((set, get) => ({
    resources: {},

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

    getStorageCapacity: () => {
      const buildings = useBuildingStore.getState().buildings;
      const siloCount = buildings.filter(b => b.type === 'silo').length;
      return BASE_STORAGE_CAPACITY + (siloCount * SILO_STORAGE_BONUS);
    },
  }))
);