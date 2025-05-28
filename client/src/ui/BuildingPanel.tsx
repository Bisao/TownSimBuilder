
import { useGameStore } from "../game/stores/useGameStore";
import { buildingTypes } from "../game/constants/buildings";
import { resourceTypes } from "../game/constants/resources";
import { useResourceStore } from "../game/stores/useResourceStore";
import { cn } from "../lib/utils";
import { useDraggable } from "../hooks/useDraggable";
import { useState, useEffect } from "react";

const BuildingPanel = ({ isVisible }: { isVisible: boolean }) => {
  const { selectBuildingType, selectedBuildingType } = useGameStore();
  const { resources } = useResourceStore();
  const { dragRef, position, isDragging } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 200, y: window.innerHeight - 200 }
  });
  const [panelVisible, setPanelVisible] = useState(isVisible);

  // Controla a visibilidade do painel
  useEffect(() => {
    if (selectedBuildingType) {
      setPanelVisible(false);
    } else {
      setPanelVisible(isVisible);
    }
  }, [selectedBuildingType, isVisible]);

  if (!panelVisible) return null;

  const handleSelectBuilding = (type: string) => {
    selectBuildingType(type);
    // O painel será ocultado automaticamente pelo useEffect
  };

  // Verifica se o jogador tem recursos suficientes para um edifício
  const canAfford = (type: string) => {
    const buildingType = buildingTypes[type];
    if (!buildingType) return false;

    for (const [resourceType, amount] of Object.entries(buildingType.cost)) {
      if ((resources[resourceType] || 0) < amount) {
        return false;
      }
    }

    return true;
  };

  // Ícones para cada tipo de estrutura
  const getBuildingIcon = (buildingId: string) => {
    switch (buildingId) {
      case 'house':
        return '🏠';
      case 'farm':
        return '🌾';
      case 'waterWell':
        return '🚰';
      case 'silo':
        return '🏭';
      default:
        return '🏗️';
    }
  };

  return (
    <div
      ref={dragRef}
      className="fixed bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🏗️</span>
          </div>
          <h2 className="text-xl font-bold text-white">Estruturas</h2>
        </div>
        <button
          onClick={() => setPanelVisible(false)}
          className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors flex items-center justify-center text-red-400 hover:text-red-300"
        >
          ×
        </button>
      </div>

      {/* Grid de estruturas */}
      <div className="grid grid-cols-2 gap-4 w-80">
        {Object.values(buildingTypes).map((building) => {
          const affordable = canAfford(building.id);
          
          return (
            <div
              key={building.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105",
                affordable
                  ? "border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-700/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20"
                  : "border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/20 opacity-60 cursor-not-allowed"
              )}
              onClick={() => affordable && handleSelectBuilding(building.id)}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative p-4 flex flex-col items-center text-center space-y-3">
                {/* Ícone grande */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300",
                  affordable 
                    ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:scale-110" 
                    : "bg-red-500/20"
                )}>
                  {getBuildingIcon(building.id)}
                </div>

                {/* Nome */}
                <h3 className={cn(
                  "font-semibold text-sm",
                  affordable ? "text-white" : "text-red-300"
                )}>
                  {building.name}
                </h3>

                {/* Custos */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {Object.entries(building.cost).map(([resourceType, amount]) => {
                    const hasEnough = (resources[resourceType] || 0) >= amount;
                    const resourceInfo = resourceTypes[resourceType];
                    
                    return (
                      <div
                        key={resourceType}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                          hasEnough 
                            ? "bg-green-500/20 text-green-300" 
                            : "bg-red-500/20 text-red-300"
                        )}
                      >
                        <span>{resourceInfo?.icon || '❓'}</span>
                        <span>{amount}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Indicador de disponibilidade */}
                <div className={cn(
                  "absolute top-2 right-2 w-3 h-3 rounded-full",
                  affordable ? "bg-green-500" : "bg-red-500"
                )} />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          );
        })}
      </div>

      {/* Footer com dica */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <p className="text-xs text-slate-300 text-center">
          💡 Clique em uma estrutura para selecioná-la e posicioná-la no mapa
        </p>
      </div>
    </div>
  );
};

export default BuildingPanel;
