
import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  gold: number;
  inventory: any[];
  equipment: {
    helmet?: any;
    armor?: any;
    weapon?: any;
    shield?: any;
    boots?: any;
  };
}

interface PlayerState {
  player: Player;
  setPlayer: (player: Player) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  addExperience: (amount: number) => void;
  addGold: (amount: number) => void;
  subtractGold: (amount: number) => void;
  updateHealth: (amount: number) => void;
  updateMana: (amount: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: {
    id: 'player-1',
    name: 'Aventureiro',
    level: 1,
    experience: 0,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    vitality: 10,
    gold: 100,
    inventory: [],
    equipment: {},
  },

  setPlayer: (player) => set({ player }),

  updatePlayer: (updates) => set((state) => ({
    player: { ...state.player, ...updates }
  })),

  addExperience: (amount) => set((state) => {
    const newExp = state.player.experience + amount;
    const newLevel = Math.floor(newExp / 100) + 1;
    return {
      player: {
        ...state.player,
        experience: newExp,
        level: newLevel,
      }
    };
  }),

  addGold: (amount) => set((state) => ({
    player: {
      ...state.player,
      gold: state.player.gold + amount,
    }
  })),

  subtractGold: (amount) => set((state) => ({
    player: {
      ...state.player,
      gold: Math.max(0, state.player.gold - amount),
    }
  })),

  updateHealth: (amount) => set((state) => ({
    player: {
      ...state.player,
      health: Math.max(0, Math.min(state.player.maxHealth, state.player.health + amount)),
    }
  })),

  updateMana: (amount) => set((state) => ({
    player: {
      ...state.player,
      mana: Math.max(0, Math.min(state.player.maxMana, state.player.mana + amount)),
    }
  })),
}));
