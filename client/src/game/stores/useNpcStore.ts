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
            // Verificar se existe silo antes de procurar recursos
            const hasSilo = useBuildingStore.getState().buildings.some(b => b.type === 'silo');
            
            // Verificar se existem recursos disponíveis para coleta
            const hasAvailableResources = window.naturalResources?.some(r => {
              const isMatchingType = (npc.type === "lumberjack" && r.type === "wood") || 
                                   (npc.type === "miner" && r.type === "stone");
              return isMatchingType && !r.lastCollected;
            });
            
            // Lenhadores e mineradores procuram recursos apenas se houver silo e recursos disponíveis
            if ((npc.type === "lumberjack" || npc.type === "miner") && hasSilo && hasAvailableResources) {
              const resourceType = npc.type === "lumberjack" ? "wood" : "stone";
              
              // Buscar recurso mais próximo do grid
              const resources = window.naturalResources?.filter(r => 
                r.type === resourceType && !r.lastCollected
              ) || [];
              
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
                updatedNPC.position = [newX, 0, newZ];
              } else {
                // Chegou ao destino
                updatedNPC.position = [...npc.targetPosition];
                updatedNPC.targetPosition = null;

                if (npc.hasResource) {
                  // Depositar recurso no silo
                  const resourceType = npc.type === "lumberjack" ? "wood" : "stone";
                  const resourceStore = useResourceStore.getState();
                  const storageCapacity = resourceStore.getStorageCapacity();
                  const currentAmount = resourceStore.resources[resourceType] || 0;
                  
                  // Verificar se há espaço no armazenamento
                  if (currentAmount < storageCapacity) {
                    resourceStore.updateResource(resourceType, 1);
                    console.log(`Depositando ${resourceType} no silo. Novo total: ${currentAmount + 1}`);
                  }
                  
                  updatedNPC.hasResource = false;
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
              updatedNPC.workProgress += deltaTime * 0.2; // 5 segundos para coletar

              if (updatedNPC.workProgress >= 1) {
                // Recurso coletado
                const resourceType = npc.type === "lumberjack" ? "wood" : "stone";
                const resourceStore = useResourceStore.getState();
                resourceStore.updateResource(resourceType, 1);

                // Marcar recurso como coletado
                if (window.naturalResources) {
                  const resourceIndex = window.naturalResources.findIndex(
                    r => r.position[0] === npc.targetResource?.position[0] && 
                         r.position[1] === npc.targetResource?.position[1]
                  );
                  if (resourceIndex !== -1) {
                    window.naturalResources[resourceIndex].lastCollected = Date.now();
                  }
                }

                // Procurar silo mais próximo
                const buildings = useBuildingStore.getState().buildings;
                const silo = buildings.find(b => b.type === 'silo');

                if (silo) {
                  // Ir até o silo para depositar recursos
                  updatedNPC.targetPosition = [silo.position[0] + 0.5, 0, silo.position[1] + 0.5];
                  updatedNPC.state = "moving";
                  updatedNPC.hasResource = true;
                } else {
                  // Se não houver silo, volta ao estado idle
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