import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { npcTypes } from "../constants/npcs";
import { useBuildingStore } from "./useBuildingStore";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

// ===== INTERFACES E TIPOS =====

export interface NPCNeeds {
  energy: number;
  satisfaction: number;
  health: number;
  hunger: number;
}

export interface NPCSkills {
  gathering: number;
  working: number;
  efficiency: number;
  experience: number;
}

export interface NPCMemory {
  lastVisitedPositions: Array<[number, number]>;
  knownResources: Array<{ type: string; position: [number, number] }>;
  failedAttempts: number;
  lastTaskCompletion: number;
  efficiency: number;
}

export type NPCSchedule = "home" | "working" | "lunch" | "traveling";
export type NPCState = "idle" | "moving" | "working" | "gathering" | "resting" | "searching" | "planting" | "harvesting";

export interface NPC {
  id: string;
  type: string;
  originalType?: string;
  homeId: string;
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  targetBuildingId: string | null;
  targetResource: { type: string; position: [number, number] } | null;
  state: NPCState;
  workProgress: number;
  lastResourceTime: number;
  lastMoveTime: number;
  stuckTimer: number;
  isWorkingManually?: boolean;
  isPlayerControlled?: boolean;
  controlMode: "autonomous" | "manual";
  inventory: {
    type: string;
    amount: number;
  };
  needs: NPCNeeds;
  memory: NPCMemory;
  currentSchedule: NPCSchedule;
  name: string;
  skills: NPCSkills;
  farmerData?: {
    currentTask: "waiting" | "getting_seeds" | "planting" | "harvesting" | "delivering";
    targetFarmId: string | null;
    targetSiloId: string | null;
    selectedSeed: string | null;
  };
}

export interface ResourceReservation {
  resourcePosition: [number, number];
  resourceType: string;
  npcId: string;
  timestamp: number;
}

interface NPCStoreState {
  npcs: NPC[];
  npcIdCounter: number;
  resourceReservations: ResourceReservation[];

  // Actions
  spawnNPC: (type: string, homeId: string, position: [number, number, number]) => string;
  removeNPC: (id: string) => void;
  updateNPCs: (deltaTime: number) => void;
  findWorkplace: (npcId: string) => string | null;
  reserveResource: (npcId: string, resourceType: string, position: [number, number]) => boolean;
  releaseResource: (npcId: string) => void;
  isResourceReserved: (resourceType: string, position: [number, number]) => boolean;
  toggleNpcControlMode: (npcId: string) => void;
  setNpcControlMode: (npcId: string, mode: "autonomous" | "manual") => void;
  startNpcWork: (npcId: string) => void;
  updateNpc: (npcId: string, updates: Partial<NPC>) => void;
  restoreVillagerType: (npcId: string) => void;
}

// ===== CONSTANTES =====

const CONSTANTS = {
  ENERGY_CONSUMPTION: {
    MOVING: 0.02,
    WORKING: 0.025,
    GATHERING: 0.023,
  },
  SATISFACTION_CONSUMPTION: {
    MOVING: 0.01,
    WORKING: 0.015,
    GATHERING: 0.013,
  },
  REGENERATION: {
    ENERGY: 25,
    SATISFACTION: 20,
  },
  WORK_SPEED: 0.2,
  GATHERING_SPEED: 0.18,
  MAX_INVENTORY: 5,
  MOVEMENT_TOLERANCE: 0.2,
  RESOURCE_PROXIMITY: 1.5,
  RESERVATION_TIMEOUT: 300000, // 5 minutos
  STUCK_THRESHOLD: 3.0,
} as const;

const WORKPLACE_MAPPING: Record<string, string> = {
  farm: "farmer",
  bakery: "baker",
  mine: "miner",
  lumberyard: "lumberjack"
};

// ===== UTILITÁRIOS =====

class NPCUtils {
  static getDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    return Math.hypot(pos1[0] - pos2[0], pos1[2] - pos2[2]);
  }

  static getScheduleForTime(timeCycle: number): NPCSchedule {
    const hours = timeCycle * 24;

    if (hours >= 6 && hours < 12) return "working";
    if (hours >= 12 && hours < 13) return "lunch";
    if (hours >= 13 && hours < 18) return "working";
    return "home";
  }

  static shouldReturnHome(npc: NPC, currentSchedule: NPCSchedule): boolean {
    return currentSchedule === "lunch" || 
           currentSchedule === "home" ||
           npc.needs.energy <= 30 || 
           npc.needs.satisfaction <= 30;
  }

  static findNearestResource(npc: NPC, resourceType: string, reservations: ResourceReservation[]): any | null {
    if (!window.naturalResources) return null;

    const currentTime = Date.now();
    const availableResources = window.naturalResources.filter(r => {
      const isCorrectType = r.type === resourceType;
      const isNotCollected = !r.lastCollected || (currentTime - r.lastCollected) > 300000;
      const isNotReserved = !this.isResourceReservedByPosition(resourceType, r.position, reservations);
      return isCorrectType && isNotCollected && isNotReserved;
    });

    if (availableResources.length === 0) return null;

    return availableResources.reduce((nearest, resource) => {
      const dist = Math.hypot(
        resource.position[0] - npc.position[0],
        resource.position[1] - npc.position[2]
      );
      const nearestDist = Math.hypot(
        nearest.position[0] - npc.position[0],
        nearest.position[1] - npc.position[2]
      );
      return dist < nearestDist ? resource : nearest;
    });
  }

  static findBestSilo(npc: NPC, buildings: any[]): any | null {
    const silos = buildings.filter(b => b.type === 'silo');
    if (silos.length === 0) return null;

    return silos.reduce((best, silo) => {
      const distance = Math.hypot(
        silo.position[0] - npc.position[0],
        silo.position[1] - npc.position[2]
      );
      const bestDistance = Math.hypot(
        best.position[0] - npc.position[0],
        best.position[1] - npc.position[2]
      );
      return distance < bestDistance ? silo : best;
    });
  }

  static isResourceReservedByPosition(resourceType: string, position: [number, number], reservations: ResourceReservation[]): boolean {
    const now = Date.now();
    return reservations.some(r => 
      r.resourceType === resourceType &&
      r.resourcePosition[0] === position[0] &&
      r.resourcePosition[1] === position[1] &&
      now - r.timestamp < CONSTANTS.RESERVATION_TIMEOUT
    );
  }

  static clampPosition(x: number, z: number): [number, number] {
    return [
      Math.max(0, Math.min(x, 39)),
      Math.max(0, Math.min(z, 39))
    ];
  }
}

// ===== HANDLERS DE ESTADO =====

class NPCStateManager {
  static handleIdle(npc: NPC, context: StateContext): Partial<NPC> {
    const { currentSchedule, buildings } = context;

    // Verificar se deve ir para casa
    if (NPCUtils.shouldReturnHome(npc, currentSchedule)) {
      return this.goHome(npc, buildings);
    }

    // Se não for horário de trabalho, descansar
    if (currentSchedule !== "working") {
      return { state: "resting" };
    }

    // Se NPC foi ativado manualmente, permitir trabalho
    if (npc.isWorkingManually) {
      if (npc.inventory.amount >= CONSTANTS.MAX_INVENTORY) {
        return this.goToSilo(npc, buildings);
      }
      return this.startWork(npc, context);
    }

    // Verificar inventário cheio
    if (npc.inventory.amount >= CONSTANTS.MAX_INVENTORY) {
      return this.goToSilo(npc, buildings);
    }

    // Comportamento específico do fazendeiro
    if (npc.type === "farmer" && npc.farmerData?.currentTask !== "waiting") {
      return this.handleFarmerCycle(npc, buildings);
    }

    return {};
  }

  static handleMoving(npc: NPC, context: StateContext): Partial<NPC> {
    const { adjustedDeltaTime, buildings } = context;

    if (!npc.targetPosition) {
      return { state: "idle" };
    }

    const [targetX, , targetZ] = npc.targetPosition;
    const [currentX, , currentZ] = npc.position;

    const npcConfig = npcTypes[npc.type];
    const baseSpeed = npcConfig ? npcConfig.speed : 0.15;
    const moveSpeed = baseSpeed * adjustedDeltaTime;

    const dx = targetX - currentX;
    const dz = targetZ - currentZ;
    const distance = Math.sqrt(dx * dx + dz * dz);

    const updates: Partial<NPC> = {
      needs: {
        energy: Math.max(0, npc.needs.energy - adjustedDeltaTime * CONSTANTS.ENERGY_CONSUMPTION.MOVING),
        satisfaction: Math.max(0, npc.needs.satisfaction - adjustedDeltaTime * CONSTANTS.SATISFACTION_CONSUMPTION.MOVING),
        health: npc.needs.health,
        hunger: npc.needs.hunger
      }
    };

    // Verificar se chegou ao destino
    if (distance < CONSTANTS.MOVEMENT_TOLERANCE) {
      updates.position = [targetX, 0, targetZ];
      updates.targetPosition = null;
      updates.stuckTimer = 0;

      if (npc.targetResource) {
        updates.state = "gathering";
        updates.workProgress = 0;
      } else if (npc.inventory.amount > 0 && npc.targetBuildingId) {
        return this.handleSiloDeposit(npc, buildings, updates);
      } else if (npc.targetBuildingId) {
        return this.handleWorkplaceArrival(npc, buildings, updates);
      } else {
        return this.handleHomeArrival(npc, buildings, updates);
      }
    } else {
      // Movimento normal
      const dirX = dx / distance;
      const dirZ = dz / distance;
      const newX = currentX + dirX * moveSpeed;
      const newZ = currentZ + dirZ * moveSpeed;
      const [clampedX, clampedZ] = NPCUtils.clampPosition(newX, newZ);

      updates.position = [clampedX, 0, clampedZ];

      // Verificar se está travado
      const positionChanged = Math.abs(clampedX - currentX) > 0.001 || Math.abs(clampedZ - currentZ) > 0.001;
      if (!positionChanged) {
        updates.stuckTimer = npc.stuckTimer + adjustedDeltaTime;
        if (updates.stuckTimer > CONSTANTS.STUCK_THRESHOLD) {
          updates.position = [targetX, 0, targetZ];
          updates.targetPosition = null;
          updates.state = "idle";
          updates.stuckTimer = 0;
        }
      } else {
        updates.stuckTimer = 0;
      }
    }

    return updates;
  }

  static handleGathering(npc: NPC, context: StateContext): Partial<NPC> {
    const { adjustedDeltaTime } = context;

    if (!npc.targetResource) {
      return { state: "idle" };
    }

    if (npc.inventory.amount >= CONSTANTS.MAX_INVENTORY) {
      return {
        targetResource: null,
        workProgress: 0,
        state: "idle"
      };
    }

    // Verificar se o recurso ainda existe
    const resourceExists = window.naturalResources?.find(r => 
      r.position[0] === npc.targetResource!.position[0] &&
      r.position[1] === npc.targetResource!.position[1] &&
      r.type === npc.targetResource!.type &&
      (!r.lastCollected || (Date.now() - r.lastCollected) > 300000)
    );

    if (!resourceExists) {
      return {
        targetResource: null,
        workProgress: 0,
        state: "searching"
      };
    }

    // Verificar proximidade
    const distanceToResource = Math.hypot(
      npc.targetResource.position[0] - npc.position[0],
      npc.targetResource.position[1] - npc.position[2]
    );

    if (distanceToResource > CONSTANTS.RESOURCE_PROXIMITY) {
      return {
        targetPosition: [npc.targetResource.position[0], 0, npc.targetResource.position[1]],
        state: "moving"
      };
    }

    // Progresso da coleta
    const newWorkProgress = npc.workProgress + adjustedDeltaTime * CONSTANTS.GATHERING_SPEED;

    if (newWorkProgress >= 1) {
      return this.completeResourceGathering(npc);
    }

    return {
      workProgress: newWorkProgress,
      needs: {
        energy: Math.max(0, npc.needs.energy - adjustedDeltaTime * CONSTANTS.ENERGY_CONSUMPTION.GATHERING),
        satisfaction: Math.max(0, npc.needs.satisfaction - adjustedDeltaTime * CONSTANTS.SATISFACTION_CONSUMPTION.GATHERING),
        health: npc.needs.health,
        hunger: npc.needs.hunger
      }
    };
  }

  static handleWorking(npc: NPC, context: StateContext): Partial<NPC> {
    const { adjustedDeltaTime, buildings } = context;

    if (!npc.targetBuildingId) return { state: "idle" };

    const newWorkProgress = npc.workProgress + adjustedDeltaTime * CONSTANTS.WORK_SPEED;

    if (newWorkProgress >= 1) {
      // Chance de voltar para casa após trabalhar
      if (Math.random() < 0.3) {
        const home = buildings.find(b => b.id === npc.homeId);
        if (home) {
          return {
            workProgress: 0,
            targetPosition: [home.position[0] + 0.5, 0, home.position[1] + 0.5],
            targetBuildingId: null,
            state: "moving"
          };
        }
      }
      return { workProgress: 0 };
    }

    return {
      workProgress: newWorkProgress,
      needs: {
        energy: Math.max(0, npc.needs.energy - adjustedDeltaTime * CONSTANTS.ENERGY_CONSUMPTION.WORKING),
        satisfaction: Math.max(0, npc.needs.satisfaction - adjustedDeltaTime * CONSTANTS.SATISFACTION_CONSUMPTION.WORKING),
        health: npc.needs.health,
        hunger: npc.needs.hunger
      }
    };
  }

  static handleResting(npc: NPC, context: StateContext): Partial<NPC> {
    const { adjustedDeltaTime, currentSchedule } = context;

    const homeRegenerationMultiplier = 2.0;
    const newNeeds = {
      energy: Math.min(100, npc.needs.energy + adjustedDeltaTime * CONSTANTS.REGENERATION.ENERGY * homeRegenerationMultiplier),
      satisfaction: Math.min(100, npc.needs.satisfaction + adjustedDeltaTime * CONSTANTS.REGENERATION.SATISFACTION * homeRegenerationMultiplier),
      health: npc.needs.health,
      hunger: npc.needs.hunger
    };

    // Sair para trabalhar se condições adequadas
    if (currentSchedule === "working" && 
        newNeeds.energy >= 70 && 
        newNeeds.satisfaction >= 70 &&
        !NPCUtils.shouldReturnHome(npc, currentSchedule)) {
      return {
        needs: newNeeds,
        state: "idle"
      };
    }

    return { needs: newNeeds };
  }

  static handleSearching(npc: NPC, context: StateContext): Partial<NPC> {
    const { reservations } = context;
    const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;

    if (resourceType) {
      const nearestResource = NPCUtils.findNearestResource(npc, resourceType, reservations);

      if (nearestResource) {
        return {
          targetResource: nearestResource,
          targetPosition: [nearestResource.position[0], 0, nearestResource.position[1]],
          state: "moving"
        };
      } else {
        // Explorar área aleatória
        const newX = Math.floor(Math.random() * 40);
        const newZ = Math.floor(Math.random() * 40);
        return {
          targetPosition: [newX, 0, newZ],
          state: "moving"
        };
      }
    }

    return { state: "idle" };
  }

  // Métodos auxiliares
  static goHome(npc: NPC, buildings: any[]): Partial<NPC> {
    const home = buildings.find(b => b.id === npc.homeId);
    if (home) {
      return {
        targetPosition: [home.position[0] + 0.5, 0, home.position[1] + 0.5],
        targetBuildingId: null,
        targetResource: null,
        state: "moving"
      };
    }
    return { state: "resting" };
  }

  static goToSilo(npc: NPC, buildings: any[]): Partial<NPC> {
    const bestSilo = NPCUtils.findBestSilo(npc, buildings);
    if (bestSilo) {
      return {
        targetPosition: [bestSilo.position[0] + 0.5, 0, bestSilo.position[1] + 0.5],
        targetBuildingId: bestSilo.id,
        targetResource: null,
        state: "moving"
      };
    }
    return { state: "idle" };
  }

  static startWork(npc: NPC, context: StateContext): Partial<NPC> {
    const { buildings, reservations } = context;

    if (npc.type === "miner" || npc.type === "lumberjack") {
      const resourceType = npc.type === "miner" ? "stone" : "wood";
      const resource = NPCUtils.findNearestResource(npc, resourceType, reservations);

      if (resource) {
        return {
          targetResource: resource,
          targetPosition: [resource.position[0], 0, resource.position[1]],
          state: "moving"
        };
      } else {
        return { state: "searching" };
      }
    }

    if (npc.type === "farmer") {
      return this.handleFarmerCycle(npc, buildings);
    }

    // Para outros tipos, ir para workplace
    const workplaceType = Object.entries(WORKPLACE_MAPPING).find(([_, npcTypeId]) => npcTypeId === npc.type)?.[0];
    if (workplaceType) {
      const workplace = buildings.find(b => b.type === workplaceType);
      if (workplace) {
        return {
          targetPosition: [workplace.position[0] + 0.5, 0, workplace.position[1] + 0.5],
          targetBuildingId: workplace.id,
          targetResource: null,
          state: "moving"
        };
      }
    }

    return {};
  }

  static handleSiloDeposit(npc: NPC, buildings: any[], updates: Partial<NPC>): Partial<NPC> {
    const silo = buildings.find(b => b.id === npc.targetBuildingId && b.type === 'silo');

    if (silo && npc.inventory.amount > 0) {
      // Importar e usar resource store
      import('./useResourceStore').then(({ useResourceStore }) => {
        const resourceStore = useResourceStore.getState();
        resourceStore.updateResource(npc.inventory.type, npc.inventory.amount);
      }).catch(console.error);

      return {
        ...updates,
        inventory: { type: '', amount: 0 },
        targetBuildingId: null,
        state: "idle"
      };
    }

    return {
      ...updates,
      targetBuildingId: null,
      state: "idle"
    };
  }

  static handleWorkplaceArrival(npc: NPC, buildings: any[], updates: Partial<NPC>): Partial<NPC> {
    const workBuilding = buildings.find(b => b.id === npc.targetBuildingId);

    if (workBuilding && workBuilding.type !== 'silo') {
      return {
        ...updates,
        state: "working",
        workProgress: 0
      };
    }

    return {
      ...updates,
      state: "idle",
      targetBuildingId: null
    };
  }

  static handleHomeArrival(npc: NPC, buildings: any[], updates: Partial<NPC>): Partial<NPC> {
    const home = buildings.find(b => 
      b.id === npc.homeId && 
      Math.abs(b.position[0] - updates.position![0]) < 1.0 && 
      Math.abs(b.position[1] - updates.position![2]) < 1.0
    );

    if (home) {
      return { ...updates, state: "resting" };
    }

    return { ...updates, state: "idle" };
  }

  static completeResourceGathering(npc: NPC): Partial<NPC> {
    const resourceType = npc.type === "lumberjack" ? "wood" : "stone";

    if (npc.inventory.type === '' || npc.inventory.type === resourceType) {
      // Marcar recurso como coletado
      if (window.naturalResources && npc.targetResource) {
        const resourceIndex = window.naturalResources.findIndex(r => 
          r.position[0] === npc.targetResource!.position[0] &&
          r.position[1] === npc.targetResource!.position[1] &&
          r.type === npc.targetResource!.type
        );

        if (resourceIndex !== -1) {
          window.naturalResources[resourceIndex].lastCollected = Date.now();
        }
      }

      // Atualizar métricas
      import('./useNpcMetrics').then(({ useNpcMetrics }) => {
        const metricsStore = useNpcMetrics.getState();
        metricsStore.recordResourceCollection(npc.id, resourceType, 1);
        metricsStore.updateEfficiency(npc.id, npc.skills.efficiency + 0.1);
      }).catch(console.error);

      return {
        inventory: {
          type: resourceType,
          amount: npc.inventory.amount + 1
        },
        skills: {
          ...npc.skills,
          experience: npc.skills.experience + 1,
          gathering: Math.min(100, npc.skills.gathering + 0.1),
          efficiency: Math.min(100, npc.skills.efficiency + 0.05)
        },
        targetResource: null,
        workProgress: 0,
        state: "idle"
      };
    }

    return {
      targetResource: null,
      workProgress: 0,
      state: "idle"
    };
  }

  static handleFarmerCycle(npc: NPC, buildings: any[]): Partial<NPC> {
    const silos = buildings.filter(b => b.type === 'silo');
    const farms = buildings.filter(b => b.type === 'farm');

    if (silos.length === 0 || farms.length === 0) {
      return { state: "resting" };
    }

    // Inicializar dados do fazendeiro se necessário
    if (!npc.farmerData) {
      return {
        farmerData: {
          currentTask: "waiting",
          targetFarmId: null,
          targetSiloId: null,
          selectedSeed: null
        }
      };
    }

    const hasSeeds = npc.inventory.type.includes("seeds") && npc.inventory.amount > 0;
    const hasWheat = npc.inventory.type === "wheat" && npc.inventory.amount > 0;

    if (hasWheat) {
      const nearestSilo = NPCUtils.findBestSilo(npc, buildings);
      if (nearestSilo) {
        return {
          targetPosition: [nearestSilo.position[0] + 0.5, 0, nearestSilo.position[1] + 0.5],
          targetBuildingId: nearestSilo.id,
          state: "moving",
          farmerData: {
            ...npc.farmerData,
            currentTask: "delivering",
            targetSiloId: nearestSilo.id
          }
        };
      }
    }

    if (hasSeeds) {
      const availableFarm = farms.find(f => !f.plantation?.planted || f.plantation?.harvested);
      if (availableFarm) {
        return {
          targetPosition: [availableFarm.position[0] + 0.5, 0, availableFarm.position[1] + 0.5],
          targetBuildingId: availableFarm.id,
          state: "moving",
          farmerData: {
            ...npc.farmerData,
            currentTask: "planting",
            targetFarmId: availableFarm.id
          }
        };
      }
    } else {
      const readyFarm = farms.find(f => f.plantation?.ready && !f.plantation?.harvested);
      if (readyFarm) {
        return {
          targetPosition: [readyFarm.position[0] + 0.5, 0, readyFarm.position[1] + 0.5],
          targetBuildingId: readyFarm.id,
          state: "moving",
          farmerData: {
            ...npc.farmerData,
            currentTask: "harvesting",
            targetFarmId: readyFarm.id
          }
        };
      }
    }

    return { state: "resting" };
  }
}

// Interface para contexto dos handlers
interface StateContext {
  adjustedDeltaTime: number;
  currentSchedule: NPCSchedule;
  buildings: any[];
  npcs: NPC[];
  reservations: ResourceReservation[];
}

// ===== STORE PRINCIPAL =====

export const useNpcStore = create<NPCStoreState>()(
  subscribeWithSelector((set, get) => ({
    npcs: [],
    npcIdCounter: 0,
    resourceReservations: [],

    spawnNPC: (type, homeId, position) => {
      if (!npcTypes[type]) {
        console.error(`Tipo de NPC inválido: ${type}`);
        return "";
      }

      const id = `npc_${get().npcIdCounter}`;

      const newNPC: NPC = {
        id,
        type,
        originalType: type === "villager" ? "villager" : undefined,
        homeId,
        position,
        targetPosition: null,
        targetBuildingId: null,
        targetResource: null,
        state: "idle",
        workProgress: 0,
        lastResourceTime: 0,
        lastMoveTime: Date.now(),
        stuckTimer: 0,
        isPlayerControlled: false,
        controlMode: "autonomous",
        inventory: { type: '', amount: 0 },
        needs: {
          energy: 100,
          satisfaction: 100,
          health: 100,
          hunger: 100
        },
        memory: {
          lastVisitedPositions: [],
          knownResources: [],
          failedAttempts: 0,
          lastTaskCompletion: Date.now(),
          efficiency: 1.0
        },
        currentSchedule: "home",
        name: `${type} ${get().npcIdCounter}`,
        skills: {
          gathering: 10 + Math.random() * 20,
          working: 10 + Math.random() * 20,
          efficiency: 10 + Math.random() * 20,
          experience: 0
        },
        ...(type === "farmer" && {
          farmerData: {
            currentTask: "waiting",
            targetFarmId: null,
            targetSiloId: null,
            selectedSeed: null
          }
        })
      };

      set((state) => ({
        npcs: [...state.npcs, newNPC],
        npcIdCounter: state.npcIdCounter + 1,
      }));

      // Inicializar métricas
      import('./useNpcMetrics').then(({ useNpcMetrics }) => {
        useNpcMetrics.getState().initializeNPC(id);
      }).catch(console.error);

      console.log(`NPC ${type} criado com ID ${id} em ${position}`);
      return id;
    },

    removeNPC: (id) => {
      set((state) => ({
        npcs: state.npcs.filter((npc) => npc.id !== id),
      }));
      console.log(`NPC ${id} removido`);
    },

    updateNPCs: (deltaTime: number) => {
      const gameState = useGameStore.getState();
      if (gameState.isPaused) return;

      const adjustedDeltaTime = deltaTime * gameState.timeSpeed;
      const buildings = useBuildingStore.getState().buildings;
      const currentSchedule = NPCUtils.getScheduleForTime(gameState.timeCycle);
      const state = get();

      // Atualizar plantações
      useBuildingStore.getState().updatePlantations(Date.now());

      // Limpar reservas expiradas
      const now = Date.now();
      const validReservations = state.resourceReservations.filter(
        r => now - r.timestamp < CONSTANTS.RESERVATION_TIMEOUT
      );

      if (validReservations.length !== state.resourceReservations.length) {
        set({ resourceReservations: validReservations });
      }

      const context: StateContext = {
        adjustedDeltaTime,
        currentSchedule,
        buildings,
        npcs: state.npcs,
        reservations: validReservations
      };

      const updatedNPCs = state.npcs.map(npc => {
        // Pular NPCs em controle manual
        if (gameState.isManualControl && gameState.controlledNpcId === npc.id && npc.controlMode === "manual") {
          return npc;
        }

        const updates: Partial<NPC> = { currentSchedule };

        try {
          switch (npc.state) {
            case "idle":
              Object.assign(updates, NPCStateManager.handleIdle(npc, context));
              break;
            case "moving":
              Object.assign(updates, NPCStateManager.handleMoving(npc, context));
              break;
            case "gathering":
              Object.assign(updates, NPCStateManager.handleGathering(npc, context));
              break;
            case "working":
              Object.assign(updates, NPCStateManager.handleWorking(npc, context));
              break;
            case "resting":
              Object.assign(updates, NPCStateManager.handleResting(npc, context));
              break;
            case "searching":
              Object.assign(updates, NPCStateManager.handleSearching(npc, context));
              break;
            case "planting":
              break;
            case "harvesting":
              break;
            default:
              console.warn(`Estado desconhecido para NPC ${npc.id}: ${npc.state}`);
          }

          const updatedNpc = { ...npc, ...updates };

          // Atualizar métricas se estado mudou
          if (npc.state !== updatedNpc.state) {
            import('./useNpcMetrics').then(({ useNpcMetrics }) => {
              useNpcMetrics.getState().updateActivity(npc.id, updatedNpc.state);
            }).catch(console.error);
          }

          return updatedNpc;
        } catch (error) {
          console.error(`Erro ao atualizar NPC ${npc.id}:`, error);
          return npc;
        }
      });

      set({ npcs: updatedNPCs });
    },

    findWorkplace: (npcId) => {
      const npc = get().npcs.find(n => n.id === npcId);
      if (!npc) return null;

      const buildings = useBuildingStore.getState().buildings;
      const workplaceType = Object.entries(WORKPLACE_MAPPING).find(([_, npcTypeId]) => npcTypeId === npc.type)?.[0];

      if (!workplaceType) return null;

      const workplace = buildings.find(b => b.type === workplaceType);
return workplace ? workplace.id : null;
    },

    reserveResource: (npcId, resourceType, position) => {
      const state = get();

      if (state.isResourceReserved(resourceType, position)) {
        return false;
      }

      const newReservation: ResourceReservation = {
        resourcePosition: position,
        resourceType,
        npcId,
        timestamp: Date.now()
      };

      set({
        resourceReservations: [...state.resourceReservations, newReservation]
      });

      return true;
    },

    releaseResource: (npcId) => {
      const state = get();
      set({
        resourceReservations: state.resourceReservations.filter(r => r.npcId !== npcId)
      });
    },

    isResourceReserved: (resourceType, position) => {
      const state = get();
      return NPCUtils.isResourceReservedByPosition(resourceType, position, state.resourceReservations);
    },

    toggleNpcControlMode: (npcId: string) => {
      set((state) => ({
        npcs: state.npcs.map(npc =>
          npc.id === npcId
            ? {
                ...npc,
                controlMode: npc.controlMode === "autonomous" ? "manual" : "autonomous",
                isPlayerControlled: npc.controlMode === "autonomous",
                state: "idle" as const,
                targetPosition: null,
                targetResource: null,
                targetBuildingId: null,
                workProgress: 0,
              }
            : npc
        ),
      }));
    },

    setNpcControlMode: (npcId: string, mode: "autonomous" | "manual") => {
      set((state) => ({
        npcs: state.npcs.map(npc =>
          npc.id === npcId
            ? {
                ...npc,
                controlMode: mode,
                isPlayerControlled: mode === "manual",
                state: "idle" as const,
                targetPosition: null,
                targetResource: null,
                targetBuildingId: null,
                workProgress: 0,
              }
            : npc
        ),
      }));
    },

    startNpcWork: (npcId: string) => {
      set((state) => ({
        npcs: state.npcs.map(npc =>
          npc.id === npcId
            ? {
                ...npc,
                isWorkingManually: true,
                state: "idle" as const,
              }
            : npc
        ),
      }));
    },

    updateNpc: (npcId: string, updates: Partial<NPC>) => {
      set((state) => ({
        npcs: state.npcs.map(npc =>
          npc.id === npcId ? { ...npc, ...updates } : npc
        ),
      }));
    },

    restoreVillagerType: (npcId: string) => {
      set((state) => ({
        npcs: state.npcs.map(npc => {
          if (npc.id === npcId && npc.originalType === "villager") {
            return {
              ...npc,
              type: "villager",
              farmerData: undefined,
              isWorkingManually: false
            };
          }
          return npc;
        }),
      }));
    },
  }))
);