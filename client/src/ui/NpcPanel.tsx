import React, { useState } from "react";
import { NPC, useNpcStore } from "../game/stores/useNpcStore";
import { npcTypes } from "../game/constants/npcs";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useGameStore } from "../game/stores/useGameStore";
import { useDraggable } from "../hooks/useDraggable";
import SeedSelectionPanel from "./SeedSelectionPanel";
import SkillTreePanel from "./SkillTreePanel";
import InventoryPanel from "./InventoryPanel";
import NpcCreationPanel from "./NpcCreationPanel";
import TaskPanel from "./TaskPanel";

interface NpcPanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const NpcPanel: React.FC<NpcPanelProps> = ({ npc, onClose }) => {
  const { updateNpc, assignNpcToBuilding, spawnNPC } = useNpcStore();
  const { buildings } = useBuildingStore();

  // Verificar se é um NPC temporário (casa vazia)
  const isTemporaryNpc = npc.id.startsWith('temp_');
  const building = buildings.find(b => b.id === npc.homeId);

  const [showSeedSelection, setShowSeedSelection] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showNpcCreation, setShowNpcCreation] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  if (!npc) return null;

  // Removido: auto-start de trabalho - agora só inicia manualmente via botão

  const npcType = npcTypes[npc.type];
  const stateTranslations = {
    idle: "Parado",
    moving: "Movendo",
    working: "Trabalhando",
    gathering: "Coletando",
    resting: "Descansando",
    searching: "Procurando"
  };

  const scheduleTranslations = {
    home: "Em Casa",
    working: "Horário de Trabalho",
    lunch: "Horário de Almoço",
    traveling: "Viajando"
  };

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 192, y: window.innerHeight / 2 - 200 }
  });

  const handleWorkClick = () => {
    // Ativar NPC para trabalhar manualmente
    useNpcStore.getState().startNpcWork(npc.id);
  };

  const handleCreateNpc = () => {
    if (isTemporaryNpc && building) {
      // Criar um novo NPC real para esta casa
      const newNpcId = spawnNPC(
        building.position,
        'villager',
        `Morador da ${building.type}`,
        building.id
      );

      if (newNpcId) {
        const newNpc = useNpcStore.getState().npcs.find(n => n.id === newNpcId);
        if (newNpc) {
          // Fechar o painel temporário e reabrir com o NPC real
          onClose();
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('npcClick', { detail: newNpc }));
          }, 100);
        }
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto relative"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
      >
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                npc.type === "miner" ? "bg-blue-100" :
                npc.type === "lumberjack" ? "bg-green-100" :
                npc.type === "farmer" ? "bg-yellow-100" : "bg-orange-100"
              }`}>
                <i className={`fa-solid ${
                  npc.type === "miner" ? "fa-helmet-safety" :
                  npc.type === "lumberjack" ? "fa-tree" :
                  npc.type === "farmer" ? "fa-wheat-awn" : "fa-bread-slice"
                } text-xl ${
                  npc.type === "miner" ? "text-blue-600" :
                  npc.type === "lumberjack" ? "text-green-600" :
                  npc.type === "farmer" ? "text-yellow-600" : "text-orange-600"
                }`}></i>
              </div>
              <h2 className="text-xl font-bold">{npcType?.name || npc.type}</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Disparar evento para focar a câmera no NPC
                  window.dispatchEvent(new CustomEvent('focusOnNpc', { 
                    detail: { 
                      position: npc.position,
                      npcId: npc.id 
                    } 
                  }));
                }}
                className="text-blue-500 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50"
                title="Focar câmera no NPC"
              >
                👁️
              </button>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-dot text-green-500"></i>
                <span>{stateTranslations[npc.state]}</span>
              </div>
              {npc.workProgress > 0 && (
                <div className="col-span-2 mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300" 
                      style={{width: `${npc.workProgress * 100}%`}}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Necessidades</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Energia</span>
                  <span>{npc.needs.energy.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{width: `${npc.needs.energy}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Satisfação</span>
                  <span>{npc.needs.satisfaction.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500" 
                    style={{width: `${npc.needs.satisfaction}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Inventário</h3>
            <p className="flex items-center gap-2">
              <i className="fa-solid fa-box text-gray-500"></i>
              {npc.inventory.type ? (
                <span>{npc.inventory.type}: {npc.inventory.amount}</span>
              ) : (
                <span className="text-gray-500">Vazio</span>
              )}
            </p>
          </div>

          {/* Create NPC Section for Empty Houses */}
          {isTemporaryNpc && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-home text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Casa Vazia</h3>
                <p className="text-gray-600 mb-4">
                  Esta casa não possui um morador. Você pode criar um novo NPC para habitar este local.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNpcCreation(true);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <i className="fa-solid fa-user-plus text-lg"></i>
                  Criar Novo NPC
                </button>
                <div className="mt-3 text-xs text-gray-500 flex items-center justify-center gap-1">
                  <i className="fa-solid fa-info-circle"></i>
                  <span>Inspire-se no sistema de criação do Albion Online</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Modo de Controle</h3>

            {/* Tasks Button */}
            <div className="mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTasks(true);
                }}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-tasks"></i>
                📋 Tarefas
              </button>
            </div>

            {/* Skill Tree Button */}
            <div className="mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSkillTree(true);
                }}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-sitemap"></i>
                🌟 Árvore de Habilidades
              </button>
            </div>

            {/* Inventory Button */}
            <div className="mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInventory(true);
                }}
                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-backpack"></i>
                📦 Inventário
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useNpcStore.getState().setNpcControlMode(npc.id, "autonomous");
                  useGameStore.getState().setControlledNpc(null);

                  // Resetar câmera para posição padrão
                  const { updateCameraPosition, updateCameraTarget } = useGameStore.getState();
                  updateCameraPosition([20, 20, 20]);
                  updateCameraTarget([0, 0, 0]);
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  npc.controlMode === "autonomous" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                🤖 Autônomo
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useNpcStore.getState().setNpcControlMode(npc.id, "manual");
                  useGameStore.getState().setControlledNpc(npc.id);

                  // Disparar evento para focar câmera no NPC
                  window.dispatchEvent(new CustomEvent('focusOnNpc', { 
                    detail: { 
                      position: npc.position,
                      npcId: npc.id,
                      followMode: true
                    } 
                  }));
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  npc.controlMode === "manual" 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                🎮 Manual
              </button>
            </div>

            {npc.controlMode === "manual" && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-2">
                  🎮 Controle Manual Ativo
                </p>
                <div className="text-xs text-green-600 space-y-1">
                  <div>WASD - Movimento</div>
                  <div>Espaço - Ação (trabalhar/coletar)</div>
                  <div>ESC - Sair do controle</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Trabalho Autônomo</h3>
            {npc.type === "miner" && npc.controlMode === "autonomous" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleWorkClick();
                }}
                className={`w-full px-4 py-2 rounded-lg pointer-events-auto relative z-[10000] ${
                  npc.state === "gathering" || npc.state === "moving"
                    ? "bg-gray-200 cursor-not-allowed" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                } font-medium transition-colors`}
                disabled={npc.state === "gathering" || npc.state === "moving"}
              >
                {npc.state === "gathering" ? "Minerando..." : 
                 npc.state === "searching" ? "Procurando Pedra..." : 
                 npc.state === "moving" ? "Movendo..." : "Iniciar Mineração"}
              </button>
            )}
             {npc.type === "lumberjack" && npc.controlMode === "autonomous" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleWorkClick();
                }}
                className={`w-full px-4 py-2 rounded-lg ${
                  npc.state === "gathering" || npc.state === "moving"
                    ? "bg-gray-200 cursor-not-allowed" 
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-medium transition-colors`}
                disabled={npc.state === "gathering" || npc.state === "moving"}
              >
                {npc.state === "gathering" ? "Cortando..." : 
                 npc.state === "searching" ? "Procurando Madeira..." : 
                 npc.state === "moving" ? "Movendo..." : "Iniciar Corte"}
              </button>
            )}
            {npc.type === "farmer" && npc.controlMode === "autonomous" && (
              <div className="space-y-3">
                {npc.farmerData?.selectedSeed && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600">🌱</span>
                      <span className="text-sm font-medium">
                        Semente selecionada: {npc.farmerData.selectedSeed}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSeedSelection(true);
                  }}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  🌱 Selecionar Semente
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!npc.farmerData?.selectedSeed) {
                      setShowSeedSelection(true);
                      return;
                    }

                    // Iniciar trabalho manual do fazendeiro
                    const updatedNpc = {
                      ...npc,
                      state: "idle" as const,
                      workProgress: 0,
                      targetResource: null,
                      targetPosition: null,
                      farmerData: {
                        ...npc.farmerData,
                        currentTask: "waiting" as const
                      },
                      needs: {
                        ...npc.needs,
                        energy: Math.max(npc.needs.energy, 70),
                        satisfaction: Math.max(npc.needs.satisfaction, 70)
                      }
                    };

                    useNpcStore.setState(state => ({
                      npcs: state.npcs.map(n => n.id === npc.id ? updatedNpc : n)
                    }));

                    console.log(`Fazendeiro iniciado manualmente com semente: ${npc.farmerData.selectedSeed}`);
                  }}
                  className={`w-full px-4 py-2 rounded-lg ${
                    npc.state === "working" || npc.state === "planting" || npc.state === "harvesting"
                      ? "bg-gray-200 cursor-not-allowed" 
                      : "bg-yellow-500 hover:bg-yellow-600"
                  } text-white font-medium transition-colors`}
                  disabled={npc.state === "working" || npc.state === "planting" || npc.state === "harvesting"}
                >
                  {npc.state === "planting" ? "Plantando..." : 
                   npc.state === "harvesting" ? "Colhendo..." :
                   npc.state === "working" ? "Trabalhando..." : "Iniciar Cultivo"}
                </button>
              </div>
            )}
            {npc.type === "baker" && npc.controlMode === "autonomous" && (
              <button
                onClick={() => {
                  if (npc.state === "idle") {
                    npc.state = "working";
                    npc.workProgress = 0;
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg ${
                  npc.state === "working" 
                    ? "bg-gray-200 cursor-not-allowed" 
                    : "bg-orange-500 hover:bg-orange-600"
                } text-white font-medium transition-colors`}
                disabled={npc.state === "working"}
              >
                {npc.state === "working" ? "Assando..." : "Assar"}
              </button>
            )}

            {npc.controlMode === "manual" && (
              <div className="space-y-3">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-700 mb-2">
                    🎮 Modo Manual Ativo
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
                    <div>WASD - Movimento</div>
                    <div>Shift - Correr</div>
                    <div>Espaço - Ação</div>
                    <div>Tab - Trocar NPC</div>
                    <div>H - Ocultar HUD</div>
                    <div>ESC - Sair</div>
                  </div>
                </div>

                {/* Status Bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">⚡ Energia:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          npc.needs.energy > 60 ? 'bg-yellow-400' : 
                          npc.needs.energy > 30 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${npc.needs.energy}%` }}
                      />
                    </div>
                    <span className="text-xs">{Math.round(npc.needs.energy)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs">😊 Satisfação:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          npc.needs.satisfaction > 60 ? 'bg-green-400' : 
                          npc.needs.satisfaction > 30 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${npc.needs.satisfaction}%` }}
                      />
                    </div>
                    <span className="text-xs">{Math.round(npc.needs.satisfaction)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs">📦 Inventário:</span>
                    <div className="flex-1 text-xs">
                      {npc.inventory.amount > 0 ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {npc.inventory.amount}x {npc.inventory.type}
                        </span>
                      ) : (
                        <span className="text-gray-500">Vazio</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comandos Rápidos */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700">Comandos Rápidos:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        // Comando para ir para casa
                        const buildings = useBuildingStore.getState().buildings;
                        const home = buildings.find(b => b.id === npc.homeId);
                        if (home) {
                          useNpcStore.setState(state => ({
                            npcs: state.npcs.map(n => 
                              n.id === npc.id 
                                ? {
                                    ...n,
                                    targetPosition: [home.position[0] + 0.5, 0, home.position[1] + 0.5],
                                    state: "moving" as const
                                  }
                                : n
                            )
                          }));
                        }
                      }}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                    >
                      🏠 Ir para Casa
                    </button>

                    <button
                      onClick={() => {
                        // Comando para procurar silo mais próximo
                        const buildings = useBuildingStore.getState().buildings;
                        const silos = buildings.filter(b => b.type === 'silo');
                        if (silos.length > 0) {
                          const nearestSilo = silos.reduce((nearest, silo) => {
                            const currentDist = Math.hypot(silo.position[0] - npc.position[0], silo.position[1] - npc.position[2]);
                            const nearestDist = Math.hypot(nearest.position[0] - npc.position[0], nearest.position[1] - npc.position[2]);
                            return currentDist < nearestDist ? silo : nearest;
                          });

                          useNpcStore.setState(state => ({
                            npcs: state.npcs.map(n => 
                              n.id === npc.id 
                                ? {
                                    ...n,
                                    targetPosition: [nearestSilo.position[0] + 0.5, 0, nearestSilo.position[1] + 0.5],
                                    targetBuildingId: nearestSilo.id,
                                    state: "moving" as const
                                  }
                                : n
                            )
                          }));
                        }
                      }}
                      className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-colors"
                      disabled={npc.inventory.amount === 0}
                    >
                      🏗️ Ir ao Silo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSeedSelection && (
        <SeedSelectionPanel
          onSeedSelect={(seedType) => {
            // Atualizar o NPC com a semente selecionada
            useNpcStore.setState(state => ({
              npcs: state.npcs.map(n => 
                n.id === npc.id 
                  ? {
                      ...n,
                      farmerData: {
                        ...n.farmerData!,
                        selectedSeed: seedType
                      }
                    }
                  : n
              )
            }));
            setShowSeedSelection(false);
          }}
          onClose={() => setShowSeedSelection(false)}
        />
      )}

      {showSkillTree && (
        <SkillTreePanel
          npc={npc}
          onClose={() => setShowSkillTree(false)}
        />
      )}

      {showInventory && (
        <InventoryPanel
          npc={npc}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showNpcCreation && isTemporaryNpc && building && (
        <NpcCreationPanel
          houseId={building.id}
          housePosition={building.position}
          onClose={() => setShowNpcCreation(false)}
          onNpcCreated={(npcId) => {
            // Fechar o painel atual e reabrir com o novo NPC
            onClose();
            setTimeout(() => {
              const newNpc = useNpcStore.getState().npcs.find(n => n.id === npcId);
              if (newNpc) {
                window.dispatchEvent(new CustomEvent('npcClick', { detail: newNpc }));
              }
            }, 100);
          }}
        />
      )}

      {showTasks && (
        <TaskPanel
          npc={npc}
          onClose={() => setShowTasks(false)}
        />
      )}
    </div>
  );
};

export default NpcPanel;