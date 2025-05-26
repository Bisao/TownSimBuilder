
<old_str>import { useGameStore } from "../game/stores/useGameStore";
import { buildingTypes } from "../game/constants/buildings";
import { resourceTypes } from "../game/constants/resources";
import { useResourceStore } from "../game/stores/useResourceStore";
import { cn } from "../lib/utils";
import { useDraggable } from "../hooks/useDraggable";

const BuildingPanel = ({ isVisible }: { isVisible: boolean }) => {
  const { selectBuilding, selectedBuildingType } = useGameStore();
  const { resources } = useResourceStore();
  const { dragRef, position, isDragging } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 192, y: window.innerHeight / 2 - 200 }
  });

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
    <div
        ref={dragRef}
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl p-4 shadow-lg border border-gray-800"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
    >
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

export default BuildingPanel;</old_str>
<new_str>import { useGameStore } from "../game/stores/useGameStore";
import { buildingTypes } from "../game/constants/buildings";
import { resourceTypes } from "../game/constants/resources";
import { useResourceStore } from "../game/stores/useResourceStore";
import { cn } from "../lib/utils";
import { useDraggable } from "../hooks/useDraggable";

const BuildingPanel = ({ isVisible }: { isVisible: boolean }) => {
  const { selectBuilding, selectedBuildingType } = useGameStore();
  const { resources } = useResourceStore();
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 300, y: window.innerHeight - 200 }
  });

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
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          selectBuilding(null);
        }
        e.stopPropagation();
      }}
    >
      <div
        ref={dragRef}
        className="bg-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto relative shadow-xl"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fa-solid fa-building text-xl text-blue-600"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Construir</h2>
              <p className="text-sm text-gray-600">Selecione um edifício para construir</p>
            </div>
          </div>
          <button 
            onClick={() => selectBuilding(null)}
            className="text-gray-400 hover:text-gray-600 text-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2">Edifícios Disponíveis</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {Object.values(buildingTypes).map((building) => {
              const affordable = canAfford(building.id);
              const selected = selectedBuildingType === building.id;
              
              return (
                <div
                  key={building.id}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all",
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : affordable
                        ? "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                        : "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => affordable && handleSelectBuilding(building.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                      style={{ backgroundColor: building.model.color }}
                    >
                      {building.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{building.name}</h4>
                      <p className="text-sm text-gray-600">{building.description}</p>
                    </div>
                    {selected && (
                      <div className="text-blue-500">
                        <i className="fa-solid fa-check-circle text-lg"></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-700">Custo:</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(building.cost).map(([resourceType, amount]) => {
                        const resource = resourceTypes[resourceType];
                        const hasEnough = (resources[resourceType] || 0) >= amount;
                        
                        return (
                          <div
                            key={resourceType}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded text-xs",
                              hasEnough ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}
                          >
                            <i className={resource?.icon} style={{ color: resource?.color }}></i>
                            <span>{amount}</span>
                            <span className="font-medium">{resource?.name || resourceType}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {selectedBuildingType && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <i className="fa-solid fa-info-circle mr-1"></i>
                Clique no mapa para posicionar o edifício selecionado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingPanel;</new_str>
