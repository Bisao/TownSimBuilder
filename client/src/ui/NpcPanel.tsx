import React, { useState } from "react";
import { NPC, useNpcStore } from "../game/stores/useNpcStore";
import { npcTypes } from "../game/constants/npcs";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useGameStore } from "../game/stores/useGameStore";
import { useDraggable } from "../hooks/useDraggable";
import SeedSelectionPanel from "./SeedSelectionPanel";

interface NpcPanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const NpcPanel = ({ npc, onClose }: NpcPanelProps) => {
  const [showSeedSelection, setShowSeedSelection] = useState(false);
  
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
    console.log(`Iniciando trabalho manual para NPC ${npc.type} - Estado atual: ${npc.state}`);

    const buildings = useBuildingStore.getState().buildings;
    const home = buildings.find(b => b.id === npc.homeId);

    if (!home) {
      console.error(`Casa não encontrada para NPC ${npc.id}`);
      return;
    }

    // Forçar início do trabalho independente do horário
    useNpcStore.setState(state => ({
      npcs: state.npcs.map(n => {
        if (n.id !== npc.id) return n;

        console.log(`FORÇANDO início de trabalho manual para NPC ${n.type} - mudando de ${n.state} para searching/moving`);

        // Para mineiros e lenhadores: buscar recursos IMEDIATAMENTE
        if (n.type === "miner" || n.type === "lumberjack") {
          // Marcar como trabalhando manualmente para bypass das verificações de horário
          return {
            ...n,
            state: "searching" as const,
            workProgress: 0,
            targetResource: null,
            targetPosition: null,
            targetBuildingId: null,
            isWorkingManually: true, // Flag para indicar trabalho manual
            needs: {
              energy: Math.max(n.needs.energy, 70),
              satisfaction: Math.max(n.needs.satisfaction, 70)
            }
          };
        }

        // Para fazendeiros: iniciar ciclo de farming
        if (n.type === "farmer") {
          return {
            ...n,
            state: "idle" as const,
            workProgress: 0,
            targetResource: null,
            targetPosition: null,
            targetBuildingId: null,
            isWorkingManually: true,
            farmerData: {
              ...n.farmerData!,
              currentTask: "waiting"
            },
            needs: {
              energy: Math.max(n.needs.energy, 70),
              satisfaction: Math.max(n.needs.satisfaction, 70)
            }
          };
        }

        // Para padeiros: encontrar workplace
        if (n.type === "baker") {
          const bakery = buildings.find(b => b.type === "bakery");
          if (bakery) {
            return {
              ...n,
              state: "moving" as const,
              targetPosition: [bakery.position[0] + 0.5, 0, bakery.position[1] + 0.5],
              targetBuildingId: bakery.id,
              workProgress: 0,
              isWorkingManually: true,
              needs: {
                energy: Math.max(n.needs.energy, 70),
                satisfaction: Math.max(n.needs.satisfaction, 70)
              }
            };
          }
        }

        return n;
      })
    }));
    
    console.log(`Trabalho manual FORÇADO para NPC ${npc.type}`);
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

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Modo de Controle</h3>
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
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  Use WASD para mover e Espaço para trabalhar/coletar recursos próximos
                </p>
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
    </div>
  );
};

export default NpcPanel;