
declare global {
  interface Window {
    dummyStore?: {
      getDummy: (id: string) => any;
      hitDummy: (id: string, damage: number, critical?: boolean) => void;
    };
    npcMetricsStore?: {
      initializeNPC: (id: string) => void;
      recordResourceCollection: (id: string, type: string, amount: number) => void;
      updateEfficiency: (id: string, efficiency: number) => void;
      updateActivity: (id: string, state: string) => void;
    };
    resourceStore?: {
      updateResource: (type: string, amount: number) => void;
    };
    naturalResources?: Array<{
      type: string;
      position: [number, number];
      lastCollected?: number;
    }>;
  }
}

export {};
