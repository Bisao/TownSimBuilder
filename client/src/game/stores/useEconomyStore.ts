import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface EconomyState {
  coins: number;
  taxRate: number;
  happiness: number;
  population: number;

  // Market prices (dynamic)
  marketPrices: Record<string, number>;

  // Income sources
  taxIncome: number;
  tradeIncome: number;

  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  setTaxRate: (rate: number) => void;
  updateMarketPrice: (resource: string, price: number) => void;
  calculateTaxes: () => void;
  updateHappiness: (change: number) => void;
}

const DEFAULT_PRICES = {
  madeira: 10,
  pedra: 15,
  trigo: 5,
  pao: 8,
  agua: 2,
  wood: 2,
  stone: 3,
  wheat: 1,
  bread: 4,
  water: 1,
  seeds: 2,
  corn_seeds: 3,
  carrot_seeds: 3,
};

export const useEconomyStore = create<EconomyState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    coins: 1000,
    taxRate: 0.1,
    happiness: 80,
    population: 0,

    marketPrices: { ...DEFAULT_PRICES },

    taxIncome: 0,
    tradeIncome: 0,

    // Actions
    addCoins: (amount) => set((state) => ({
      coins: state.coins + amount,
      tradeIncome: state.tradeIncome + amount
    })),

    spendCoins: (amount) => {
      const state = get();
      if (state.coins >= amount) {
        set({ coins: state.coins - amount });
        return true;
      }
      return false;
    },

    setTaxRate: (rate) => set({ 
      taxRate: Math.max(0, Math.min(0.5, rate)) 
    }),

    updateMarketPrice: (resource, price) => set((state) => ({
      marketPrices: {
        ...state.marketPrices,
        [resource]: Math.max(0.1, price)
      }
    })),

    calculateTaxes: () => set((state) => {
      const taxAmount = Math.floor(state.population * state.taxRate * 10);
      return {
        coins: state.coins + taxAmount,
        taxIncome: taxAmount,
        happiness: Math.max(0, state.happiness - (state.taxRate * 20))
      };
    }),

    updateHappiness: (change) => set((state) => ({
      happiness: Math.max(0, Math.min(100, state.happiness + change))
    })),
  }))
);