
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { weaponsDatabase } from '../constants/weapons';
import { useNotificationStore } from '../../lib/stores/useNotificationStore';
import { GAME_CONFIG } from '../../../shared/constants/game';

// Types
export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  
  // Core Attributes
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  wisdom: number;
  charisma: number;
  
  // Skills
  combat: number;
  crafting: number;
  gathering: number;
  building: number;
  leadership: number;
  magic: number;
  
  // Derived Stats
  attackPower: number;
  defense: number;
  magicPower: number;
  criticalChance: number;
  criticalDamage: number;
  movementSpeed: number;
  carryCapacity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'tool' | 'misc';
  quantity: number;
  durability?: number;
  maxDurability?: number;
  quality: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  weight: number;
  description: string;
  icon?: string;
  stackable: boolean;
  maxStack: number;
}

export interface Equipment {
  weapon?: InventoryItem;
  armor?: InventoryItem;
  helmet?: InventoryItem;
  boots?: InventoryItem;
  gloves?: InventoryItem;
  ring1?: InventoryItem;
  ring2?: InventoryItem;
  necklace?: InventoryItem;
}

interface PlayerState {
  // Character Info
  name: string;
  class: string;
  stats: PlayerStats;
  availablePoints: number;
  
  // Position & Movement
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  
  // Inventory & Equipment
  inventory: InventoryItem[];
  equipment: Equipment;
  maxInventorySlots: number;
  currentWeight: number;
  
  // Currency
  gold: number;
  gems: number;
  
  // Achievements & Progress
  achievements: string[];
  questsCompleted: number;
  playTime: number;
  
  // Settings
  autoPickup: boolean;
  showDamageNumbers: boolean;
  combatMode: 'peaceful' | 'defensive' | 'aggressive';
}

interface PlayerActions {
  // Character Management
  createCharacter: (name: string, className: string) => void;
  levelUp: () => boolean;
  allocateStatPoint: (stat: keyof PlayerStats) => boolean;
  resetStats: () => void;
  
  // Position & Movement
  setPosition: (position: [number, number, number]) => void;
  setRotation: (rotation: number) => void;
  setMoving: (isMoving: boolean) => void;
  
  // Health & Resources
  heal: (amount: number) => void;
  damage: (amount: number) => void;
  restoreMana: (amount: number) => void;
  consumeMana: (amount: number) => boolean;
  restoreStamina: (amount: number) => void;
  consumeStamina: (amount: number) => boolean;
  
  // Inventory Management
  addItem: (item: Omit<InventoryItem, 'id'>, quantity?: number) => boolean;
  removeItem: (itemId: string, quantity?: number) => boolean;
  moveItem: (fromIndex: number, toIndex: number) => boolean;
  sortInventory: () => void;
  getItemById: (itemId: string) => InventoryItem | undefined;
  getItemsByType: (type: InventoryItem['type']) => InventoryItem[];
  
  // Equipment Management
  equipItem: (itemId: string, slot: keyof Equipment) => boolean;
  unequipItem: (slot: keyof Equipment) => boolean;
  canEquipItem: (itemId: string, slot: keyof Equipment) => boolean;
  
  // Currency Management
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  
  // Stats & Calculations
  calculateDerivedStats: () => void;
  getTotalWeight: () => number;
  getEquipmentStats: () => Partial<PlayerStats>;
  
  // Achievements & Progress
  unlockAchievement: (achievementId: string) => void;
  addPlayTime: (minutes: number) => void;
  
  // Utilities
  canCarryMore: (weight: number) => boolean;
  getInventorySpace: () => number;
  exportCharacter: () => string;
  importCharacter: (data: string) => boolean;
  
  // State Management
  reset: () => void;
  initialize: (name?: string, className?: string) => void;
}

type PlayerStore = PlayerState & PlayerActions;

// Initial state
const initialStats: PlayerStats = {
  level: 1,
  experience: 0,
  experienceToNext: 100,
  health: 100,
  maxHealth: 100,
  mana: 50,
  maxMana: 50,
  stamina: 100,
  maxStamina: 100,
  
  strength: 10,
  dexterity: 10,
  intelligence: 10,
  constitution: 10,
  wisdom: 10,
  charisma: 10,
  
  combat: 1,
  crafting: 1,
  gathering: 1,
  building: 1,
  leadership: 1,
  magic: 1,
  
  attackPower: 0,
  defense: 0,
  magicPower: 0,
  criticalChance: 0.05,
  criticalDamage: 1.5,
  movementSpeed: 1.0,
  carryCapacity: 100,
};

const initialState: PlayerState = {
  name: 'Aventureiro',
  class: 'Iniciante',
  stats: { ...initialStats },
  availablePoints: 0,
  
  position: [25, 0, 25],
  rotation: 0,
  isMoving: false,
  
  inventory: [],
  equipment: {},
  maxInventorySlots: 20,
  currentWeight: 0,
  
  gold: 100,
  gems: 0,
  
  achievements: [],
  questsCompleted: 0,
  playTime: 0,
  
  autoPickup: true,
  showDamageNumbers: true,
  combatMode: 'defensive',
};

// Store implementation
export const usePlayerStore = create<PlayerStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Character Management
    createCharacter: (name: string, className: string) => {
      set((state) => ({
        ...state,
        name,
        class: className,
        stats: { ...initialStats },
        availablePoints: 5,
      }));

      get().calculateDerivedStats();

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Personagem criado',
        message: `Bem-vindo, ${name} o ${className}!`,
      });
    },

    levelUp: () => {
      const { stats } = get();
      
      if (stats.experience < stats.experienceToNext) {
        return false;
      }

      const newLevel = stats.level + 1;
      const newExperienceToNext = newLevel * 100;
      const remainingExperience = stats.experience - stats.experienceToNext;

      set((state) => ({
        stats: {
          ...state.stats,
          level: newLevel,
          experience: remainingExperience,
          experienceToNext: newExperienceToNext,
          maxHealth: state.stats.maxHealth + 10,
          health: state.stats.maxHealth + 10,
          maxMana: state.stats.maxMana + 5,
          mana: state.stats.maxMana + 5,
          maxStamina: state.stats.maxStamina + 5,
          stamina: state.stats.maxStamina + 5,
        },
        availablePoints: state.availablePoints + 3,
      }));

      get().calculateDerivedStats();

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Nível aumentado!',
        message: `Você alcançou o nível ${newLevel}! +3 pontos de atributo`,
      });

      return true;
    },

    allocateStatPoint: (stat: keyof PlayerStats) => {
      const { availablePoints, stats } = get();
      
      if (availablePoints <= 0) return false;

      // Only allow allocation to base attributes
      const baseAttributes = ['strength', 'dexterity', 'intelligence', 'constitution', 'wisdom', 'charisma'];
      if (!baseAttributes.includes(stat)) return false;

      set((state) => ({
        stats: {
          ...state.stats,
          [stat]: state.stats[stat] + 1,
        },
        availablePoints: state.availablePoints - 1,
      }));

      get().calculateDerivedStats();
      return true;
    },

    resetStats: () => {
      const { stats } = get();
      const totalPoints = stats.level * 3 + 5; // Starting points + level ups
      
      set((state) => ({
        stats: {
          ...state.stats,
          strength: 10,
          dexterity: 10,
          intelligence: 10,
          constitution: 10,
          wisdom: 10,
          charisma: 10,
        },
        availablePoints: totalPoints - 60, // 60 = 6 attributes * 10 base
      }));

      get().calculateDerivedStats();
    },

    // Position & Movement
    setPosition: (position: [number, number, number]) => {
      set({ position });
    },

    setRotation: (rotation: number) => {
      set({ rotation });
    },

    setMoving: (isMoving: boolean) => {
      set({ isMoving });
    },

    // Health & Resources
    heal: (amount: number) => {
      set((state) => ({
        stats: {
          ...state.stats,
          health: Math.min(state.stats.maxHealth, state.stats.health + amount),
        },
      }));
    },

    damage: (amount: number) => {
      set((state) => ({
        stats: {
          ...state.stats,
          health: Math.max(0, state.stats.health - amount),
        },
      }));
    },

    restoreMana: (amount: number) => {
      set((state) => ({
        stats: {
          ...state.stats,
          mana: Math.min(state.stats.maxMana, state.stats.mana + amount),
        },
      }));
    },

    consumeMana: (amount: number) => {
      const { stats } = get();
      if (stats.mana < amount) return false;

      set((state) => ({
        stats: {
          ...state.stats,
          mana: state.stats.mana - amount,
        },
      }));

      return true;
    },

    restoreStamina: (amount: number) => {
      set((state) => ({
        stats: {
          ...state.stats,
          stamina: Math.min(state.stats.maxStamina, state.stats.stamina + amount),
        },
      }));
    },

    consumeStamina: (amount: number) => {
      const { stats } = get();
      if (stats.stamina < amount) return false;

      set((state) => ({
        stats: {
          ...state.stats,
          stamina: state.stats.stamina - amount,
        },
      }));

      return true;
    },

    // Inventory Management
    addItem: (itemData: Omit<InventoryItem, 'id'>, quantity: number = 1) => {
      const { inventory, maxInventorySlots, canCarryMore } = get();
      
      if (!canCarryMore(itemData.weight * quantity)) {
        useNotificationStore.getState().addNotification({
          type: 'warning',
          title: 'Muito pesado',
          message: 'Você não pode carregar mais peso',
        });
        return false;
      }

      // Check if item can stack with existing item
      if (itemData.stackable) {
        const existingItem = inventory.find(item => 
          item.name === itemData.name && 
          item.type === itemData.type &&
          item.quantity < item.maxStack
        );

        if (existingItem) {
          const canAdd = Math.min(quantity, existingItem.maxStack - existingItem.quantity);
          
          set((state) => ({
            inventory: state.inventory.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + canAdd }
                : item
            ),
          }));

          return true;
        }
      }

      // Add as new item
      if (inventory.length >= maxInventorySlots) {
        useNotificationStore.getState().addNotification({
          type: 'warning',
          title: 'Inventário cheio',
          message: 'Você não tem espaço no inventário',
        });
        return false;
      }

      const newItem: InventoryItem = {
        ...itemData,
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantity,
      };

      set((state) => ({
        inventory: [...state.inventory, newItem],
      }));

      return true;
    },

    removeItem: (itemId: string, quantity: number = 1) => {
      const { inventory } = get();
      const item = inventory.find(i => i.id === itemId);
      
      if (!item || item.quantity < quantity) return false;

      if (item.quantity === quantity) {
        // Remove item completely
        set((state) => ({
          inventory: state.inventory.filter(i => i.id !== itemId),
        }));
      } else {
        // Reduce quantity
        set((state) => ({
          inventory: state.inventory.map(i =>
            i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
          ),
        }));
      }

      return true;
    },

    moveItem: (fromIndex: number, toIndex: number) => {
      const { inventory } = get();
      
      if (fromIndex < 0 || fromIndex >= inventory.length ||
          toIndex < 0 || toIndex >= inventory.length) {
        return false;
      }

      const newInventory = [...inventory];
      const [movedItem] = newInventory.splice(fromIndex, 1);
      newInventory.splice(toIndex, 0, movedItem);

      set({ inventory: newInventory });
      return true;
    },

    sortInventory: () => {
      set((state) => ({
        inventory: [...state.inventory].sort((a, b) => {
          if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
          }
          return a.name.localeCompare(b.name);
        }),
      }));
    },

    getItemById: (itemId: string) => {
      const { inventory } = get();
      return inventory.find(item => item.id === itemId);
    },

    getItemsByType: (type: InventoryItem['type']) => {
      const { inventory } = get();
      return inventory.filter(item => item.type === type);
    },

    // Equipment Management
    equipItem: (itemId: string, slot: keyof Equipment) => {
      const { inventory, equipment, canEquipItem } = get();
      
      if (!canEquipItem(itemId, slot)) return false;

      const item = inventory.find(i => i.id === itemId);
      if (!item) return false;

      // Unequip current item in slot
      if (equipment[slot]) {
        get().unequipItem(slot);
      }

      // Remove from inventory and equip
      set((state) => ({
        inventory: state.inventory.filter(i => i.id !== itemId),
        equipment: {
          ...state.equipment,
          [slot]: item,
        },
      }));

      get().calculateDerivedStats();
      return true;
    },

    unequipItem: (slot: keyof Equipment) => {
      const { equipment } = get();
      const item = equipment[slot];
      
      if (!item) return false;

      // Add back to inventory
      const success = get().addItem(item);
      if (!success) return false;

      set((state) => ({
        equipment: {
          ...state.equipment,
          [slot]: undefined,
        },
      }));

      get().calculateDerivedStats();
      return true;
    },

    canEquipItem: (itemId: string, slot: keyof Equipment) => {
      const item = get().getItemById(itemId);
      if (!item) return false;

      // Check if item type matches slot
      const slotTypes: Record<keyof Equipment, InventoryItem['type'][]> = {
        weapon: ['weapon'],
        armor: ['armor'],
        helmet: ['armor'],
        boots: ['armor'],
        gloves: ['armor'],
        ring1: ['misc'],
        ring2: ['misc'],
        necklace: ['misc'],
      };

      return slotTypes[slot]?.includes(item.type) || false;
    },

    // Currency Management
    addGold: (amount: number) => {
      set((state) => ({
        gold: state.gold + amount,
      }));
    },

    spendGold: (amount: number) => {
      const { gold } = get();
      if (gold < amount) return false;

      set((state) => ({
        gold: state.gold - amount,
      }));

      return true;
    },

    addGems: (amount: number) => {
      set((state) => ({
        gems: state.gems + amount,
      }));
    },

    spendGems: (amount: number) => {
      const { gems } = get();
      if (gems < amount) return false;

      set((state) => ({
        gems: state.gems - amount,
      }));

      return true;
    },

    // Stats & Calculations
    calculateDerivedStats: () => {
      const { stats, getEquipmentStats } = get();
      const equipmentStats = getEquipmentStats();

      const newStats = {
        attackPower: Math.floor(stats.strength * 2 + stats.dexterity + (equipmentStats.attackPower || 0)),
        defense: Math.floor(stats.constitution + stats.strength * 0.5 + (equipmentStats.defense || 0)),
        magicPower: Math.floor(stats.intelligence * 2 + stats.wisdom + (equipmentStats.magicPower || 0)),
        criticalChance: Math.min(0.5, 0.05 + stats.dexterity * 0.001 + (equipmentStats.criticalChance || 0)),
        criticalDamage: 1.5 + stats.strength * 0.01 + (equipmentStats.criticalDamage || 0),
        movementSpeed: 1.0 + stats.dexterity * 0.01 + (equipmentStats.movementSpeed || 0),
        carryCapacity: 100 + stats.strength * 5 + (equipmentStats.carryCapacity || 0),
      };

      set((state) => ({
        stats: {
          ...state.stats,
          ...newStats,
        },
      }));
    },

    getTotalWeight: () => {
      const { inventory, equipment } = get();
      
      const inventoryWeight = inventory.reduce((total, item) => {
        return total + (item.weight * item.quantity);
      }, 0);

      const equipmentWeight = Object.values(equipment).reduce((total, item) => {
        return total + (item?.weight || 0);
      }, 0);

      return inventoryWeight + equipmentWeight;
    },

    getEquipmentStats: () => {
      const { equipment } = get();
      const stats: Partial<PlayerStats> = {};

      Object.values(equipment).forEach(item => {
        if (item) {
          // Add equipment stats (would be defined in item data)
          // This is a simplified version
          if (item.type === 'weapon') {
            stats.attackPower = (stats.attackPower || 0) + 10;
          }
          if (item.type === 'armor') {
            stats.defense = (stats.defense || 0) + 5;
          }
        }
      });

      return stats;
    },

    // Achievements & Progress
    unlockAchievement: (achievementId: string) => {
      const { achievements } = get();
      
      if (achievements.includes(achievementId)) return;

      set((state) => ({
        achievements: [...state.achievements, achievementId],
      }));

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Conquista desbloqueada!',
        message: `Você desbloqueou: ${achievementId}`,
      });
    },

    addPlayTime: (minutes: number) => {
      set((state) => ({
        playTime: state.playTime + minutes,
      }));
    },

    // Utilities
    canCarryMore: (weight: number) => {
      const { getTotalWeight, stats } = get();
      return getTotalWeight() + weight <= stats.carryCapacity;
    },

    getInventorySpace: () => {
      const { inventory, maxInventorySlots } = get();
      return maxInventorySlots - inventory.length;
    },

    exportCharacter: () => {
      const state = get();
      return JSON.stringify({
        name: state.name,
        class: state.class,
        stats: state.stats,
        inventory: state.inventory,
        equipment: state.equipment,
        gold: state.gold,
        gems: state.gems,
        achievements: state.achievements,
        playTime: state.playTime,
      });
    },

    importCharacter: (data: string) => {
      try {
        const characterData = JSON.parse(data);
        
        set((state) => ({
          ...state,
          ...characterData,
        }));

        get().calculateDerivedStats();
        return true;
      } catch (error) {
        console.error('Failed to import character:', error);
        return false;
      }
    },

    // State Management
    reset: () => {
      set({ ...initialState });
    },

    initialize: (name?: string, className?: string) => {
      if (name && className) {
        get().createCharacter(name, className);
      }
      get().calculateDerivedStats();
      console.log('Player store initialized');
    },
  }))
);

// Selectors
export const usePlayerSelectors = {
  getStats: () => usePlayerStore((state) => state.stats),
  getPosition: () => usePlayerStore((state) => state.position),
  getInventory: () => usePlayerStore((state) => state.inventory),
  getEquipment: () => usePlayerStore((state) => state.equipment),
  getCurrency: () => usePlayerStore((state) => ({ gold: state.gold, gems: state.gems })),
  getLevel: () => usePlayerStore((state) => state.stats.level),
  getHealth: () => usePlayerStore((state) => ({ 
    current: state.stats.health, 
    max: state.stats.maxHealth 
  })),
  getMana: () => usePlayerStore((state) => ({ 
    current: state.stats.mana, 
    max: state.stats.maxMana 
  })),
  getStamina: () => usePlayerStore((state) => ({ 
    current: state.stats.stamina, 
    max: state.stats.maxStamina 
  })),
};
