import React, { useState } from "react";
import { useMapEditorStore } from "../game/stores/useMapEditorStore";
import { useGameStore } from "../game/stores/useGameStore";

interface MapEditorPanelProps {
  isVisible: boolean;
}

const MapEditorPanel = ({ isVisible }: MapEditorPanelProps) => {
  const { 
    isEditing, 
    selectedTool, 
    brushSize, 
    startEditing, 
    stopEditing, 
    setSelectedTool, 
    setBrushSize 
  } = useMapEditorStore();

  const { setGameMode, gameMode } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEnterEditor = () => {
    console.log("Entrando no modo de edição de mapa");
    startEditing();
    setGameMode("terrain"); // Ativar modo de edição de terreno
  };

  const handleExitEditor = () => {
    console.log("Saindo do modo de edição de mapa");
    stopEditing();
    setGameMode("normal"); // Voltar ao modo normal
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-16 right-4 bg-gray-800 text-white rounded-lg p-4 w-80 z-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <i className="fa-solid fa-map text-blue-400"></i>
          Editor de Mapas
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white"
        >
          <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {!isEditing ? (
            <button
              onClick={handleEnterEditor}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <i className="fa-solid fa-play"></i>
              Entrar no Editor
            </button>
          ) : (
            <button
              onClick={handleExitEditor}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <i className="fa-solid fa-stop"></i>
              Sair do Editor
            </button>
          )}

          <h4 className="font-semibold text-gray-300">Ferramentas</h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setSelectedTool("terrain_height")}
              className={`bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg transition-colors ${selectedTool === "terrain_height" ? 'bg-blue-600 text-white' : ''}`}
            >
              <i className="fa-solid fa-mountain"></i>
              <span className="block text-xs">Altura</span>
            </button>
            <button
              onClick={() => setSelectedTool("terrain_paint")}
              className={`bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg transition-colors ${selectedTool === "terrain_paint" ? 'bg-blue-600 text-white' : ''}`}
            >
              <i className="fa-solid fa-paint-brush"></i>
              <span className="block text-xs">Pintar</span>
            </button>
            <button
              onClick={() => setSelectedTool("water")}
              className={`bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg transition-colors ${selectedTool === "water" ? 'bg-blue-600 text-white' : ''}`}
            >
              <i className="fa-solid fa-water"></i>
              <span className="block text-xs">Água</span>
            </button>
             <button 
              onClick={() => setSelectedTool("road")}
              className={`bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg transition-colors ${selectedTool === "road" ? 'bg-blue-600 text-white' : ''}`}
            >
              <i className="fa-solid fa-road"></i>
              <span className="block text-xs">Estrada</span>
            </button>
            <button
              onClick={() => setSelectedTool("eraser")}
              className={`bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg transition-colors ${selectedTool === "eraser" ? 'bg-blue-600 text-white' : ''}`}
            >
              <i className="fa-solid fa-eraser"></i>
              <span className="block text-xs">Apagar</span>
            </button>
          </div>

          <h4 className="font-semibold text-gray-300 mt-4">Configurações do Pincel</h4>
          <div className="space-y-2">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Tamanho</label>
              <input
                type="range"
                min="1"
                max="10"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full bg-gray-700 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapEditorPanel;