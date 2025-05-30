
export interface CombatStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  
  // Atributos base
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  
  // Atributos de combate
  physicalDamage: number;
  magicalDamage: number;
  physicalDefense: number;
  magicalDefense: number;
  accuracy: number;
  evasion: number;
  criticalChance: number;
  criticalDamage: number;
  
  // Resistências
  fireResistance: number;
  iceResistance: number;
  lightningResistance: number;
  physicalResistance: number;
}

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  tier: number;
  damage: number;
  speed: number;
  range: number;
  durability: number;
  maxDurability: number;
  requirements: {
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    level?: number;
  };
  enchantments?: Enchantment[];
  specialAbilities?: SpecialAbility[];
}

export type WeaponType = 
  // Corpo a Corpo
  | 'sword' | 'axe' | 'mace' | 'dagger' | 'spear'
  // À Distância
  | 'bow' | 'crossbow' | 'throwing_knife'
  // Mágico
  | 'fire_staff' | 'ice_staff' | 'lightning_staff' | 'holy_staff'
  // Híbrido
  | 'enchanted_sword' | 'battle_mage_staff';

export interface Armor {
  id: string;
  name: string;
  type: ArmorType;
  tier: number;
  physicalDefense: number;
  magicalDefense: number;
  durability: number;
  maxDurability: number;
  weight: number;
  requirements: {
    strength?: number;
    level?: number;
  };
}

export type ArmorType = 'cloth' | 'leather' | 'plate' | 'helmet' | 'boots' | 'gloves';

export interface Enchantment {
  id: string;
  name: string;
  type: 'damage' | 'defense' | 'utility';
  effect: {
    attribute: string;
    value: number;
    percentage?: boolean;
  };
  duration?: number; // Em segundos, undefined para permanente
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive';
  cooldown?: number;
  manaCost?: number;
  staminaCost?: number;
  damage?: number;
  effect?: string;
  range?: number;
  areaOfEffect?: number;
}

export interface CombatAction {
  id: string;
  type: 'attack' | 'defend' | 'spell' | 'ability' | 'item';
  targetId?: string;
  targetPosition?: { x: number; y: number; z: number };
  weaponId?: string;
  spellId?: string;
  abilityId?: string;
  itemId?: string;
}

export interface DamageResult {
  totalDamage: number;
  physicalDamage: number;
  magicalDamage: number;
  critical: boolean;
  blocked: boolean;
  evaded: boolean;
  damageType: 'physical' | 'fire' | 'ice' | 'lightning' | 'holy';
}

export interface CombatEntity {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  stats: CombatStats;
  equipment: {
    weapon?: Weapon;
    armor: Partial<Record<ArmorType, Armor>>;
  };
  activeEffects: StatusEffect[];
  combatState: 'idle' | 'attacking' | 'defending' | 'casting' | 'stunned' | 'dead';
  currentTarget?: string;
  specialization: CombatSpecialization;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'damage_over_time' | 'heal_over_time';
  duration: number;
  effect: {
    attribute?: string;
    value?: number;
    damagePerTick?: number;
    healPerTick?: number;
  };
  stackable: boolean;
  stacks: number;
}

export type CombatSpecialization = 
  | 'warrior' | 'plate_fighter' 
  | 'hunter' | 'archer'
  | 'fire_mage' | 'ice_mage' | 'lightning_mage' | 'holy_mage'
  | 'battle_mage' | 'spellsword';

export interface Spell {
  id: string;
  name: string;
  description: string;
  school: 'fire' | 'ice' | 'lightning' | 'holy' | 'arcane';
  tier: number;
  manaCost: number;
  castTime: number;
  cooldown: number;
  range: number;
  areaOfEffect?: number;
  damage?: number;
  healing?: number;
  effects?: StatusEffect[];
  requirements: {
    intelligence: number;
    level: number;
    skillId?: string;
  };
}

export interface CombatResult {
  winner: string;
  loser: string;
  duration: number;
  damageDealt: Record<string, number>;
  experienceGained: Record<string, number>;
  lootDropped?: string[];
}
