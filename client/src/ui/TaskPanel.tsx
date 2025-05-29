
import React from "react";
import { NPC, useNpcStore } from "../game/stores/useNpcStore";
import { useDraggable } from "../hooks/useDraggable";

interface TaskPanelProps {
  npc: NPC;
  onClose: () => void;
}

interface Task {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements?: string[];
  available: boolean;
}

const TaskPanel: React.FC<TaskPanelProps> = ({ npc, onClose }) => {
  const { startNpcWork, setNpcControlMode } = useNpcStore();

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 300 }
  });

  const getTasks = (): Task[] => {
    const baseTasks: Task[] = [];

    // Se for aldeão, pode fazer qualquer trabalho
    if (npc.type === "villager") {
      baseTasks.push({
        id: "mining",
        name: "Mineração",
        description: "Extrair pedras dos recursos naturais disponíveis no mapa",
        icon: "fa-hammer",
        color: "text-orange-600",
        available: true
      });

      baseTasks.push({
        id: "lumbering",
        name: "Cortar Madeira",
        description: "Cortar árvores dos recursos naturais disponíveis no mapa",
        icon: "fa-tree",
        color: "text-green-600",
        available: true
      });

      baseTasks.push({
        id: "farming",
        name: "Cultivar",
        description: "Plantar e colher cultivos nas fazendas disponíveis",
        icon: "fa-wheat-awn",
        color: "text-yellow-600",
        requirements: ["Fazenda construída", "Sementes disponíveis"],
        available: true
      });

      baseTasks.push({
        id: "baking",
        name: "Assar",
        description: "Transformar trigo em pão na padaria",
        icon: "fa-bread-slice",
        color: "text-amber-600",
        requirements: ["Padaria construída", "Trigo disponível"],
        available: true
      });
    } else {
      // Tarefas específicas para cada tipo de NPC
      switch (npc.type) {
        case "miner":
          baseTasks.push({
            id: "mining",
            name: "Mineração",
            description: "Extrair pedras dos recursos naturais disponíveis no mapa",
            icon: "fa-hammer",
            color: "text-orange-600",
            available: true
          });
          break;

        case "lumberjack":
          baseTasks.push({
            id: "lumbering",
            name: "Cortar Madeira",
            description: "Cortar árvores dos recursos naturais disponíveis no mapa",
            icon: "fa-tree",
            color: "text-green-600",
            available: true
          });
          break;

        case "farmer":
          baseTasks.push({
            id: "farming",
            name: "Cultivar",
            description: "Plantar e colher cultivos nas fazendas disponíveis",
            icon: "fa-wheat-awn",
            color: "text-yellow-600",
            requirements: ["Fazenda construída", "Sementes disponíveis"],
            available: true
          });
          break;

        case "baker":
          baseTasks.push({
            id: "baking",
            name: "Assar",
            description: "Transformar trigo em pão na padaria",
            icon: "fa-bread-slice",
            color: "text-amber-600",
            requirements: ["Padaria construída", "Trigo disponível"],
            available: true
          });
          break;
      }
    }

    // Tarefas universais
    baseTasks.push({
      id: "transport",
      name: "Transporte",
      description: "Carregar recursos para silos automaticamente",
      icon: "fa-truck",
      color: "text-blue-600",
      available: npc.inventory.amount > 0
    });

    baseTasks.push({
      id: "rest",
      name: "Descansar",
      description: "Voltar para casa e recuperar energia e satisfação",
      icon: "fa-bed",
      color: "text-purple-600",
      available: npc.needs.energy < 80 || npc.needs.satisfaction < 80
    });

    return baseTasks;
  };

  const handleTaskStart = (taskId: string) => {
    // Colocar NPC em modo autônomo para executar a tarefa
    setNpcControlMode(npc.id, "autonomous");

    // Se for aldeão, mudar temporariamente o tipo para executar o trabalho
    if (npc.type === "villager") {
      let newType = npc.type;
      switch (taskId) {
        case "mining":
          newType = "miner";
          break;
        case "lumbering":
          newType = "lumberjack";
          break;
        case "farming":
          newType = "farmer";
          break;
        case "baking":
          newType = "baker";
          break;
      }

      // Atualizar o tipo do NPC temporariamente
      useNpcStore.setState(state => ({
        npcs: state.npcs.map(n => 
          n.id === npc.id 
            ? { 
                ...n, 
                type: newType,
                // Se for fazendeiro, adicionar dados necessários
                ...(newType === "farmer" && !n.farmerData && {
                  farmerData: {
                    currentTask: "waiting",
                    targetFarmId: null,
                    targetSiloId: null,
                    selectedSeed: null
                  }
                })
              }
            : n
        )
      }));
    }

    switch (taskId) {
      case "mining":
      case "lumbering":
      case "farming":
      case "baking":
        startNpcWork(npc.id);
        break;

      case "transport":
        // NPC automaticamente irá para silo se tiver itens
        if (npc.inventory.amount > 0) {
          useNpcStore.setState(state => ({
            npcs: state.npcs.map(n => 
              n.id === npc.id 
                ? { ...n, state: "idle" as const }
                : n
            )
          }));
        }
        break;

      case "rest":
        // Forçar NPC a ir para casa
        useNpcStore.setState(state => ({
          npcs: state.npcs.map(n => 
            n.id === npc.id 
              ? { 
                  ...n, 
                  state: "idle" as const,
                  targetPosition: null,
                  targetResource: null,
                  targetBuildingId: null
                }
              : n
          )
        }));
        break;
    }

    onClose();
  };

  const tasks = getTasks();

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-white rounded-xl w-96 max-h-[80vh] overflow-hidden relative shadow-2xl"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <i className="fa-solid fa-tasks text-blue-600"></i>
            </div>
            <h2 className="text-lg font-bold text-white">Tarefas Disponíveis</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* NPC Info */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              npc.type === "miner" ? "bg-orange-100" :
              npc.type === "lumberjack" ? "bg-green-100" :
              npc.type === "farmer" ? "bg-yellow-100" : "bg-blue-100"
            }`}>
              <i className={`fa-solid ${
                npc.type === "miner" ? "fa-helmet-safety" :
                npc.type === "lumberjack" ? "fa-tree" :
                npc.type === "farmer" ? "fa-wheat-awn" : "fa-bread-slice"
              } ${
                npc.type === "miner" ? "text-orange-600" :
                npc.type === "lumberjack" ? "text-green-600" :
                npc.type === "farmer" ? "text-yellow-600" : "text-blue-600"
              }`}></i>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{npc.name}</h3>
              <p className="text-sm text-gray-600">
                {npc.type === "miner" ? "Minerador" :
                 npc.type === "lumberjack" ? "Lenhador" :
                 npc.type === "farmer" ? "Fazendeiro" : "Padeiro"}
              </p>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="max-h-96 overflow-y-auto">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`p-4 border-b border-gray-100 transition-colors ${
                task.available 
                  ? "hover:bg-gray-50 cursor-pointer" 
                  : "bg-gray-100 cursor-not-allowed opacity-60"
              }`}
              onClick={() => task.available && handleTaskStart(task.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  task.available ? "bg-blue-100" : "bg-gray-200"
                }`}>
                  <i className={`fa-solid ${task.icon} ${
                    task.available ? task.color : "text-gray-400"
                  }`}></i>
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    task.available ? "text-gray-800" : "text-gray-500"
                  }`}>
                    {task.name}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    task.available ? "text-gray-600" : "text-gray-400"
                  }`}>
                    {task.description}
                  </p>
                  {task.requirements && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Requisitos:</p>
                      <ul className="text-xs text-gray-500">
                        {task.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <i className="fa-solid fa-check text-green-500 text-xs"></i>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {task.available && (
                  <div className="text-blue-500">
                    <i className="fa-solid fa-play text-sm"></i>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fa-solid fa-info-circle text-blue-500"></i>
            <span>Clique em uma tarefa para iniciar automaticamente</span>
          </div>
          
          {npc.type === "villager" && (
            <div className="mt-2 p-2 bg-green-100 rounded-lg border border-green-200">
              <p className="text-xs text-green-700">
                <i className="fa-solid fa-star"></i>
                {" "}Aldeões são versáteis e podem realizar qualquer trabalho disponível.
              </p>
            </div>
          )}
          
          {npc.controlMode === "manual" && (
            <div className="mt-2 p-2 bg-yellow-100 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700">
                <i className="fa-solid fa-exclamation-triangle"></i>
                {" "}NPC está em modo manual. As tarefas mudarão para modo autônomo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPanel;
