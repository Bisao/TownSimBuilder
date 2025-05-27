import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral";
  effects: {
    resources?: Record<string, number>;
    happiness?: number;
    duration?: number;
  };
  timestamp: number;
  duration: number;
  active: boolean;
}

interface EventState {
  events: GameEvent[];
  activeEvents: GameEvent[];
  lastEventTime: number;

  // Actions
  addEvent: (event: Omit<GameEvent, "id" | "timestamp">) => void;
  updateEvents: (deltaTime: number) => void;
  dismissEvent: (eventId: string) => void;
  generateRandomEvent: () => void;
}

const RANDOM_EVENTS = [
  {
    title: "Chuva Abundante",
    description: "Uma chuva inesperada acelera o crescimento das plantações",
    type: "positive" as const,
    effects: { happiness: 10 },
    duration: 30000, // 30 segundos
    active: false
  },
  {
    title: "Descoberta de Veio Mineral",
    description: "Seus mineiros encontraram um rico veio de pedra",
    type: "positive" as const,
    effects: { resources: { stone: 20 } },
    duration: 20000,
    active: false
  },
  {
    title: "Festival da Colheita",
    description: "A população está celebrando, aumentando a felicidade",
    type: "positive" as const,
    effects: { happiness: 15 },
    duration: 45000,
    active: false
  },
  {
    title: "Praga nas Plantações",
    description: "Uma praga afetou algumas plantações",
    type: "negative" as const,
    effects: { resources: { wheat: -5 }, happiness: -5 },
    duration: 25000,
    active: false
  }
];

export const useEventStore = create<EventState>()(
  subscribeWithSelector((set, get) => ({
    events: [],
    activeEvents: [],
    lastEventTime: Date.now(),

    addEvent: (eventData) => {
      const event: GameEvent = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        active: true
      };

      set((state) => ({
        events: [...state.events, event],
        activeEvents: [...state.activeEvents, event]
      }));

      // Aplicar efeitos do evento
      if (event.effects.resources) {
        import('./useResourceStore').then(({ useResourceStore }) => {
          const resourceStore = useResourceStore.getState();
          Object.entries(event.effects.resources!).forEach(([resource, amount]) => {
            resourceStore.updateResource(resource, amount);
          });
        });
      }

      if (event.effects.happiness) {
        import('./useEconomyStore').then(({ useEconomyStore }) => {
          useEconomyStore.getState().updateHappiness(event.effects.happiness!);
        });
      }

      console.log(`Evento ativado: ${event.title}`);
    },

    updateEvents: (deltaTime) => {
      const now = Date.now();
      const state = get();

      // Remover eventos expirados
      const activeEvents = state.activeEvents.filter(event => {
        const elapsed = now - event.timestamp;
        return elapsed < event.duration;
      });

      if (activeEvents.length !== state.activeEvents.length) {
        set({ activeEvents });
      }

      // Gerar eventos aleatórios ocasionalmente
      if (now - state.lastEventTime > 120000) { // 2 minutos
        if (Math.random() < 0.3) { // 30% de chance
          get().generateRandomEvent();
        }
        set({ lastEventTime: now });
      }
    },

    dismissEvent: (eventId) => {
      set((state) => ({
        activeEvents: state.activeEvents.filter(event => event.id !== eventId)
      }));
    },

    generateRandomEvent: () => {
      const randomEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      get().addEvent(randomEvent);
    }
  }))
);