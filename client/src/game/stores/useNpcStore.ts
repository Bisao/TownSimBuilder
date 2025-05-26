import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { npcTypes } from "../constants/npcs";
import { useBuildingStore } from "./useBuildingStore";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

// Interface para um NPC no jogo
interface NPCNeeds {
  energy: number;
  satisfaction: number;
}

interface NPCSkills {
  gathering: number; // 0-100
  working: number;   // 0-100
  efficiency: number; // 0-100
  experience: number; // Total experience points
}

interface NPCMemory {
  lastVisitedPositions: Array<[number, number]>;
  knownResources: Array<{ type: string; position: [number, number] }>;
  failedAttempts: number;
  lastTaskCompletion: number;
  efficiency: number;
}

interface TaskPriority {
  type: "gather" | "deposit" | "work" | "rest";
  priority: number;
  resourceType?: string;
  targetPosition?: [number, number];
  buildingId?: string;
}

export type NPCSchedule = "home" | "working" | "lunch" | "traveling";

// Funções auxiliares para IA
function findUnexploredArea(visitedPositions: Array<[number, number]>): [number, number] {
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

function calculatePathRisk(start: [number, number], end: [number, number], npcs: NPC[]): number {
  const distance = Math.hypot(end[0] - start[0], end[1] - start[1]);
  const npcDensity = npcs.filter(npc => 
    Math.abs(npc.position[0] - start[0]) < 5 && 
    Math.abs(npc.position[2] - start[1]) < 5
  ).length;

  return distance * (1 + npcDensity * 0.2);
}

function calculateTaskPriority(npc: NPC, task: TaskPriority, currentTime: number): number {
  let priority = task.priority;

  // Modificadores baseados em necessidades
  if (task.type === "rest") {
    const energyModifier = (100 - npc.needs.energy) / 100;
    const satisfactionModifier = (100 - npc.needs.satisfaction) / 100;
    priority *= (1 + energyModifier + satisfactionModifier);
  }

  // Modificador de eficiência
  priority *= npc.memory.efficiency;

  // Modificador de tempo desde última tarefa
  const timeSinceLastTask = currentTime - npc.memory.lastTaskCompletion;
  if (timeSinceLastTask > 300000) { // 5 minutos
    priority *= 1.2;
  }

  return priority;
}

function getAvailableTasks(npc: NPC, buildings: any[], currentTime: number): TaskPriority[] {
  const tasks: TaskPriority[] = [];

  // Tarefa de descanso
  if (npc.needs.energy < 60 || npc.needs.satisfaction < 40) {
    tasks.push({
      type: "rest",
      priority: 100,
      buildingId: npc.homeId
    });
  }

  // Tarefa de depósito se inventário cheio
  if (npc.inventory.amount >= 5) {
    const silos = buildings.filter(b => b.type === 'silo');
    if (silos.length > 0) {
      tasks.push({
        type: "deposit",
        priority: 90,
        buildingId: silos[0].id
      });
    }
  }

  // Tarefas de coleta
  if (npc.inventory.amount < 5) {
    const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;
    if (resourceType && window.naturalResources) {
      const availableResources = window.naturalResources.filter(r => 
        r.type === resourceType && !r.lastCollected
      );
      
      if (availableResources.length > 0) {
        tasks.push({
          type: "gather",
          priority: 70,
          resourceType: resourceType
        });
      }
    }
  }

  return tasks;
}

  interface NPC {
  id: string;
  type: string;
  homeId: string;
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  targetBuildingId: string | null;
  targetResource: { type: string; position: [number, number] } | null;
  state: "idle" | "moving" | "working" | "gathering" | "resting" | "searching";
  workProgress: number;
  lastResourceTime: number;
  inventory: {
    type: string;
    amount: number;
  };
  needs: NPCNeeds;
  memory: NPCMemory;
  currentSchedule: NPCSchedule;
  name: string;
  skills: NPCSkills;
}

interface ResourceReservation {
  resourcePosition: [number, number];
  resourceType: string;
  npcId: string;
  timestamp: number;
}

interface NPCState {
  npcs: NPC[];
  npcIdCounter: number;
  resourceReservations: ResourceReservation[];

  // Métodos
  spawnNPC: (type: string, homeId: string, position: [number, number, number]) => string;
  removeNPC: (id: string) => void;
  updateNPCs: (deltaTime: number) => void;
  findWorkplace: (npcId: string) => string | null;
  reserveResource: (npcId: string, resourceType: string, position: [number, number]) => boolean;
  releaseResource: (npcId: string) => void;
  isResourceReserved: (resourceType: string, position: [number, number]) => boolean;
}

// Mock function to find nearest resource
// Replace with actual implementation
function findNearestResource(position: [number, number, number], resourceType: string): { type: string; position: [number, number] } | null {
  // Mock implementation: returns a resource if the NPC is close enough
  const [x, _, z] = position;
  if (Math.abs(x) < 10 && Math.abs(z) < 10) {
    return { type: resourceType, position: [5, 5] };
  }
  return null;
}

// Helper function to check if NPC should be working
const shouldBeWorking = (timeCycle: number): boolean => {
  const hours = timeCycle * 24;

  // Ciclo de trabalho:
  // 6h-12h: trabalhar (manhã)
  // 12h-13h: almoço em casa
  // 13h-18h: trabalhar (tarde)
  // 18h-6h: em casa
  return (hours >= 6 && hours < 12) || (hours >= 13 && hours < 18);
};

// Helper function to determine what NPCs should be doing based on time
const getScheduleForTime = (timeCycle: number, npcId?: string): NPCSchedule => {
  const hours = timeCycle * 24;
  
  // Sistema de turnos - alguns NPCs trabalham em horários diferentes
  const isNightShift = npcId ? parseInt(npcId.slice(-1), 16) % 3 === 0 : false;
  
  if (isNightShift) {
    // Turno noturno: 22h-6h trabalho, 6h-14h descanso, 14h-22h casa
    if (hours >= 22 || hours < 6) return "working";
    if (hours >= 6 && hours < 14) return "home";
    if (hours >= 14 && hours < 15) return "lunch";
    return "home";
  } else {
    // Turno diurno normal
    if (hours >= 6 && hours < 12) return "working";
    if (hours >= 12 && hours < 13) return "lunch";
    if (hours >= 13 && hours < 18) return "working";
    return "home";
  }
};

// Mapping de tipos de workplace para tipos de NPC
const workplaceMapping: Record<string, string> = {
  farm: "farmer",
  bakery: "baker",
  mine: "miner",
  lumberyard: "lumberjack"
};

const getDistance = (pos1: [number, number, number], pos2: [number, number, number]): number => {
  return Math.hypot(pos1[0] - pos2[0], pos1[2] - pos2[2]);
};

const findNearestNaturalResource = (npc: NPC, resourceType: string): [number, number] | null => {
    const naturalResources = (window as any).naturalResources;
    if (!naturalResources || !Array.isArray(naturalResources)) {
      console.log("window.naturalResources não está disponível ou não é um array");
      return null;
    }

    const availableResources = naturalResources.filter((r: any) => 
      r && r.type === resourceType && !r.lastCollected && r.position
    );

    if (availableResources.length === 0) {
      console.log(`Nenhum recurso ${resourceType} disponível`);
      return null;
    }

    let nearest = availableResources[0];
    let minDistance = getDistance(npc.position, [nearest.position[0], 0, nearest.position[1]]);

    for (const resource of availableResources) {
      if (resource && resource.position) {
        const distance = getDistance(npc.position, [resource.position[0], 0, resource.position[1]]);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = resource;
        }
      }
    }

    return nearest.position;
  };

export const useNpcStore = create<NPCState>()(
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
          gathering: 10 + Math.random() * 20, // 10-30 inicial
          working: 10 + Math.random() * 20,
          efficiency: 10 + Math.random() * 20,
          experience: 0
        }
      };

      set((state) => ({
        npcs: [...state.npcs, newNPC],
        npcIdCounter: state.npcIdCounter + 1,
      }));

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

    // Se o jogo estiver pausado, não atualizar NPCs
    if (isPaused) return;

    // Aplicar multiplicador de velocidade
    const adjustedDeltaTime = deltaTime * timeSpeed;

      const buildings = useBuildingStore.getState().buildings;
      const updatedNPCs: NPC[] = [];

      // Determinar o horário atual
      const currentSchedule = getScheduleForTime(timeCycle);

      for (const npc of get().npcs) {
        let updatedNPC = { ...npc };

        // Atualizar o horário atual do NPC
        updatedNPC.currentSchedule = currentSchedule;

        // Verificar se NPC deve estar em casa (almoço ou noite)
        if (currentSchedule === "lunch" || currentSchedule === "home") {
          const home = buildings.find(b => b.id === npc.homeId);
          if (home) {
            const distanceToHome = Math.hypot(
              home.position[0] - npc.position[0],
              home.position[1] - npc.position[2]
            );

            // Se não está em casa e deveria estar, vai para casa
            if (distanceToHome > 1.0 && npc.state !== "moving") {
              console.log(`NPC ${npc.type} indo para casa - horário: ${currentSchedule}`);
              updatedNPC.targetPosition = [home.position[0], 0, home.position[1]];
              updatedNPC.targetBuildingId = null;
              updatedNPC.targetResource = null;
              updatedNPC.state = "moving";
              updatedNPCs.push(updatedNPC);
              continue;
            }

            // Se está em casa, descansa
            if (distanceToHome <= 1.0 && npc.state !== "resting") {
              updatedNPC.state = "resting";
              updatedNPC.targetPosition = null;
              updatedNPC.targetBuildingId = null;
              updatedNPC.targetResource = null;
              console.log(`NPC ${npc.type} descansando em casa - horário: ${currentSchedule}`);
            }
          }
        }

        // Lógica baseada no estado atual do NPC
        switch (npc.state) {
          case "idle": {
            console.log(`NPC ${npc.type} em estado idle, verificando ações possíveis - horário: ${currentSchedule}`);

            // Se não é horário de trabalho, vai para casa
            if (currentSchedule !== "working") {
              const home = buildings.find(b => b.id === npc.homeId);
              if (home) {
                updatedNPC.targetPosition = [home.position[0], 0, home.position[1]];
                updatedNPC.targetBuildingId = null;
                updatedNPC.targetResource = null;
                updatedNPC.state = "moving";
                console.log(`NPC ${npc.type} voltando para casa - horário: ${currentSchedule}`);
                break;
              }
            }

            // Verifica se precisa descansar primeiro
            if (updatedNPC.needs.energy < 30) {
              const home = buildings.find(b => b.id === npc.homeId);
              if (home) {
                updatedNPC.targetPosition = [home.position[0], 0, home.position[1]];
                updatedNPC.targetBuildingId = null;
                updatedNPC.targetResource = null;
                updatedNPC.state = "moving";
                console.log(`NPC ${npc.type} está cansado e voltando para casa`);
                break;
              }
            }

            // Verifica se tem espaço no inventário para coletar
            const hasSpaceInInventory = updatedNPC.inventory.amount < 5;

            if (hasSpaceInInventory) {
              // Procura por recursos para coletar
              const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;

              if (resourceType && window.naturalResources) {
                // Filtra recursos disponíveis com sistema de reserva
                const availableResources = window.naturalResources.filter(r => {
                  const isCorrectType = r.type === resourceType;
                  const isNotCollected = !r.lastCollected;

                  // Verifica se não está sendo alvo de outro NPC
                  const isNotTargeted = !get().npcs.some(
                    other => other.id !== npc.id && 
                    other.targetResource?.position[0] === r.position[0] &&
                    other.targetResource?.position[1] === r.position[1]
                  );

                  // Verifica se não está reservado
                  const isNotReserved = !get().isResourceReserved(resourceType, r.position);

                  return isCorrectType && isNotCollected && isNotTargeted && isNotReserved;
                });

                if (availableResources.length > 0) {
                  // Prioriza recursos mais próximos mas evita super concentração
                  let bestResource = null;
                  let bestScore = -1;

                  for (const resource of availableResources) {
                    const dist = Math.hypot(
                      resource.position[0] - npc.position[0],
                      resource.position[1] - npc.position[2]
                    );

                    // Conta quantos NPCs estão próximos a este recurso
                    const nearbyNpcs = get().npcs.filter(otherNpc => 
                      otherNpc.id !== npc.id &&
                      Math.hypot(
                        resource.position[0] - otherNpc.position[0],
                        resource.position[1] - otherNpc.position[2]
                      ) < 3
                    ).length;

                    // Score baseado na distância e densidade de NPCs
                    const score = (100 / (dist + 1)) * (1 / (nearbyNpcs + 1));

                    if (score > bestScore) {
                      bestScore = score;
                      bestResource = resource;
                    }
                  }

                  if (bestResource) {
                    // Reserva o recurso
                    const reserved = get().reserveResource(npc.id, resourceType, bestResource.position);
                    
                    if (reserved) {
                      // Define o recurso como alvo e muda para estado de movimento
                      updatedNPC.targetResource = bestResource;
                      updatedNPC.targetPosition = [bestResource.position[0], 0, bestResource.position[1]];
                      updatedNPC.targetBuildingId = null;
                      updatedNPC.state = "moving";

                    const distance = Math.hypot(
                      bestResource.position[0] - npc.position[0],
                      bestResource.position[1] - npc.position[2]
                    );
                    console.log(`NPC ${npc.type} indo para recurso ${resourceType} em [${bestResource.position[0]}, ${bestResource.position[1]}] - distância: ${distance.toFixed(2)}`);
                  }
                } else {
                  // Se não encontrar recursos, entra em modo de busca
                  updatedNPC.state = "searching";
                  console.log(`NPC ${npc.type} não encontrou recursos ${resourceType}, entrando em modo de busca`);
                }
              } else if (!resourceType) {
                // NPCs que não coletam recursos (farmer, baker) procuram trabalho
                const workplace = get().findWorkplace(npc.id);
                if (workplace) {
                  const workplaceBuilding = buildings.find(b => b.id === workplace);
                  if (workplaceBuilding) {
                    updatedNPC.targetPosition = [workplaceBuilding.position[0] + 0.5, 0, workplaceBuilding.position[1] + 0.5];
                    updatedNPC.targetBuildingId = workplace;
                    updatedNPC.targetResource = null;
                    updatedNPC.state = "moving";
                    console.log(`NPC ${npc.type} indo trabalhar em ${workplaceBuilding.type}`);
                  }
                }
              }
            } else {
              // Inventário cheio - procura silo para depositar
              console.log(`NPC ${npc.type} inventário cheio (${updatedNPC.inventory.amount}/5), procurando silo`);
              const silos = buildings.filter(b => b.type === 'silo');

              if (silos.length > 0) {
                // Encontra o silo mais próximo que não está sendo usado por muitos NPCs
                let bestSilo = null;
                let bestScore = -1;

                for (const silo of silos) {
                  const distance = Math.hypot(
                    silo.position[0] - npc.position[0],
                    silo.position[1] - npc.position[2]
                  );

                  // Conta NPCs próximos ao silo
                  const nearbyNpcs = get().npcs.filter(otherNpc => 
                    otherNpc.id !== npc.id &&
                    otherNpc.targetBuildingId === silo.id
                  ).length;

                  // Score baseado na distância e uso do silo
                  const score = (100 / (distance + 1)) * (1 / (nearbyNpcs + 1));

                  if (score > bestScore) {
                    bestScore = score;
                    bestSilo = silo;
                  }
                }

                if (bestSilo) {
                  // Ir para o centro do silo para melhor detecção
                  updatedNPC.targetPosition = [bestSilo.position[0] + 0.5, 0, bestSilo.position[1] + 0.5];
                  updatedNPC.targetBuildingId = bestSilo.id;
                  updatedNPC.targetResource = null;
                  updatedNPC.state = "moving";
                  
                  const distance = Math.hypot(
                    bestSilo.position[0] - npc.position[0],
                    bestSilo.position[1] - npc.position[2]
                  );
                  console.log(`NPC ${npc.type} inventário cheio (${updatedNPC.inventory.amount} ${updatedNPC.inventory.type}), indo para silo otimizado ID:${bestSilo.id} em [${bestSilo.position[0]}, ${bestSilo.position[1]}] - distância: ${distance.toFixed(2)}`);
                }
              } else {
                console.warn(`NPC ${npc.type} não encontrou silos para depositar recursos`);
                // Se não encontrar silo, fica parado
                updatedNPC.state = "idle";
              }
            }
            break;
          }

            // Todos os NPCs procuram recursos se tiverem espaço no inventário
            if ((npc.type === "lumberjack" || npc.type === "miner") && hasSpaceInInventory) {
              const resourceMapping = {
                "lumberjack": "wood",
                "miner": "stone"
              };
              const resourceType = resourceMapping[npc.type];

              // Buscar recurso mais próximo no grid
              // Pega o tipo de NPC para definir raio de trabalho
              const npcConfig = npcTypes[npc.type];
              // Busca todos os recursos do tipo correto em todo o grid
              const resources = window.naturalResources?.filter(r => {
                // Verifica tipo e status do recurso
                const isCorrectType = r.type === resourceType;
                const isNotCollected = !r.lastCollected;

                // Verifica se não está sendo coletado por outro NPC
                const isNotTargeted = !get().npcs.some(
                  other => other.id !== npc.id && 
                  other.targetResource?.position[0] === r.position[0] &&
                  other.targetResource?.position[1] === r.position[1]
                );

                return isCorrectType && isNotCollected && isNotTargeted;
              }) || [];

              let nearestResource = null;
              let minDistance = Infinity;

              for (const resource of resources) {
                const distance = Math.hypot(
                  resource.position[0] - npc.position[0],
                  resource.position[1] - npc.position[2]
                );

                if (distance < minDistance) {
                  minDistance = distance;
                  nearestResource = resource;
                }
              }

              if (nearestResource) {
                console.log(`NPC ${npc.type} encontrou recurso em [${nearestResource.position}]`);
                updatedNPC.targetResource = nearestResource;
                updatedNPC.targetPosition = [nearestResource.position[0], 0, nearestResource.position[1]];
                updatedNPC.state = "moving";
              } else {
                // Se não encontrar recurso, move-se aleatoriamente
                if (Math.random() < 0.01) {
                  const randomX = npc.position[0] + (Math.random() * 10 - 5);
                  const randomZ = npc.position[2] + (Math.random() * 10 - 5);
                  updatedNPC.targetPosition = [randomX, 0, randomZ];
                  updatedNPC.state = "moving";
                }
              }
            } else if (!npc.targetBuildingId) {
              const workplace = get().findWorkplace(npc.id);
              if (workplace) {
                const workplaceBuilding = buildings.find(b => b.id === workplace);
                if (workplaceBuilding) {
                  // Encontrar posição do edifício alvo
                  const [bx, bz] = workplaceBuilding.position;
                  updatedNPC.targetPosition = [bx + 0.5, 0, bz + 0.5];
                  updatedNPC.targetBuildingId = workplace;
                  updatedNPC.state = "moving";
                }
              } else {
                // Se não encontrar trabalho, mova-se aleatoriamente
                if (Math.random() < 0.01) { // 1% de chance por frame
                  const randomX = npc.position[0] + (Math.random() * 10 - 5);
                  const randomZ = npc.position[2] + (Math.random() * 10 - 5);
                  updatedNPC.targetPosition = [randomX, 0, randomZ];
                  updatedNPC.state = "moving";
                }
              }
            }
            break;

          case "searching":
            // Explora o mapa procurando por recursos
            const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;

            if (resourceType && window.naturalResources) {
              console.log(`NPC ${npc.type} explorando mapa em busca de ${resourceType}. Recursos totais: ${window.naturalResources.length}`);

              const availableResources = window.naturalResources.filter(r => {
                const isCorrectType = r.type === resourceType;
                const isNotCollected = !r.lastCollected;

                const isNotTargeted = !get().npcs.some(
                  other => other.id !== npc.id && 
                  other.targetResource?.position[0] === r.position[0] &&
                  other.targetResource?.position[1] === r.position[1]
                );

                return isCorrectType && isNotCollected && isNotTargeted;
              });

              console.log(`NPC ${npc.type} encontrou ${availableResources.length} recursos disponíveis durante busca`);

              if (availableResources.length > 0) {
                // Encontrou recurso - vai para ele
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

                updatedNPC.targetResource = nearest;
                updatedNPC.targetPosition = [nearest.position[0], 0, nearest.position[1]];
                updatedNPC.state = "moving";
                console.log(`NPC ${npc.type} encontrou recurso durante busca em [${nearest.position[0]}, ${nearest.position[1]}]`);
              } else {
                // Não encontrou recursos - move para área aleatória
                const newX = Math.floor(Math.random() * 40);
                const newZ = Math.floor(Math.random() * 40);

                updatedNPC.targetPosition = [newX, 0, newZ];
                updatedNPC.state = "moving";
                console.log(`NPC ${npc.type} movendo para área aleatória [${newX}, ${newZ}] durante busca`);
              }
            } else {
              // Volta para idle se não conseguir buscar
              updatedNPC.state = "idle";
            }
            break;

          case "moving":
            if (npc.targetPosition) {
              const targetX = npc.targetPosition[0];
              const targetZ = npc.targetPosition[2];
              const currentX = npc.position[0];
              const currentZ = npc.position[2];

              // Velocidade de movimento baseada no tipo de NPC
              const npcConfig = npcTypes[npc.type];
              const baseSpeed = npcConfig ? npcConfig.speed : 0.5;
              const moveSpeed = baseSpeed * adjustedDeltaTime * 4; // Ajuste para movimento mais suave

              // Calcula direção
              const dx = targetX - currentX;
              const dz = targetZ - currentZ;
              const distance = Math.sqrt(dx * dx + dz * dz);

              // Reduz estamina ao se mover (ajustado para 90 minutos)
              updatedNPC.needs.energy = Math.max(0, updatedNPC.needs.energy - adjustedDeltaTime * 0.0185);
              updatedNPC.needs.satisfaction = Math.max(0, updatedNPC.needs.satisfaction - adjustedDeltaTime * 0.0093);

              // Verificar se já chegou ao destino (tolerância de 0.15 para melhor detecção)
              if (distance < 0.15) {
                updatedNPC.position = [targetX, 0, targetZ];
                updatedNPC.targetPosition = null;

                console.log(`NPC ${npc.type} chegou ao destino [${targetX.toFixed(1)}, ${targetZ.toFixed(1)}]`);

                // Verificar o que fazer no destino
                if (npc.targetResource) {
                  // Chegou ao recurso - começar a coletar
                  updatedNPC.state = "gathering";
                  updatedNPC.workProgress = 0;
                  console.log(`NPC ${npc.type} começando a coletar recurso`);
                } else if (npc.inventory.amount > 0 && npc.targetBuildingId) {
                  // Verificar se chegou ao silo para depositar recursos
                  const silo = buildings.find(b => 
                    b.id === npc.targetBuildingId && 
                    b.type === 'silo'
                  );

                  if (silo) {
                    // Depositar recursos no silo
                    const depositedAmount = updatedNPC.inventory.amount;
                    const depositedType = updatedNPC.inventory.type;

                    // Importar dinamicamente o store para evitar dependência circular
                    import('./useResourceStore').then(({ useResourceStore }) => {
                      const resourceStore = useResourceStore.getState();
                      resourceStore.updateResource(depositedType, depositedAmount);
                      console.log(`NPC ${npc.type} depositou ${depositedAmount} ${depositedType} no silo (recursos atualizados)`);
                    });

                    // Limpar inventário e alvo
                    updatedNPC.inventory = { type: '', amount: 0 };
                    updatedNPC.targetBuildingId = null;
                    updatedNPC.state = "idle";
                    console.log(`NPC ${npc.type} depositou ${depositedAmount} ${depositedType} e esvaziou inventário no silo`);
                  } else {
                    console.warn(`NPC ${npc.type} não encontrou silo alvo ID: ${npc.targetBuildingId}`);
                    updatedNPC.targetBuildingId = null;
                    updatedNPC.state = "idle";
                  }
                } else if (npc.targetBuildingId) {
                  // Chegou ao local de trabalho (não silo)
                  const workBuilding = buildings.find(b => b.id === npc.targetBuildingId);
                  if (workBuilding && workBuilding.type !== 'silo') {
                    updatedNPC.state = "working";
                    updatedNPC.workProgress = 0;
                    console.log(`NPC ${npc.type} começando a trabalhar em ${workBuilding.type}`);
                  } else {
                    updatedNPC.state = "idle";
                    updatedNPC.targetBuildingId = null;
                  }
                } else {
                  // Chegou em casa ou outro local para descansar
                  const home = buildings.find(b => 
                    b.id === npc.homeId && 
                    Math.abs(b.position[0] - targetX) < 1.0 && 
                    Math.abs(b.position[1] - targetZ) < 1.0
                  );

                  if (home && (updatedNPC.needs.energy < 80 || updatedNPC.needs.satisfaction < 60)) {
                    updatedNPC.state = "resting";
                    console.log(`NPC ${npc.type} chegou em casa e começou a descansar`);
                  } else {
                    updatedNPC.state = "idle";
                  }
                }
              } else {
                // Movimento suave interpolado
                const dirX = dx / distance;
                const dirZ = dz / distance;

                const newX = currentX + dirX * moveSpeed;
                const newZ = currentZ + dirZ * moveSpeed;

                // Validar limites do mapa
                const clampedX = Math.max(0, Math.min(newX, 39));
                const clampedZ = Math.max(0, Math.min(newZ, 39));

                updatedNPC.position = [clampedX, 0, clampedZ];
              }
            } else {
              updatedNPC.state = "idle";
            }
            break;

          case "working":
            if (npc.targetBuildingId) {
              // Progresso do trabalho
              updatedNPC.workProgress += adjustedDeltaTime * 0.2; // 5 segundos para completar

              // Reduz estamina e satisfação durante o trabalho (consumo para 90 minutos)
              updatedNPC.needs.energy = Math.max(0, updatedNPC.needs.energy - adjustedDeltaTime * 0.0185); // 0.0185 pontos por segundo (90 min)
              updatedNPC.needs.satisfaction = Math.max(0, updatedNPC.needs.satisfaction - adjustedDeltaTime * 0.0093); // 0.0093 pontos por segundo (90 min)

              if (updatedNPC.workProgress >= 1) {
                // Trabalho concluído - aumenta a produção do edifício
                // Código para melhorar a produção será implementado aqui

                // Voltar para casa ou procurar outro trabalho
                updatedNPC.workProgress = 0;

                // 50% de chance de voltar para casa ou continuar trabalhando
                if (Math.random() < 0.5) {
                  const home = buildings.find(b => b.id === npc.homeId);
                  if (home) {
                    const [hx, hz] = home.position;
                    updatedNPC.targetPosition = [hx + 0.5, 0, hz + 0.5];
                    updatedNPC.targetBuildingId = null;
                    updatedNPC.state = "moving";
                  } else {
                    updatedNPC.state = "idle";
                  }
                } else {
                  // Continuar trabalhando
                  updatedNPC.workProgress = 0;
                }
              }
            } else {
              updatedNPC.state = "idle";
            }
            break;

          case "gathering":
            if (npc.targetResource) {
              // Verifica se o inventário está cheio
              if (updatedNPC.inventory.amount >= 5) {
                console.log(`NPC ${npc.type} inventário cheio, procurando silo`);
                updatedNPC.targetResource = null;
                updatedNPC.workProgress = 0;
                updatedNPC.state = "idle";
                break;
              }

              // Verifica se o recurso ainda existe e não foi coletado
              if (window.naturalResources && npc.targetResource) {
                const resourceExists = window.naturalResources.find(r => 
                  r.position[0] === npc.targetResource.position[0] &&
                  r.position[1] === npc.targetResource.position[1] &&
                  r.type === npc.targetResource.type &&
                  !r.lastCollected
                );

                if (!resourceExists) {
                  console.log(`NPC ${npc.type} recurso não existe mais ou foi coletado por outro NPC`);
                  updatedNPC.targetResource = null;
                  updatedNPC.workProgress = 0;
                  updatedNPC.state = "idle";
                  break;
                }
              }

              // Verifica distância ao recurso (mais tolerante)
              const distanceToResource = Math.hypot(
                npc.targetResource.position[0] - npc.position[0],
                npc.targetResource.position[1] - npc.position[2]
              );

              // Se estiver muito longe, move para mais perto mas não reseta progresso se já começou
              if (distanceToResource > 1.5) {
                console.log(`NPC ${npc.type} muito longe do recurso (${distanceToResource.toFixed(2)}), reposicionando`);
                updatedNPC.targetPosition = [npc.targetResource.position[0], 0, npc.targetResource.position[1]];
                updatedNPC.state = "moving";
                // Não reseta workProgress se já estava coletando
                break;
              }

              // Progresso da coleta - 1.5 segundos para coletar (mais rápido)
              updatedNPC.workProgress += adjustedDeltaTime * 0.67;

              // Reduz estamina e satisfação durante a coleta (ajustado para 90 minutos)
              updatedNPC.needs.energy = Math.max(0, updatedNPC.needs.energy - adjustedDeltaTime * 0.0185);
              updatedNPC.needs.satisfaction = Math.max(0, updatedNPC.needs.satisfaction - adjustedDeltaTime * 0.0093);

              if (updatedNPC.workProgress >= 1) {
                // Coletar recurso
                const resourceType = npc.type === "lumberjack" ? "wood" : "stone";

                if (updatedNPC.inventory.type === '' || updatedNPC.inventory.type === resourceType) {
                  updatedNPC.inventory.type = resourceType;
                  updatedNPC.inventory.amount += 1;
                  
                  // Ganhar experiência e melhorar habilidades
                  updatedNPC.skills.experience += 1;
                  updatedNPC.skills.gathering = Math.min(100, updatedNPC.skills.gathering + 0.1);
                  updatedNPC.skills.efficiency = Math.min(100, updatedNPC.skills.efficiency + 0.05);
                  updatedNPC.memory.efficiency = 1 + (updatedNPC.skills.efficiency / 100);
                  updatedNPC.memory.lastTaskCompletion = Date.now();
                  
                  // Liberar reserva do recurso
                  get().releaseResource(npc.id);
                  
                  // Atualizar métricas (importação dinâmica para evitar dependência circular)
                  import('./useNpcMetrics').then(({ useNpcMetrics }) => {
                    useNpcMetrics.getState().updateMetrics(npc.id, "collect", resourceType);
                  }).catch(() => {
                    // Fallback se não conseguir importar
                    console.log("Métricas não disponíveis");
                  });
                  
                  console.log(`${npc.type} coletou ${resourceType}. Inventário: ${updatedNPC.inventory.amount}/5 - XP: ${updatedNPC.skills.experience} - Eficiência: ${updatedNPC.skills.efficiency.toFixed(1)}`);

                  // Marca o recurso como coletado
                  if (window.naturalResources && npc.targetResource) {
                    const resourceIndex = window.naturalResources.findIndex(r => 
                      r.position[0] === npc.targetResource.position[0] &&
                      r.position[1] === npc.targetResource.position[1] &&
                      r.type === npc.targetResource.type
                    );

                    if (resourceIndex !== -1) {
                      window.naturalResources[resourceIndex].lastCollected = Date.now();
                      console.log(`Recurso ${resourceType} coletado na posição [${npc.targetResource.position[0]}, ${npc.targetResource.position[1]}] - respawn em 5 minutos`);
                    }
                  }

                  // Limpa o alvo e volta para idle imediatamente
                  updatedNPC.targetResource = null;
                  updatedNPC.workProgress = 0;
                  updatedNPC.state = "idle";
                } else {
                  console.warn(`NPC ${npc.type} tentou coletar ${resourceType} mas inventário contém ${updatedNPC.inventory.type}`);
                  updatedNPC.targetResource = null;
                  updatedNPC.workProgress = 0;
                  updatedNPC.state = "idle";
                }
              }
            } else {
              updatedNPC.state = "idle";
            }
            break;

          case "resting":
            // Regenera energia e satisfação quando em casa
            updatedNPC.needs.energy = Math.min(100, updatedNPC.needs.energy + adjustedDeltaTime * 15); // 15 pontos por segundo
            updatedNPC.needs.satisfaction = Math.min(100, updatedNPC.needs.satisfaction + adjustedDeltaTime * 10); // 10 pontos por segundo

            // Se é horário de trabalho e tem energia suficiente, volta ao trabalho
            if (currentSchedule === "working" && updatedNPC.needs.energy >= 80 && updatedNPC.needs.satisfaction >= 60) {
              updatedNPC.state = "idle";
              console.log(`NPC ${npc.type} descansou e voltou ao trabalho - horário: ${currentSchedule}`);
            }
            // Se não é horário de trabalho, continua descansando
            else if (currentSchedule !== "working") {
              console.log(`NPC ${npc.type} descansando em casa - horário: ${currentSchedule}`);
            }
            break;
        }

        // Verifica se precisa voltar para casa para descansar
        if (updatedNPC.state !== "resting" && updatedNPC.state !== "moving" && 
            (updatedNPC.needs.energy < 20 || updatedNPC.needs.satisfaction < 20)) {
          const home = buildings.find(b => b.id === npc.homeId);
          if (home) {
            updatedNPC.targetPosition = [home.position[0], 0, home.position[1]];
            updatedNPC.state = "moving";
            updatedNPC.targetResource = null;
            updatedNPC.targetBuildingId = null;
            console.log(`NPC ${npc.type} voltando para casa para descansar (energia: ${updatedNPC.needs.energy.toFixed(1)}, satisfação: ${updatedNPC.needs.satisfaction.toFixed(1)})`);
          }
        }

        // Se chegou em casa, entra em modo de descanso
        if (updatedNPC.state === "idle" && buildings.find(b => 
          b.id === npc.homeId && 
          Math.abs(b.position[0] - updatedNPC.position[0]) < 0.5 && 
          Math.abs(b.position[1] - updatedNPC.position[2]) < 0.5
        ) && (updatedNPC.needs.energy < 80 || updatedNPC.needs.satisfaction < 60)) {
          updatedNPC.state = "resting";
          console.log(`NPC ${npc.type} começou a descansar em casa`);
        }

        updatedNPCs.push(updatedNPC);
      }

      if (updatedNPCs.some((npc, i) => npc.position !== get().npcs[i].position || npc.state !== get().npcs[i].state)) {
        set({ npcs: updatedNPCs });
      }
    },

    findWorkplace: (npcId) => {
      const npc = get().npcs.find(n => n.id === npcId);
      if (!npc) return null;

      const buildings = useBuildingStore.getState().buildings;
      const npcType = npcTypes[npc.type];

      // Encontrar o tipo de edifício adequado para este NPC
      const workplaceType = Object.entries(workplaceMapping).find(([_, npcTypeId]) => npcTypeId === npc.type)?.[0];
      if (!workplaceType) return null;

      // Encontrar edifícios do tipo correto dentro do raio de trabalho
      const possibleWorkplaces = buildings.filter(building => {
        if (building.type !== workplaceType) return false;

        // Verificar se está dentro do raio de trabalho
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
      
      // Verifica se já está reservado
      if (state.isResourceReserved(resourceType, position)) {
        return false;
      }

      // Remove reservas antigas (mais de 10 minutos)
      const now = Date.now();
      const filteredReservations = state.resourceReservations.filter(
        r => now - r.timestamp < 600000
      );

      // Adiciona nova reserva
      const newReservation: ResourceReservation = {
        resourcePosition: position,
        resourceType,
        npcId,
        timestamp: now
      };

      set({
        resourceReservations: [...filteredReservations, newReservation]
      });

      console.log(`Recurso ${resourceType} em [${position[0]}, ${position[1]}] reservado por NPC ${npcId}`);
      return true;
    },

    releaseResource: (npcId) => {
      const state = get();
      const filteredReservations = state.resourceReservations.filter(
        r => r.npcId !== npcId
      );
      
      set({ resourceReservations: filteredReservations });
      console.log(`Reservas liberadas para NPC ${npcId}`);
    },

    isResourceReserved: (resourceType, position) => {
      const state = get();
      const now = Date.now();
      
      return state.resourceReservations.some(r => 
        r.resourceType === resourceType &&
        r.resourcePosition[0] === position[0] &&
        r.resourcePosition[1] === position[1] &&
        now - r.timestamp < 600000 // 10 minutos
      );
    },
  }))
);