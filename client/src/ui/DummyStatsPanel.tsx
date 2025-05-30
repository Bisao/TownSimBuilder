
import React, { useState } from 'react';
import { useDummyStore } from '../game/stores/useDummyStore';
import { useCombatStore } from '../game/stores/useCombatStore';
import { useDraggable } from '../hooks/useDraggable';
import { useIsMobile } from '../hooks/useIsMobile';

interface DummyStatsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const DummyStatsPanel: React.FC<DummyStatsPanelProps> = ({ isVisible, onClose }) => {
  const { dummies } = useDummyStore();
  const { combatEntities } = useCombatStore();
  const isMobile = useIsMobile();
  
  const [selectedDummy, setSelectedDummy] = useState<string | null>(null);

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: 20, y: 300 },
    disabled: isMobile
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDummyStats = (dummyId: string) => {
    // In a real implementation, this would come from the dummy store
    return {
      totalHits: Math.floor(Math.random() * 1000),
      damageDealt: Math.floor(Math.random() * 50000),
      criticalHits: Math.floor(Math.random() * 100),
      trainingTime: Math.floor(Math.random() * 3600), // seconds
      activeTrainers: Array.from(combatEntities.values()).filter(entity => 
        entity.combatState === 'combat' // Simplified check
      ).length
    };
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (!isVisible) return null;

  return (
    <div
      ref={dragRef}
      className={`
        dummy-stats-panel fixed z-40 
        ${isMobile 
          ? 'inset-x-4 top-20 max-h-96' 
          : 'w-80 max-h-screen'
        }
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      style={!isMobile ? { 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      } : {}}
    >
      <div className="panel-base bg-glass-bg backdrop-blur-lg border border-glass-border 
                      rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="panel-header bg-gradient-to-r from-red-600 to-orange-600 
                     p-4 cursor-grab active:cursor-grabbing"
          onMouseDown={!isMobile ? handleMouseDown : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-crosshairs text-white text-lg"></i>
              </div>
              <h2 className="text-lg font-bold text-white">Treino de Combate</h2>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg 
                       flex items-center justify-center transition-colors duration-200"
              aria-label="Fechar painel de treino"
            >
              <i className="fa-solid fa-times text-white"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="panel-content p-4 max-h-96 overflow-y-auto custom-scrollbar">
          {dummies.length === 0 ? (
            <div className="text-center py-8">
              <i className="fa-solid fa-target text-4xl text-gray-400 mb-3"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum Dummy de Treino
              </h3>
              <p className="text-gray-500 text-sm">
                Construa dummies de treino para permitir que os NPCs pratiquem combate.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overview Stats */}
              <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-red-600"></i>
                  Estatísticas Gerais
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{dummies.length}</div>
                    <div className="text-xs text-gray-600">Dummies Ativos</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Array.from(combatEntities.values()).filter(e => 
                        e.combatState === 'combat'
                      ).length}
                    </div>
                    <div className="text-xs text-gray-600">NPCs Treinando</div>
                  </div>
                </div>
              </div>

              {/* Dummy List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <i className="fa-solid fa-list text-orange-600"></i>
                  Dummies de Treino
                </h3>
                
                {dummies.map((dummy) => {
                  const stats = getDummyStats(dummy.id);
                  const isSelected = selectedDummy === dummy.id;
                  
                  return (
                    <div
                      key={dummy.id}
                      onClick={() => setSelectedDummy(isSelected ? null : dummy.id)}
                      className={`
                        bg-white/40 rounded-lg p-3 backdrop-blur-sm cursor-pointer
                        transition-all duration-200 hover:bg-white/60
                        ${isSelected ? 'ring-2 ring-red-500 bg-white/70' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 
                                        rounded-lg flex items-center justify-center">
                            <i className="fa-solid fa-crosshairs text-white text-sm"></i>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">
                              Dummy #{dummy.id.slice(-4)}
                            </h4>
                            <p className="text-xs text-gray-600">
                              Posição: {dummy.position.map(p => Math.round(p)).join(', ')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-800">
                            {stats.activeTrainers}
                          </div>
                          <div className="text-xs text-gray-500">treinando</div>
                        </div>
                      </div>

                      {/* Expanded Stats */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-white/30 space-y-2">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-600">Total de Golpes:</span>
                              <div className="font-semibold text-gray-800">
                                {formatNumber(stats.totalHits)}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Dano Total:</span>
                              <div className="font-semibold text-gray-800">
                                {formatNumber(stats.damageDealt)}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Golpes Críticos:</span>
                              <div className="font-semibold text-gray-800">
                                {formatNumber(stats.criticalHits)}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Tempo de Treino:</span>
                              <div className="font-semibold text-gray-800">
                                {formatTime(stats.trainingTime)}
                              </div>
                            </div>
                          </div>

                          {/* Progress Bars */}
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Eficácia de Treino</span>
                                <span className="font-medium">
                                  {((stats.criticalHits / Math.max(stats.totalHits, 1)) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-green-600 
                                           transition-all duration-500"
                                  style={{ 
                                    width: `${Math.min((stats.criticalHits / Math.max(stats.totalHits, 1)) * 100, 100)}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 
                                             text-white text-xs rounded-md transition-colors duration-200
                                             flex items-center justify-center gap-1">
                              <i className="fa-solid fa-eye"></i>
                              Focar
                            </button>
                            
                            <button className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 
                                             text-white text-xs rounded-md transition-colors duration-200
                                             flex items-center justify-center gap-1">
                              <i className="fa-solid fa-chart-bar"></i>
                              Detalhes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Training Tips */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 
                            rounded-lg p-3 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-lightbulb text-orange-600"></i>
                  Dicas de Treino
                </h4>
                <ul className="text-xs text-orange-700 space-y-1">
                  <li>• NPCs ganham experiência atacando dummies</li>
                  <li>• Múltiplos NPCs podem usar o mesmo dummy</li>
                  <li>• Golpes críticos melhoram as habilidades mais rapidamente</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DummyStatsPanel;
