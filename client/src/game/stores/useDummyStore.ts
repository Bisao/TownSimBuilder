import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface TrainingDummy {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  damageReceived: number;
  hits: number;
  lastHitTime: number;
}

interface DummyState {
  dummies: TrainingDummy[];

  // Ações
  addDummy: (position: [number, number, number]) => string;
  removeDummy: (id: string) => void;
  hitDummy: (id: string, damage: number, critical?: boolean) => void;
  resetDummyStats: (id: string) => void;
  getDummy: (id: string) => TrainingDummy | undefined;
}

export const useDummyStore = create<DummyState>()(
  subscribeWithSelector((set, get) => ({
    dummies: [],

    addDummy: (position: [number, number, number]) => {
      const id = `dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDummy: TrainingDummy = {
        id,
        position,
        health: 999999,
        maxHealth: 999999,
        damageReceived: 0,
        hits: 0,
        lastHitTime: 0
      };

      set((state) => ({
        dummies: [...state.dummies, newDummy]
      }));

      console.log(`Dummy de treinamento criado: ${id} na posição [${position.join(', ')}]`);
      return id;
    },

    removeDummy: (id: string) => {
      set((state) => ({
        dummies: state.dummies.filter(dummy => dummy.id !== id)
      }));
      console.log(`Dummy removido: ${id}`);
    },

    hitDummy: (id: string, damage: number, critical = false) => {
      set((state) => ({
        dummies: state.dummies.map(dummy => 
          dummy.id === id 
            ? {
                ...dummy,
                damageReceived: dummy.damageReceived + damage,
                hits: dummy.hits + 1,
                lastHitTime: Date.now()
              }
            : dummy
        )
      }));

      console.log(`Dummy ${id} recebeu ${damage} de dano${critical ? ' (CRÍTICO)' : ''}`);

      // Disparar evento para animações
      window.dispatchEvent(new CustomEvent('dummyHit', { 
        detail: { id, damage, critical } 
      }));
    },

    resetDummyStats: (id: string) => {
      set((state) => ({
        dummies: state.dummies.map(dummy => 
          dummy.id === id 
            ? {
                ...dummy,
                damageReceived: 0,
                hits: 0,
                lastHitTime: 0
              }
            : dummy
        )
      }));
      console.log(`Stats do dummy ${id} resetadas`);
    },

    getDummy: (id: string) => {
      return get().dummies.find(dummy => dummy.id === id);
    }
  }))
);

// Configurar referência global
if (typeof window !== 'undefined') {
  window.dummyStore = {
    getDummy: (id: string) => useDummyStore.getState().getDummy(id),
    hitDummy: (id: string, damage: number, critical?: boolean) => 
      useDummyStore.getState().hitDummy(id, damage, critical)
  };
}