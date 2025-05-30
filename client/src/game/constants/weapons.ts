export type WeaponType = 'sword' | 'axe' | 'bow' | 'staff' | 'dagger' | 'mace' | 'spear' | 'crossbow';
export type DamageType = 'physical' | 'magical' | 'piercing' | 'slashing' | 'blunt';

export interface WeaponDefinition {
  id: string;
  name: string;
  type: WeaponType;
  tier: number;
  damage: {
    min: number;
    max: number;
    type: DamageType;
  };
  durability: number;
  maxDurability: number;
  weight: number;
  range: number;
  attackSpeed: number; // attacks per second
  criticalChance: number; // 0-1
  criticalMultiplier: number;
  requirements: {
    level?: number;
    strength?: number;
    dexterity?: number;
    intelligence?: number;
  };
  specialEffects?: {
    lifesteal?: number;
    poison?: number;
    burn?: number;
    freeze?: number;
  };
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingMaterials?: Record<string, number>;
}

export const WEAPON_DEFINITIONS: Record<string, WeaponDefinition> = {
  // ===== ESPADAS =====
  wooden_sword: {
    id: 'wooden_sword',
    name: 'Espada de Madeira',
    type: 'sword',
    tier: 1,
    damage: { min: 3, max: 6, type: 'slashing' },
    durability: 25,
    maxDurability: 25,
    weight: 2,
    range: 1.2,
    attackSpeed: 1.0,
    criticalChance: 0.05,
    criticalMultiplier: 1.5,
    requirements: { level: 1 },
    description: 'Espada básica de madeira para iniciantes',
    rarity: 'common',
    craftingMaterials: { wood: 8, iron: 2 },
  },

  iron_sword: {
    id: 'iron_sword',
    name: 'Espada de Ferro',
    type: 'sword',
    tier: 3,
    damage: { min: 8, max: 14, type: 'slashing' },
    durability: 60,
    maxDurability: 60,
    weight: 4,
    range: 1.3,
    attackSpeed: 1.1,
    criticalChance: 0.08,
    criticalMultiplier: 1.6,
    requirements: { level: 5, strength: 12 },
    description: 'Espada confiável feita de ferro temperado',
    rarity: 'uncommon',
    craftingMaterials: { iron: 15, wood: 5, coal: 3 },
  },

  steel_sword: {
    id: 'steel_sword',
    name: 'Espada de Aço',
    type: 'sword',
    tier: 5,
    damage: { min: 15, max: 22, type: 'slashing' },
    durability: 100,
    maxDurability: 100,
    weight: 5,
    range: 1.4,
    attackSpeed: 1.2,
    criticalChance: 0.12,
    criticalMultiplier: 1.8,
    requirements: { level: 15, strength: 18 },
    description: 'Espada de aço forjada com maestria',
    rarity: 'rare',
    craftingMaterials: { iron: 25, coal: 10, gems: 2 },
  },

  // ===== MACHADOS =====
  stone_axe: {
    id: 'stone_axe',
    name: 'Machado de Pedra',
    type: 'axe',
    tier: 1,
    damage: { min: 4, max: 8, type: 'slashing' },
    durability: 30,
    maxDurability: 30,
    weight: 3,
    range: 1.1,
    attackSpeed: 0.8,
    criticalChance: 0.06,
    criticalMultiplier: 2.0,
    requirements: { level: 1 },
    description: 'Machado primitivo de pedra lascada',
    rarity: 'common',
    craftingMaterials: { stone: 10, wood: 5 },
  },

  battle_axe: {
    id: 'battle_axe',
    name: 'Machado de Guerra',
    type: 'axe',
    tier: 4,
    damage: { min: 12, max: 20, type: 'slashing' },
    durability: 80,
    maxDurability: 80,
    weight: 7,
    range: 1.5,
    attackSpeed: 0.7,
    criticalChance: 0.15,
    criticalMultiplier: 2.2,
    requirements: { level: 10, strength: 20 },
    description: 'Machado pesado projetado para combate',
    rarity: 'rare',
    craftingMaterials: { iron: 20, wood: 8, coal: 5 },
  },

  // ===== ARCOS =====
  hunting_bow: {
    id: 'hunting_bow',
    name: 'Arco de Caça',
    type: 'bow',
    tier: 2,
    damage: { min: 5, max: 9, type: 'piercing' },
    durability: 40,
    maxDurability: 40,
    weight: 2,
    range: 8.0,
    attackSpeed: 1.5,
    criticalChance: 0.18,
    criticalMultiplier: 2.0,
    requirements: { level: 3, dexterity: 10 },
    description: 'Arco versátil para caça e combate à distância',
    rarity: 'common',
    craftingMaterials: { wood: 12, string: 3 },
  },

  elven_bow: {
    id: 'elven_bow',
    name: 'Arco Élfico',
    type: 'bow',
    tier: 6,
    damage: { min: 18, max: 25, type: 'piercing' },
    durability: 120,
    maxDurability: 120,
    weight: 1,
    range: 12.0,
    attackSpeed: 2.0,
    criticalChance: 0.25,
    criticalMultiplier: 2.5,
    requirements: { level: 20, dexterity: 25 },
    description: 'Arco élfico de precisão incomparável',
    rarity: 'epic',
    craftingMaterials: { wood: 30, gems: 5, gold: 10 },
  },

  // ===== CAJADOS =====
  wooden_staff: {
    id: 'wooden_staff',
    name: 'Cajado de Madeira',
    type: 'staff',
    tier: 1,
    damage: { min: 2, max: 5, type: 'magical' },
    durability: 35,
    maxDurability: 35,
    weight: 2,
    range: 1.8,
    attackSpeed: 1.2,
    criticalChance: 0.10,
    criticalMultiplier: 1.8,
    requirements: { level: 1, intelligence: 8 },
    description: 'Cajado básico para iniciantes em magia',
    rarity: 'common',
    craftingMaterials: { wood: 10, gems: 1 },
  },

  crystal_staff: {
    id: 'crystal_staff',
    name: 'Cajado de Cristal',
    type: 'staff',
    tier: 5,
    damage: { min: 12, max: 18, type: 'magical' },
    durability: 90,
    maxDurability: 90,
    weight: 3,
    range: 2.5,
    attackSpeed: 1.0,
    criticalChance: 0.20,
    criticalMultiplier: 2.2,
    requirements: { level: 15, intelligence: 20 },
    description: 'Cajado ornamentado com cristais mágicos',
    rarity: 'rare',
    craftingMaterials: { wood: 15, gems: 8, gold: 5 },
  },

  // ===== ADAGAS =====
  iron_dagger: {
    id: 'iron_dagger',
    name: 'Adaga de Ferro',
    type: 'dagger',
    tier: 2,
    damage: { min: 3, max: 7, type: 'piercing' },
    durability: 45,
    maxDurability: 45,
    weight: 1,
    range: 0.8,
    attackSpeed: 2.0,
    criticalChance: 0.25,
    criticalMultiplier: 2.0,
    requirements: { level: 3, dexterity: 8 },
    description: 'Adaga rápida e precisa',
    rarity: 'common',
    craftingMaterials: { iron: 8, wood: 3 },
  },

  poisoned_dagger: {
    id: 'poisoned_dagger',
    name: 'Adaga Envenenada',
    type: 'dagger',
    tier: 4,
    damage: { min: 6, max: 11, type: 'piercing' },
    durability: 60,
    maxDurability: 60,
    weight: 1,
    range: 0.8,
    attackSpeed: 2.2,
    criticalChance: 0.30,
    criticalMultiplier: 2.2,
    requirements: { level: 12, dexterity: 16 },
    specialEffects: { poison: 3 },
    description: 'Adaga com lâmina impregnada de veneno',
    rarity: 'uncommon',
    craftingMaterials: { iron: 12, poison_sac: 5, wood: 3 },
  },
};

// Utility functions
export const getWeaponDefinition = (weaponId: string): WeaponDefinition | undefined => {
  return WEAPON_DEFINITIONS[weaponId];
};

export const getWeaponsByType = (type: WeaponType): WeaponDefinition[] => {
  return Object.values(WEAPON_DEFINITIONS).filter(weapon => weapon.type === type);
};

export const getWeaponsByTier = (tier: number): WeaponDefinition[] => {
  return Object.values(WEAPON_DEFINITIONS).filter(weapon => weapon.tier === tier);
};

export const canEquipWeapon = (weaponId: string, character: any): boolean => {
  const weapon = getWeaponDefinition(weaponId);
  if (!weapon) return false;

  const { level, strength, dexterity, intelligence } = weapon.requirements;

  if (level && character.level < level) return false;
  if (strength && character.strength < strength) return false;
  if (dexterity && character.dexterity < dexterity) return false;
  if (intelligence && character.intelligence < intelligence) return false;

  return true;
};

export const calculateWeaponDamage = (weaponId: string): number => {
  const weapon = getWeaponDefinition(weaponId);
  if (!weapon) return 0;

  const { min, max } = weapon.damage;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Weapon categories for UI organization
export const WEAPON_CATEGORIES = {
  MELEE: ['sword', 'axe', 'dagger', 'mace', 'spear'],
  RANGED: ['bow', 'crossbow'],
  MAGIC: ['staff'],
} as const;

// Legacy exports for compatibility
export const weaponsDatabase = WEAPON_DEFINITIONS;