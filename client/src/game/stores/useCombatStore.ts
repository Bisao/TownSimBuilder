
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  CombatEntity, 
  CombatAction, 
  DamageResult, 
  CombatResult,
  Weapon,
  Armor,
  Spell,
  StatusEffect,
  CombatStats
} from "../types/combat";

interface CombatState {
  // Estado do combate
  isInCombat: boolean;
  activeCombats: Map<string, CombatInstance>;
  combatEntities: Map<string, CombatEntity>;
  
  // Ações
  initializeCombat: (attacker: string, defender: string) => string;
  endCombat: (combatId: string, result: CombatResult) => void;
  executeCombatAction: (combatId: string, entityId: string, action: CombatAction) => void;
  
  // Gerenciamento de entidades
  addCombatEntity: (entity: CombatEntity) => void;
  updateEntityStats: (entityId: string, stats: Partial<CombatStats>) => void;
  applyDamage: (entityId: string, damage: DamageResult) => void;
  applyStatusEffect: (entityId: string, effect: StatusEffect) => void;
  
  // Sistema de equipamentos
  equipWeapon: (entityId: string, weapon: Weapon) => void;
  equipArmor: (entityId: string, armor: Armor) => void;
  
  // Sistema de magias
  castSpell: (casterId: string, spellId: string, targetId?: string, targetPosition?: {x: number, y: number, z: number}) => void;
  
  // Cálculos de combate
  calculateDamage: (attacker: CombatEntity, defender: CombatEntity, action: CombatAction) => DamageResult;
  calculateDefense: (entity: CombatEntity) => { physical: number; magical: number };
  
  // Utilitários
  getEntityById: (entityId: string) => CombatEntity | undefined;
  isEntityInCombat: (entityId: string) => boolean;
  getActiveCombatForEntity: (entityId: string) => CombatInstance | undefined;
}

interface CombatInstance {
  id: string;
  participants: string[];
  startTime: number;
  currentTurn: string;
  turnOrder: string[];
  actions: CombatAction[];
  status: 'active' | 'paused' | 'ended';
}

// Definir magias básicas por escola
const SPELLS_DATABASE: Record<string, Spell> = {
  // Magias de Fogo
  fireball: {
    id: 'fireball',
    name: 'Bola de Fogo',
    description: 'Lança uma bola de fogo que causa dano em área',
    school: 'fire',
    tier: 1,
    manaCost: 20,
    castTime: 2,
    cooldown: 5,
    range: 15,
    areaOfEffect: 3,
    damage: 50,
    requirements: { intelligence: 10, level: 5 }
  },
  
  flame_strike: {
    id: 'flame_strike',
    name: 'Golpe Flamejante',
    description: 'Encanta a arma com fogo por um período',
    school: 'fire',
    tier: 2,
    manaCost: 30,
    castTime: 1,
    cooldown: 10,
    range: 0,
    effects: [{
      id: 'flame_weapon',
      name: 'Arma Flamejante',
      type: 'buff',
      duration: 30,
      effect: { attribute: 'fireDamage', value: 25 },
      stackable: false,
      stacks: 1
    }],
    requirements: { intelligence: 15, level: 10 }
  },

  // Magias de Gelo
  ice_shard: {
    id: 'ice_shard',
    name: 'Estilhaço de Gelo',
    description: 'Dispara um projétil de gelo que pode congelar o alvo',
    school: 'ice',
    tier: 1,
    manaCost: 15,
    castTime: 1.5,
    cooldown: 3,
    range: 20,
    damage: 35,
    effects: [{
      id: 'frost_slow',
      name: 'Lentidão Glacial',
      type: 'debuff',
      duration: 5,
      effect: { attribute: 'speed', value: -0.5 },
      stackable: false,
      stacks: 1
    }],
    requirements: { intelligence: 8, level: 3 }
  },

  // Magias de Raio
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Raio',
    description: 'Dispara um raio instantâneo com alta precisão',
    school: 'lightning',
    tier: 1,
    manaCost: 25,
    castTime: 0.5,
    cooldown: 4,
    range: 25,
    damage: 45,
    requirements: { intelligence: 12, level: 6 }
  },

  // Magias Sagradas
  heal: {
    id: 'heal',
    name: 'Cura',
    description: 'Restaura pontos de vida do alvo',
    school: 'holy',
    tier: 1,
    manaCost: 20,
    castTime: 2,
    cooldown: 2,
    range: 10,
    healing: 60,
    requirements: { intelligence: 10, level: 4 }
  }
};

export const useCombatStore = create<CombatState>()(
  subscribeWithSelector((set, get) => ({
    isInCombat: false,
    activeCombats: new Map(),
    combatEntities: new Map(),

    initializeCombat: (attackerId: string, defenderId: string) => {
      const combatId = `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newCombat: CombatInstance = {
        id: combatId,
        participants: [attackerId, defenderId],
        startTime: Date.now(),
        currentTurn: attackerId,
        turnOrder: [attackerId, defenderId],
        actions: [],
        status: 'active'
      };

      set((state) => ({
        isInCombat: true,
        activeCombats: new Map(state.activeCombats).set(combatId, newCombat)
      }));

      console.log(`Combate iniciado: ${combatId} entre ${attackerId} e ${defenderId}`);
      return combatId;
    },

    endCombat: (combatId: string, result: CombatResult) => {
      set((state) => {
        const newCombats = new Map(state.activeCombats);
        newCombats.delete(combatId);
        
        return {
          activeCombats: newCombats,
          isInCombat: newCombats.size > 0
        };
      });

      console.log(`Combate ${combatId} finalizado:`, result);
    },

    executeCombatAction: (combatId: string, entityId: string, action: CombatAction) => {
      const combat = get().activeCombats.get(combatId);
      if (!combat || combat.currentTurn !== entityId) return;

      const entity = get().combatEntities.get(entityId);
      if (!entity) return;

      // Processar ação baseada no tipo
      switch (action.type) {
        case 'attack':
          if (action.targetId && action.weaponId) {
            const target = get().combatEntities.get(action.targetId);
            if (target) {
              const damage = get().calculateDamage(entity, target, action);
              get().applyDamage(action.targetId, damage);
              console.log(`${entity.name} atacou ${target.name} causando ${damage.totalDamage} de dano`);
            }
          }
          break;
          
        case 'spell':
          if (action.spellId) {
            get().castSpell(entityId, action.spellId, action.targetId, action.targetPosition);
          }
          break;
      }

      // Avançar turno
      const currentIndex = combat.turnOrder.indexOf(entityId);
      const nextIndex = (currentIndex + 1) % combat.turnOrder.length;
      const nextTurn = combat.turnOrder[nextIndex];

      set((state) => {
        const newCombats = new Map(state.activeCombats);
        const updatedCombat = { ...combat, currentTurn: nextTurn };
        newCombats.set(combatId, updatedCombat);
        return { activeCombats: newCombats };
      });
    },

    addCombatEntity: (entity: CombatEntity) => {
      set((state) => ({
        combatEntities: new Map(state.combatEntities).set(entity.id, entity)
      }));
    },

    updateEntityStats: (entityId: string, stats: Partial<CombatStats>) => {
      set((state) => {
        const entity = state.combatEntities.get(entityId);
        if (!entity) return state;

        const updatedEntity = {
          ...entity,
          stats: { ...entity.stats, ...stats }
        };

        return {
          combatEntities: new Map(state.combatEntities).set(entityId, updatedEntity)
        };
      });
    },

    applyDamage: (entityId: string, damage: DamageResult) => {
      const entity = get().combatEntities.get(entityId);
      if (!entity) return;

      const newHealth = Math.max(0, entity.stats.health - damage.totalDamage);
      
      get().updateEntityStats(entityId, { health: newHealth });

      if (newHealth <= 0) {
        // Entidade morreu
        const updatedEntity = { ...entity, combatState: 'dead' as const };
        set((state) => ({
          combatEntities: new Map(state.combatEntities).set(entityId, updatedEntity)
        }));
        
        console.log(`${entity.name} foi derrotado!`);
      }
    },

    applyStatusEffect: (entityId: string, effect: StatusEffect) => {
      const entity = get().combatEntities.get(entityId);
      if (!entity) return;

      const existingEffect = entity.activeEffects.find(e => e.id === effect.id);
      let newEffects = [...entity.activeEffects];

      if (existingEffect && effect.stackable) {
        existingEffect.stacks += effect.stacks;
        existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
      } else if (existingEffect) {
        existingEffect.duration = effect.duration;
      } else {
        newEffects.push(effect);
      }

      const updatedEntity = { ...entity, activeEffects: newEffects };
      set((state) => ({
        combatEntities: new Map(state.combatEntities).set(entityId, updatedEntity)
      }));
    },

    equipWeapon: (entityId: string, weapon: Weapon) => {
      const entity = get().combatEntities.get(entityId);
      if (!entity) return;

      const updatedEntity = {
        ...entity,
        equipment: { ...entity.equipment, weapon }
      };

      set((state) => ({
        combatEntities: new Map(state.combatEntities).set(entityId, updatedEntity)
      }));
    },

    equipArmor: (entityId: string, armor: Armor) => {
      const entity = get().combatEntities.get(entityId);
      if (!entity) return;

      const updatedEntity = {
        ...entity,
        equipment: {
          ...entity.equipment,
          armor: { ...entity.equipment.armor, [armor.type]: armor }
        }
      };

      set((state) => ({
        combatEntities: new Map(state.combatEntities).set(entityId, updatedEntity)
      }));
    },

    castSpell: (casterId: string, spellId: string, targetId?: string, targetPosition?: {x: number, y: number, z: number}) => {
      const caster = get().combatEntities.get(casterId);
      const spell = SPELLS_DATABASE[spellId];
      
      if (!caster || !spell) return;

      // Verificar mana
      if (caster.stats.mana < spell.manaCost) {
        console.log(`${caster.name} não tem mana suficiente para ${spell.name}`);
        return;
      }

      // Consumir mana
      get().updateEntityStats(casterId, { 
        mana: caster.stats.mana - spell.manaCost 
      });

      // Aplicar efeitos da magia
      if (spell.damage && targetId) {
        const damageResult: DamageResult = {
          totalDamage: spell.damage,
          physicalDamage: 0,
          magicalDamage: spell.damage,
          critical: Math.random() < caster.stats.criticalChance,
          blocked: false,
          evaded: false,
          damageType: spell.school
        };
        
        if (damageResult.critical) {
          damageResult.totalDamage *= caster.stats.criticalDamage;
          damageResult.magicalDamage *= caster.stats.criticalDamage;
        }

        get().applyDamage(targetId, damageResult);
      }

      if (spell.healing && targetId) {
        const target = get().combatEntities.get(targetId);
        if (target) {
          const newHealth = Math.min(target.stats.maxHealth, target.stats.health + spell.healing);
          get().updateEntityStats(targetId, { health: newHealth });
        }
      }

      if (spell.effects) {
        spell.effects.forEach(effect => {
          if (targetId) {
            get().applyStatusEffect(targetId, effect);
          }
        });
      }

      console.log(`${caster.name} lançou ${spell.name}`);
    },

    calculateDamage: (attacker: CombatEntity, defender: CombatEntity, action: CombatAction) => {
      const weapon = attacker.equipment.weapon;
      if (!weapon) {
        return {
          totalDamage: 0,
          physicalDamage: 0,
          magicalDamage: 0,
          critical: false,
          blocked: false,
          evaded: false,
          damageType: 'physical'
        };
      }

      let baseDamage = weapon.damage + attacker.stats.physicalDamage;
      
      // Verificar crítico
      const critical = Math.random() < attacker.stats.criticalChance;
      if (critical) {
        baseDamage *= attacker.stats.criticalDamage;
      }

      // Verificar evasão
      const evaded = Math.random() < defender.stats.evasion;
      if (evaded) {
        return {
          totalDamage: 0,
          physicalDamage: 0,
          magicalDamage: 0,
          critical: false,
          blocked: false,
          evaded: true,
          damageType: 'physical'
        };
      }

      // Aplicar defesa
      const defense = get().calculateDefense(defender);
      const finalDamage = Math.max(1, baseDamage - defense.physical);

      return {
        totalDamage: finalDamage,
        physicalDamage: finalDamage,
        magicalDamage: 0,
        critical,
        blocked: false,
        evaded: false,
        damageType: 'physical'
      };
    },

    calculateDefense: (entity: CombatEntity) => {
      let physicalDefense = entity.stats.physicalDefense;
      let magicalDefense = entity.stats.magicalDefense;

      // Adicionar defesa das armaduras
      Object.values(entity.equipment.armor).forEach(armor => {
        if (armor) {
          physicalDefense += armor.physicalDefense;
          magicalDefense += armor.magicalDefense;
        }
      });

      return { physical: physicalDefense, magical: magicalDefense };
    },

    getEntityById: (entityId: string) => {
      return get().combatEntities.get(entityId);
    },

    isEntityInCombat: (entityId: string) => {
      const activeCombats = get().activeCombats;
      for (const combat of activeCombats.values()) {
        if (combat.participants.includes(entityId)) {
          return true;
        }
      }
      return false;
    },

    getActiveCombatForEntity: (entityId: string) => {
      const activeCombats = get().activeCombats;
      for (const combat of activeCombats.values()) {
        if (combat.participants.includes(entityId)) {
          return combat;
        }
      }
      return undefined;
    }
  }))
);
