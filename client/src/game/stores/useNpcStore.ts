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
            // Verificar se o inventário não está cheio
            const hasSpaceInInventory = updatedNPC.inventory.amount < 5;

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

              if (distance > 0.1) {
                // Calcular próxima coordenada do grid
                const targetGridX = Math.round(npc.targetPosition[0]);
                const targetGridZ = Math.round(npc.targetPosition[2]);
                const currentGridX = Math.round(npc.position[0]);
                const currentGridZ = Math.round(npc.position[2]);

                // Mover apenas se não estiver na coordenada alvo
                if (currentGridX !== targetGridX || currentGridZ !== targetGridZ) {
                  // Determinar próxima coordenada com base na diferença até o alvo
                  const nextGridX = currentGridX + Math.sign(targetGridX - currentGridX);
                  const nextGridZ = currentGridZ + Math.sign(targetGridZ - currentGridZ);

                  // Garantir que está dentro dos limites
                  const clampedX = Math.max(0, Math.min(nextGridX, 39));
                  const clampedZ = Math.max(0, Math.min(nextGridZ, 39));

                  updatedNPC.position = [clampedX, 0, clampedZ];
                } else {
                  // Se já está na coordenada alvo, chegou ao destino
                  updatedNPC.position = [...npc.targetPosition];
                  updatedNPC.targetPosition = null;
                  updatedNPC.state = "idle";
                }

                // Debug do movimento
                console.log(`NPC ${npc.type} movendo de [${npc.position[0]}, ${npc.position[2]}] para [${updatedNPC.position[0]}, ${updatedNPC.position[2]}]`);
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
                // Procura o silo mais próximo usando distância Manhattan (grid)
                const buildings = useBuildingStore.getState().buildings;
                const silos = buildings.filter(b => b.type === 'silo');

                if (silos.length > 0) {
                  // Encontra o silo mais próximo usando lógica de grid
                  let nearestSilo = silos[0];
                  let minGridDistance = Infinity;

                  for (const silo of silos) {
                    const dx = Math.abs(Math.floor(silo.position[0]) - Math.floor(npc.position[0]));
                    const dz = Math.abs(Math.floor(silo.position[1]) - Math.floor(npc.position[2]));
                    const gridDistance = dx + dz;

                    if (gridDistance < minGridDistance) {
                      minGridDistance = gridDistance;
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

                // Usa o resourceMapping já definido anteriormente
                const expectedResourceType = resourceMapping[npc.type];

                if (updatedNPC.inventory.type === '' || updatedNPC.inventory.type === expectedResourceType) {
                  updatedNPC.inventory.type = expectedResourceType;
                  updatedNPC.inventory.amount += 1;
                  console.log(`${npc.type} coletou ${expectedResourceType} na posição [${Math.floor(npc.position[0])}, ${Math.floor(npc.position[2])}]. Inventário: ${updatedNPC.inventory.amount}/${5}`);
                }

                // Remove o recurso do array naturalResources com verificação de grid
                if (window.naturalResources) {
                  const resourceIndex = window.naturalResources.findIndex(r => {
                    const isCorrectType = (npc.type === "lumberjack" && r.type === "wood") ||
                                       (npc.type === "miner" && r.type === "stone");
                    const isInSameGridCell = 
                      Math.floor(r.position[0]) === Math.floor(npc.position[0]) &&
                      Math.floor(r.position[1]) === Math.floor(npc.position[2]);
                    const isNotCollected = !r.lastCollected;

                    return isCorrectType && isInSameGridCell && isNotCollected;
                  });

                  if (resourceIndex !== -1) {
                    window.naturalResources.splice(resourceIndex, 1);
                    console.log(`Recurso removido na posição [${Math.floor(npc.position[0])}, ${Math.floor(npc.position[2])}]`);
                  }
                }

                // Procura o silo mais próximo usando distância Manhattan
                const buildings = useBuildingStore.getState().buildings;
                const silos = buildings.filter(b => b.type === 'silo');

                if (silos.length > 0) {
                  let nearestSilo = null;
                  let minDistance = Infinity;

                  for (const silo of silos) {
                    const dx = Math.abs(silo.position[0] - Math.floor(npc.position[0]));
                    const dz = Math.abs(silo.position[1] - Math.floor(npc.position[2]));
                    const gridDistance = dx + dz;

                    if (gridDistance < minDistance) {
                      minDistance = gridDistance;
                      nearestSilo = silo;
                    }
                  }

                  if (nearestSilo && minDistance < 1 && updatedNPC.inventory.amount > 0) {
                    // Deposita recursos no silo
                    const resourceStore = useResourceStore.getState();
                    const storageCapacity = resourceStore.getStorageCapacity();
                    const currentAmount = resourceStore.resources[updatedNPC.inventory.type] || 0;

                    // Verifica capacidade do silo
                    if (currentAmount < storageCapacity) {
                      resourceStore.updateResource(updatedNPC.inventory.type, updatedNPC.inventory.amount);
                      console.log(`${npc.type} depositou ${updatedNPC.inventory.amount} ${updatedNPC.inventory.type} no silo. Total: ${currentAmount + updatedNPC.inventory.amount}`);

                      // Limpa o inventário
                      updatedNPC.inventory = { type: '', amount: 0 };
                      updatedNPC.targetResource = null;
                      updatedNPC.workProgress = 0;
                      updatedNPC.state = "idle";
                    } else {
                      console.log(`Silo cheio para ${updatedNPC.inventory.type}`);
                      // Procura outro silo
                      updatedNPC.state = "moving";
                    }
                  }
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