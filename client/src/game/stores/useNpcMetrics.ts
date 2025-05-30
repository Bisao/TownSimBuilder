
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface NPCMetrics {
  npcId: string;
  totalResourcesCollected: Record<string, number>;
  totalWorkTime: number;
  efficiency: number;
  currentActivity: string;
  lastActivityChange: number;
  workSessions: number;
  idleTime: number;
}

interface NPCMetricsState {
  metrics: Record<string, NPCMetrics>;

  // Actions
  initializeNPC: (npcId: string) => void;
  recordResourceCollection: (npcId: string, resourceType: string, amount: number) => void;
  updateActivity: (npcId: string, activity: string) => void;
  updateWorkTime: (npcId: string, deltaTime: number) => void;
  updateEfficiency: (npcId: string, efficiency: number) => void;
  getMetrics: (npcId: string) => NPCMetrics | null;
  getAllMetrics: () => NPCMetrics[];
}

export const useNpcMetrics = create<NPCMetricsState>()(
  subscribeWithSelector((set, get) => ({
    metrics: {},

    initializeNPC: (npcId) => {
      set((state) => ({
        metrics: {
          ...state.metrics,
          [npcId]: {
            npcId,
            totalResourcesCollected: {},
            totalWorkTime: 0,
            efficiency: 50,
            currentActivity: "idle",
            lastActivityChange: Date.now(),
            workSessions: 0,
            idleTime: 0
          }
        }
      }));
    },

    recordResourceCollection: (npcId, resourceType, amount) => {
      set((state) => {
        const currentMetrics = state.metrics[npcId];
        if (!currentMetrics) return state;

        return {
          metrics: {
            ...state.metrics,
            [npcId]: {
              ...currentMetrics,
              totalResourcesCollected: {
                ...currentMetrics.totalResourcesCollected,
                [resourceType]: (currentMetrics.totalResourcesCollected[resourceType] || 0) + amount
              }
            }
          }
        };
      });
    },

    updateActivity: (npcId, activity) => {
      set((state) => {
        const currentMetrics = state.metrics[npcId];
        if (!currentMetrics) return state;

        const now = Date.now();
        const timeDiff = now - currentMetrics.lastActivityChange;

        // Se estava trabalhando, incrementar sessões de trabalho
        const workSessions = currentMetrics.currentActivity === "working" && activity !== "working"
          ? currentMetrics.workSessions + 1
          : currentMetrics.workSessions;

        // Atualizar tempo idle
        const idleTime = currentMetrics.currentActivity === "idle"
          ? currentMetrics.idleTime + timeDiff
          : currentMetrics.idleTime;

        return {
          metrics: {
            ...state.metrics,
            [npcId]: {
              ...currentMetrics,
              currentActivity: activity,
              lastActivityChange: now,
              workSessions,
              idleTime
            }
          }
        };
      });
    },

    updateWorkTime: (npcId, deltaTime) => {
      set((state) => {
        const currentMetrics = state.metrics[npcId];
        if (!currentMetrics || currentMetrics.currentActivity !== "working") return state;

        return {
          metrics: {
            ...state.metrics,
            [npcId]: {
              ...currentMetrics,
              totalWorkTime: currentMetrics.totalWorkTime + deltaTime
            }
          }
        };
      });
    },

    updateEfficiency: (npcId, efficiency) => {
      set((state) => {
        const currentMetrics = state.metrics[npcId];
        if (!currentMetrics) return state;

        return {
          metrics: {
            ...state.metrics,
            [npcId]: {
              ...currentMetrics,
              efficiency: Math.max(0, Math.min(100, efficiency))
            }
          }
        };
      });
    },

    getMetrics: (npcId) => {
      return get().metrics[npcId] || null;
    },

    getAllMetrics: () => {
      return Object.values(get().metrics);
    }
  }))
);

// Expor store globalmente
if (typeof window !== 'undefined') {
  window.npcMetricsStore = {
    initializeNPC: (id: string) => useNpcMetrics.getState().initializeNPC(id),
    recordResourceCollection: (id: string, type: string, amount: number) => 
      useNpcMetrics.getState().recordResourceCollection(id, type, amount),
    updateEfficiency: (id: string, efficiency: number) => 
      useNpcMetrics.getState().updateEfficiency(id, efficiency),
    updateActivity: (id: string, state: string) => 
      useNpcMetrics.getState().updateActivity(id, state)
  };
}
