
import React from "react";
import { useResearchStore } from "../game/stores/useResearchStore";
import { useDraggable } from "../hooks/useDraggable";

const ResearchPanel: React.FC = () => {
  const {
    researchPoints,
    technologies,
    currentResearch,
    researchProgress,
    startResearch,
    canResearch,
  } = useResearchStore();

  const { isDragging, position, handleMouseDown } = useDraggable("research-panel");

  const currentTech = currentResearch ? technologies[currentResearch] : null;

  return (
    <div
      className={`absolute bg-gray-800 text-white p-4 rounded-lg shadow-lg w-96 ${
        isDragging ? "z-50" : "z-10"
      }`}
      style={{
        left: position.x,
        top: position.y,
        pointerEvents: "auto",
      }}
    >
      <div
        className="cursor-move mb-3 font-bold text-lg border-b border-gray-600 pb-2"
        onMouseDown={handleMouseDown}
      >
        🔬 Centro de Pesquisa
      </div>

      <div className="space-y-4">
        {/* Research Points */}
        <div className="bg-gray-700 p-3 rounded">
          <div className="flex justify-between items-center">
            <span className="text-blue-400 font-semibold">Pontos de Pesquisa</span>
            <span className="text-xl font-bold">{researchPoints.toFixed(1)}</span>
          </div>
          {currentTech && (
            <div className="mt-2">
              <div className="text-sm text-gray-300 mb-1">
                Pesquisando: {currentTech.name}
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(researchProgress / currentTech.cost) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {researchProgress.toFixed(1)} / {currentTech.cost}
              </div>
            </div>
          )}
        </div>

        {/* Available Technologies */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-sm text-gray-300">Tecnologias Disponíveis</h3>
          {Object.values(technologies).map((tech) => (
            <div
              key={tech.id}
              className={`p-3 rounded border ${
                tech.researched
                  ? "border-green-500 bg-green-900/30"
                  : canResearch(tech.id)
                  ? "border-blue-500 bg-blue-900/30"
                  : "border-gray-600 bg-gray-700/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{tech.name}</h4>
                  <p className="text-xs text-gray-300 mt-1">{tech.description}</p>
                  
                  {tech.prerequisites.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      Requer: {tech.prerequisites.map(prereq => 
                        technologies[prereq]?.name || prereq
                      ).join(", ")}
                    </div>
                  )}

                  <div className="text-xs text-blue-400 mt-1">
                    Desbloqueia: {tech.unlocks.join(", ")}
                  </div>
                </div>

                <div className="ml-3 text-right">
                  {tech.researched ? (
                    <span className="text-green-400 text-xs">✓ Pesquisado</span>
                  ) : currentResearch === tech.id ? (
                    <span className="text-blue-400 text-xs">Em progresso...</span>
                  ) : (
                    <div>
                      <div className="text-yellow-400 font-semibold text-sm">
                        {tech.cost}
                      </div>
                      <button
                        onClick={() => startResearch(tech.id)}
                        disabled={!canResearch(tech.id) || !!currentResearch}
                        className={`text-xs px-2 py-1 rounded mt-1 ${
                          canResearch(tech.id) && !currentResearch
                            ? "bg-blue-600 hover:bg-blue-500"
                            : "bg-gray-600 cursor-not-allowed"
                        }`}
                      >
                        Pesquisar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchPanel;
