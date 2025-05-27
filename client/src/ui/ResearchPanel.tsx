import React from "react";
import { useResearchStore } from "../game/stores/useResearchStore";
import { useDraggable } from "../hooks/useDraggable";

const ResearchPanel: React.FC = () => {
  const { 
    researches, 
    currentResearch, 
    researchPoints, 
    startResearch, 
    canResearch 
  } = useResearchStore();

  const {
    position,
    isDragging,
    dragRef,
    handleMouseDown
  } = useDraggable({ x: 100, y: 100 });

  const researchList = Object.values(researches);

  return (
    <div
      ref={dragRef}
      className="absolute bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80 select-none"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 1000,
      }}
    >
      <div
        className="flex justify-between items-center mb-3 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-lg font-bold">Pesquisa</h3>
        <div className="text-sm">
          Pontos: {researchPoints}
        </div>
      </div>

      {currentResearch && (
        <div className="mb-4 p-2 bg-blue-900 rounded">
          <div className="text-sm font-semibold">Pesquisando:</div>
          <div className="text-xs">{researches[currentResearch]?.name}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ 
                width: `${(researches[currentResearch]?.progress || 0) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {researchList.map((research) => (
          <div
            key={research.id}
            className={`p-2 rounded border ${
              research.completed
                ? 'bg-green-900 border-green-600'
                : canResearch(research.id)
                ? 'bg-gray-700 border-gray-500 hover:bg-gray-600'
                : 'bg-gray-800 border-gray-600 opacity-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-sm">{research.name}</div>
                <div className="text-xs text-gray-300 mb-1">
                  {research.description}
                </div>
                <div className="text-xs text-gray-400">
                  Custo: {research.cost} pontos
                </div>
                {research.requirements.length > 0 && (
                  <div className="text-xs text-gray-400">
                    Requer: {research.requirements.join(", ")}
                  </div>
                )}
              </div>

              {!research.completed && canResearch(research.id) && !currentResearch && (
                <button
                  onClick={() => startResearch(research.id)}
                  disabled={researchPoints < research.cost}
                  className="ml-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
                >
                  Pesquisar
                </button>
              )}

              {research.completed && (
                <div className="ml-2 text-xs text-green-400">✓</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchPanel;