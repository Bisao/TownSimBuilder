import { Armor, ArmorType } from "../types/combat";

export const ARMORS_DATABASE: Record<string, Armor> = {
  // === ARMADURAS DE TECIDO (Magos) ===

  cloth_robe: {
    id: 'cloth_robe',
    name: 'Túnica de Tecido',
    type: 'cloth',
    tier: 3,
    physicalDefense: 5,
    magicalDefense: 25,
    durability: 60,
    maxDurability: 60,
    weight: 2,
    requirements: { level: 5 }
  },

  mage_robe: {
    id: 'mage_robe',
    name: 'Túnica de Mago',
    type: 'cloth',
    tier: 4,
    physicalDefense: 8,
    magicalDefense: 40,
    durability: 80,
    maxDurability: 80,
    weight: 3,
    requirements: { intelligence: 15, level: 10 }
  },

  archmage_robe: {
    id: 'archmage_robe',
    name: 'Túnica de Arquimago',
    type: 'cloth',
    tier: 6,
    physicalDefense: 15,
    magicalDefense: 70,
    durability: 120,
    maxDurability: 120,
    weight: 4,
    requirements: { intelligence: 35, level: 30 }
  },

  // === ARMADURAS DE COURO (Hunters/Archers) ===

  leather_armor: {
    id: 'leather_armor',
    name: 'Armadura de Couro',
    type: 'leather',
    tier: 3,
    physicalDefense: 15,
    magicalDefense: 10,
    durability: 80,
    maxDurability: 80,
    weight: 8,
    requirements: { level: 8 }
  },

  hunter_leather: {
    id: 'hunter_leather',
    name: 'Couro de Caçador',
    type: 'leather',
    tier: 4,
    physicalDefense: 25,
    magicalDefense: 15,
    durability: 100,
    maxDurability: 100,
    weight: 10,
    requirements: { dexterity: 20, level: 15 }
  },

  stalker_leather: {
    id: 'stalker_leather',
    name: 'Couro de Perseguidor',
    type: 'leather',
    tier: 5,
    physicalDefense: 35,
    magicalDefense: 20,
    durability: 130,
    maxDurability: 130,
    weight: 12,
    requirements: { dexterity: 30, level: 25 }
  },

  // === ARMADURAS DE PLACA (Warriors/Tanks) ===

  iron_plate: {
    id: 'iron_plate',
    name: 'Armadura de Placas de Ferro',
    type: 'plate',
    tier: 4,
    physicalDefense: 45,
    magicalDefense: 5,
    durability: 150,
    maxDurability: 150,
    weight: 25,
    requirements: { strength: 20, level: 12 }
  },

  steel_plate: {
    id: 'steel_plate',
    name: 'Armadura de Placas de Aço',
    type: 'plate',
    tier: 5,
    physicalDefense: 65,
    magicalDefense: 8,
    durability: 200,
    maxDurability: 200,
    weight: 30,
    requirements: { strength: 30, level: 20 }
  },

  guardian_plate: {
    id: 'guardian_plate',
    name: 'Armadura do Guardião',
    type: 'plate',
    tier: 6,
    physicalDefense: 90,
    magicalDefense: 15,
    durability: 280,
    maxDurability: 280,
    weight: 40,
    requirements: { strength: 45, level: 35 }
  },

  // === CAPACETES ===

  leather_helmet: {
    id: 'leather_helmet',
    name: 'Capacete de Couro',
    type: 'helmet',
    tier: 3,
    physicalDefense: 8,
    magicalDefense: 3,
    durability: 50,
    maxDurability: 50,
    weight: 2,
    requirements: { level: 6 }
  },

  iron_helmet: {
    id: 'iron_helmet',
    name: 'Capacete de Ferro',
    type: 'helmet',
    tier: 4,
    physicalDefense: 15,
    magicalDefense: 2,
    durability: 80,
    maxDurability: 80,
    weight: 5,
    requirements: { strength: 15, level: 10 }
  },

  mage_hood: {
    id: 'mage_hood',
    name: 'Capuz de Mago',
    type: 'helmet',
    tier: 4,
    physicalDefense: 3,
    magicalDefense: 20,
    durability: 60,
    maxDurability: 60,
    weight: 1,
    requirements: { intelligence: 15, level: 10 }
  },

  // === BOTAS ===

  leather_boots: {
    id: 'leather_boots',
    name: 'Botas de Couro',
    type: 'boots',
    tier: 3,
    physicalDefense: 5,
    magicalDefense: 2,
    durability: 40,
    maxDurability: 40,
    weight: 2,
    requirements: { level: 5 }
  },

  iron_boots: {
    id: 'iron_boots',
    name: 'Botas de Ferro',
    type: 'boots',
    tier: 4,
    physicalDefense: 12,
    magicalDefense: 1,
    durability: 70,
    maxDurability: 70,
    weight: 6,
    requirements: { strength: 12, level: 8 }
  },

  mage_sandals: {
    id: 'mage_sandals',
    name: 'Sandálias de Mago',
    type: 'boots',
    tier: 4,
    physicalDefense: 2,
    magicalDefense: 15,
    durability: 50,
    maxDurability: 50,
    weight: 1,
    requirements: { intelligence: 12, level: 8 }
  },

  // === LUVAS ===

  leather_gloves: {
    id: 'leather_gloves',
    name: 'Luvas de Couro',
    type: 'gloves',
    tier: 3,
    physicalDefense: 3,
    magicalDefense: 2,
    durability: 35,
    maxDurability: 35,
    weight: 1,
    requirements: { level: 4 }
  },

  iron_gauntlets: {
    id: 'iron_gauntlets',
    name: 'Manoplas de Ferro',
    type: 'gloves',
    tier: 4,
    physicalDefense: 10,
    magicalDefense: 1,
    durability: 60,
    maxDurability: 60,
    weight: 4,
    requirements: { strength: 10, level: 7 }
  },

  mage_gloves: {
    id: 'mage_gloves',
    name: 'Luvas de Mago',
    type: 'gloves',
    tier: 4,
    physicalDefense: 1,
    magicalDefense: 12,
    durability: 45,
    maxDurability: 45,
    weight: 1,
    requirements: { intelligence: 10, level: 7 }
  }
};

export const getArmorsByType = (type: ArmorType): Armor[] => {
  return Object.values(ARMORS_DATABASE).filter(armor => armor.type === type);
};

export const getArmorsBySpecialization = (specialization: string): Armor[] => {
  switch (specialization) {
    case 'warrior':
    case 'plate_fighter':
      return Object.values(ARMORS_DATABASE).filter(armor => 
        armor.name.includes('Ferro') || 
        armor.name.includes('Aço') || 
        armor.name.includes('Placas') ||
        armor.name.includes('Guardião')
      );

    case 'hunter':
    case 'archer':
      return Object.values(ARMORS_DATABASE).filter(armor => 
        armor.name.includes('Couro') || 
        armor.name.includes('Caçador') ||
        armor.name.includes('Perseguidor')
      );

    case 'fire_mage':
    case 'ice_mage':
    case 'lightning_mage':
    case 'holy_mage':
      return Object.values(ARMORS_DATABASE).filter(armor => 
        armor.name.includes('Mago') || 
        armor.name.includes('Tecido') ||
        armor.name.includes('Túnica') ||
        armor.name.includes('Capuz') ||
        armor.name.includes('Sandálias')
      );

    case 'battle_mage':
    case 'spellsword':
      // Combinação de armaduras médias
      return Object.values(ARMORS_DATABASE).filter(armor => 
        armor.type === 'leather' || 
        (armor.type === 'cloth' && armor.tier >= 4)
      );

    default:
      return [];
  }
};

export const getArmorSet = (specialization: string, tier: number): Armor[] => {
  const armors = getArmorsBySpecialization(specialization);
  return armors.filter(armor => armor.tier === tier);
};