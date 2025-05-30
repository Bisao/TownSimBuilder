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
      className={cn(
        "absolute bg-gray-800 text-white p-2 sm:p-3 lg:p-4 rounded-lg shadow-lg ui-panel panel-positioned",
        isDragging ? "z-50" : "z-10"
      )}
      style={{
        left: position.x,
        top: position.y,
        pointerEvents: "auto",
        width: "min(90vw, 320px)",
        height: "100vh",
        maxHeight: "100vh"
      }}
    >
      <h2 className="text-white text-center font-bold mb-2 sm:mb-3 responsive-text-lg">Estruturas</h2>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  "responsive-button p-2 sm:p-3 rounded-lg border transition-all duration-200 text-left",
                  isSelected
                    ? "bg-blue-600 border-blue-500 shadow-lg transform scale-105"
                    : canAfford
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                    : "bg-red-900/50 border-red-800 cursor-not-allowed opacity-60"
                )}
                disabled={!canAfford}
              >
                <div className="text-white font-semibold responsive-text mb-1">
                  {building.name}
                </div>
                <div className="text-xs text-gray-300 mb-1 sm:mb-2">
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
    </div>
  );
};

export default BuildingPanel;