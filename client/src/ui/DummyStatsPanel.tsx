import React from 'react';
import { useDummyStore } from '../game/stores/useDummyStore';
import { useDraggable } from '../hooks/useDraggable';

interface DummyStatsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const DummyStatsPanel: React.FC<DummyStatsPanelProps> = ({ isVisible, onClose }) => {
  const { dummies, resetDummyStats } = useDummyStore();

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth - 320, y: 20 }
  });

  if (!isVisible) return null;

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Nunca';
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) return `${minutes}m ${seconds % 60}s atrás`;
    return `${seconds}s atrás`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-md lg:max-w-lg h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-slate-700 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-bullseye text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Estatísticas de Combate</h2>
            <p className="text-sm text-slate-400">Dummy de Treinamento</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <i className="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {dummies.length === 0 ? (
          <div className="text-center py-8">
            <i className="fa-solid fa-bullseye text-4xl text-slate-600 mb-3"></i>
            <p className="text-slate-400">Nenhum dummy encontrado</p>
          </div>
        ) : (
          dummies.map(dummy => (
            <div key={dummy.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-200">
                  Dummy ({dummy.position.join(', ')})
                </h3>
                <button
                  onClick={() => resetDummyStats(dummy.id)}
                  className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-slate-400">Total de Hits:</div>
                  <div className="font-medium text-yellow-400">{dummy.hits}</div>
                </div>
                <div>
                  <div className="text-slate-400">Dano Total:</div>
                  <div className="font-medium text-red-400">{dummy.damageReceived}</div>
                </div>
                <div>
                  <div className="text-slate-400">Dano Médio:</div>
                  <div className="font-medium text-blue-400">
                    {dummy.hits > 0 ? Math.round(dummy.damageReceived / dummy.hits) : 0}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Último Hit:</div>
                  <div className="font-medium text-green-400 text-xs">
                    {formatTime(dummy.lastHitTime)}
                  </div>
                </div>
              </div>

              {/* Barra de vida (sempre cheia para dummy) */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Vida</span>
                  <span>∞</span>
                </div>
                <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-green-500 w-full"></div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Instruções */}
        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
          <div className="flex items-start gap-2">
            <i className="fa-solid fa-info-circle text-blue-400 text-sm mt-0.5"></i>
            <div className="text-xs text-blue-200">
              <p className="font-medium mb-1">Como usar:</p>
              <p>• Clique no dummy para atacar</p>
              <p>• Configure NPCs para atacar automaticamente</p>
              <p>• Use o botão Reset para limpar estatísticas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DummyStatsPanel;
`