
import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useNpcStore } from '../stores/useNpcStore';
import { useBuildingStore } from '../stores/useBuildingStore';

const ManualNpcController = () => {
  const { isManualControl, controlledNpcId, updateManualControlKeys, setControlledNpc } = useGameStore();
  const { npcs } = useNpcStore();
  const [actionCooldown, setActionCooldown] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const controlledNpc = npcs.find(npc => npc.id === controlledNpcId);

  useEffect(() => {
    if (!isManualControl || !controlledNpcId) return;

    let isSprintPressed = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'w':
          updateManualControlKeys({ forward: true });
          break;
        case 's':
          updateManualControlKeys({ backward: true });
          break;
        case 'a':
          updateManualControlKeys({ left: true });
          break;
        case 'd':
          updateManualControlKeys({ right: true });
          break;
        case 'shift':
          isSprintPressed = true;
          updateManualControlKeys({ sprint: true });
          break;
        case ' ':
          event.preventDefault();
          if (!actionCooldown) {
            updateManualControlKeys({ action: true });
            setActionCooldown(true);
            setTimeout(() => {
              setActionCooldown(false);
              updateManualControlKeys({ action: false });
            }, 300);
          }
          break;
        case 'escape':
          setControlledNpc(null);
          break;
        case 'h':
          setShowControls(!showControls);
          break;
        case 'tab':
          event.preventDefault();
          // Alternar para próximo NPC disponível
          const currentIndex = npcs.findIndex(npc => npc.id === controlledNpcId);
          const nextIndex = (currentIndex + 1) % npcs.length;
          const nextNpc = npcs[nextIndex];
          if (nextNpc) {
            useNpcStore.getState().setNpcControlMode(controlledNpcId!, "autonomous");
            useNpcStore.getState().setNpcControlMode(nextNpc.id, "manual");
            setControlledNpc(nextNpc.id);
          }
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'w':
          updateManualControlKeys({ forward: false });
          break;
        case 's':
          updateManualControlKeys({ backward: false });
          break;
        case 'a':
          updateManualControlKeys({ left: false });
          break;
        case 'd':
          updateManualControlKeys({ right: false });
          break;
        case 'shift':
          isSprintPressed = false;
          updateManualControlKeys({ sprint: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      updateManualControlKeys({
        forward: false,
        backward: false,
        left: false,
        right: false,
        action: false,
        sprint: false,
      });
    };
  }, [isManualControl, controlledNpcId, updateManualControlKeys, setControlledNpc, npcs, actionCooldown, showControls]);

  if (!isManualControl || !controlledNpcId || !controlledNpc) return null;

  return (
    <>
      {/* HUD de Controle Manual */}
      {showControls && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg z-50">
          <div className="text-lg font-bold mb-2">
            🎮 Controlando: {controlledNpc.type}
          </div>
          <div className="space-y-1 text-sm">
            <div>WASD - Movimento</div>
            <div>Shift - Correr</div>
            <div>Espaço - Ação {actionCooldown && "(⏳)"}</div>
            <div>Tab - Trocar NPC</div>
            <div>H - Ocultar controles</div>
            <div>ESC - Sair</div>
          </div>
        </div>
      )}

      {/* Indicador de Status */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg z-50">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${controlledNpc.needs.energy}%` }}
              />
            </div>
            <span>{Math.round(controlledNpc.needs.energy)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>😊</span>
            <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 transition-all duration-300"
                style={{ width: `${controlledNpc.needs.satisfaction}%` }}
              />
            </div>
            <span>{Math.round(controlledNpc.needs.satisfaction)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📦</span>
            <span>{controlledNpc.inventory.amount}/5</span>
            {controlledNpc.inventory.type && (
              <span className="text-blue-300">({controlledNpc.inventory.type})</span>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de Ação Disponível */}
      {isActionAvailable(controlledNpc) && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold animate-pulse z-50">
          Pressione ESPAÇO para {getActionText(controlledNpc)}
        </div>
      )}
    </>
  );
};

// Função auxiliar para verificar se há ação disponível
function isActionAvailable(npc: any): boolean {
  const buildings = useBuildingStore.getState().buildings;
  const [x, , z] = npc.position;

  // Verificar edifícios próximos
  const nearbyBuilding = buildings.find(b => {
    const distance = Math.hypot(b.position[0] - x, b.position[1] - z);
    return distance < 1.5;
  });

  if (nearbyBuilding) return true;

  // Verificar recursos próximos
  if (window.naturalResources) {
    const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;
    if (resourceType) {
      const nearbyResource = window.naturalResources.find(r => {
        const distance = Math.hypot(r.position[0] - x, r.position[1] - z);
        return r.type === resourceType && distance < 1.5 && (!r.lastCollected || (Date.now() - r.lastCollected) > 300000);
      });
      return !!nearbyResource;
    }
  }

  return false;
}

// Função auxiliar para obter texto da ação
function getActionText(npc: any): string {
  const buildings = useBuildingStore.getState().buildings;
  const [x, , z] = npc.position;

  const nearbyBuilding = buildings.find(b => {
    const distance = Math.hypot(b.position[0] - x, b.position[1] - z);
    return distance < 1.5;
  });

  if (nearbyBuilding) {
    if (nearbyBuilding.type === 'silo' && npc.inventory.amount > 0) {
      return "depositar no silo";
    }
    if (nearbyBuilding.type === 'farm' && npc.type === 'farmer') {
      if (npc.inventory.type === "seeds" || npc.inventory.type === "potato_seeds" || npc.inventory.type === "carrot_seeds") {
        return "plantar";
      }
      if (nearbyBuilding.plantation?.ready) {
        return "colher";
      }
    }
    return "trabalhar";
  }

  if (window.naturalResources) {
    const resourceType = npc.type === "miner" ? "stone" : npc.type === "lumberjack" ? "wood" : null;
    if (resourceType) {
      return `coletar ${resourceType}`;
    }
  }

  return "interagir";
}

export default ManualNpcController;
