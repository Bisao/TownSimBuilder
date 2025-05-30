import React, { useState } from "react";
import { NPC, useNpcStore } from "../game/stores/useNpcStore";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useCombatStore } from "../game/stores/useCombatStore";
import { npcTypes, workTypes } from "../game/constants/npcs";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useGameStore } from "../game/stores/useGameStore";
import { useDraggable } from "../hooks/useDraggable";
import SeedSelectionPanel from "./SeedSelectionPanel";
import SkillTreePanel from "./SkillTreePanel";
import InventoryPanel from "./InventoryPanel";
import NpcCreationPanel from "./NpcCreationPanel";
import TaskPanel from "./TaskPanel";
import CombatPanel from "./CombatPanel";

interface NpcPanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const NpcPanel: React.FC<NpcPanelProps> = ({ npc, onClose }) => {
  const { updateNpc, spawnNPC } = useNpcStore();
  const { buildings } = useBuildingStore();

  // Verificar se é um NPC temporário (casa vazia)
  const isTemporaryNpc = npc?.id.startsWith('temp_');
  const building = buildings.find(b => b.id === npc?.homeId);

  const [showSeedSelection, setShowSeedSelection] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showNpcCreation, setShowNpcCreation] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showCombat, setShowCombat] = useState(false);

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
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl responsive-panel-large overflow-hidden relative border border-gray-200"
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
        <div className={`bg-gradient-to-r ${getWorkColor(currentWork?.id)} p-3 sm:p-6 text-white relative overflow-hidden`}>
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
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar">

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

          {/* Main NPC Info - Only show when NPC exists */}
          {!isTemporaryNpc && (
            <div className={`p-6 rounded-xl border-2 ${getWorkBg(npc.assignedWork)}`}>
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${getWorkColor(npc.assignedWork)} rounded-full flex items-center justify-center shadow-lg`}>
                  <i className={`fa-solid ${currentWork?.icon || 'fa-user'} text-white text-2xl`}></i>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{npc.name}</h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <i className="fa-solid fa-home text-sm"></i>
                    <span className="text-sm">{npcType?.name || 'Aldeão'}</span>
                    {currentWork && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm font-medium">{currentWork.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Energy */}
                <div className="bg-white/70 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-bolt text-white text-sm"></i>
                    </div>
                    <span className="font-semibold text-gray-700">Energia</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{Math.round(npc.needs.energy)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${npc.needs.energy}%` }}
                    ></div>
                  </div>
                </div>

                {/* Satisfaction */}
                <div className="bg-white/70 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-smile text-white text-sm"></i>
                    </div>
                    <span className="font-semibold text-gray-700">Satisfação</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">{Math.round(npc.needs.satisfaction)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${npc.needs.satisfaction}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 sm:mb-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTasks(true);
                  }}
                  className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fa-solid fa-tasks"></i>
                  Gerenciar Tarefas
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSkillTree(true);
                  }}
                  className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fa-solid fa-tree"></i>
                  Habilidades
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInventory(true);
                  }}
                  className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fa-solid fa-backpack"></i>
                  Inventário
                </button>

                <button
                  onClick={handleWorkClick}
                  className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fa-solid fa-hammer"></i>
                  Trabalhar
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCombat(true);
                  }}
                  className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fa-solid fa-sword"></i>
                  Combate
                </button>
              </div>

              {/* Current Status */}
              <div className="bg-white/50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-info-circle text-blue-500"></i>
                  Status Atual
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <div className="font-medium text-gray-800">{stateTranslations[npc.state] || npc.state}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Horário:</span>
                    <div className="font-medium text-gray-800">{scheduleTranslations[npc.currentSchedule] || npc.currentSchedule}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Nível:</span>
                    <div className="font-medium text-purple-600">{npc.currentLevel || 1}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Experiência:</span>
                    <div className="font-medium text-green-600">{Math.round(npc.skills?.experience || 0)} XP</div>
                  </div>
                </div>
              </div>

              {/* Inventory Display */}
              <div className="bg-white/50 p-4 rounded-lg border border-gray-200 mt-4">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-box text-gray-600"></i>
                  Inventário Atual
                </h3>
                <div className="text-gray-600">
                  {npc.inventory.amount > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{npc.inventory.type}</span>
                      <span className="text-gray-500">×</span>
                      <span className="font-bold text-blue-600">{npc.inventory.amount}</span>
                    </div>
                  ) : (
                    <span className="italic">Vazio</span>
                  )}
                </div>
              </div>

              {/* Control Mode */}
              <div className="bg-white/50 p-4 rounded-lg border border-gray-200 mt-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-gamepad text-purple-500"></i>
                  Modo de Controle
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useNpcStore.getState().setNpcControlMode(npc.id, "autonomous");
                    }}
                    className={`flex-1 p-3 rounded-lg font-medium transition-all ${
                      npc.controlMode === "autonomous"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <i className="fa-solid fa-robot mr-2"></i>
                    Autônomo
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useNpcStore.getState().setNpcControlMode(npc.id, "manual");
                    }}
                    className={`flex-1 p-3 rounded-lg font-medium transition-all ${
                      npc.controlMode === "manual"
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <i className="fa-solid fa-hand text-sm mr-2"></i>
                    Manual
                  </button>
                </div>
              </div>
            </div>
          )}

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

      {showCombat && !isTemporaryNpc && (
        <CombatPanel
          entityId={npc.id}
          onClose={() => setShowCombat(false)}
        />
      )}

    </div>
  );
};

export default NpcPanel;