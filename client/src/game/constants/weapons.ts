
import { Weapon, WeaponType } from "../types/combat";

export const WEAPONS_DATABASE: Record<string, Weapon> = {
  // === COMBATE CORPO A CORPO ===
  
  // Espadas
  iron_sword: {
    id: 'iron_sword',
    name: 'Espada de Ferro',
    type: 'sword',
    tier: 4,
    damage: 45,
    speed: 1.2,
    range: 2,
    durability: 100,
    maxDurability: 100,
    requirements: { strength: 15, level: 10 },
    specialAbilities: [{
      id: 'slash_combo',
      name: 'Combo de Corte',
      description: 'Executa 3 ataques rápidos consecutivos',
      type: 'active',
      cooldown: 8,
      staminaCost: 30,
      damage: 35
    }]
  },

  steel_sword: {
    id: 'steel_sword',
    name: 'Espada de Aço',
    type: 'sword',
    tier: 5,
    damage: 65,
    speed: 1.3,
    range: 2,
    durability: 150,
    maxDurability: 150,
    requirements: { strength: 25, level: 20 },
    specialAbilities: [{
      id: 'piercing_thrust',
      name: 'Estocada Perfurante',
      description: 'Ignora 50% da armadura',
      type: 'active',
      cooldown: 12,
      staminaCost: 40,
      damage: 80
    }]
  },

  // Machados
  iron_axe: {
    id: 'iron_axe',
    name: 'Machado de Ferro',
    type: 'axe',
    tier: 4,
    damage: 55,
    speed: 1.0,
    range: 2.2,
    durability: 120,
    maxDurability: 120,
    requirements: { strength: 20, level: 12 },
    specialAbilities: [{
      id: 'heavy_swing',
      name: 'Golpe Pesado',
      description: 'Ataque lento mas devastador',
      type: 'active',
      cooldown: 10,
      staminaCost: 50,
      damage: 90
    }]
  },

  // Maças
  iron_mace: {
    id: 'iron_mace',
    name: 'Maça de Ferro',
    type: 'mace',
    tier: 4,
    damage: 50,
    speed: 1.1,
    range: 1.8,
    durability: 140,
    maxDurability: 140,
    requirements: { strength: 18, level: 11 },
    specialAbilities: [{
      id: 'stunning_blow',
      name: 'Golpe Atordoante',
      description: 'Pode atordoar o inimigo por 3 segundos',
      type: 'active',
      cooldown: 15,
      staminaCost: 35,
      damage: 45
    }]
  },

  // === COMBATE À DISTÂNCIA ===
  
  // Arcos
  hunting_bow: {
    id: 'hunting_bow',
    name: 'Arco de Caça',
    type: 'bow',
    tier: 3,
    damage: 35,
    speed: 1.5,
    range: 15,
    durability: 80,
    maxDurability: 80,
    requirements: { dexterity: 15, level: 8 },
    specialAbilities: [{
      id: 'aimed_shot',
      name: 'Tiro Certeiro',
      description: 'Aumenta precisão e dano crítico',
      type: 'active',
      cooldown: 6,
      staminaCost: 25,
      damage: 50
    }]
  },

  warbow: {
    id: 'warbow',
    name: 'Arco de Guerra',
    type: 'bow',
    tier: 5,
    damage: 60,
    speed: 1.4,
    range: 20,
    durability: 120,
    maxDurability: 120,
    requirements: { dexterity: 30, level: 25 },
    specialAbilities: [{
      id: 'rain_of_arrows',
      name: 'Chuva de Flechas',
      description: 'Dispara múltiplas flechas em área',
      type: 'active',
      cooldown: 20,
      staminaCost: 60,
      damage: 40,
      range: 18,
      areaOfEffect: 5
    }]
  },

  // Bestas
  crossbow: {
    id: 'crossbow',
    name: 'Besta',
    type: 'crossbow',
    tier: 4,
    damage: 70,
    speed: 0.8,
    range: 18,
    durability: 100,
    maxDurability: 100,
    requirements: { dexterity: 20, level: 15 },
    specialAbilities: [{
      id: 'explosive_bolt',
      name: 'Virote Explosivo',
      description: 'Causa dano em área no impacto',
      type: 'active',
      cooldown: 12,
      staminaCost: 40,
      damage: 80,
      areaOfEffect: 3
    }]
  },

  // === COMBATE MÁGICO ===
  
  // Cajados de Fogo
  fire_staff: {
    id: 'fire_staff',
    name: 'Cajado de Fogo',
    type: 'fire_staff',
    tier: 4,
    damage: 40,
    speed: 1.0,
    range: 12,
    durability: 90,
    maxDurability: 90,
    requirements: { intelligence: 25, level: 15 },
    specialAbilities: [{
      id: 'fireball',
      name: 'Bola de Fogo',
      description: 'Lança uma bola de fogo explosiva',
      type: 'active',
      cooldown: 8,
      manaCost: 30,
      damage: 60,
      range: 15,
      areaOfEffect: 3
    }]
  },

  // Cajados de Gelo
  ice_staff: {
    id: 'ice_staff',
    name: 'Cajado de Gelo',
    type: 'ice_staff',
    tier: 4,
    damage: 35,
    speed: 1.1,
    range: 14,
    durability: 90,
    maxDurability: 90,
    requirements: { intelligence: 22, level: 13 },
    specialAbilities: [{
      id: 'frost_wave',
      name: 'Onda Glacial',
      description: 'Cria uma onda que congela inimigos',
      type: 'active',
      cooldown: 10,
      manaCost: 35,
      damage: 45,
      range: 10,
      areaOfEffect: 6
    }]
  },

  // Cajados de Raio
  lightning_staff: {
    id: 'lightning_staff',
    name: 'Cajado de Raio',
    type: 'lightning_staff',
    tier: 4,
    damage: 50,
    speed: 1.3,
    range: 16,
    durability: 85,
    maxDurability: 85,
    requirements: { intelligence: 28, level: 18 },
    specialAbilities: [{
      id: 'chain_lightning',
      name: 'Raio em Corrente',
      description: 'Salta entre múltiplos inimigos',
      type: 'active',
      cooldown: 12,
      manaCost: 40,
      damage: 55
    }]
  },

  // Cajados Sagrados
  holy_staff: {
    id: 'holy_staff',
    name: 'Cajado Sagrado',
    type: 'holy_staff',
    tier: 4,
    damage: 30,
    speed: 1.2,
    range: 12,
    durability: 100,
    maxDurability: 100,
    requirements: { intelligence: 20, level: 12 },
    specialAbilities: [{
      id: 'divine_healing',
      name: 'Cura Divina',
      description: 'Cura aliados em área',
      type: 'active',
      cooldown: 8,
      manaCost: 25,
      range: 10,
      areaOfEffect: 4
    }]
  },

  // === COMBATE HÍBRIDO ===
  
  // Espadas Encantadas
  enchanted_sword: {
    id: 'enchanted_sword',
    name: 'Espada Encantada',
    type: 'enchanted_sword',
    tier: 5,
    damage: 55,
    speed: 1.3,
    range: 2.2,
    durability: 130,
    maxDurability: 130,
    requirements: { strength: 20, intelligence: 15, level: 22 },
    enchantments: [{
      id: 'flame_enchant',
      name: 'Encantamento Flamejante',
      type: 'damage',
      effect: { attribute: 'fireDamage', value: 15 }
    }],
    specialAbilities: [{
      id: 'elemental_slash',
      name: 'Corte Elemental',
      description: 'Combina dano físico e mágico',
      type: 'active',
      cooldown: 10,
      staminaCost: 25,
      manaCost: 15,
      damage: 70
    }]
  },

  // Cajado de Batalha
  battle_mage_staff: {
    id: 'battle_mage_staff',
    name: 'Cajado de Mago de Batalha',
    type: 'battle_mage_staff',
    tier: 5,
    damage: 45,
    speed: 1.1,
    range: 8,
    durability: 110,
    maxDurability: 110,
    requirements: { strength: 15, intelligence: 25, level: 25 },
    specialAbilities: [{
      id: 'mana_strike',
      name: 'Golpe de Mana',
      description: 'Ataque corpo a corpo que consome mana',
      type: 'active',
      cooldown: 6,
      manaCost: 20,
      damage: 65
    }]
  }
};

export const getWeaponsByType = (type: WeaponType): Weapon[] => {
  return Object.values(WEAPONS_DATABASE).filter(weapon => weapon.type === type);
};

export const getWeaponsBySpecialization = (specialization: string): Weapon[] => {
  switch (specialization) {
    case 'warrior':
    case 'plate_fighter':
      return getWeaponsByType('sword')
        .concat(getWeaponsByType('axe'))
        .concat(getWeaponsByType('mace'));
        
    case 'hunter':
    case 'archer':
      return getWeaponsByType('bow')
        .concat(getWeaponsByType('crossbow'));
        
    case 'fire_mage':
      return getWeaponsByType('fire_staff');
      
    case 'ice_mage':
      return getWeaponsByType('ice_staff');
      
    case 'lightning_mage':
      return getWeaponsByType('lightning_staff');
      
    case 'holy_mage':
      return getWeaponsByType('holy_staff');
      
    case 'battle_mage':
    case 'spellsword':
      return getWeaponsByType('enchanted_sword')
        .concat(getWeaponsByType('battle_mage_staff'));
        
    default:
      return [];
  }
};
