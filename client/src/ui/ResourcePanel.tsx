import React from 'react';
import { useResourceStore } from '../game/stores/useResourceStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { X, Coins, TreePine, Hammer, Wheat } from 'lucide-react';
import { useIsMobile, useDraggable } from '../hooks';

interface ResourcePanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ isVisible, onClose }) => {
  const resourceStore = useResourceStore();
  const { resources = {} } = resourceStore || {};
  const isMobile = useIsMobile();

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: 20, y: 120 },
    disabled: isMobile
  });

  const resourceIcons: Record<string, string> = {
    wood: 'fa-tree',
    stone: 'fa-cube',
    food: 'fa-apple-alt',
    gold: 'fa-coins',
    iron: 'fa-hammer',
    cloth: 'fa-tshirt',
    gems: 'fa-gem',
    herbs: 'fa-leaf'
  };

  const resourceColors: Record<string, string> = {
    wood: 'text-green-600',
    stone: 'text-gray-600',
    food: 'text-red-500',
    gold: 'text-yellow-500',
    iron: 'text-blue-600',
    cloth: 'text-purple-500',
    gems: 'text-pink-500',
    herbs: 'text-emerald-500'
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getResourceName = (resourceId: string): string => {
    const nameMap: Record<string, string> = {
      wood: 'Madeira',
      stone: 'Pedra',
      food: 'Comida',
      gold: 'Ouro',
      iron: 'Ferro',
      cloth: 'Tecido',
      gems: 'Gemas',
      herbs: 'Ervas'
    };
    return nameMap[resourceId] || resourceId;
  };

  if (!isVisible) return null;

  return (
    <div
      ref={dragRef}
      className={`
        resource-panel fixed z-40 
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
          className="panel-header bg-gradient-to-r from-fantasy-primary to-fantasy-secondary 
                     p-4 cursor-grab active:cursor-grabbing"
          onMouseDown={!isMobile ? handleMouseDown : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-coins text-white text-lg"></i>
              </div>
              <h2 className="text-lg font-bold text-white">Recursos</h2>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg 
                         flex items-center justify-center transition-colors duration-200"
                aria-label="Fechar painel de recursos"
              >
                <i className="fa-solid fa-times text-white"></i>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="panel-content p-4 max-h-96 overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            {Object.entries(resources).map(([resourceId, amount]) => (
              <div
                key={resourceId}
                className="resource-item bg-white/50 backdrop-blur-sm border border-white/30 
                         rounded-lg p-3 transition-all duration-200 hover:bg-white/70 
                         hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm
                      group-hover:scale-110 transition-transform duration-200
                    `}>
                      <i className={`
                        fa-solid ${resourceIcons[resourceId] || 'fa-cube'} 
                        ${resourceColors[resourceId] || 'text-gray-600'} text-lg
                      `}></i>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {getResourceName(resourceId)}
                      </h3>
                      <p className="text-xs text-gray-600 capitalize">
                        {resourceId}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-800">
                      {formatNumber(amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      unidades
                    </div>
                  </div>
                </div>

                {/* Resource bar visualization */}
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`
                        h-full transition-all duration-500 rounded-full
                        ${resourceColors[resourceId]?.replace('text-', 'bg-') || 'bg-gray-400'}
                      `}
                      style={{
                        width: `${Math.min((amount / 1000) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>1K+</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-white/30">
            <div className="bg-gradient-to-r from-fantasy-primary/20 to-fantasy-secondary/20 
                          rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total de Recursos:
                </span>
                <span className="text-lg font-bold text-fantasy-primary">
                  {Object.keys(resources).length}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-600">
                  Valor total estimado:
                </span>
                <span className="text-sm font-semibold text-fantasy-accent">
                  {formatNumber(
                    Object.entries(resources).reduce((total, [id, amount]) => {
                      const baseValue = id === 'gold' ? 1 : id === 'gems' ? 10 : 2;
                      return total + (amount * baseValue);
                    }, 0)
                  )} ouro
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePanel;