import { useGameStore } from "../game/stores/useGameStore";
import { buildingTypes } from "../game/constants/buildings";
import { resourceTypes } from "../game/constants/resources";
import { useResourceStore } from "../game/stores/useResourceStore";
import { cn } from "../lib/utils";
import { useDraggable } from "../hooks/useDraggable";
import { useState, useEffect } from "react";

const BuildingPanel = ({ isVisible }: { isVisible: boolean }) => {
  const { selectedBuildingType, selectBuildingType, onBuildingPlaced } = useGameStore();
  const { resources } = useResourceStore();
  const [isDragging, dragHandlers] = useDraggable();

  // Filter buildings to only show the allowed ones
  const allowedBuildings = ['house', 'farm', 'well', 'silo'];
  const filteredBuildings = Object.values(buildingTypes).filter(building => 
    allowedBuildings.includes(building.id)
  );

  // Check if player can afford a building
  const canAfford = (building: any) => {
    return Object.entries(building.cost).every(([resourceId, cost]) => {
      return (resources[resourceId] || 0) >= cost;
    });
  };

  // Handle building selection
  const handleBuildingSelect = (buildingId: string) => {
    const building = buildingTypes[buildingId];
    if (building && canAfford(building)) {
      selectBuildingType(buildingId);
    }
  };

  // Auto-hide panel when building is selected
  useEffect(() => {
    if (selectedBuildingType) {
      // Panel will be hidden when a building is selected
    }
  }, [selectedBuildingType]);

  if (!isVisible || selectedBuildingType) {
    return null;
  }

  return (
    <div 
      className={cn(
        "absolute top-20 right-4 bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl p-4 shadow-lg border border-gray-800 w-80",
        isDragging && "opacity-80"
      )}
      {...dragHandlers}
    >
      <h2 className="text-white text-center font-bold mb-4 text-lg">Estruturas</h2>

      <div className="grid grid-cols-2 gap-3">
        {filteredBuildings.map((building) => {
          const affordable = canAfford(building);

          return (
            <button
              key={building.id}
              onClick={() => handleBuildingSelect(building.id)}
              disabled={!affordable}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all duration-200 text-left",
                affordable
                  ? "bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                  : "bg-gradient-to-br from-gray-600/20 to-gray-800/20 border-gray-600/50 cursor-not-allowed opacity-50"
              )}
              title={affordable ? building.description : "Recursos insuficientes"}
            >
              {/* Building Icon */}
              <div className="flex items-center gap-3 mb-2">
                <i 
                  className={`${building.icon} text-2xl`} 
                  style={{ color: affordable ? building.color : '#666' }}
                />
                <div>
                  <h3 className="text-white font-medium text-sm">{building.name}</h3>
                  <p className="text-gray-400 text-xs">{building.type}</p>
                </div>
              </div>

              {/* Cost */}
              <div className="space-y-1">
                <p className="text-xs text-gray-300 font-medium">Custo:</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(building.cost).map(([resourceId, cost]) => {
                    const resource = resourceTypes[resourceId];
                    const playerAmount = resources[resourceId] || 0;
                    const hasEnough = playerAmount >= cost;

                    return (
                      <div key={resourceId} className="flex items-center gap-1">
                        <i 
                          className={`${resource.icon} text-xs`} 
                          style={{ color: hasEnough ? resource.color : '#666' }}
                        />
                        <span 
                          className={cn(
                            "text-xs",
                            hasEnough ? "text-green-400" : "text-red-400"
                          )}
                        >
                          {cost}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Not affordable overlay */}
              {!affordable && (
                <div className="absolute inset-0 bg-red-900/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-lock text-red-400 text-lg" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-2 bg-blue-900/30 rounded border border-blue-700/50">
        <p className="text-blue-200 text-xs text-center">
          Clique em uma estrutura para selecioná-la. O painel será ocultado até que a estrutura seja posicionada.
        </p>
      </div>
    </div>
  );
};

export default BuildingPanel;