import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { npcTypes, NpcType } from '../constants/npcs';
import { useResourceStore } from './useResourceStore';
import { useBuildingStore } from './useBuildingStore';
import { useNotificationStore } from '../../lib/stores/useNotificationStore';
import { GAME_CONFIG } from '../../../../shared/constants/game';

// Types
export interface Npc {
  id: string;
  name: string;
  type: NpcType;
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;

  // Stats
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    constitution: number;
    gathering: number;
    crafting: number;
    combat: number;
  };

  // State
  state: 'idle' | 'moving' | 'working' | 'gathering' | 'resting' | 'combat';
  task: string | null;
  assignedBuilding: string | null;
  inventory: Record<string, number>;
  equipment: {
    weapon?: string;
    armor?: string;
    accessories?: string[];
  };

  // AI Behavior
  behavior: {
    priority: 'gathering' | 'building' | 'combat' | 'exploration';
    workRadius: number;
    restTime: number;
    lastTaskTime: number;
  };

  // Pathfinding
  path: [number, number, number][];
  pathIndex: number;
  isMoving: boolean;
  moveSpeed: number;

  // Timers
  lastMoveTime: number;
  lastWorkTime: number;
  lastRestTime: number;
}

interface NpcState {
  npcs: Record<string, Npc>;
  selectedNpc: string | null;
  totalNpcs: number;
  npcStats: Record<NpcType, number>;
  spawnPoints: [number, number][];
  maxNpcs: number;
}

interface NpcActions {
  // NPC Management
  createNpc: (type: NpcType, position: [number, number, number], name?: string) => string | null;
  removeNpc: (npcId: string) => boolean;
  selectNpc: (npcId: string | null) => void;

  // Movement & Pathfinding
  moveNpc: (npcId: string, targetPosition: [number, number, number]) => boolean;
  updateNpcPosition: (npcId: string, position: [number, number, number]) => void;
  findPath: (from: [number, number, number], to: [number, number, number]) => [number, number, number][];

  // Tasks & Work
  assignTask: (npcId: string, task: string, buildingId?: string) => boolean;
  clearTask: (npcId: string) => void;
  processWork: (npcId: string, deltaTime: number) => void;

  // Inventory & Equipment
  addToInventory: (npcId: string, itemId: string, amount: number) => boolean;
  removeFromInventory: (npcId: string, itemId: string, amount: number) => boolean;
  equipItem: (npcId: string, itemId: string, slot: string) => boolean;
  unequipItem: (npcId: string, slot: string) => boolean;

  // Stats & Leveling
  gainExperience: (npcId: string, amount: number) => boolean;
  levelUp: (npcId: string) => boolean;
  modifyStats: (npcId: string, stats: Partial<Npc['stats']>) => void;

  // Health & Energy
  healNpc: (npcId: string, amount: number) => void;
  damageNpc: (npcId: string, amount: number) => void;
  restoreEnergy: (npcId: string, amount: number) => void;
  consumeEnergy: (npcId: string, amount: number) => boolean;

  // AI & Behavior
  updateNPCs: (deltaTime: number) => void;
  processAI: (npcId: string, deltaTime: number) => void;
  findNearestResource: (position: [number, number, number], resourceType: string) => [number, number, number] | null;
  findNearestBuilding: (position: [number, number, number], buildingType: string) => string | null;

  // Utilities
  getNpcAt: (position: [number, number, number]) => Npc | null;
  getNpcsByType: (type: NpcType) => Npc[];
  getDistance: (pos1: [number, number, number], pos2: [number, number, number]) => number;

  // State Management
  reset: () => void;
  initialize: () => void;
}

type NpcStore = NpcState & NpcActions;

// Initial state
const initialState: NpcState = {
  npcs: {},
  selectedNpc: null,
  totalNpcs: 0,
  npcStats: {
    villager: 0,
    worker: 0,
    miner: 0,
    farmer: 0,
    lumberjack: 0,
    guard: 0,
    merchant: 0,
    crafter: 0,
  },
  spawnPoints: [[25, 0, 25]],
  maxNpcs: 50,
};

// Utility functions
const generateNpcName = (type: NpcType): string => {
  const names = {
    villager: ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia'],
    worker: ['Roberto', 'Fernanda', 'Marcos', 'Paula', 'Ricardo', 'Sandra'],
    miner: ['Bento', 'Carla', 'Diego', 'Elena', 'Fábio', 'Gabriela'],
    farmer: ['Antonio', 'Beatriz', 'César', 'Diana', 'Eduardo', 'Fátima'],
    lumberjack: ['Hugo', 'Irene', 'Jorge', 'Karla', 'Leonardo', 'Monica'],
    guard: ['Nicolas', 'Olivia', 'Paulo', 'Quinta', 'Rafael', 'Sofia'],
    merchant: ['Tomás', 'Ursula', 'Victor', 'Wanda', 'Xavier', 'Yara'],
    crafter: ['Zeca', 'Alice', 'Bruno', 'Clara', 'Daniel', 'Eva'],
  };

  const typeNames = names[type] || names.villager;
  return typeNames[Math.floor(Math.random() * typeNames.length)];
};

// Store implementation
export const useNpcStore = create<NpcStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // NPC Management
    createNpc: (type: NpcType, position: [number, number, number], name?: string) => {
      const { totalNpcs, maxNpcs } = get();

      if (totalNpcs >= maxNpcs) {
        useNotificationStore.getState().addNotification({
          type: 'warning',
          title: 'Limite de NPCs atingido',
          message: `Você não pode criar mais NPCs (limite: ${maxNpcs})`,
        });
        return null;
      }

      const npcDef = npcTypes[type];
      if (!npcDef) {
        console.error(`NPC type ${type} not found`);
        return null;
      }

      const npcId = `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const npcName = name || generateNpcName(type);

      const newNpc: Npc = {
        id: npcId,
        name: npcName,
        type,
        position,
        targetPosition: null,
        health: npcDef.health,
        maxHealth: npcDef.health,
        energy: npcDef.energy,
        maxEnergy: npcDef.energy,
        level: 1,
        experience: 0,

        stats: { ...npcDef.stats },

        state: 'idle',
        task: null,
        assignedBuilding: null,
        inventory: {},
        equipment: {},

        behavior: {
          priority: npcDef.defaultPriority || 'gathering',
          workRadius: npcDef.workRadius || 5,
          restTime: 0,
          lastTaskTime: Date.now(),
        },

        path: [],
        pathIndex: 0,
        isMoving: false,
        moveSpeed: npcDef.moveSpeed || GAME_CONFIG.NPC_MOVE_SPEED,

        lastMoveTime: Date.now(),
        lastWorkTime: Date.now(),
        lastRestTime: Date.now(),
      };

      set((state) => ({
        npcs: { ...state.npcs, [npcId]: newNpc },
        totalNpcs: state.totalNpcs + 1,
        npcStats: {
          ...state.npcStats,
          [type]: state.npcStats[type] + 1,
        },
      }));

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'NPC criado',
        message: `${npcName} (${npcDef.name}) foi criado com sucesso`,
      });

      console.log(`NPC ${npcName} criado com ID ${npcId} em ${position}`);
      return npcId;
    },

    removeNpc: (npcId: string) => {
      const { npcs } = get();
      const npc = npcs[npcId];

      if (!npc) {
        console.warn(`NPC ${npcId} not found`);
        return false;
      }

      // Remove from building assignment
      if (npc.assignedBuilding) {
        const buildingStore = useBuildingStore.getState();
        buildingStore.removeWorker(npc.assignedBuilding, npcId);
      }

      set((state) => {
        const { [npcId]: removed, ...remainingNpcs } = state.npcs;
        return {
          npcs: remainingNpcs,
          totalNpcs: state.totalNpcs - 1,
          npcStats: {
            ...state.npcStats,
            [npc.type]: Math.max(0, state.npcStats[npc.type] - 1),
          },
          selectedNpc: state.selectedNpc === npcId ? null : state.selectedNpc,
        };
      });

      console.log(`NPC ${npc.name} (${npcId}) removido`);
      return true;
    },

    selectNpc: (npcId: string | null) => {
      set({ selectedNpc: npcId });
    },

    // Movement & Pathfinding
    moveNpc: (npcId: string, targetPosition: [number, number, number]) => {
      const { npcs, findPath } = get();
      const npc = npcs[npcId];

      if (!npc) return false;

      const path = findPath(npc.position, targetPosition);

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            targetPosition,
            path,
            pathIndex: 0,
            isMoving: true,
            state: 'moving',
          },
        },
      }));

      return true;
    },

    updateNpcPosition: (npcId: string, position: [number, number, number]) => {
      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...state.npcs[npcId],
            position,
          },
        },
      }));
    },

    findPath: (from: [number, number, number], to: [number, number, number]) => {
      // Simple pathfinding - direct line for now
      // TODO: Implement A* pathfinding with obstacle avoidance
      return [from, to];
    },

    // Tasks & Work
    assignTask: (npcId: string, task: string, buildingId?: string) => {
      const { npcs } = get();
      const npc = npcs[npcId];

      if (!npc) return false;

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            task,
            assignedBuilding: buildingId || null,
            state: 'working',
            behavior: {
              ...npc.behavior,
              lastTaskTime: Date.now(),
            },
          },
        },
      }));

      // Assign to building if specified
      if (buildingId) {
        const buildingStore = useBuildingStore.getState();
        buildingStore.assignWorker(buildingId, npcId);
      }

      return true;
    },

    clearTask: (npcId: string) => {
      const { npcs } = get();
      const npc = npcs[npcId];

      if (!npc) return;

      // Remove from building assignment
      if (npc.assignedBuilding) {
        const buildingStore = useBuildingStore.getState();
        buildingStore.removeWorker(npc.assignedBuilding, npcId);
      }

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            task: null,
            assignedBuilding: null,
            state: 'idle',
          },
        },
      }));
    },

    processWork: (npcId: string, deltaTime: number) => {
      const { npcs, consumeEnergy, gainExperience } = get();
      const npc = npcs[npcId];

      if (!npc || npc.state !== 'working' || !npc.task) return;

      const workInterval = 2000; // 2 seconds per work cycle
      const currentTime = Date.now();

      if (currentTime - npc.lastWorkTime >= workInterval) {
        // Consume energy
        if (!consumeEnergy(npcId, 5)) {
          // Not enough energy, rest
          set((state) => ({
            npcs: {
              ...state.npcs,
              [npcId]: {
                ...npc,
                state: 'resting',
              },
            },
          }));
          return;
        }

        // Process task based on type
        const resourceStore = useResourceStore.getState();
        const npcDef = npcTypes[npc.type];

        if (npcDef.gatheringYield) {
          Object.entries(npcDef.gatheringYield).forEach(([resource, amount]) => {
            const actualAmount = amount * (1 + npc.stats.gathering * 0.1);
            resourceStore.addResource(resource, actualAmount);
          });
        }

        // Gain experience
        gainExperience(npcId, 1);

        set((state) => ({
          npcs: {
            ...state.npcs,
            [npcId]: {
              ...npc,
              lastWorkTime: currentTime,
            },
          },
        }));
      }
    },

    // Stats & Leveling
    gainExperience: (npcId: string, amount: number) => {
      const { npcs, levelUp } = get();
      const npc = npcs[npcId];

      if (!npc) return false;

      const newExperience = npc.experience + amount;
      const experienceForNextLevel = npc.level * 100;

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            experience: newExperience,
          },
        },
      }));

      // Check for level up
      if (newExperience >= experienceForNextLevel) {
        levelUp(npcId);
      }

      return true;
    },

    levelUp: (npcId: string) => {
      const { npcs } = get();
      const npc = npcs[npcId];

      if (!npc) return false;

      const newLevel = npc.level + 1;
      const statIncrease = 2;

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            level: newLevel,
            experience: 0,
            maxHealth: npc.maxHealth + 10,
            health: npc.maxHealth + 10,
            maxEnergy: npc.maxEnergy + 5,
            energy: npc.maxEnergy + 5,
            stats: {
              strength: npc.stats.strength + statIncrease,
              dexterity: npc.stats.dexterity + statIncrease,
              intelligence: npc.stats.intelligence + statIncrease,
              constitution: npc.stats.constitution + statIncrease,
              gathering: npc.stats.gathering + statIncrease,
              crafting: npc.stats.crafting + statIncrease,
              combat: npc.stats.combat + statIncrease,
            },
          },
        },
      }));

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'NPC evoluiu!',
        message: `${npc.name} subiu para o nível ${newLevel}!`,
      });

      return true;
    },

    // Health & Energy
    healNpc: (npcId: string, amount: number) => {
      const { npcs } = get();
      const npc = npcs[npcId];

      if (!npc) return;

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            health: Math.min(npc.maxHealth, npc.health + amount),
          },
        },
      }));
    },

    damageNpc: (npcId: string, amount: number) => {
      const { npcs } = get();
      const npc = npcs[npcId];

      if (!npc) return;

      const newHealth = Math.max(0, npc.health - amount);

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            health: newHealth,
            state: newHealth <= 0 ? 'idle' : npc.state,
          },
        },
      }));

      if (newHealth <= 0) {
        useNotificationStore.getState().addNotification({
          type: 'error',
          title: 'NPC derrotado',
          message: `${npc.name} foi derrotado!`,
        });
      }
    },

    restoreEnergy: (npcId: string, amount: number) => {
      const { npcs } = get();
      const npc = npcs[npcId];

      if (!npc) return;

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            energy: Math.min(npc.maxEnergy, npc.energy + amount),
          },
        },
      }));
    },

    consumeEnergy: (npcId: string, amount: number) => {
      const { npcs } = get();
      const npc = npcs[npcId];

      if (!npc || npc.energy < amount) return false;

      set((state) => ({
        npcs: {
          ...state.npcs,
          [npcId]: {
            ...npc,
            energy: npc.energy - amount,
          },
        },
      }));

      return true;
    },

    // AI & Behavior
    updateNPCs: (deltaTime: number) => {
      const { npcs, processAI } = get();

      Object.keys(npcs).forEach((npcId) => {
        processAI(npcId, deltaTime);
      });
    },

    processAI: (npcId: string, deltaTime: number) => {
      const { npcs, processWork, restoreEnergy } = get();
      const npc = npcs[npcId];

      if (!npc) return;

      const currentTime = Date.now();

      // Handle different states
      switch (npc.state) {
        case 'working':
          processWork(npcId, deltaTime);
          break;

        case 'resting':
          // Restore energy while resting
          if (currentTime - npc.lastRestTime >= 1000) {
            restoreEnergy(npcId, 10);

            set((state) => ({
              npcs: {
                ...state.npcs,
                [npcId]: {
                  ...npc,
                  lastRestTime: currentTime,
                },
              },
            }));

            // Return to work if energy is full
            if (npc.energy >= npc.maxEnergy * 0.8) {
              set((state) => ({
                npcs: {
                  ...state.npcs,
                  [npcId]: {
                    ...npc,
                    state: npc.task ? 'working' : 'idle',
                  },
                },
              }));
            }
          }
          break;

        case 'moving':
          // Handle movement along path
          if (npc.path.length > 0 && npc.pathIndex < npc.path.length) {
            const targetPos = npc.path[npc.pathIndex];
            const distance = get().getDistance(npc.position, targetPos);

            if (distance < 0.5) {
              // Reached waypoint
              if (npc.pathIndex >= npc.path.length - 1) {
                // Reached final destination
                set((state) => ({
                  npcs: {
                    ...state.npcs,
                    [npcId]: {
                      ...npc,
                      position: targetPos,
                      isMoving: false,
                      state: npc.task ? 'working' : 'idle',
                      pathIndex: 0,
                      path: [],
                    },
                  },
                }));
              } else {
                // Move to next waypoint
                set((state) => ({
                  npcs: {
                    ...state.npcs,
                    [npcId]: {
                      ...npc,
                      pathIndex: npc.pathIndex + 1,
                    },
                  },
                }));
              }
            } else {
              // Move towards waypoint
              const moveDistance = npc.moveSpeed * deltaTime;
              const direction = [
                (targetPos[0] - npc.position[0]) / distance,
                (targetPos[1] - npc.position[1]) / distance,
                (targetPos[2] - npc.position[2]) / distance,
              ] as [number, number, number];

              const newPosition = [
                npc.position[0] + direction[0] * moveDistance,
                npc.position[1] + direction[1] * moveDistance,
                npc.position[2] + direction[2] * moveDistance,
              ] as [number, number, number];

              set((state) => ({
                npcs: {
                  ...state.npcs,
                  [npcId]: {
                    ...npc,
                    position: newPosition,
                  },
                },
              }));
            }
          }
          break;

        case 'idle':
          // Auto-assign tasks based on behavior priority
          if (!npc.task && currentTime - npc.behavior.lastTaskTime >= 5000) {
            // TODO: Implement intelligent task assignment
          }
          break;
      }
    },

    // Utilities
    getNpcAt: (position: [number, number, number]) => {
      const { npcs, getDistance } = get();
      return Object.values(npcs).find(
        (npc) => getDistance(npc.position, position) < 1.0
      ) || null;
    },

    getNpcsByType: (type: NpcType) => {
      const { npcs } = get();
      return Object.values(npcs).filter((npc) => npc.type === type);
    },

    getDistance: (pos1: [number, number, number], pos2: [number, number, number]) => {
      const dx = pos1[0] - pos2[0];
      const dy = pos1[1] - pos2[1];
      const dz = pos1[2] - pos2[2];
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    findNearestResource: (position: [number, number, number], resourceType: string) => {
      // TODO: Implement resource finding logic
      return null;
    },

    findNearestBuilding: (position: [number, number, number], buildingType: string) => {
      const buildingStore = useBuildingStore.getState();
      const buildings = buildingStore.getBuildingsByType(buildingType as any);

      let nearest = null;
      let minDistance = Infinity;

      buildings.forEach((building) => {
        const buildingPos: [number, number, number] = [building.position[0], 0, building.position[1]];
        const distance = get().getDistance(position, buildingPos);

        if (distance < minDistance) {
          minDistance = distance;
          nearest = building.id;
        }
      });

      return nearest;
    },

    // State Management
    reset: () => {
      set(initialState);
    },

    initialize: () => {
      console.log('NPC store initialized');
    },
  }))
);

// Selectors
export const useNpcSelectors = {
  getNpc: (id: string) => useNpcStore((state) => state.npcs[id]),
  getSelectedNpc: () => useNpcStore((state) => 
    state.selectedNpc ? state.npcs[state.selectedNpc] : null
  ),
  getNpcStats: () => useNpcStore((state) => state.npcStats),
  getTotalNpcs: () => useNpcStore((state) => state.totalNpcs),
  getWorkingNpcs: () => useNpcStore((state) => 
    Object.values(state.npcs).filter(npc => npc.state === 'working')
  ),
  getIdleNpcs: () => useNpcStore((state) => 
    Object.values(state.npcs).filter(npc => npc.state === 'idle')
  ),
};