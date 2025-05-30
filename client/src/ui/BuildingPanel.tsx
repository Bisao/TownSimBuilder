
import React from "react";
import { useGameStore } from "../game/stores/useGameStore";
import { useResourceStore } from "../game/stores/useResourceStore";
import { buildingTypes } from "../game/constants/buildings";
import { useDraggable } from "../hooks/useDraggable";
import { getPanelClasses, getHeaderClasses, getContentClasses, getButtonClasses, cn } from "../lib/ui-system";
import { Building, Hammer, Home, Wheat, Droplets, Warehouse } from "lucide-react";

const BuildingPanel = ({ isVisible }: { isVisible: boolean }) => {
  const { selectedBuildingType, selectBuildingType } = useGameStore();
  const { resources } = useResourceStore();
  const { isDragging, position, dragRef, handleMouseDown } = useDraggable({
    initialPosition: { x: 20, y: 20 }
  });

  if (!isVisible) return null;

  // Filter buildings to only show the allowed ones
  const allowedBuildings = ['house', 'farm', 'well', 'silo'];
  const availableBuildings = allowedBuildings
    .map(id => ({ id, ...buildingTypes[id] }))
    .filter(building => building.name); // Only show if building exists

  const handleSelectBuilding = (buildingType: string) => {
    selectBuildingType(buildingType);
  };

  const getBuildingIcon = (type: string) => {
    switch (type) {
      case 'house': return Home;
      case 'farm': return Wheat;
      case 'well': return Droplets;
      case 'silo': return Warehouse;
      default: return Building;
    }
  };

  const getBuildingColor = (type: string) => {
    switch (type) {
      case 'house': return 'from-blue-500 to-blue-600';
      case 'farm': return 'from-green-500 to-green-600';
      case 'well': return 'from-cyan-500 to-cyan-600';
      case 'silo': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div
      ref={dragRef}
      className={cn(
        getPanelClasses('primary'),
        "fixed w-80 max-h-[600px] z-30",
        isDragging && "scale-105 shadow-2xl"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: "auto"
      }}
    >
      {/* Header */}
      <div 
        className={cn(getHeaderClasses(), "cursor-move")}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <Hammer className="w-6 h-6 text-amber-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-100">Construções</h2>
            <p className="text-sm text-amber-300">Selecione para construir</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={getContentClasses()}>
        <div className="space-y-3">
          {availableBuildings.map((building) => {
            const canAfford = Object.entries(building.cost).every(
              ([resourceType, amount]) => resources[resourceType] >= amount
            );

            const isSelected = selectedBuildingType === building.id;
            const IconComponent = getBuildingIcon(building.id);

            return (
              <button
                key={building.id}
                onClick={() => handleSelectBuilding(building.id)}
                disabled={!canAfford}
                className={cn(
                  "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                  isSelected
                    ? "bg-gradient-to-r from-blue-600/80 to-blue-700/80 border-blue-400 shadow-lg transform scale-105"
                    : canAfford
                    ? "bg-gradient-to-r from-amber-200/10 to-amber-400/20 border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-300/20"
                    : "bg-gradient-to-r from-red-200/10 to-red-400/20 border-red-500/30 cursor-not-allowed opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    `bg-gradient-to-br ${getBuildingColor(building.id)}`
                  )}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-amber-100 mb-1">
                      {building.name}
                    </div>
                    <div className="text-sm text-amber-300 mb-2">
                      {building.description}
                    </div>
                    
                    {/* Cost breakdown */}
                    <div className="space-y-1">
                      <div className="text-xs text-amber-400">Custo:</div>
                      {Object.entries(building.cost).map(([resourceType, amount]) => (
                        <div key={resourceType} className="flex justify-between items-center text-xs">
                          <span className="text-amber-300 capitalize">{resourceType}:</span>
                          <span className={cn(
                            "font-medium",
                            resources[resourceType] >= amount ? "text-green-400" : "text-red-400"
                          )}>
                            {resources[resourceType] || 0} / {amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="text-blue-300">
                      <i className="fa-solid fa-check-circle text-lg" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-600/30">
          <div className="text-sm text-blue-200">
            <i className="fa-solid fa-info-circle mr-2" />
            Selecione uma estrutura e clique no mapa para construir
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingPanel;
