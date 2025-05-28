
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useNpcStore } from '../stores/useNpcStore';
import { useBuildingStore } from '../stores/useBuildingStore';
import { npcTypes } from '../constants/npcs';

// Constants for manual control
const CONSTANTS = {
  MOVEMENT_SPEED: 5,
  MAX_INVENTORY: 20,
  ENERGY_CONSUMPTION: {
    MOVING: 10
  },
  SATISFACTION_CONSUMPTION: {
    MOVING: 5
  }
};

interface ManualNpcControllerProps {
  npcId: string;
}

const ManualNpcController: React.FC<ManualNpcControllerProps> = ({ npcId }) => {
  const keysRef = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    sprint: false
  });

  const { npcs, updateNpc } = useNpcStore();
  const { controlledNpc } = useGameStore();
  const buildings = useBuildingStore((state) => state.buildings);

  const npc = npcs.find(n => n.id === npcId);
  const isActive = controlledNpc === npcId && npc?.controlMode === 'manual';

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          keysRef.current.w = true;
          break;
        case 'KeyA':
          keysRef.current.a = true;
          break;
        case 'KeyS':
          keysRef.current.s = true;
          break;
        case 'KeyD':
          keysRef.current.d = true;
          break;
        case 'Space':
          e.preventDefault();
          keysRef.current.space = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keysRef.current.sprint = true;
          break;
        case 'Escape':
          // Sair do controle manual
          useNpcStore.getState().setNpcControlMode(npcId, 'autonomous');
          useGameStore.getState().setControlledNpc(null);
          
          // Resetar câmera
          const { updateCameraPosition, updateCameraTarget } = useGameStore.getState();
          updateCameraPosition([20, 20, 20]);
          updateCameraTarget([0, 0, 0]);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          keysRef.current.w = false;
          break;
        case 'KeyA':
          keysRef.current.a = false;
          break;
        case 'KeyS':
          keysRef.current.s = false;
          break;
        case 'KeyD':
          keysRef.current.d = false;
          break;
        case 'Space':
          keysRef.current.space = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keysRef.current.sprint = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, npcId]);

  useEffect(() => {
    if (!isActive || !npc) return;

    const gameLoop = setInterval(() => {
      const keys = keysRef.current;
      const hasMovement = keys.w || keys.a || keys.s || keys.d;
      const deltaTime = 0.016; // ~60fps

      if (!hasMovement && !keys.space) return;

      let [x, y, z] = npc.position;
      let newState = npc.state;
      let workProgress = npc.workProgress;
      let inventory = npc.inventory;
      let targetBuildingId = npc.targetBuildingId;

      // Movimento
      if (hasMovement) {
        const speed = keys.sprint ? CONSTANTS.MOVEMENT_SPEED * 2 : CONSTANTS.MOVEMENT_SPEED;
        const moveDistance = speed * deltaTime;

        if (keys.w) z -= moveDistance;
        if (keys.s) z += moveDistance;
        if (keys.a) x -= moveDistance;
        if (keys.d) x += moveDistance;

        // Limitar movimento dentro dos bounds do mapa
        const clampedX = Math.max(0, Math.min(49, x));
        const clampedZ = Math.max(0, Math.min(49, z));

        newState = "moving";

        // Consumo de energia ajustado para sprint
        const energySprintMultiplier = keys.sprint ? 2.5 : 1;
        const energyConsumption = hasMovement ? CONSTANTS.ENERGY_CONSUMPTION.MOVING * 0.3 * energySprintMultiplier : 0;
        const satisfactionConsumption = hasMovement ? CONSTANTS.SATISFACTION_CONSUMPTION.MOVING * 0.3 * energySprintMultiplier : 0;

        updateNpc(npcId, {
          position: [clampedX, y, clampedZ],
          state: newState,
          workProgress: workProgress,
          inventory: inventory,
          targetBuildingId: targetBuildingId,
          needs: {
            ...npc.needs,
            energy: Math.max(0, npc.needs.energy - deltaTime * energyConsumption),
            satisfaction: Math.max(0, npc.needs.satisfaction - deltaTime * satisfactionConsumption)
          }
        });

        // Disparar evento para câmera seguir o NPC
        window.dispatchEvent(new CustomEvent('focusOnNpc', { 
          detail: { 
            position: [clampedX, y, clampedZ],
            npcId: npcId,
            followMode: true
          } 
        }));
      }

      // Ação contextual (Espaço)
      if (keys.space) {
        const actionResult = NPCStateHandlers.handleManualAction(npc, x, z, deltaTime);
        if (actionResult) {
          workProgress = actionResult.workProgress !== undefined ? actionResult.workProgress : workProgress;
          inventory = actionResult.inventory !== undefined ? actionResult.inventory : inventory;
          newState = actionResult.state !== undefined ? actionResult.state : newState;
          targetBuildingId = actionResult.targetBuildingId !== undefined ? actionResult.targetBuildingId : targetBuildingId;

          updateNpc(npcId, {
            position: npc.position,
            state: newState,
            workProgress: workProgress,
            inventory: inventory,
            targetBuildingId: targetBuildingId,
            needs: npc.needs
          });
        }
      }
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [isActive, npc, npcId, updateNpc]);

  // Handlers de ação contextual
  const NPCStateHandlers = {
    handleManualAction(npc: any, x: number, z: number, deltaTime: number): any {
      // Verificar proximidade com edifícios
      const nearbyBuilding = buildings.find(b => {
        const distance = Math.hypot(b.position[0] - x, b.position[1] - z);
        return distance < 1.5;
      });

      if (nearbyBuilding) {
        return NPCStateHandlers.handleManualBuildingInteraction(npc, nearbyBuilding, deltaTime);
      }

      // Verificar recursos naturais
      if (window.naturalResources) {
        const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;
        if (resourceType) {
          const nearbyResource = window.naturalResources.find((r: any) => {
            const distance = Math.hypot(r.position[0] - x, r.position[1] - z);
            return r.type === resourceType && distance < 1.5 && (!r.lastCollected || (Date.now() - r.lastCollected) > 300000);
          });

          if (nearbyResource && npc.inventory.amount < CONSTANTS.MAX_INVENTORY) {
            return NPCStateHandlers.handleManualResourceGathering(npc, nearbyResource, deltaTime);
          }
        }
      }

      return null;
    },

    handleManualBuildingInteraction(npc: any, building: any, deltaTime: number): any {
      // Silo - depositar recursos
      if (building.type === 'silo' && npc.inventory.amount > 0) {
        import('../stores/useResourceStore').then(({ useResourceStore }) => {
          const resourceStore = useResourceStore.getState();
          resourceStore.updateResource(npc.inventory.type, npc.inventory.amount);
        });

        console.log(`${npc.type} depositou ${npc.inventory.amount} ${npc.inventory.type} no silo manualmente`);
        
        return {
          inventory: { type: '', amount: 0 },
          state: "idle"
        };
      }

      // Fazenda - ações específicas do fazendeiro
      if (building.type === 'farm' && npc.type === 'farmer') {
        return NPCStateHandlers.handleManualFarmInteraction(npc, building, deltaTime);
      }

      // Workplace - trabalhar no edifício
      const workplaceMapping: Record<string, string> = {
        farm: "farmer",
        bakery: "baker", 
        mine: "miner",
        lumberyard: "lumberjack"
      };
      const workplaceType = Object.entries(workplaceMapping).find(([_, npcTypeId]) => npcTypeId === npc.type)?.[0];
      if (building.type === workplaceType) {
        const newWorkProgress = npc.workProgress + deltaTime * 2; // Trabalho manual mais rápido

        if (newWorkProgress >= 1) {
          console.log(`${npc.type} completou trabalho manual no ${building.type}`);
          return {
            workProgress: 0,
            state: "idle"
          };
        }

        return {
          workProgress: newWorkProgress,
          state: "working"
        };
      }

      return null;
    },

    handleManualFarmInteraction(npc: any, farm: any, deltaTime: number): any {
      // Se tem sementes, plantar
      if (npc.inventory.type === "seeds" || npc.inventory.type === "potato_seeds" || npc.inventory.type === "carrot_seeds") {
        if (!farm.plantation?.planted || farm.plantation?.harvested) {
          const newWorkProgress = npc.workProgress + deltaTime * 2;

          if (newWorkProgress >= 1) {
            import('../stores/useBuildingStore').then(({ useBuildingStore }) => {
              useBuildingStore.getState().plantSeeds(farm.id);
            });

            console.log(`Fazendeiro plantou ${npc.inventory.type} manualmente`);
            
            return {
              inventory: { type: '', amount: 0 },
              workProgress: 0,
              state: "idle"
            };
          }

          return {
            workProgress: newWorkProgress,
            state: "working"
          };
        }
      }

      // Se não tem sementes, verificar se a plantação está pronta para colheita
      if (farm.plantation?.planted && !farm.plantation?.harvested && farm.plantation?.growth >= 1) {
        const newWorkProgress = npc.workProgress + deltaTime * 2;

        if (newWorkProgress >= 1) {
          const harvestedType = farm.plantation.type === "potato_seeds" ? "potato" : 
                              farm.plantation.type === "carrot_seeds" ? "carrot" : "wheat";
          
          import('../stores/useBuildingStore').then(({ useBuildingStore }) => {
            useBuildingStore.getState().harvestCrop(farm.id);
          });

          console.log(`Fazendeiro colheu ${harvestedType} manualmente`);
          
          return {
            inventory: { type: harvestedType, amount: 10 },
            workProgress: 0,
            state: "idle"
          };
        }

        return {
          workProgress: newWorkProgress,
          state: "working"
        };
      }

      return null;
    },

    handleManualResourceGathering(npc: any, resource: any, deltaTime: number): any {
      const newWorkProgress = npc.workProgress + deltaTime * 2; // Coleta manual mais rápida

      if (newWorkProgress >= 1) {
        const amount = Math.min(10, CONSTANTS.MAX_INVENTORY - npc.inventory.amount);
        
        // Marcar recurso como coletado
        resource.lastCollected = Date.now();
        
        console.log(`${npc.type} coletou ${amount} ${resource.type} manualmente`);
        
        return {
          inventory: {
            type: resource.type,
            amount: npc.inventory.amount + amount
          },
          workProgress: 0,
          state: "idle"
        };
      }

      return {
        workProgress: newWorkProgress,
        state: "gathering"
      };
    }
  };

  if (!isActive) return null;

  return (
    <>
      {/* Indicador visual de controle manual */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg border border-green-500">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎮</span>
            <div>
              <div className="font-bold">Controle Manual Ativo</div>
              <div className="text-sm opacity-90">
                {npc?.type} - Energia: {Math.round(npc?.needs.energy || 0)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles na tela */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg">
          <div className="text-center mb-3">
            <div className="font-bold text-lg mb-1">Controles</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">Movimento:</div>
              <div>WASD - Mover</div>
              <div>Shift - Correr</div>
            </div>
            
            <div>
              <div className="font-semibold mb-1">Ações:</div>
              <div>Espaço - Trabalhar/Coletar</div>
              <div>ESC - Sair do controle</div>
            </div>
          </div>

          {/* Status atual */}
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-xs opacity-75">
              Status: {npc?.state === "moving" ? "Movendo" : 
                      npc?.state === "working" ? "Trabalhando" :
                      npc?.state === "gathering" ? "Coletando" : "Parado"}
              {npc?.inventory.amount > 0 && (
                <span className="ml-2">
                  | Inventário: {npc.inventory.amount} {npc.inventory.type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { ManualNpcController };
export default ManualNpcController;
