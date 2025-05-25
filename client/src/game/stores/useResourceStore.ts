import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { resourceTypes } from "../constants/resources";

interface ResourceState {
  resources: Record<string, number>;
  
  // Methods
  initResources: () => void;
  updateResource: (type: string, amount: number) => boolean;
  hasEnoughResources: (requirements: Record<string, number>) => boolean;
}

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
  }))
);
