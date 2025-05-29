import React, { useState } from "react";
import { useDraggable } from "../hooks/useDraggable";
import { useNpcStore } from "../game/stores/useNpcStore";
import { npcTypes } from "../game/constants/npcs";

interface NpcCreationPanelProps {
  houseId: string;
  housePosition: [number, number];
  onClose: () => void;
  onNpcCreated: (npcId: string) => void;
}

interface NpcClass {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  baseStats: {
    gathering: number;
    working: number;
    efficiency: number;
  };
}

const npcClasses: NpcClass[] = [
  {
    id: "villager",
    name: "Aldeão",
    description: "Um habitante comum da vila. Versátil em tarefas básicas.",
    icon: "fa-user",
    color: "bg-gray-500",
    baseStats: { gathering: 15, working: 15, efficiency: 15 }
  },
  {
    id: "miner",
    name: "Minerador",
    description: "Especialista em extrair recursos minerais das montanhas.",
    icon: "fa-helmet-safety",
    color: "bg-blue-500",
    baseStats: { gathering: 25, working: 20, efficiency: 10 }
  },
  {
    id: "lumberjack",
    name: "Lenhador",
    description: "Especialista em cortar madeira das florestas.",
    icon: "fa-tree",
    color: "bg-green-500",
    baseStats: { gathering: 25, working: 20, efficiency: 10 }
  },
  {
    id: "farmer",
    name: "Fazendeiro",
    description: "Especialista em cultivar alimentos e plantas.",
    icon: "fa-wheat-awn",
    color: "bg-yellow-500",
    baseStats: { gathering: 20, working: 25, efficiency: 10 }
  },
  {
    id: "baker",
    name: "Padeiro",
    description: "Especialista em preparar alimentos e produtos de panificação.",
    icon: "fa-bread-slice",
    color: "bg-orange-500",
    baseStats: { gathering: 10, working: 25, efficiency: 20 }
  }
];

const NpcCreationPanel: React.FC<NpcCreationPanelProps> = ({ 
  houseId, 
  housePosition, 
  onClose, 
  onNpcCreated 
}) => {
  const { spawnNPC } = useNpcStore();
  const [selectedClass, setSelectedClass] = useState<string>("villager");
  const [npcName, setNpcName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 400, y: window.innerHeight / 2 - 300 }
  });

  const selectedNpcClass = npcClasses.find(c => c.id === selectedClass);

  const handleCreateNpc = () => {
    if (!npcName.trim()) return;

    const newNpcId = spawnNPC(
      houseId,
      [housePosition[0] + 0.5, 0, housePosition[1] + 0.5],
      npcName.trim()
    );

    if (newNpcId) {
      onNpcCreated(newNpcId);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto relative border border-slate-600 shadow-2xl"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={(e) => {
          // Não iniciar drag se o clique for no input
          if ((e.target as HTMLElement).tagName === 'INPUT') {
            return;
          }
          handleMouseDown(e);
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-user-plus text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Criar Novo NPC</h2>
              <p className="text-slate-400">Escolha a classe e personalize seu novo habitante</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Class Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Escolha a Classe</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {npcClasses.map((npcClass) => (
              <div
                key={npcClass.id}
                onClick={() => setSelectedClass(npcClass.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedClass === npcClass.id
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${npcClass.color} rounded-full flex items-center justify-center text-white`}>
                    <i className={`fa-solid ${npcClass.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{npcClass.name}</h4>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-3">{npcClass.description}</p>

                {/* Stats Preview */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Coleta:</span>
                    <span className="text-green-400">{npcClass.baseStats.gathering}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Trabalho:</span>
                    <span className="text-blue-400">{npcClass.baseStats.working}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Eficiência:</span>
                    <span className="text-purple-400">{npcClass.baseStats.efficiency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Character Customization */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Personalização</h3>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Nome do NPC
              </label>
              <input
                type="text"
                value={npcName}
                onChange={(e) => setNpcName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Digite um nome único"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                maxLength={30}
                autoFocus
              />
            </div>

            {/* Selected Class Preview */}
            {selectedNpcClass && (
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <h4 className="font-semibold text-white mb-2">Prévia da Classe</h4>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${selectedNpcClass.color} rounded-full flex items-center justify-center text-white text-xl`}>
                    <i className={`fa-solid ${selectedNpcClass.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white">{selectedNpcClass.name}</h5>
                    <p className="text-sm text-slate-400 mb-2">{selectedNpcClass.description}</p>

                    {/* Stats Bars */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-16">Coleta:</span>
                        <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500"
                            style={{ width: `${(selectedNpcClass.baseStats.gathering / 30) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-green-400">{selectedNpcClass.baseStats.gathering}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-16">Trabalho:</span>
                        <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500"
                            style={{ width: `${(selectedNpcClass.baseStats.working / 30) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-blue-400">{selectedNpcClass.baseStats.working}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-16">Eficiência:</span>
                        <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500"
                            style={{ width: `${(selectedNpcClass.baseStats.efficiency / 30) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-purple-400">{selectedNpcClass.baseStats.efficiency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateNpc}
            disabled={!npcName.trim() || isCreating}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Criando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-user-plus"></i>
                Criar NPC
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-600">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <i className="fa-solid fa-info-circle"></i>
            <span>O NPC será criado na casa selecionada e começará com habilidades básicas que podem ser melhoradas com o tempo.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NpcCreationPanel;