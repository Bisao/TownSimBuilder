import React, { useState } from "react";
import { useDraggable } from "../hooks/useDraggable";
import { useNpcStore } from "../game/stores/useNpcStore";

interface NpcCreationPanelProps {
  houseId: string;
  housePosition: [number, number];
  onClose: () => void;
  onNpcCreated: (npcId: string) => void;
}

const NpcCreationPanel: React.FC<NpcCreationPanelProps> = ({ 
  houseId, 
  housePosition, 
  onClose, 
  onNpcCreated 
}) => {
  const { spawnNPC } = useNpcStore();
  const [npcName, setNpcName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 250 }
  });

  const handleCreateNpc = () => {
    if (!npcName.trim()) return;

    setIsCreating(true);

    // Simular delay para melhor UX
    setTimeout(() => {
      const newNpcId = spawnNPC(
        houseId,
        [housePosition[0] + 0.5, 0, housePosition[1] + 0.5],
        npcName.trim()
      );

      if (newNpcId) {
        onNpcCreated(newNpcId);
      }
      setIsCreating(false);
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 w-[600px] relative border border-slate-600 shadow-2xl"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).tagName === 'INPUT') {
            return;
          }
          handleMouseDown(e);
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700"
        >
          <i className="fa-solid fa-times"></i>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fa-solid fa-user-plus text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Criar Novo Aldeão</h2>
          <p className="text-slate-400 text-lg">Dê vida a um novo habitante da vila</p>
        </div>

        {/* Villager Preview Card */}
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-user text-white text-2xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Aldeão</h3>
              <p className="text-slate-400">Habitante versátil da vila</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <i className="fa-solid fa-star text-yellow-400"></i>
              Características
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">Versátil em tarefas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-300">Aprende rapidamente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-slate-300">Pode especializar-se</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-slate-300">Sociável</span>
              </div>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-white mb-3">
            <i className="fa-solid fa-signature text-blue-400 mr-2"></i>
            Nome do Aldeão
          </label>
          <input
            type="text"
            value={npcName}
            onChange={(e) => setNpcName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && npcName.trim() && !isCreating) {
                handleCreateNpc();
              }
            }}
            placeholder="Digite um nome único..."
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-lg transition-all"
            maxLength={20}
            autoFocus
          />
          <div className="flex justify-between mt-2">
            <span className="text-slate-400 text-sm">
              {npcName.length > 0 && (
                <i className="fa-solid fa-check text-green-400 mr-1"></i>
              )}
              Dê um nome especial ao seu aldeão
            </span>
            <span className="text-slate-400 text-sm">{npcName.length}/20</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-600/50 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all border border-slate-500"
          >
            <i className="fa-solid fa-times mr-2"></i>
            Cancelar
          </button>
          <button
            onClick={handleCreateNpc}
            disabled={!npcName.trim() || isCreating}
            className="flex-2 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isCreating ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Criando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-sparkles text-lg"></i>
                Criar Aldeão
              </>
            )}
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-600">
          <div className="flex items-start gap-3 text-slate-400 text-sm">
            <i className="fa-solid fa-lightbulb text-yellow-400 text-lg mt-0.5"></i>
            <div>
              <p className="font-medium text-slate-300 mb-1">Dica:</p>
              <p>Seu novo aldeão começará morando nesta casa e poderá aprender diferentes profissões conforme trabalha. Você pode atribuir trabalhos específicos através do painel de tarefas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NpcCreationPanel;