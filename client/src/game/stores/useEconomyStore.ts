
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
    coins: 1000,
    taxRate: 0.1, // 10%
    happiness: 75,
    population: 0,
    marketPrices: { ...DEFAULT_PRICES },
    taxIncome: 0,
    tradeIncome: 0,

    addCoins: (amount) => {
      set((state) => ({ coins: state.coins + amount }));
    },

    spendCoins: (amount) => {
      const state = get();
      if (state.coins >= amount) {
        set({ coins: state.coins - amount });
        return true;
      }
      return false;
    },

    setTaxRate: (rate) => {
      set({ taxRate: Math.max(0, Math.min(1, rate)) });
    },

    updateMarketPrice: (resource, price) => {
      set((state) => ({
        marketPrices: {
          ...state.marketPrices,
          [resource]: Math.max(0.1, price)
        }
      }));
    },

    calculateTaxes: () => {
      const state = get();
      const taxAmount = Math.floor(state.population * state.taxRate * 10);
      
      set((state) => ({
        coins: state.coins + taxAmount,
        taxIncome: taxAmount
      }));
    },

    updateHappiness: (change) => {
      set((state) => ({
        happiness: Math.max(0, Math.min(100, state.happiness + change))
      }));
    }
  }))
);
