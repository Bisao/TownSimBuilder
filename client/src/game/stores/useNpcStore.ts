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

export interface TaskPriority {
  type: "gather" | "deposit" | "work" | "rest";
  priority: number;
  resourceType?: string;
  targetPosition?: [number, number];
  buildingId?: string;
}

export type NPCSchedule = "home" | "working" | "lunch" | "traveling";

export type NPCState = "idle" | "moving" | "working" | "gathering" | "resting" | "searching" | "planting" | "harvesting" | "going_to_silo" | "going_to_farm";

export interface NPC {
  id: string;
  type: string;
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
}

// ===== CONSTANTES =====

const CONSTANTS = {
  ENERGY_CONSUMPTION: {
    MOVING: 0.025,    // Aumentado para tornar energia mais importante
    WORKING: 0.030,   // Trabalho consome mais energia
    GATHERING: 0.028, // Coleta consome energia considerável
  },
  SATISFACTION_CONSUMPTION: {
    MOVING: 0.015,    // Movimento reduz satisfação
    WORKING: 0.020,   // Trabalho reduz satisfação
    GATHERING: 0.018, // Coleta reduz satisfação
  },
  REGENERATION: {
    ENERGY: 20,       // Regeneração mais rápida
    SATISFACTION: 15, // Regeneração mais rápida
  },
  WORK_SPEED: 0.15,
  GATHERING_SPEED: 0.15,
  MAX_INVENTORY: 5,
  MOVEMENT_TOLERANCE: 0.15,
  RESOURCE_PROXIMITY: 1.5,
  RESERVATION_TIMEOUT: 600000, // 10 minutos
} as const;

const WORKPLACE_MAPPING: Record<string, string> = {
  farm: "farmer",
  bakery: "baker",
  mine: "miner",
  lumberyard: "lumberjack"
};

// ===== FUNÇÕES AUXILIARES =====

class NPCUtils {
  static getDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    return Math.hypot(pos1[0] - pos2[0], pos1[2] - pos2[2]);
  }

  static findUnexploredArea(visitedPositions: Array<[number, number]>): [number, number] {
    const gridSize = 40;
    let attempts = 0;
    let newPosition: [number, number];

    do {
      newPosition = [
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize)
      ];
      attempts++;
    } while (
      visitedPositions.some(pos => 
        Math.abs(pos[0] - newPosition[0]) < 5 && 
        Math.abs(pos[1] - newPosition[1]) < 5
      ) && 
      attempts < 10
    );

    return newPosition;
  }

  static calculatePathRisk(start: [number, number], end: [number, number], npcs: NPC[]): number {
    const distance = Math.hypot(end[0] - start[0], end[1] - start[1]);
    const npcDensity = npcs.filter(npc => 
      Math.abs(npc.position[0] - start[0]) < 5 && 
      Math.abs(npc.position[2] - start[1]) < 5
    ).length;

    return distance * (1 + npcDensity * 0.2);
  }

  static getScheduleForTime(timeCycle: number, npcId?: string): NPCSchedule {
    const hours = timeCycle * 24;
    
    // Horário padrão para todos os NPCs:
    // 6h-12h: trabalho
    // 12h-13h: almoço (em casa)
    // 13h-18h: trabalho
    // 18h-6h: descanso (em casa)
    
    if (hours >= 6 && hours < 12) {
      return "working"; // Manhã de trabalho
    } else if (hours >= 12 && hours < 13) {
      return "lunch"; // Hora do almoço
    } else if (hours >= 13 && hours < 18) {
      return "working"; // Tarde de trabalho
    } else {
      return "home"; // Noite/madrugada - descanso
    }
  }

  static shouldReturnHome(npc: NPC, currentSchedule: NPCSchedule): boolean {
    // Sempre retornar para casa se for hora do almoço ou descanso
    if (currentSchedule === "lunch" || currentSchedule === "home") {
      return true;
    }
    
    // Retornar para casa se energia ou satisfação estiverem baixas
    if (npc.needs.energy <= 30 || npc.needs.satisfaction <= 30) {
      return true;
    }
    
    return false;
  }

  static findNearestAvailableResource(npc: NPC, resourceType: string, npcs: NPC[], reservations: ResourceReservation[]): any | null {
    if (!window.naturalResources) return null;

    const availableResources = window.naturalResources.filter(r => {
      const isCorrectType = r.type === resourceType;
      const isNotCollected = !r.lastCollected;
      const isNotTargeted = !npcs.some(
        other => other.id !== npc.id && 
        other.targetResource?.position[0] === r.position[0] &&
        other.targetResource?.position[1] === r.position[1]
      );
      const isNotReserved = !NPCUtils.isResourceReservedByPosition(resourceType, r.position, reservations);

      return isCorrectType && isNotCollected && isNotTargeted && isNotReserved;
    });

    if (availableResources.length === 0) return null;

    let bestResource = null;
    let bestScore = -1;

    for (const resource of availableResources) {
      const dist = Math.hypot(
        resource.position[0] - npc.position[0],
        resource.position[1] - npc.position[2]
      );

      const nearbyNpcs = npcs.filter(otherNpc => 
        otherNpc.id !== npc.id &&
        Math.hypot(
          resource.position[0] - otherNpc.position[0],
          resource.position[1] - otherNpc.position[2]
        ) < 3
      ).length;

      const score = (100 / (dist + 1)) * (1 / (nearbyNpcs + 1));

      if (score > bestScore) {
        bestScore = score;
        bestResource = resource;
      }
    }

    return bestResource;
  }

  static findBestSilo(npc: NPC, buildings: any[], npcs: NPC[]): any | null {
    const silos = buildings.filter(b => b.type === 'silo');
    if (silos.length === 0) return null;

    let bestSilo = null;
    let bestScore = -1;

    for (const silo of silos) {
      const distance = Math.hypot(
        silo.position[0] - npc.position[0],
        silo.position[1] - npc.position[2]
      );

      const nearbyNpcs = npcs.filter(otherNpc => 
        otherNpc.id !== npc.id &&
        otherNpc.targetBuildingId === silo.id
      ).length;

      const score = (100 / (distance + 1)) * (1 / (nearbyNpcs + 1));

      if (score > bestScore) {
        bestScore = score;
        bestSilo = silo;
      }
    }

    return bestSilo;
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

class NPCStateHandlers {
  static handleIdleState(npc: NPC, currentSchedule: NPCSchedule, buildings: any[], npcs: NPC[], reservations: ResourceReservation[]): Partial<NPC> {
    const updates: Partial<NPC> = {};
    
    const timeCycle = useGameStore.getState().timeCycle;
    const hours = timeCycle * 24;

    console.log(`NPC ${npc.type} em estado idle - horário: ${currentSchedule} (${hours.toFixed(1)}h) - energia: ${npc.needs.energy.toFixed(1)} - satisfação: ${npc.needs.satisfaction.toFixed(1)}`);

    // Verificar se deve ir para casa por horário ou necessidades
    if (NPCUtils.shouldReturnHome(npc, currentSchedule)) {
      const home = buildings.find(b => b.id === npc.homeId);
      if (home) {
        const reason = currentSchedule === "lunch" ? "almoçar" : 
                      currentSchedule === "home" ? "descansar" : 
                      "repor energia/satisfação";
        console.log(`NPC ${npc.type} voltando para casa para ${reason}`);
        updates.targetPosition = [home.position[0] + 0.5, 0, home.position[1] + 0.5];
        updates.targetBuildingId = null;
        updates.targetResource = null;
        updates.state = "moving";
        return updates;
      }
    }

    // Se não for horário de trabalho, ficar em casa
    if (currentSchedule !== "working") {
      console.log(`NPC ${npc.type} aguardando horário de trabalho`);
      return { state: "resting" };
    }

    // MODIFICADO: NPCs agora só trabalham quando ativados manualmente
    // Não iniciar trabalho automaticamente - aguardar comando manual
    console.log(`NPC ${npc.type} aguardando comando manual para trabalhar`);

    // Se inventário estiver cheio, ir para silo automaticamente
    if (npc.inventory.amount >= CONSTANTS.MAX_INVENTORY) {
      console.log(`NPC ${npc.type} inventário cheio (${npc.inventory.amount}/${CONSTANTS.MAX_INVENTORY}), indo para silo`);
      return NPCStateHandlers.handleInventoryFull(npc, buildings, npcs);
    }

    // Comportamento especial para fazendeiro apenas se já estiver trabalhando
    if (npc.type === "farmer" && npc.farmerData?.currentTask && npc.farmerData.currentTask !== "waiting") {
      return NPCStateHandlers.handleFarmerCycle(npc, buildings);
    }

    // Ficar idle até receber comando manual
    return {};
  }

  static handleResourceGathering(npc: NPC, npcs: NPC[], reservations: ResourceReservation[], buildings: any[]): Partial<NPC> {
    const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;

    if (!resourceType) {
      return NPCStateHandlers.handleWorkplaceSearch(npc, buildings);
    }

    const bestResource = NPCUtils.findNearestAvailableResource(npc, resourceType, npcs, reservations);

    if (bestResource) {
      return {
        targetResource: bestResource,
        targetPosition: [bestResource.position[0], 0, bestResource.position[1]],
        targetBuildingId: null,
        state: "moving"
      };
    } else {
      return { state: "searching" };
    }
  }

  static handleInventoryFull(npc: NPC, buildings: any[], npcs: NPC[]): Partial<NPC> {
    const bestSilo = NPCUtils.findBestSilo(npc, buildings, npcs);

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

  static handleWorkplaceSearch(npc: NPC, buildings: any[]): Partial<NPC> {
    const workplaceType = Object.entries(WORKPLACE_MAPPING).find(([_, npcTypeId]) => npcTypeId === npc.type)?.[0];
    if (!workplaceType) return {};

    const workplace = buildings.find(b => b.type === workplaceType);
    if (workplace) {
      return {
        targetPosition: [workplace.position[0] + 0.5, 0, workplace.position[1] + 0.5],
        targetBuildingId: workplace.id,
        targetResource: null,
        state: "moving"
      };
    }

    return {};
  }

  static handleMovingState(npc: NPC, adjustedDeltaTime: number, buildings: any[]): Partial<NPC> {
    if (!npc.targetPosition) {
      console.log(`NPC ${npc.type} sem targetPosition, voltando para idle`);
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
        satisfaction: Math.max(0, npc.needs.satisfaction - adjustedDeltaTime * CONSTANTS.SATISFACTION_CONSUMPTION.MOVING)
      }
    };

    // Calcular fator de desaceleração baseado na distância
    const slowdownDistance = 2.0; // Começar a desacelerar quando estiver a 2 unidades do destino
    const speedMultiplier = distance > slowdownDistance ? 1.0 : Math.max(0.2, distance / slowdownDistance);
    
    // Aumentar tolerância e adicionar timeout para evitar travamento
    const tolerance = Math.max(CONSTANTS.MOVEMENT_TOLERANCE, 0.3);
    
    if (distance < tolerance || moveSpeed === 0) {
      console.log(`NPC ${npc.type} chegou ao destino [${targetX.toFixed(1)}, ${targetZ.toFixed(1)}]`);
      updates.position = [targetX, 0, targetZ];
      updates.targetPosition = null;

      if (npc.targetResource) {
        console.log(`NPC ${npc.type} começando a coletar recurso`);
        updates.state = "gathering";
        updates.workProgress = 0;
      } else if (npc.inventory.amount > 0 && npc.targetBuildingId) {
        return NPCStateHandlers.handleSiloDeposit(npc, buildings, updates);
      } else if (npc.targetBuildingId) {
        return NPCStateHandlers.handleWorkplaceArrival(npc, buildings, updates);
      } else {
        return NPCStateHandlers.handleHomeArrival(npc, buildings, updates);
      }
    } else {
      // Verificar se o NPC está se movendo muito devagar ou travado
      if (moveSpeed < 0.001) {
        console.log(`NPC ${npc.type} movimento muito lento, forçando chegada ao destino`);
        updates.position = [targetX, 0, targetZ];
        updates.targetPosition = null;
        updates.state = "idle";
        return updates;
      }

      const dirX = dx / distance;
      const dirZ = dz / distance;
      const adjustedMoveSpeed = moveSpeed * speedMultiplier;
      const newX = currentX + dirX * adjustedMoveSpeed;
      const newZ = currentZ + dirZ * adjustedMoveSpeed;
      const [clampedX, clampedZ] = NPCUtils.clampPosition(newX, newZ);
      
      // Verificar se a posição realmente mudou
      const positionChanged = Math.abs(clampedX - currentX) > 0.001 || Math.abs(clampedZ - currentZ) > 0.001;
      
      if (!positionChanged && distance > tolerance) {
        console.log(`NPC ${npc.type} não conseguiu se mover, forçando teleporte para destino`);
        updates.position = [targetX, 0, targetZ];
        updates.targetPosition = null;
        updates.state = "idle";
      } else {
        updates.position = [clampedX, 0, clampedZ];
      }
    }

    return updates;
  }

  static handleSiloDeposit(npc: NPC, buildings: any[], updates: Partial<NPC>): Partial<NPC> {
    const silo = buildings.find(b => b.id === npc.targetBuildingId && b.type === 'silo');

    if (silo) {
      if (npc.type === "farmer") {
        return NPCStateHandlers.handleFarmerSiloInteraction(npc, updates);
      } else {
        const depositedAmount = npc.inventory.amount;
        const depositedType = npc.inventory.type;

        import('./useResourceStore').then(({ useResourceStore }) => {
          const resourceStore = useResourceStore.getState();
          resourceStore.updateResource(depositedType, depositedAmount);
        });

        return {
          ...updates,
          inventory: { type: '', amount: 0 },
          targetBuildingId: null,
          state: "idle"
        };
      }
    }

    return {
      ...updates,
      targetBuildingId: null,
      state: "idle"
    };
  }

  static handleFarmerSiloInteraction(npc: NPC, updates: Partial<NPC>): Partial<NPC> {
    if (!npc.farmerData) return { ...updates, state: "idle" };

    if (npc.farmerData.currentTask === "getting_seeds") {
      const selectedSeed = npc.farmerData.selectedSeed || "seeds";
      
      // Pegar sementes do silo
      import('./useResourceStore').then(({ useResourceStore }) => {
        const resourceStore = useResourceStore.getState();
        if (resourceStore.resources[selectedSeed] >= 1) {
          resourceStore.updateResource(selectedSeed, -1);
        }
      });

      console.log(`Fazendeiro pegou ${selectedSeed} do silo`);
      return {
        ...updates,
        inventory: { type: selectedSeed, amount: 1 },
        targetBuildingId: null,
        state: "idle",
        farmerData: {
          ...npc.farmerData,
          currentTask: "waiting"
        }
      };
    } else if (npc.farmerData.currentTask === "delivering") {
      // Depositar trigo no silo
      import('./useResourceStore').then(({ useResourceStore }) => {
        const resourceStore = useResourceStore.getState();
        resourceStore.updateResource("wheat", npc.inventory.amount);
      });

      console.log(`Fazendeiro depositou ${npc.inventory.amount} trigo no silo`);
      return {
        ...updates,
        inventory: { type: '', amount: 0 },
        targetBuildingId: null,
        state: "idle",
        farmerData: {
          ...npc.farmerData,
          currentTask: "waiting"
        }
      };
    }

    return { ...updates, state: "idle" };
  }

  static handleWorkplaceArrival(npc: NPC, buildings: any[], updates: Partial<NPC>): Partial<NPC> {
    const workBuilding = buildings.find(b => b.id === npc.targetBuildingId);
    
    if (workBuilding) {
      if (npc.type === "farmer" && workBuilding.type === "farm") {
        return NPCStateHandlers.handleFarmerFarmArrival(npc, workBuilding, updates);
      } else if (workBuilding.type !== 'silo') {
        return {
          ...updates,
          state: "working",
          workProgress: 0
        };
      }
    }

    return {
      ...updates,
      state: "idle",
      targetBuildingId: null
    };
  }

  static handleFarmerFarmArrival(npc: NPC, farm: any, updates: Partial<NPC>): Partial<NPC> {
    if (!npc.farmerData) return { ...updates, state: "idle" };

    if (npc.farmerData.currentTask === "planting") {
      console.log(`Fazendeiro iniciando plantio na fazenda ${farm.id}`);
      return {
        ...updates,
        state: "planting",
        workProgress: 0
      };
    } else if (npc.farmerData.currentTask === "harvesting") {
      console.log(`Fazendeiro iniciando colheita na fazenda ${farm.id}`);
      return {
        ...updates,
        state: "harvesting", 
        workProgress: 0
      };
    }

    return { ...updates, state: "idle" };
  }

  static handlePlantingState(npc: NPC, adjustedDeltaTime: number, buildings: any[]): Partial<NPC> {
    if (!npc.targetBuildingId || !npc.farmerData) {
      return { state: "idle" };
    }

    const newWorkProgress = npc.workProgress + adjustedDeltaTime * 0.5; // Plantio demora 2 segundos

    if (newWorkProgress >= 1) {
      // Concluir plantio
      import('./useBuildingStore').then(({ useBuildingStore }) => {
        useBuildingStore.getState().plantSeeds(npc.targetBuildingId!);
      });

      console.log(`Fazendeiro concluiu plantio na fazenda ${npc.targetBuildingId}`);
      
      return {
        inventory: { type: '', amount: 0 }, // Consumir semente
        workProgress: 0,
        targetBuildingId: null,
        state: "idle",
        farmerData: {
          ...npc.farmerData,
          currentTask: "waiting",
          targetFarmId: null
        }
      };
    }

    return {
      workProgress: newWorkProgress,
      needs: {
        energy: Math.max(0, npc.needs.energy - adjustedDeltaTime * CONSTANTS.ENERGY_CONSUMPTION.WORKING),
        satisfaction: Math.max(0, npc.needs.satisfaction - adjustedDeltaTime * CONSTANTS.SATISFACTION_CONSUMPTION.WORKING)
      }
    };
  }

  static handleHarvestingState(npc: NPC, adjustedDeltaTime: number, buildings: any[]): Partial<NPC> {
    if (!npc.targetBuildingId || !npc.farmerData) {
      return { state: "idle" };
    }

    const newWorkProgress = npc.workProgress + adjustedDeltaTime * 0.5; // Colheita demora 2 segundos

    if (newWorkProgress >= 1) {
      // Concluir colheita
      import('./useBuildingStore').then(({ useBuildingStore }) => {
        useBuildingStore.getState().harvestCrop(npc.targetBuildingId!);
      });

      console.log(`Fazendeiro concluiu colheita na fazenda ${npc.targetBuildingId}`);
      
      return {
        inventory: { type: 'wheat', amount: 2 }, // Colher trigo
        workProgress: 0,
        targetBuildingId: null,
        state: "idle",
        farmerData: {
          ...npc.farmerData,
          currentTask: "waiting",
          targetFarmId: null
        }
      };
    }

    return {
      workProgress: newWorkProgress,
      needs: {
        energy: Math.max(0, npc.needs.energy - adjustedDeltaTime * CONSTANTS.ENERGY_CONSUMPTION.WORKING),
        satisfaction: Math.max(0, npc.needs.satisfaction - adjustedDeltaTime * CONSTANTS.SATISFACTION_CONSUMPTION.WORKING)
      }
    };
  }

  static handleHomeArrival(npc: NPC, buildings: any[], updates: Partial<NPC>): Partial<NPC> {
    const home = buildings.find(b => 
      b.id === npc.homeId && 
      Math.abs(b.position[0] - updates.position![0]) < 1.0 && 
      Math.abs(b.position[1] - updates.position![2]) < 1.0
    );

    if (home) {
      console.log(`NPC ${npc.type} chegou em casa - energia: ${npc.needs.energy} - satisfação: ${npc.needs.satisfaction}`);
      return { ...updates, state: "resting" };
    }

    return { ...updates, state: "idle" };
  }

  static handleGatheringState(npc: NPC, adjustedDeltaTime: number): Partial<NPC> {
    if (!npc.targetResource) {
      console.log(`NPC ${npc.type} sem recurso alvo, voltando para idle`);
      return { state: "idle" };
    }

    if (npc.inventory.amount >= CONSTANTS.MAX_INVENTORY) {
      console.log(`NPC ${npc.type} inventário cheio durante coleta, voltando para idle`);
      return {
        targetResource: null,
        workProgress: 0,
        state: "idle"
      };
    }

    const currentTime = Date.now();
    const resourceExists = window.naturalResources?.find(r => 
      r.position[0] === npc.targetResource!.position[0] &&
      r.position[1] === npc.targetResource!.position[1] &&
      r.type === npc.targetResource!.type &&
      (!r.lastCollected || (currentTime - r.lastCollected) > 300000) // 5 minutos
    );

    if (!resourceExists) {
      console.log(`NPC ${npc.type} recurso não existe mais ou não disponível, procurando novo`);
      return {
        targetResource: null,
        workProgress: 0,
        state: "searching"
      };
    }

    const distanceToResource = Math.hypot(
      npc.targetResource.position[0] - npc.position[0],
      npc.targetResource.position[1] - npc.position[2]
    );

    if (distanceToResource > CONSTANTS.RESOURCE_PROXIMITY) {
      console.log(`NPC ${npc.type} muito longe do recurso (${distanceToResource.toFixed(2)}), movendo`);
      return {
        targetPosition: [npc.targetResource.position[0], 0, npc.targetResource.position[1]],
        state: "moving"
      };
    }

    // Primeira vez chegando ao recurso
    if (npc.workProgress === 0) {
      console.log(`NPC ${npc.type} começando a coletar recurso`);
    }

    const npcConfig = npcTypes[npc.type];
    const baseSpeed = npcConfig ? npcConfig.speed : 0.15;
    const newWorkProgress = npc.workProgress + adjustedDeltaTime * baseSpeed;

    if (newWorkProgress >= 1) {
      return NPCStateHandlers.completeResourceGathering(npc);
    }

    return {
      workProgress: newWorkProgress,
      needs: {
        energy: Math.max(0, npc.needs.energy - adjustedDeltaTime * CONSTANTS.ENERGY_CONSUMPTION.GATHERING),
        satisfaction: Math.max(0, npc.needs.satisfaction - adjustedDeltaTime * CONSTANTS.SATISFACTION_CONSUMPTION.GATHERING)
      }
    };
  }

  static completeResourceGathering(npc: NPC): Partial<NPC> {
    const resourceType = npc.type === "lumberjack" ? "wood" : "stone";

    if (npc.inventory.type === '' || npc.inventory.type === resourceType) {
      const newSkills = {
        ...npc.skills,
        experience: npc.skills.experience + 1,
        gathering: Math.min(100, npc.skills.gathering + 0.1),
        efficiency: Math.min(100, npc.skills.efficiency + 0.05)
      };

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
        metricsStore.updateEfficiency(npc.id, newSkills.efficiency);
      }).catch(() => {});

      return {
        inventory: {
          type: resourceType,
          amount: npc.inventory.amount + 1
        },
        skills: newSkills,
        memory: {
          ...npc.memory,
          efficiency: 1 + (newSkills.efficiency / 100),
          lastTaskCompletion: Date.now()
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

  static handleWorkingState(npc: NPC, adjustedDeltaTime: number, buildings: any[]): Partial<NPC> {
    if (!npc.targetBuildingId) return { state: "idle" };

    const npcConfig = npcTypes[npc.type];
    const baseSpeed = npcConfig ? npcConfig.speed : 0.15;
    const newWorkProgress = npc.workProgress + adjustedDeltaTime * baseSpeed;

    if (newWorkProgress >= 1) {
      if (Math.random() < 0.5) {
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
        satisfaction: Math.max(0, npc.needs.satisfaction - adjustedDeltaTime * CONSTANTS.SATISFACTION_CONSUMPTION.WORKING)
      }
    };
  }

  static handleRestingState(npc: NPC, adjustedDeltaTime: number, currentSchedule: NPCSchedule): Partial<NPC> {
    const timeCycle = useGameStore.getState().timeCycle;
    const hours = timeCycle * 24;
    
    // Regeneração mais rápida em casa
    const homeRegenerationMultiplier = 2.0;
    const newNeeds = {
      energy: Math.min(100, npc.needs.energy + adjustedDeltaTime * CONSTANTS.REGENERATION.ENERGY * homeRegenerationMultiplier),
      satisfaction: Math.min(100, npc.needs.satisfaction + adjustedDeltaTime * CONSTANTS.REGENERATION.SATISFACTION * homeRegenerationMultiplier)
    };

    console.log(`NPC ${npc.type} descansando - energia: ${newNeeds.energy.toFixed(1)} - satisfação: ${newNeeds.satisfaction.toFixed(1)} - horário: ${currentSchedule} (${hours.toFixed(1)}h)`);

    // Só sair para trabalhar se:
    // 1. For horário de trabalho
    // 2. Energia e satisfação estiverem adequadas
    // 3. Não for hora do almoço nem descanso
    if (currentSchedule === "working" && 
        newNeeds.energy >= 70 && 
        newNeeds.satisfaction >= 70 &&
        !NPCUtils.shouldReturnHome(npc, currentSchedule)) {
      console.log(`NPC ${npc.type} saindo para trabalhar - energia restaurada`);
      return {
        needs: newNeeds,
        state: "idle"
      };
    }

    return { needs: newNeeds };
  }

  static handleSearchingState(npc: NPC): Partial<NPC> {
    const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;

    if (resourceType && window.naturalResources) {
      const currentTime = Date.now();
      const availableResources = window.naturalResources.filter(r => {
        const isCorrectType = r.type === resourceType;
        const isNotCollected = !r.lastCollected || (currentTime - r.lastCollected) > 300000; // 5 minutos
        return isCorrectType && isNotCollected;
      });

      if (availableResources.length > 0) {
        let nearest = availableResources[0];
        let minDist = Infinity;

        for (const resource of availableResources) {
          const dist = Math.hypot(
            resource.position[0] - npc.position[0],
            resource.position[1] - npc.position[2]
          );
          if (dist < minDist) {
            minDist = dist;
            nearest = resource;
          }
        }

        console.log(`NPC ${npc.type} found resource ${nearest.type} at [${nearest.position[0]}, ${nearest.position[1]}] - distance: ${minDist.toFixed(2)}`);

        return {
          targetResource: nearest,
          targetPosition: [nearest.position[0], 0, nearest.position[1]],
          state: "moving"
        };
      } else {
        // Se não há recursos disponíveis, explorar área aleatória
        const newX = Math.floor(Math.random() * 40);
        const newZ = Math.floor(Math.random() * 40);
        
        console.log(`NPC ${npc.type} no resources available, exploring [${newX}, ${newZ}]`);
        
        return {
          targetPosition: [newX, 0, newZ],
          state: "moving"
        };
      }
    }

    // Se não há tipo de recurso válido, voltar para idle
    console.log(`NPC ${npc.type} invalid resource type, returning to idle`);
    return { state: "idle" };
  }

  static handleFarmerCycle(npc: NPC, buildings: any[]): Partial<NPC> {
    // Verificar se há silos e fazendas disponíveis
    const silos = buildings.filter(b => b.type === 'silo');
    const farms = buildings.filter(b => b.type === 'farm');

    if (silos.length === 0 || farms.length === 0) {
      console.log(`Fazendeiro aguardando: silos=${silos.length}, fazendas=${farms.length}`);
      return { state: "resting" };
    }

    // Inicializar dados do fazendeiro se não existir
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

    // Verificar se tem sementes no inventário (da semente selecionada)
    const selectedSeed = npc.farmerData.selectedSeed || "seeds";
    const hasSeeds = npc.inventory.type === selectedSeed && npc.inventory.amount > 0;
    
    // Verificar se tem trigo no inventário
    const hasWheat = npc.inventory.type === "wheat" && npc.inventory.amount > 0;

    if (hasWheat) {
      // Levar trigo para o silo
      const nearestSilo = NPCUtils.findBestSilo(npc, buildings, []);
      if (nearestSilo) {
        console.log(`Fazendeiro levando trigo para silo`);
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
      // Procurar fazenda sem plantação
      const availableFarm = farms.find(f => !f.plantation?.planted || f.plantation?.harvested);
      if (availableFarm) {
        console.log(`Fazendeiro indo plantar na fazenda ${availableFarm.id}`);
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
      // Procurar fazenda pronta para colheita
      const readyFarm = farms.find(f => f.plantation?.ready && !f.plantation?.harvested);
      if (readyFarm) {
        console.log(`Fazendeiro indo colher na fazenda ${readyFarm.id}`);
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
      } else {
        // Verificar se há semente selecionada
        const selectedSeed = npc.farmerData.selectedSeed;
        if (!selectedSeed) {
          console.log(`Fazendeiro aguardando seleção de semente`);
          return { state: "resting" };
        }

        // Verificar se há sementes disponíveis no silo
        import('./useResourceStore').then(({ useResourceStore }) => {
          const resourceStore = useResourceStore.getState();
          if (resourceStore.resources[selectedSeed] < 1) {
            console.log(`Fazendeiro aguardando: sem ${selectedSeed} disponível`);
            return { state: "resting" };
          }
        });

        // Ir buscar sementes no silo
        const nearestSilo = NPCUtils.findBestSilo(npc, buildings, []);
        if (nearestSilo) {
          console.log(`Fazendeiro indo buscar ${selectedSeed} no silo`);
          return {
            targetPosition: [nearestSilo.position[0] + 0.5, 0, nearestSilo.position[1] + 0.5],
            targetBuildingId: nearestSilo.id,
            state: "moving",
            farmerData: {
              ...npc.farmerData,
              currentTask: "getting_seeds",
              targetSiloId: nearestSilo.id
            }
          };
        }
      }
    }

    return { state: "resting" };
  }
}

// ===== STORE PRINCIPAL =====

export const useNpcStore = create<NPCStoreState>()(
  subscribeWithSelector((set, get) => ({
    npcs: [],
    npcIdCounter: 0,
    resourceReservations: [],

    spawnNPC: (type, homeId, position) => {
      if (!npcTypes[type]) return "";

      const id = `npc_${get().npcIdCounter}`;

      const newNPC: NPC = {
        id,
        type,
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
        inventory: { type: '', amount: 0 },
        needs: {
          energy: 100,
          satisfaction: 100
        },
        memory: {
          lastVisitedPositions: [],
          knownResources: [],
          failedAttempts: 0,
          lastTaskCompletion: Date.now(),
          efficiency: 1.0
        },
        currentSchedule: "home",
        name: `NPC ${get().npcIdCounter}`,
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

      // Inicializar métricas para o novo NPC
      import('./useNpcMetrics').then(({ useNpcMetrics }) => {
        useNpcMetrics.getState().initializeNPC(id);
      }).catch(() => {});

      console.log(`NPC ${type} criado em ${position}`);
      return id;
    },

    removeNPC: (id) => {
      set((state) => ({
        npcs: state.npcs.filter((npc) => npc.id !== id),
      }));
    },

    updateNPCs: (deltaTime: number) => {
      const { isPaused, timeSpeed, timeCycle } = useGameStore.getState();
      if (isPaused) return;

      const adjustedDeltaTime = deltaTime * timeSpeed;
      const buildings = useBuildingStore.getState().buildings;
      const currentSchedule = NPCUtils.getScheduleForTime(timeCycle);

      // Atualizar plantações
      useBuildingStore.getState().updatePlantations(Date.now());

      const updatedNPCs = get().npcs.map(npc => {
        const updates: Partial<NPC> = { currentSchedule };
        const oldState = npc.state;
        const currentTime = Date.now();

        // Detectar NPCs travados no estado "moving"
        if (npc.state === "moving") {
          // Se não se moveu nas últimas 2 segundos, incrementar stuckTimer
          const lastPosition = npc.position;
          updates.stuckTimer = npc.stuckTimer + adjustedDeltaTime;
          
          // Se estiver travado há mais de 3 segundos, forçar reset
          if (updates.stuckTimer > 3) {
            console.log(`NPC ${npc.type} travado há ${updates.stuckTimer.toFixed(1)}s, forçando reset`);
            updates.state = "idle";
            updates.targetPosition = null;
            updates.targetResource = null;
            updates.targetBuildingId = null;
            updates.stuckTimer = 0;
            updates.lastMoveTime = currentTime;
          }
        } else {
          // Reset do stuckTimer se não estiver em movimento
          updates.stuckTimer = 0;
          updates.lastMoveTime = currentTime;
        }

        switch (npc.state) {
          case "idle":
            Object.assign(updates, NPCStateHandlers.handleIdleState(npc, currentSchedule, buildings, get().npcs, get().resourceReservations));
            break;
          case "moving":
            Object.assign(updates, NPCStateHandlers.handleMovingState(npc, adjustedDeltaTime, buildings));
            break;
          case "gathering":
            Object.assign(updates, NPCStateHandlers.handleGatheringState(npc, adjustedDeltaTime));
            break;
          case "working":
            Object.assign(updates, NPCStateHandlers.handleWorkingState(npc, adjustedDeltaTime, buildings));
            break;
          case "resting":
            Object.assign(updates, NPCStateHandlers.handleRestingState(npc, adjustedDeltaTime, currentSchedule));
            break;
          case "searching":
            Object.assign(updates, NPCStateHandlers.handleSearchingState(npc));
            break;
          case "planting":
            Object.assign(updates, NPCStateHandlers.handlePlantingState(npc, adjustedDeltaTime, buildings));
            break;
          case "harvesting":
            Object.assign(updates, NPCStateHandlers.handleHarvestingState(npc, adjustedDeltaTime, buildings));
            break;
        }

        const updatedNpc = { ...npc, ...updates };

        // Atualizar métricas se o estado mudou
        if (oldState !== updatedNpc.state) {
          import('./useNpcMetrics').then(({ useNpcMetrics }) => {
            useNpcMetrics.getState().updateActivity(npc.id, updatedNpc.state);
          }).catch(() => {});
        }

        return updatedNpc;
      });

      set({ npcs: updatedNPCs });
    },

    findWorkplace: (npcId) => {
      const npc = get().npcs.find(n => n.id === npcId);
      if (!npc) return null;

      const buildings = useBuildingStore.getState().buildings;
      const npcType = npcTypes[npc.type];
      const workplaceType = Object.entries(WORKPLACE_MAPPING).find(([_, npcTypeId]) => npcTypeId === npc.type)?.[0];

      if (!workplaceType) return null;

      const possibleWorkplaces = buildings.filter(building => {
        if (building.type !== workplaceType) return false;

        const [bx, bz] = building.position;
        const buildingPos = new THREE.Vector3(bx, 0, bz);
        const npcPos = new THREE.Vector3(...npc.position);
        const distance = buildingPos.distanceTo(npcPos);

        return distance <= npcType.workRadius;
      });

      return possibleWorkplaces.length > 0 ? possibleWorkplaces[0].id : null;
    },

    reserveResource: (npcId, resourceType, position) => {
      const state = get();

      if (state.isResourceReserved(resourceType, position)) {
        return false;
      }

      const now = Date.now();
      const filteredReservations = state.resourceReservations.filter(
        r => now - r.timestamp < CONSTANTS.RESERVATION_TIMEOUT
      );

      const newReservation: ResourceReservation = {
        resourcePosition: position,
        resourceType,
        npcId,
        timestamp: now
      };

      set({
        resourceReservations: [...filteredReservations, newReservation]
      });

      return true;
    },

    releaseResource: (npcId) => {
      const state = get();
      const filteredReservations = state.resourceReservations.filter(
        r => r.npcId !== npcId
      );

      set({ resourceReservations: filteredReservations });
    },

    isResourceReserved: (resourceType, position) => {
      const state = get();
      return NPCUtils.isResourceReservedByPosition(resourceType, position, state.resourceReservations);
    },
  }))
);