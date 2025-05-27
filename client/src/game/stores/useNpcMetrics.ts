import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface NPCMetrics {
  id: string;
  name: string;
  type: string;
  totalResourcesCollected: Record<string, number>;
  workTime: number; // total time spent working
  idleTime: number; // total time spent idle
  efficiency: number; // 0-100
  lastActivity: string;
  activityStartTime: number;
}

interface NPCMetricsState {
  npcMetrics: Record<string, NPCMetrics>;

  // Actions
  initializeNPC: (npcId: string, type?: string, name?: string) => void;
  updateActivity: (npcId: string, activity: string) => void;
  recordResourceCollection: (npcId: string, resourceType: string, amount: number) => void;
  updateEfficiency: (npcId: string, efficiency: number) => void;
  removeNPC: (npcId: string) => void;
  getTopPerformers: () => NPCMetrics[];
  getTotalResourcesCollected: () => Record<string, number>;
}

export const useNpcMetrics = create<NPCMetricsState>()(
  subscribeWithSelector((set, get) => ({
    npcMetrics: {},

    initializeNPC: (npcId, type = "unknown", name = "NPC") => {
      set((state) => ({
        npcMetrics: {
          ...state.npcMetrics,
          [npcId]: {
            id: npcId,
            name,
            type,
            totalResourcesCollected: {},
            workTime: 0,
            idleTime: 0,
            efficiency: 50,
            lastActivity: "idle",
            activityStartTime: Date.now(),
          }
        }
      }));
    },

    updateActivity: (npcId, activity) => {
      const state = get();
      const metrics = state.npcMetrics[npcId];

      if (!metrics) return;

      const now = Date.now();
      const timeDiff = (now - metrics.activityStartTime) / 1000; // seconds

      // Update time spent in previous activity
      const updates: Partial<NPCMetrics> = {
        lastActivity: activity,
        activityStartTime: now,
      };

      if (metrics.lastActivity === "working" || metrics.lastActivity === "gathering") {
        updates.workTime = metrics.workTime + timeDiff;
      } else if (metrics.lastActivity === "idle") {
        updates.idleTime = metrics.idleTime + timeDiff;
      }

      set((state) => ({
        npcMetrics: {
          ...state.npcMetrics,
          [npcId]: { ...metrics, ...updates }
        }
      }));
    },

    recordResourceCollection: (npcId, resourceType, amount) => {
      const state = get();
      const metrics = state.npcMetrics[npcId];

      if (!metrics) return;

      const currentAmount = metrics.totalResourcesCollected[resourceType] || 0;

      set((state) => ({
        npcMetrics: {
          ...state.npcMetrics,
          [npcId]: {
            ...metrics,
            totalResourcesCollected: {
              ...metrics.totalResourcesCollected,
              [resourceType]: currentAmount + amount
            }
          }
        }
      }));
    },

    updateEfficiency: (npcId, efficiency) => {
      const state = get();
      const metrics = state.npcMetrics[npcId];

      if (!metrics) return;

      set((state) => ({
        npcMetrics: {
          ...state.npcMetrics,
          [npcId]: { ...metrics, efficiency }
        }
      }));
    },

    removeNPC: (npcId) => {
      set((state) => {
        const newMetrics = { ...state.npcMetrics };
        delete newMetrics[npcId];
        return { npcMetrics: newMetrics };
      });
    },

    getTopPerformers: () => {
      const state = get();
      return Object.values(state.npcMetrics)
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 5);
    },

    getTotalResourcesCollected: () => {
      const state = get();
      const totals: Record<string, number> = {};

      Object.values(state.npcMetrics).forEach(metrics => {
        Object.entries(metrics.totalResourcesCollected).forEach(([resource, amount]) => {
          totals[resource] = (totals[resource] || 0) + amount;
        });
      });

      return totals;
    },
  }))
);