
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { resourceTypes } from '../constants/resources';
import { useNotificationStore } from '../../lib/stores/useNotificationStore';
import { GAME_CONFIG } from '../../../../shared/constants/game';

// Types
export interface ResourceState {
  resources: Record<string, number>;
  maxStorage: Record<string, number>;
  storageUpgrades: Record<string, number>;
  resourceHistory: Record<string, Array<{ time: number; amount: number }>>;
  totalCollected: Record<string, number>;
  autoCollect: Record<string, boolean>;
  lastUpdate: number;
}

interface ResourceActions {
  // Resource Management
  addResource: (resourceId: string, amount: number) => boolean;
  spendResource: (resourceId: string, amount: number) => boolean;
  setResource: (resourceId: string, amount: number) => void;
  
  // Storage Management
  upgradeStorage: (resourceId: string) => boolean;
  getStorageCapacity: (resourceId: string) => number;
  getStorageUsage: (resourceId: string) => number;
  
  // Auto Collection
  toggleAutoCollect: (resourceId: string) => void;
  processAutoCollection: () => void;
  
  // Utilities
  hasResources: (requirements: Record<string, number>) => boolean;
  canAfford: (cost: Record<string, number>) => boolean;
  spendResources: (cost: Record<string, number>) => boolean;
  
  // History & Statistics
  updateHistory: (resourceId: string, amount: number) => void;
  getResourceRate: (resourceId: string, timeWindow?: number) => number;
  
  // State Management
  reset: () => void;
  initResources: () => void;
  tick: (deltaTime: number) => void;
}

type ResourceStore = ResourceState & ResourceActions;

// Initial state
const initialState: ResourceState = {
  resources: {
    wood: 50,
    stone: 30,
    iron: 20,
    food: 100,
    coal: 10,
    gold: 0,
    gems: 0,
    water: 50,
  },
  maxStorage: {
    wood: 500,
    stone: 500,
    iron: 300,
    food: 200,
    coal: 100,
    gold: 1000,
    gems: 50,
    water: 300,
  },
  storageUpgrades: {},
  resourceHistory: {},
  totalCollected: {},
  autoCollect: {},
  lastUpdate: Date.now(),
};

// Store implementation
export const useResourceStore = create<ResourceStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Resource Management
    addResource: (resourceId: string, amount: number) => {
      if (amount <= 0) return false;

      const { resources, getStorageCapacity, updateHistory } = get();
      const currentAmount = resources[resourceId] || 0;
      const maxCapacity = getStorageCapacity(resourceId);
      const availableSpace = maxCapacity - currentAmount;
      
      if (availableSpace <= 0) {
        useNotificationStore.getState().addNotification({
          type: 'warning',
          title: 'Armazenamento cheio',
          message: `Não há espaço para mais ${resourceTypes[resourceId]?.name || resourceId}`,
        });
        return false;
      }

      const actualAmount = Math.min(amount, availableSpace);
      
      set((state) => ({
        resources: {
          ...state.resources,
          [resourceId]: currentAmount + actualAmount,
        },
        totalCollected: {
          ...state.totalCollected,
          [resourceId]: (state.totalCollected[resourceId] || 0) + actualAmount,
        },
      }));

      updateHistory(resourceId, actualAmount);

      // Notification for significant amounts
      if (actualAmount >= 10) {
        const resourceInfo = resourceTypes[resourceId];
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Recursos coletados',
          message: `+${actualAmount} ${resourceInfo?.name || resourceId}`,
        });
      }

      return true;
    },

    spendResource: (resourceId: string, amount: number) => {
      if (amount <= 0) return false;

      const { resources, updateHistory } = get();
      const currentAmount = resources[resourceId] || 0;
      
      if (currentAmount < amount) {
        const resourceInfo = resourceTypes[resourceId];
        useNotificationStore.getState().addNotification({
          type: 'error',
          title: 'Recursos insuficientes',
          message: `Você precisa de ${amount} ${resourceInfo?.name || resourceId}, mas tem apenas ${currentAmount}`,
        });
        return false;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          [resourceId]: currentAmount - amount,
        },
      }));

      updateHistory(resourceId, -amount);
      return true;
    },

    setResource: (resourceId: string, amount: number) => {
      const { getStorageCapacity } = get();
      const maxCapacity = getStorageCapacity(resourceId);
      const clampedAmount = Math.max(0, Math.min(amount, maxCapacity));
      
      set((state) => ({
        resources: {
          ...state.resources,
          [resourceId]: clampedAmount,
        },
      }));
    },

    // Storage Management
    upgradeStorage: (resourceId: string) => {
      const { storageUpgrades, maxStorage } = get();
      const currentUpgrade = storageUpgrades[resourceId] || 0;
      const maxUpgrades = 10;
      
      if (currentUpgrade >= maxUpgrades) return false;

      const upgradeCost = {
        wood: 50 * (currentUpgrade + 1),
        stone: 30 * (currentUpgrade + 1),
        iron: 20 * (currentUpgrade + 1),
      };

      if (!get().canAfford(upgradeCost)) return false;

      get().spendResources(upgradeCost);

      const baseCapacity = maxStorage[resourceId] || 100;
      const newCapacity = baseCapacity * Math.pow(1.5, currentUpgrade + 1);

      set((state) => ({
        storageUpgrades: {
          ...state.storageUpgrades,
          [resourceId]: currentUpgrade + 1,
        },
        maxStorage: {
          ...state.maxStorage,
          [resourceId]: Math.floor(newCapacity),
        },
      }));

      return true;
    },

    getStorageCapacity: (resourceId: string) => {
      const { maxStorage } = get();
      return maxStorage[resourceId] || 100;
    },

    getStorageUsage: (resourceId: string) => {
      const { resources, getStorageCapacity } = get();
      const current = resources[resourceId] || 0;
      const max = getStorageCapacity(resourceId);
      return max > 0 ? current / max : 0;
    },

    // Auto Collection
    toggleAutoCollect: (resourceId: string) => {
      set((state) => ({
        autoCollect: {
          ...state.autoCollect,
          [resourceId]: !state.autoCollect[resourceId],
        },
      }));
    },

    processAutoCollection: () => {
      const { autoCollect, addResource } = get();
      
      Object.entries(autoCollect).forEach(([resourceId, enabled]) => {
        if (enabled) {
          const resourceInfo = resourceTypes[resourceId];
          if (resourceInfo?.autoCollectRate) {
            addResource(resourceId, resourceInfo.autoCollectRate);
          }
        }
      });
    },

    // Utilities
    hasResources: (requirements: Record<string, number>) => {
      const { resources } = get();
      return Object.entries(requirements).every(([resourceId, amount]) => {
        return (resources[resourceId] || 0) >= amount;
      });
    },

    canAfford: (cost: Record<string, number>) => {
      return get().hasResources(cost);
    },

    spendResources: (cost: Record<string, number>) => {
      const { hasResources, spendResource } = get();
      
      if (!hasResources(cost)) return false;

      // Spend all resources atomically
      Object.entries(cost).forEach(([resourceId, amount]) => {
        spendResource(resourceId, amount);
      });

      return true;
    },

    // History & Statistics
    updateHistory: (resourceId: string, amount: number) => {
      const currentTime = Date.now();
      const maxHistoryLength = 100;

      set((state) => {
        const history = state.resourceHistory[resourceId] || [];
        const newHistory = [
          ...history.slice(-maxHistoryLength + 1),
          { time: currentTime, amount },
        ];

        return {
          resourceHistory: {
            ...state.resourceHistory,
            [resourceId]: newHistory,
          },
        };
      });
    },

    getResourceRate: (resourceId: string, timeWindow: number = 60000) => {
      const { resourceHistory } = get();
      const history = resourceHistory[resourceId] || [];
      const currentTime = Date.now();
      
      const recentHistory = history.filter(
        entry => currentTime - entry.time <= timeWindow
      );

      if (recentHistory.length === 0) return 0;

      const totalAmount = recentHistory.reduce((sum, entry) => sum + entry.amount, 0);
      return totalAmount / (timeWindow / 1000); // per second
    },

    // State Management
    reset: () => {
      set({ ...initialState, lastUpdate: Date.now() });
    },

    initResources: () => {
      set({ lastUpdate: Date.now() });
      console.log('Resource store initialized');
    },

    tick: (deltaTime: number) => {
      const { processAutoCollection } = get();
      
      // Process auto collection every second
      const now = Date.now();
      const { lastUpdate } = get();
      
      if (now - lastUpdate >= 1000) {
        processAutoCollection();
        set({ lastUpdate: now });
      }
    },
  }))
);

// Selectors
export const useResourceSelectors = {
  getResource: (id: string) => useResourceStore((state) => state.resources[id] || 0),
  getStorageInfo: (id: string) => useResourceStore((state) => ({
    current: state.resources[id] || 0,
    max: state.getStorageCapacity(id),
    usage: state.getStorageUsage(id),
  })),
  getResourceRate: (id: string) => useResourceStore((state) => state.getResourceRate(id)),
  getTotalCollected: (id: string) => useResourceStore((state) => state.totalCollected[id] || 0),
  getAllResources: () => useResourceStore((state) => state.resources),
  getStorageUpgrades: () => useResourceStore((state) => state.storageUpgrades),
};
