
export interface Specialization {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: string[];
  unlocks: {
    recipes?: string[];
    efficiency?: number;
    rareChance?: number;
    speedBonus?: number;
  };
}

export const SPECIALIZATIONS: Record<string, Specialization> = {
  // WARRIOR FORGE
  warrior_forge: {
    id: 'warrior_forge',
    name: 'Forja do Guerreiro',
    description: 'Especialização em equipamentos pesados',
    category: 'crafting',
    requirements: ['trainee_craftsman'],
    unlocks: {
      recipes: ['plate_armor_t4', 'sword_t4', 'axe_t4', 'mace_t4'],
      efficiency: 0.15,
      speedBonus: 0.10
    }
  },
  
  plate_armor_crafter: {
    id: 'plate_armor_crafter',
    name: 'Criador de Armadura de Placa',
    description: 'Mestre em armaduras pesadas',
    category: 'crafting',
    requirements: ['warrior_forge'],
    unlocks: {
      recipes: ['soldier_armor', 'knight_armor', 'guardian_armor'],
      efficiency: 0.25,
      rareChance: 0.05
    }
  },

  // HUNTER LODGE
  hunter_lodge: {
    id: 'hunter_lodge',
    name: 'Cabana do Caçador',
    description: 'Especialização em equipamentos médios',
    category: 'crafting',
    requirements: ['trainee_craftsman'],
    unlocks: {
      recipes: ['leather_armor_t4', 'bow_t4', 'spear_t4'],
      efficiency: 0.15,
      speedBonus: 0.15
    }
  },

  // MAGE TOWER
  mage_tower: {
    id: 'mage_tower',
    name: 'Torre do Mago',
    description: 'Especialização em equipamentos mágicos',
    category: 'crafting',
    requirements: ['trainee_craftsman'],
    unlocks: {
      recipes: ['cloth_armor_t4', 'fire_staff_t4', 'holy_staff_t4'],
      efficiency: 0.20,
      rareChance: 0.08
    }
  },

  // GATHERING SPECIALIZATIONS
  adept_lumberjack: {
    id: 'adept_lumberjack',
    name: 'Lenhador Adepto',
    description: 'Mestre em coleta de madeira',
    category: 'gathering',
    requirements: ['lumberjack'],
    unlocks: {
      efficiency: 0.50,
      rareChance: 0.10,
      speedBonus: 0.25
    }
  },

  adept_miner: {
    id: 'adept_miner',
    name: 'Minerador Adepto',
    description: 'Mestre em mineração',
    category: 'gathering',
    requirements: ['miner'],
    unlocks: {
      efficiency: 0.50,
      rareChance: 0.10,
      speedBonus: 0.25
    }
  },

  // FARMING SPECIALIZATIONS
  adept_crop_farmer: {
    id: 'adept_crop_farmer',
    name: 'Fazendeiro Adepto',
    description: 'Mestre em agricultura',
    category: 'farming',
    requirements: ['crop_farmer'],
    unlocks: {
      efficiency: 1.0, // 100% mais recursos
      speedBonus: 0.30,
      rareChance: 0.05
    }
  },

  // REFINING SPECIALIZATIONS
  adept_wood_refiner: {
    id: 'adept_wood_refiner',
    name: 'Refinador de Madeira Adepto',
    description: 'Mestre em refino de madeira',
    category: 'refining',
    requirements: ['wood_refiner'],
    unlocks: {
      efficiency: 0.50,
      rareChance: 0.15,
      speedBonus: 0.20
    }
  },

  adept_ore_refiner: {
    id: 'adept_ore_refiner',
    name: 'Refinador de Minério Adepto',
    description: 'Mestre em refino de minérios',
    category: 'refining',
    requirements: ['ore_refiner'],
    unlocks: {
      efficiency: 0.50,
      rareChance: 0.15,
      speedBonus: 0.20
    }
  }
};

export const getSpecializationBonuses = (skillId: string, level: number) => {
  const spec = SPECIALIZATIONS[skillId];
  if (!spec || level === 0) {
    return { efficiency: 1.0, speed: 1.0, rareChance: 0.0 };
  }

  const levelMultiplier = level / 100; // Normalizar para 0-1

  return {
    efficiency: 1.0 + (spec.unlocks.efficiency || 0) * levelMultiplier,
    speed: 1.0 + (spec.unlocks.speedBonus || 0) * levelMultiplier,
    rareChance: (spec.unlocks.rareChance || 0) * levelMultiplier
  };
};
