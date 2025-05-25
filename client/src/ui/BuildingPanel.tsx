import { useGameStore } from "../game/stores/useGameStore";
import { buildingTypes } from "../game/constants/buildings";
import { resourceTypes } from "../game/constants/resources";
import { useResourceStore } from "../game/stores/useResourceStore";
import { cn } from "../lib/utils";

const BuildingPanel = ({ isVisible }: { isVisible: boolean }) => {
  const { selectBuilding, selectedBuildingType } = useGameStore();
  const { resources } = useResourceStore();

  if (!isVisible) return null;

  const handleSelectBuilding = (type: string) => {
    if (selectedBuildingType === type) {
      // Se já estiver selecionado, desmarque-o
      selectBuilding(null);
    } else {
      // Caso contrário, selecione o edifício
      selectBuilding(type);
    }
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

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl p-4 shadow-lg border border-gray-800">
      <h2 className="text-white text-center font-bold mb-2">Edifícios</h2>
      <div className="flex gap-2 flex-wrap justify-center">
        {Object.values(buildingTypes).map((building) => (
          <div
            key={building.id}
            className={cn(
              "w-16 h-16 flex flex-col items-center justify-center rounded border cursor-pointer transition-colors",
              selectedBuildingType === building.id 
                ? "border-yellow-400 bg-yellow-900/50" 
                : canAfford(building.id)
                  ? "border-gray-400 bg-gray-800/50 hover:bg-gray-700/50"
                  : "border-gray-600 bg-gray-800/30 opacity-50 cursor-not-allowed"
            )}
            onClick={() => canAfford(building.id) && handleSelectBuilding(building.id)}
            title={`${building.name}: ${building.description}\n${Object.entries(building.cost)
              .map(([res, amt]) => `${resourceTypes[res]?.name || res}: ${amt}`)
              .join(", ")}`}
          >
            <div 
              className="w-8 h-8 rounded" 
              style={{ backgroundColor: building.model.color }}
            />
            <div className="text-white text-xs mt-1">{building.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingPanel;