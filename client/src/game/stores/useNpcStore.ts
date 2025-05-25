import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { npcTypes, workplaceMapping } from "../constants/npcs";
import { useBuildingStore } from "./useBuildingStore";
import * as THREE from "three";

// Interface para um NPC no jogo
interface NPCNeeds {
  energy: number;
  satisfaction: number;
}

interface NPCMemory {
  lastVisitedPositions: Array<[number, number]>;
  knownResources: Array<{ type: string; position: [number, number] }>;
  failedAttempts: number;
}

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
}

interface NPCState {
  npcs: NPC[];
  npcIdCounter: number;

  // Métodos
  spawnNPC: (type: string, homeId: string, position: [number, number, number]) => string;
  removeNPC: (id: string) => void;
  updateNPCs: (deltaTime: number) => void;
  findWorkplace: (npcId: string) => string | null;
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

export const useNpcStore = create<NPCState>()(
  subscribeWithSelector((set, get) => ({
    npcs: [],
    npcIdCounter: 0,

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
          failedAttempts: 0
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

    updateNPCs: (deltaTime) => {
      const buildings = useBuildingStore.getState().buildings;
      const updatedNPCs: NPC[] = [];

      for (const npc of get().npcs) {
        let updatedNPC = { ...npc };

        // Lógica baseada no estado atual do NPC
        switch (npc.state) {
          case "idle": {
            console.log(`NPC ${npc.type} em estado idle, verificando ações possíveis`);

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
                // Filtra recursos disponíveis
                const availableResources = window.naturalResources.filter(r => {
                  const isCorrectType = r.type === resourceType;
                  const isNotCollected = !r.lastCollected;

                  // Verifica se não está sendo alvo de outro NPC
                  const isNotTargeted = !get().npcs.some(
                    other => other.id !== npc.id && 
                    other.targetResource?.position[0] === r.position[0] &&
                    other.targetResource?.position[1] === r.position[1]
                  );

                  return isCorrectType && isNotCollected && isNotTargeted;
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
                let nearestSilo = silos[0];
                let minDistance = Infinity;

                for (const silo of silos) {
                  const distance = Math.hypot(
                    silo.position[0] - npc.position[0],
                    silo.position[1] - npc.position[2]
                  );

                  if (distance < minDistance) {
                    minDistance = distance;
                    nearestSilo = silo;
                  }
                }

                // Ir para o centro do silo para melhor detecção
                updatedNPC.targetPosition = [nearestSilo.position[0] + 0.5, 0, nearestSilo.position[1] + 0.5];
                updatedNPC.targetBuildingId = nearestSilo.id;
                updatedNPC.targetResource = null;
                updatedNPC.state = "moving";
                console.log(`NPC ${npc.type} inventário cheio (${updatedNPC.inventory.amount} ${updatedNPC.inventory.type}), indo para silo ID:${nearestSilo.id} em [${nearestSilo.position[0]}, ${nearestSilo.position[1]}] - distância: ${minDistance.toFixed(2)}`);
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
              const moveSpeed = baseSpeed * deltaTime * 4; // Ajuste para movimento mais suave

              // Calcula direção
              const dx = targetX - currentX;
              const dz = targetZ - currentZ;
              const distance = Math.sqrt(dx * dx + dz * dz);

              // Reduz estamina ao se mover (ajustado para 90 minutos)
              updatedNPC.needs.energy = Math.max(0, updatedNPC.needs.energy - deltaTime * 0.0185);
              updatedNPC.needs.satisfaction = Math.max(0, updatedNPC.needs.satisfaction - deltaTime * 0.0093);

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
              updatedNPC.workProgress += deltaTime * 0.2; // 5 segundos para completar

              // Reduz estamina e satisfação durante o trabalho (consumo para 90 minutos)
              updatedNPC.needs.energy = Math.max(0, updatedNPC.needs.energy - deltaTime * 0.0185); // 0.0185 pontos por segundo (90 min)
              updatedNPC.needs.satisfaction = Math.max(0, updatedNPC.needs.satisfaction - deltaTime * 0.0093); // 0.0093 pontos por segundo (90 min)

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
              updatedNPC.workProgress += deltaTime * 0.67;

              // Reduz estamina e satisfação durante a coleta (ajustado para 90 minutos)
              updatedNPC.needs.energy = Math.max(0, updatedNPC.needs.energy - deltaTime * 0.0185);
              updatedNPC.needs.satisfaction = Math.max(0, updatedNPC.needs.satisfaction - deltaTime * 0.0093);

              if (updatedNPC.workProgress >= 1) {
                // Coletar recurso
                const resourceType = npc.type === "lumberjack" ? "wood" : "stone";

                if (updatedNPC.inventory.type === '' || updatedNPC.inventory.type === resourceType) {
                  updatedNPC.inventory.type = resourceType;
                  updatedNPC.inventory.amount += 1;
                  console.log(`${npc.type} coletou ${resourceType}. Inventário: ${updatedNPC.inventory.amount}/5 em ${updatedNPC.workProgress.toFixed(2)}s`);

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
            updatedNPC.needs.energy = Math.min(100, updatedNPC.needs.energy + deltaTime * 15); // 15 pontos por segundo
            updatedNPC.needs.satisfaction = Math.min(100, updatedNPC.needs.satisfaction + deltaTime * 10); // 10 pontos por segundo

            // Descansa até recuperar energia suficiente
            if (updatedNPC.needs.energy >= 80 && updatedNPC.needs.satisfaction >= 60) {
              updatedNPC.state = "idle";
              console.log(`NPC ${npc.type} descansou e voltou ao trabalho`);
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

      // Escolher o mais próximo ou aleatório
      if (possibleWorkplaces.length > 0) {
        return possibleWorkplaces[0].id;
      }

      return null;
    },
  }))
);