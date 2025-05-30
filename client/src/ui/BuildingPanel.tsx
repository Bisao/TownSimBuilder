
import React, { useState } from 'react';
import { useBuildingStore } from '../game/stores/useBuildingStore';
import { useGameStore } from '../game/stores/useGameStore';
import { buildingTypes } from '../game/constants/buildings';
import { useDraggable } from '../hooks/useDraggable';
import { useIsMobile } from '../hooks/useIsMobile';

interface BuildingPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

const BuildingPanel: React.FC<BuildingPanelProps> = ({ isVisible, onClose }) => {
  const { buildings, placementMode, setPlacementMode, selectedBuildingType } = useBuildingStore();
  const { gameMode } = useGameStore();
  const isMobile = useIsMobile();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth - 350, y: 120 },
    disabled: isMobile
  });

  const buildingCategories = {
    all: 'Todos',
    housing: 'Habitação',
    production: 'Produção',
    storage: 'Armazenamento',
    military: 'Militar',
    decoration: 'Decoração'
  };

  const getBuildingsByCategory = () => {
    if (selectedCategory === 'all') {
      return Object.entries(buildingTypes);
    }
    
    return Object.entries(buildingTypes).filter(([_, building]) => 
      building.category === selectedCategory
    );
  };

  const getBuildingIcon = (buildingType: string) => {
    const iconMap: Record<string, string> = {
      house: 'fa-home',
      farm: 'fa-seedling',
      mine: 'fa-mountain',
      lumber_mill: 'fa-tree',
      market: 'fa-store',
      tavern: 'fa-beer',
      blacksmith: 'fa-hammer',
      storage: 'fa-boxes',
      wall: 'fa-shield-alt',
      tower: 'fa-chess-rook'
    };
    return iconMap[buildingType] || 'fa-building';
  };

  const getBuildingColor = (buildingType: string) => {
    const colorMap: Record<string, string> = {
      house: 'from-blue-500 to-blue-600',
      farm: 'from-green-500 to-green-600',
      mine: 'from-gray-500 to-gray-600',
      lumber_mill: 'from-brown-500 to-brown-600',
      market: 'from-purple-500 to-purple-600',
      tavern: 'from-orange-500 to-orange-600',
      blacksmith: 'from-red-500 to-red-600',
      storage: 'from-yellow-500 to-yellow-600',
      wall: 'from-stone-500 to-stone-600',
      tower: 'from-indigo-500 to-indigo-600'
    };
    return colorMap[buildingType] || 'from-gray-400 to-gray-500';
  };

  const handleBuildingSelect = (buildingId: string) => {
    if (gameMode === 'build') {
      setPlacementMode(buildingId);
    }
  };

  const getBuildingCount = (buildingType: string) => {
    return buildings.filter(b => b.type === buildingType).length;
  };

  const canAffordBuilding = (building: any) => {
    // Simplified cost check - in a real game, you'd check against actual resources
    return true;
  };

  if (!isVisible) return null;

  return (
    <div
      ref={dragRef}
      className={`
        building-panel fixed z-40 
        ${isMobile 
          ? 'inset-x-4 top-20 max-h-96' 
          : 'w-96 max-h-screen'
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
          className="panel-header bg-gradient-to-r from-fantasy-secondary to-fantasy-wood 
                     p-4 cursor-grab active:cursor-grabbing"
          onMouseDown={!isMobile ? handleMouseDown : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-building text-white text-lg"></i>
              </div>
              <h2 className="text-lg font-bold text-white">Construções</h2>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg 
                         flex items-center justify-center transition-colors duration-200"
                aria-label="Fechar painel de construções"
              >
                <i className="fa-solid fa-times text-white"></i>
              </button>
            )}
          </div>

          {/* Mode Indicator */}
          {gameMode === 'build' && (
            <div className="mt-3 px-3 py-2 bg-green-500/20 border border-green-400/30 
                          rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 text-green-100">
                <i className="fa-solid fa-hammer text-sm"></i>
                <span className="text-sm font-medium">Modo Construção Ativo</span>
              </div>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="px-4 pt-4">
          <div className="flex gap-1 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
            {Object.entries(buildingCategories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`
                  flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                  ${selectedCategory === key 
                    ? 'bg-white text-fantasy-primary shadow-sm' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="panel-content p-4 max-h-96 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-3">
            {getBuildingsByCategory().map(([buildingId, building]) => {
              const count = getBuildingCount(buildingId);
              const canAfford = canAffordBuilding(building);
              const isSelected = selectedBuildingType === buildingId;

              return (
                <div
                  key={buildingId}
                  onClick={() => handleBuildingSelect(buildingId)}
                  className={`
                    building-item relative overflow-hidden rounded-lg border-2 transition-all duration-200
                    cursor-pointer group
                    ${isSelected 
                      ? 'border-fantasy-accent bg-fantasy-accent/20 shadow-lg scale-105' 
                      : canAfford
                      ? 'border-white/30 bg-white/50 hover:border-fantasy-accent/50 hover:bg-white/70 hover:shadow-md'
                      : 'border-gray-400/30 bg-gray-200/30 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Building Icon */}
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center
                        bg-gradient-to-br ${getBuildingColor(buildingId)} shadow-sm
                        group-hover:scale-110 transition-transform duration-200
                      `}>
                        <i className={`fa-solid ${getBuildingIcon(buildingId)} text-white text-lg`}></i>
                      </div>

                      {/* Building Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {building.name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {building.description}
                        </p>
                      </div>

                      {/* Count Badge */}
                      {count > 0 && (
                        <div className="w-8 h-8 bg-fantasy-primary rounded-full flex items-center 
                                      justify-center shadow-sm">
                          <span className="text-white text-xs font-bold">{count}</span>
                        </div>
                      )}
                    </div>

                    {/* Cost */}
                    {building.cost && (
                      <div className="mt-3 pt-3 border-t border-white/30">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(building.cost).map(([resource, amount]) => (
                            <div key={resource} className="flex items-center gap-1 text-xs">
                              <i className={`fa-solid fa-${resource === 'wood' ? 'tree' : resource === 'stone' ? 'cube' : 'coins'} 
                                           text-gray-600`}></i>
                              <span className="text-gray-700 font-medium">{amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-fantasy-accent rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-check text-white text-xs"></i>
                      </div>
                    </div>
                  )}

                  {/* Placement Mode Indicator */}
                  {placementMode === buildingId && (
                    <div className="absolute inset-0 bg-fantasy-accent/20 border-2 border-fantasy-accent 
                                  rounded-lg animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-white/30">
            <div className="bg-gradient-to-r from-fantasy-secondary/20 to-fantasy-wood/20 
                          rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total de Construções:
                </span>
                <span className="text-lg font-bold text-fantasy-secondary">
                  {buildings.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingPanel;
