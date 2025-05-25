import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { npcTypes, workplaceMapping } from "../constants/npcs";
import { useBuildingStore } from "./useBuildingStore";
import * as THREE from "three";

// Interface para um NPC no jogo
interface NPC {
  id: string;
  type: string;
  homeId: string;
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  targetBuildingId: string | null;
  targetResource: { type: string; position: [number, number] } | null;
  state: "idle" | "moving" | "working" | "gathering";
  workProgress: number;
  lastResourceTime: number;
  inventory: {
    type: string;
    amount: number;
  };
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
          case "idle":
            // Verificar se existe silo e se o inventário não está cheio
            const hasSilo = useBuildingStore.getState().buildings.some(b => b.type === 'silo');
            const hasSpaceInInventory = updatedNPC.inventory.amount < 5;

            // Verificar se existem recursos disponíveis para coleta
            const hasAvailableResources = window.naturalResources?.some(r => {
              const isMatchingType = (npc.type === "lumberjack" && r.type === "wood") || 
                                   (npc.type === "miner" && r.type === "stone");
              return isMatchingType && !r.lastCollected;
            });

            // Todos os NPCs procuram recursos se tiverem espaço no inventário
            if ((npc.type === "lumberjack" || npc.type === "miner") && hasSpaceInInventory) {
              // Definir tipo de recurso baseado no tipo do NPC
              const resourceMapping = {
                "lumberjack": "wood",
                "miner": "stone"
              };
              const resourceType = resourceMapping[npc.type];

              // Buscar recurso mais próximo do grid
              const resources = window.naturalResources?.filter(r => {
                const isCorrectType = r.type === resourceType;
                const isNotCollected = !r.lastCollected;
                const distance = Math.hypot(
                  r.position[0] - npc.position[0],
                  r.position[1] - npc.position[2]
                );
                const isNearHome = distance < 15; // Busca recursos em um raio de 15 unidades
                
                console.log(`NPC ${npc.type} procurando - Recurso: ${r.type}, Posição: [${r.position}], Distância: ${distance.toFixed(2)}`);
                return isCorrectType && isNotCollected && isNearHome;
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

          case "moving":
            if (npc.targetPosition) {
              // Calcular direção e distância para o alvo
              const currentPos = new THREE.Vector3(...npc.position);
              const targetPos = new THREE.Vector3(...npc.targetPosition);
              const direction = new THREE.Vector3()
                .subVectors(targetPos, currentPos)
                .normalize();

              const distance = currentPos.distanceTo(targetPos);
              const npcSpeed = npcTypes[npc.type]?.speed || 0.5;

              if (distance > 0.2) {
                // Mover em direção ao alvo
                const newX = npc.position[0] + direction.x * npcSpeed * deltaTime;
                const newZ = npc.position[2] + direction.z * npcSpeed * deltaTime;

                // Limitar movimento ao grid (assumindo grid 40x40)
                const clampedX = Math.max(0, Math.min(newX, 39));
                const clampedZ = Math.max(0, Math.min(newZ, 39));

                updatedNPC.position = [clampedX, 0, clampedZ];
              } else {
                // Chegou ao destino
                updatedNPC.position = [...npc.targetPosition];
                updatedNPC.targetPosition = null;

                if (npc.inventory.amount >= 5) {
                  // Depositar recurso no silo
                  const resourceType = npc.type === "lumberjack" ? "wood" : "stone";
                  const resourceStore = useResourceStore.getState();
                  const storageCapacity = resourceStore.getStorageCapacity();
                  const currentAmount = resourceStore.resources[resourceType] || 0;

                  // Verificar se há espaço no armazenamento
                  if (currentAmount < storageCapacity) {
                    resourceStore.updateResource(resourceType, npc.inventory.amount);
                    console.log(`Depositando ${resourceType} no silo. Novo total: ${currentAmount + npc.inventory.amount}`);
                    updatedNPC.inventory = { type: '', amount: 0 }; // Limpa o inventário após depositar
                  }

                  updatedNPC.state = "idle";
                } else if (npc.targetResource) {
                  // Começar a coletar o recurso
                  updatedNPC.state = "gathering";
                  updatedNPC.workProgress = 0;
                } else if (npc.targetBuildingId) {
                  updatedNPC.state = "working";
                  updatedNPC.workProgress = 0;
                } else {
                  updatedNPC.state = "idle";
                }
              }
            } else {
              updatedNPC.state = "idle";
            }
            break;

          case "working":
            if (npc.targetBuildingId) {
              // Progresso do trabalho
              updatedNPC.workProgress += deltaTime * 0.1; // 10 segundos para completar

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
              // Verifica se o inventário está cheio antes de coletar
              if (updatedNPC.inventory.amount >= 5) {
                // Procura o silo mais próximo
                const buildings = useBuildingStore.getState().buildings;
                const silos = buildings.filter(b => b.type === 'silo');
                
                if (silos.length > 0) {
                  // Encontra o silo mais próximo
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
                  
                  // Ir até o silo
                  updatedNPC.targetPosition = [nearestSilo.position[0] + 0.5, 0, nearestSilo.position[1] + 0.5];
                  updatedNPC.state = "moving";
                  updatedNPC.workProgress = 0;
                  return;
                }
              }

              updatedNPC.workProgress += deltaTime * 0.2; // 5 segundos para coletar

              if (updatedNPC.workProgress >= 1) {
                // Definir tipo de recurso baseado no tipo do NPC
                const resourceMapping = {
                  "lumberjack": "wood",
                  "miner": "stone"
                };
                const resourceType = resourceMapping[npc.type];

                // Atualiza o inventário do NPC
                if (updatedNPC.inventory.type === '' || updatedNPC.inventory.type === resourceType) {
                  updatedNPC.inventory.type = resourceType;
                  updatedNPC.inventory.amount += 1;
                  console.log(`${npc.type} coletou ${resourceType}. Inventário: ${updatedNPC.inventory.amount}/${5}`);
                }

                // Remove o recurso do array naturalResources
                if (window.naturalResources) {
                  const resourceIndex = window.naturalResources.findIndex(
                    r => r.position[0] === npc.targetResource?.position[0] &&
                         r.position[1] === npc.targetResource?.position[1] &&
                         !r.lastCollected &&
                         ((npc.type === "lumberjack" && r.type === "wood") ||
                          (npc.type === "miner" && r.type === "stone"))
                  );

                  // Debug log
                  console.log(`Tentando coletar recurso. NPC: ${npc.type}, Posição: [${npc.targetResource?.position}]`);
                  if (resourceIndex !== -1) {
                    window.naturalResources.splice(resourceIndex, 1);
                    console.log(`Recurso removido em [${npc.targetResource.position}]`);
                  }
                }

                // Verifica se chegou em um silo para depositar recursos
                const buildings = useBuildingStore.getState().buildings;
                const nearestSilo = buildings.find(b => 
                  b.type === 'silo' && 
                  Math.hypot(
                    b.position[0] - npc.position[0],
                    b.position[1] - npc.position[2]
                  ) < 1
                );

                if (nearestSilo && updatedNPC.inventory.amount > 0) {
                  // Deposita recursos no silo
                  const resourceStore = useResourceStore.getState();
                  resourceStore.updateResource(updatedNPC.inventory.type, updatedNPC.inventory.amount);
                  console.log(`${npc.type} depositou ${updatedNPC.inventory.amount} ${updatedNPC.inventory.type} no silo`);
                  
                  // Limpa o inventário
                  updatedNPC.inventory = { type: '', amount: 0 };
                  updatedNPC.targetResource = null;
                  updatedNPC.workProgress = 0;
                  updatedNPC.state = "idle";
                } else {
                  // Continua coletando se não estiver cheio
                  updatedNPC.targetResource = null;
                  updatedNPC.workProgress = 0;
                  updatedNPC.state = "idle";
                }
              }
            } else {
              updatedNPC.state = "idle";
            }
            break;
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