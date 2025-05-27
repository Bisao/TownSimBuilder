
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface GameEvent {
  id: string;
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
  effects: {
    resources?: Record<string, number>;
    happiness?: number;
    npcHealth?: number;
  };
  duration?: number; // in seconds, if temporary
  choices?: {
    text: string;
    effects: GameEvent['effects'];
  }[];
}

interface EventState {
  activeEvents: GameEvent[];
  eventHistory: string[];
  lastEventTime: number;
  eventCooldown: number; // seconds between events
  
  // Actions
  triggerRandomEvent: () => void;
  resolveEvent: (eventId: string, choiceIndex?: number) => void;
  updateEvents: (deltaTime: number) => void;
}

const RANDOM_EVENTS: GameEvent[] = [
  {
    id: "good_harvest",
    type: "positive",
    title: "Boa Colheita!",
    description: "Os fazendeiros tiveram uma colheita excepcional!",
    effects: {
      resources: { wheat: 20 },
      happiness: 10
    }
  },
  {
    id: "storm_damage",
    type: "negative", 
    title: "Tempestade",
    description: "Uma tempestade danificou algumas construções.",
    effects: {
      resources: { wood: -15, stone: -10 },
      happiness: -5
    }
  },
  {
    id: "merchant_caravan",
    type: "neutral",
    title: "Caravana de Mercadores",
    description: "Mercadores chegaram à cidade. O que deseja fazer?",
    choices: [
      {
        text: "Comprar recursos (50 moedas)",
        effects: { resources: { wood: 20, stone: 15 } }
      },
      {
        text: "Vender produtos (+100 moedas)",
        effects: { resources: { wheat: -10, bread: -5 } }
      },
      {
        text: "Dispensar",
        effects: {}
      }
    ]
  },
  {
    id: "disease_outbreak",
    type: "negative",
    title: "Surto de Doença",
    description: "Uma doença está se espalhando entre os NPCs.",
    effects: {
      npcHealth: -20,
      happiness: -15
    },
    duration: 300 // 5 minutes
  },
  {
    id: "festival_time",
    type: "positive",
    title: "Festival da Cidade",
    description: "Os cidadãos organizaram um festival!",
    effects: {
      happiness: 20,
      resources: { bread: -5, water: -10 }
    }
  }
];

export const useEventStore = create<EventState>()(
  subscribeWithSelector((set, get) => ({
    activeEvents: [],
    eventHistory: [],
    lastEventTime: Date.now(),
    eventCooldown: 300, // 5 minutes between events

    triggerRandomEvent: () => {
      const state = get();
      const now = Date.now();
      
      if (now - state.lastEventTime < state.eventCooldown * 1000) {
        return; // Still in cooldown
      }

      const availableEvents = RANDOM_EVENTS.filter(
        event => !state.eventHistory.includes(event.id) || 
        Math.random() < 0.1 // 10% chance to repeat events
      );

      if (availableEvents.length === 0) return;

      const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      
      set({
        activeEvents: [...state.activeEvents, { ...randomEvent }],
        lastEventTime: now,
        eventHistory: [...state.eventHistory, randomEvent.id]
      });

      console.log(`Random event triggered: ${randomEvent.title}`);
    },

    resolveEvent: (eventId, choiceIndex) => {
      const state = get();
      const event = state.activeEvents.find(e => e.id === eventId);
      
      if (!event) return;

      let effects = event.effects;
      
      if (event.choices && choiceIndex !== undefined) {
        effects = event.choices[choiceIndex].effects;
      }

      // Apply effects
      if (effects.resources) {
        import('./useResourceStore').then(({ useResourceStore }) => {
          const resourceStore = useResourceStore.getState();
          Object.entries(effects.resources!).forEach(([resource, amount]) => {
            resourceStore.updateResource(resource, amount);
          });
        });
      }

      if (effects.happiness) {
        import('./useEconomyStore').then(({ useEconomyStore }) => {
          useEconomyStore.getState().updateHappiness(effects.happiness!);
        });
      }

      if (effects.npcHealth) {
        import('./useNpcStore').then(({ useNpcStore }) => {
          const npcStore = useNpcStore.getState();
          set({
            npcs: npcStore.npcs.map(npc => ({
              ...npc,
              needs: {
                ...npc.needs,
                health: Math.max(0, Math.min(100, npc.needs.health + effects.npcHealth!))
              }
            }))
          });
        });
      }

      // Remove resolved event
      set({
        activeEvents: state.activeEvents.filter(e => e.id !== eventId)
      });
    },

    updateEvents: (deltaTime) => {
      const state = get();
      
      // Update event durations
      const updatedEvents = state.activeEvents.filter(event => {
        if (event.duration) {
          event.duration -= deltaTime;
          return event.duration > 0;
        }
        return true;
      });

      if (updatedEvents.length !== state.activeEvents.length) {
        set({ activeEvents: updatedEvents });
      }

      // Randomly trigger new events
      if (Math.random() < 0.001 * deltaTime) { // Very low chance per frame
        get().triggerRandomEvent();
      }
    }
  }))
);
