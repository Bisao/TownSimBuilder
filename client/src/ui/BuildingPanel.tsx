
import React from "react";
import { useGameStore } from "../game/stores/useGameStore";
import { useResourceStore } from "../game/stores/useResourceStore";
import { buildingTypes } from "../game/constants/buildings";
import { useDraggable } from "../hooks/useDraggable";
import { cn } from "../lib/utils";

const BuildingPanel = ({ isVisible }: { isVisible: boolean }) => {
  const { selectedBuildingType, selectBuildingType, onBuildingPlaced } = useGameStore();
  const { resources } = useResourceStore();
  const { isDragging, position, dragRef, handleMouseDown } = useDraggable();

  // Filter buildings to only show the allowed ones
  const allowedBuildings = ['house', 'farm', 'well', 'silo'];

  const handleSelectBuilding = (buildingType: string) => {
    selectBuildingType(buildingType);
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={dragRef}
      className={cn(
        "absolute top-20 right-4 bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl p-4 shadow-lg border border-gray-800 w-80",
        isDragging && "opacity-80"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <h2 className="text-white text-center font-bold mb-4 text-lg">Estruturas</h2>

      <div className="grid grid-cols-2 gap-3">
        {allowedBuildings.map((buildingType) => {
          const building = buildingTypes[buildingType];
          if (!building) return null;

          const canAfford = Object.entries(building.cost).every(
            ([resourceType, amount]) => resources[resourceType] >= amount
          );

          const isSelected = selectedBuildingType === buildingType;

          return (
            <button
              key={buildingType}
              onClick={() => handleSelectBuilding(buildingType)}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 text-left",
                isSelected
                  ? "bg-blue-600 border-blue-500 shadow-lg transform scale-105"
                  : canAfford
                  ? "bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "bg-red-900/50 border-red-800 cursor-not-allowed opacity-60"
              )}
              disabled={!canAfford}
            >
              <div className="text-white font-semibold text-sm mb-1">
                {building.name}
              </div>
              <div className="text-xs text-gray-300 mb-2">
                {building.description}
              </div>
              <div className="text-xs text-gray-400">
                Custo:
                {Object.entries(building.cost).map(([resourceType, amount]) => (
                  <div key={resourceType} className="flex justify-between">
                    <span>{resourceType}:</span>
                    <span className={resources[resourceType] >= amount ? "text-green-400" : "text-red-400"}>
                      {amount}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BuildingPanel;
