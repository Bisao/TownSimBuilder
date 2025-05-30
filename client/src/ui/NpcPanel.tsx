import React, { useState } from "react";
import { NPC, useNpcStore } from "../game/stores/useNpcStore";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useCombatStore } from "../game/stores/useCombatStore";
import { useDummyStore } from "../game/stores/useDummyStore";
import { npcTypes, workTypes } from "../game/constants/npcs";
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

  const handleCombatClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Encontrar o dummy mais próximo usando useDummyStore
    const dummyStore = useDummyStore.getState();
    const dummies = dummyStore.dummies;

    if (dummies.length === 0) {
      console.log("Nenhum dummy de treinamento encontrado!");
      return;
    }

    // Calcular distância para cada dummy e encontrar o mais próximo
    const nearestDummy = dummies.reduce((nearest, dummy) => {
      const distToNearest = Math.hypot(
        nearest.position[0] - npc.position[0],
        nearest.position[2] - npc.position[2]
      );
      const distToCurrent = Math.hypot(
        dummy.position[0] - npc.position[0],
        dummy.position[2] - npc.position[2]
      );
      return distToCurrent < distToNearest ? dummy : nearest;
    });

    // Verificar se a entidade de combate já existe
    const { combatEntities, addCombatEntity } = useCombatStore.getState();

    if (!combatEntities.has(npc.id)) {
      // Criar entidade de combate para o NPC
      const combatEntity = {
        id: npc.id,
        name: npc.name,
        position: npc.position,
        stats: {
          health: 100,
          maxHealth: 100,
          mana: 50,
          maxMana: 50,
          stamina: 100,
          maxStamina: 100,
          physicalDamage: 10,
          magicalDamage: 5,
          physicalDefense: 5,
          magicalDefense: 3,
          accuracy: 0.85,
          evasion: 0.1,
          criticalChance: 0.05,
          criticalDamage: 1.5,
          speed: 1.0
        },
        equipment: {
          weapon: {
            id: 'basic_sword',
            name: 'Espada Básica',
            type: 'sword',
            damage: 15,
            requirements: { level: 1 }
          },
          armor: {}
        },
        activeEffects: [],
        combatState: 'idle' as const,
        specialization: 'warrior' as const
      };

      addCombatEntity(combatEntity);
    }

    // Atualizar NPC para ir até o dummy e entrar em modo de combate
    updateNpc(npc.id, {
      controlMode: "manual",
      isPlayerControlled: true,
      targetPosition: [nearestDummy.position[0], 0, nearestDummy.position[2]],
      targetBuildingId: nearestDummy.id,
      state: "moving",
      combatTarget: nearestDummy.id
    });

    console.log(`${npc.name} está se movendo para atacar o dummy em [${nearestDummy.position.join(', ')}]`);
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
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden relative border border-gray-200 w-full max-w-4xl h-full max-h-screen flex flex-col"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
      >
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${getWorkColor(currentWork?.id)} p-4 text-white relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <i className={`fa-solid ${currentWork?.icon || "fa-user"} text-lg text-white`}></i>
                  </div>
                  {npc.controlMode === "manual" && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-white">
                      <i className="fa-solid fa-gamepad text-xs text-white"></i>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">{npc.name}</h2>
                  <p className="text-white/90 font-medium text-sm">
                    {currentWork ? currentWork.name : "Sem trabalho"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      npc.state === "working" ? "bg-green-400" :
                      npc.state === "moving" ? "bg-yellow-400" :
                      npc.state === "resting" ? "bg-blue-400" : "bg-gray-300"
                    }`}></div>
                    <span className="text-xs text-white/80">{stateTranslations[npc.state]}</span>
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
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30"
                  title="Focar câmera no NPC"
                >
                  <i className="fa-solid fa-eye text-white text-sm"></i>
                </button>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30"
                >
                  <i className="fa-solid fa-times text-white text-sm"></i>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {npc.workProgress > 0 && (
              <div className="bg-white/20 rounded-full h-1.5 overflow-hidden backdrop-blur-sm mt-2">
                <div 
                  className="h-full bg-white/80 transition-all duration-300 rounded-full" 
                  style={{width: `${npc.workProgress * 100}%`}}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">

          {/* Create NPC Section for Empty Houses */}
          {isTemporaryNpc && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <i className="fa-solid fa-home text-white text-2xl"></i>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Casa Vazia</h3>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  Esta casa não possui um morador. Você pode criar um novo NPC para habitar este local.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNpcCreation(true);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i className="fa-solid fa-user-plus"></i>
                  Criar Novo NPC
                </button>
              </div>
            </div>
          )}

          {/* Main NPC Info - Only show when NPC exists */}
          {!isTemporaryNpc && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-user text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{npc.name}</h2>
                  <div className="flex items-center gap-1 text-gray-600">
                    <i className="fa-solid fa-home text-xs"></i>
                    <span className="text-sm">{npcType?.name || 'Aldeão'}</span>
                  </div>
                </div>
              </div>
              {/* Control Mode Section */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Modo de Controle</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useNpcStore.getState().setNpcControlMode(npc.id, "autonomous");
                    }}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      npc.controlMode === "autonomous" 
                        ? "bg-blue-500 text-white shadow-md" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <i className="fa-solid fa-robot"></i>
                    Autônomo
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useNpcStore.getState().setNpcControlMode(npc.id, "manual");
                    }}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      npc.controlMode === "manual" 
                        ? "bg-green-500 text-white shadow-md" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <i className="fa-solid fa-gamepad"></i>
                    Controlar
                  </button>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="p-4 space-y-3">
                {/* Top Row - 3 buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTasks(true);
                    }}
                    className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-list-check"></i>
                    Tarefas
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSkillTree(true);
                    }}
                    className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-tree"></i>
                    Habilidades
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInventory(true);
                    }}
                    className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-backpack"></i>
                    Inventário
                  </button>
                </div>

                {/* Bottom Row - 2 buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleWorkClick}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-hammer"></i>
                    Trabalhar
                  </button>

                  <button
                    onClick={handleCombatClick}
                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-sword"></i>
                    Combate
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