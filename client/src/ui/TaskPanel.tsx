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
  const { startNpcWork, setNpcControlMode, assignWork } = useNpcStore();

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
    try {
      // Colocar NPC em modo autônomo para executar a tarefa
      setNpcControlMode(npc.id, "autonomous");

      // Atribuir trabalho baseado na tarefa
      switch (taskId) {
        case "mining":
          assignWork(npc.id, "miner");
          break;
        case "lumbering":
          assignWork(npc.id, "lumberjack");
          break;
        case "farming":
          assignWork(npc.id, "farmer");
          break;
        case "baking":
          assignWork(npc.id, "baker");
          break;
        case "transport":
          // Não precisa atribuir trabalho específico para transporte
          break;
        case "rest":
          // Para descansar, remove trabalho atual
          assignWork(npc.id, null);
          break;
      }

      // Iniciar trabalho
      startNpcWork(npc.id);

      console.log(`Tarefa ${taskId} iniciada para NPC ${npc.id}`);
      onClose();
    } catch (error) {
      console.error(`Erro ao iniciar tarefa ${taskId}:`, error);
    }
  };

  const tasks = getTasks();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl responsive-panel-medium overflow-hidden relative border border-gray-200"
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
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <i className="fa-solid fa-tasks text-xl text-white"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">Gerenciar Tarefas</h2>
                  <p className="text-white/90 font-medium">{npc.name}</p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30"
              >
                <i className="fa-solid fa-times text-white"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  task.available 
                    ? "bg-white hover:bg-gray-50 border-gray-200 hover:border-purple-300 cursor-pointer" 
                    : "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
                }`}
                onClick={() => task.available && handleTaskStart(task.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg`}>
                    <i className={`fa-solid ${task.icon} text-white text-lg`}></i>
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${task.color} mb-1`}>{task.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>

                    {task.requirements && (
                      <div className="flex flex-wrap gap-1">
                        {task.requirements.map((req, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    {task.available ? (
                      <i className="fa-solid fa-play text-green-600 text-xl"></i>
                    ) : (
                      <i className="fa-solid fa-lock text-gray-400 text-xl"></i>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status atual do NPC */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-info-circle"></i>
              Status Atual
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Trabalho:</span>
                <div className="text-blue-800">{npc.assignedWork || "Nenhum"}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Estado:</span>
                <div className="text-blue-800">{npc.state}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Energia:</span>
                <div className="text-blue-800">{Math.round(npc.needs.energy)}%</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Satisfação:</span>
                <div className="text-blue-800">{Math.round(npc.needs.satisfaction)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPanel;