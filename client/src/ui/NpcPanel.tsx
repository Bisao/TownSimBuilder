import React, { useState } from "react";
import { NPC, useNpcStore } from "../game/stores/useNpcStore";
import { npcTypes, workTypes } from "../game/constants/npcs";
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
  const { updateNpc, spawnNPC } = useNpcStore();
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

  const npcType = npcTypes[npc.type];
  const currentWork = npc.assignedWork ? workTypes[npc.assignedWork] : null;

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
    initialPosition: { x: window.innerWidth / 2 - 220, y: window.innerHeight / 2 - 350 }
  });

  const handleWorkClick = () => {
    useNpcStore.getState().startNpcWork(npc.id);
  };

  const handleCreateNpc = () => {
    if (isTemporaryNpc && building) {
      const newNpcId = spawnNPC(
        building.position,
        'villager',
        `Morador da ${building.type}`,
        building.id
      );

      if (newNpcId) {
        const newNpc = useNpcStore.getState().npcs.find(n => n.id === newNpcId);
        if (newNpc) {
          onClose();
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('npcClick', { detail: newNpc }));
          }, 100);
        }
      }
    }
  };

  const getWorkColor = (workId?: string) => {
    switch (workId) {
      case "miner": return "from-blue-500 to-cyan-600";
      case "lumberjack": return "from-green-500 to-emerald-600";
      case "farmer": return "from-yellow-500 to-amber-600";
      case "baker": return "from-orange-500 to-red-600";
      default: return "from-gray-500 to-slate-600";
    }
  };

  const getWorkBg = (workId?: string) => {
    switch (workId) {
      case "miner": return "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200";
      case "lumberjack": return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200";
      case "farmer": return "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200";
      case "baker": return "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200";
      default: return "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200";
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-[440px] max-h-[90vh] overflow-hidden relative border border-gray-200"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
      >
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${getWorkColor(currentWork?.id)} p-6 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <i className={`fa-solid ${currentWork?.icon || "fa-user"} text-2xl text-white`}></i>
                  </div>
                  {npc.controlMode === "manual" && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-white">
                      <i className="fa-solid fa-gamepad text-xs text-white"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">{npc.name}</h2>
                  <p className="text-white/90 font-medium">
                    {currentWork ? currentWork.name : "Sem trabalho"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      npc.state === "working" ? "bg-green-400" :
                      npc.state === "moving" ? "bg-yellow-400" :
                      npc.state === "resting" ? "bg-blue-400" : "bg-gray-300"
                    }`}></div>
                    <span className="text-sm text-white/80">{stateTranslations[npc.state]}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(new CustomEvent('focusOnNpc', { 
                      detail: { 
                        position: npc.position,
                        npcId: npc.id 
                      } 
                    }));
                  }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30"
                  title="Focar câmera no NPC"
                >
                  <i className="fa-solid fa-eye text-white"></i>
                </button>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30"
                >
                  <i className="fa-solid fa-times text-white"></i>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {npc.workProgress > 0 && (
              <div className="bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white/80 transition-all duration-300 rounded-full" 
                  style={{width: `${npc.workProgress * 100}%`}}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar">

          {/* Create NPC Section for Empty Houses */}
          {isTemporaryNpc && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i className="fa-solid fa-home text-white text-3xl"></i>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">Casa Vazia</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Esta casa não possui um morador. Você pode criar um novo NPC para habitar este local.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNpcCreation(true);
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fa-solid fa-user-plus text-lg"></i>
                  Criar Novo NPC
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-bolt text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Energia</h4>
                  <p className="text-sm text-gray-600">{npc.needs.energy.toFixed(0)}%</p>
                </div>
              </div>
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" 
                  style={{width: `${npc.needs.energy}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-smile text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Satisfação</h4>
                  <p className="text-sm text-gray-600">{npc.needs.satisfaction.toFixed(0)}%</p>
                </div>
              </div>
              <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 transition-all duration-500" 
                  style={{width: `${npc.needs.satisfaction}%`}}
                ></div>
              </div>
            </div>
          </div>

          

          {/* Main Actions */}
          <div className="space-y-4">
            {/* Primary Action - Tasks */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTasks(true);
              }}
              className="w-full p-6 bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-tasks text-xl"></i>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">Gerenciar Tarefas</div>
                <div className="text-sm text-purple-100">Atribuir trabalhos e ações específicas</div>
              </div>
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSkillTree(true);
                }}
                className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <i className="fa-solid fa-sitemap"></i>
                Habilidades
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInventory(true);
                }}
                className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <i className="fa-solid fa-backpack"></i>
                Inventário
              </button>
            </div>

            {/* Inventory Display */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-box text-gray-600"></i>
                <span className="text-sm font-medium text-gray-700">Inventário Atual</span>
              </div>
              {npc.inventory.type ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 capitalize">{npc.inventory.type}</p>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {npc.inventory.amount}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Vazio</p>
              )}
            </div>
          </div>

          {/* Control Mode */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-gamepad text-gray-600"></i>
              Modo de Controle
            </h3>

            <div className="flex gap-3 mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useNpcStore.getState().setNpcControlMode(npc.id, "autonomous");
                  const gameStore = useGameStore.getState();
                  gameStore.setControlledNpc(null);
                  useGameStore.setState({ isManualControl: false });
                  const { updateCameraPosition, updateCameraTarget } = useGameStore.getState();
                  updateCameraPosition([20, 20, 20]);
                  updateCameraTarget([0, 0, 0]);
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  npc.controlMode === "autonomous" 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" 
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <i className="fa-solid fa-robot mr-2"></i>
                Autônomo
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useNpcStore.getState().setNpcControlMode(npc.id, "manual");
                  const gameStore = useGameStore.getState();
                  gameStore.setControlledNpc(npc.id);
                  useGameStore.setState({ isManualControl: true });
                  window.dispatchEvent(new CustomEvent('focusOnNpc', { 
                    detail: { 
                      position: npc.position,
                      npcId: npc.id,
                      followMode: true
                    } 
                  }));
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  npc.controlMode === "manual" 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg" 
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <i className="fa-solid fa-gamepad mr-2"></i>
                Manual
              </button>
            </div>

            {npc.controlMode === "manual" && (
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-gamepad"></i>
                  Controle Manual Ativo
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white rounded text-green-800 font-mono">WASD</kbd>
                    <span>Movimento</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white rounded text-green-800 font-mono">SPACE</kbd>
                    <span>Ação</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white rounded text-green-800 font-mono">SHIFT</kbd>
                    <span>Correr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white rounded text-green-800 font-mono">ESC</kbd>
                    <span>Sair</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          
        </div>
      </div>

      {/* Modals */}
      {showSeedSelection && (
        <SeedSelectionPanel
          onSeedSelect={(seedType) => {
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