
import React, { useState } from "react";
import { useMapEditorStore, EditorTool, TerrainType } from "../game/stores/useMapEditorStore";
import { useDraggable } from "../hooks/useDraggable";

const MapEditorPanel = ({ isVisible }: { isVisible: boolean }) => {
  const {
    isEditorMode,
    selectedTool,
    brushSize,
    brushStrength,
    gridSize,
    maxHeight,
    showGrid,
    selectedTerrainType,
    setEditorMode,
    setSelectedTool,
    setBrushSize,
    setBrushStrength,
    setGridSize,
    setMaxHeight,
    setShowGrid,
    setSelectedTerrainType,
    clearTerrain,
    exportMap,
    importMap,
  } = useMapEditorStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState("");
  const [exportData, setExportData] = useState("");

  const { dragRef, position } = useDraggable({
    initialPosition: { x: window.innerWidth - 320, y: 100 }
  });

  if (!isVisible) return null;

  const tools: { id: EditorTool; name: string; icon: string; description: string }[] = [
    { id: "select", name: "Selecionar", icon: "fa-mouse-pointer", description: "Ferramenta de seleção" },
    { id: "terrain_height", name: "Altura", icon: "fa-mountain", description: "Modificar altura do terreno" },
    { id: "terrain_paint", name: "Pintar", icon: "fa-paint-brush", description: "Pintar tipo de terreno" },
    { id: "water", name: "Água", icon: "fa-water", description: "Adicionar água" },
    { id: "road", name: "Estrada", icon: "fa-road", description: "Criar estradas" },
    { id: "eraser", name: "Apagar", icon: "fa-eraser", description: "Apagar modificações" },
  ];

  const terrainTypes: { id: TerrainType; name: string; color: string }[] = [
    { id: "grass", name: "Grama", color: "#4CAF50" },
    { id: "dirt", name: "Terra", color: "#8B4513" },
    { id: "sand", name: "Areia", color: "#F4A460" },
    { id: "stone", name: "Pedra", color: "#708090" },
    { id: "water", name: "Água", color: "#4FC3F7" },
  ];

  const handleExport = () => {
    const data = exportMap();
    setExportData(data);
    setShowExportModal(true);
  };

  const handleImport = () => {
    if (importData.trim()) {
      importMap(importData);
      setShowImportModal(false);
      setImportData("");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
  };

  return (
    <>
      <div
        ref={dragRef}
        className="fixed bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 w-80 max-h-[80vh] overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
          zIndex: 1000,
        }}
      >
        {/* Header */}
        <div className="bg-gray-800 p-3 border-b border-gray-700 cursor-move">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <i className="fa-solid fa-map text-green-400"></i>
            Editor de Mapas
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          {/* Editor Mode Toggle */}
          <div className="mb-4 flex justify-center">
            <button
              onClick={() => {
                console.log("Toggling editor mode from", isEditorMode, "to", !isEditorMode);
                setEditorMode(!isEditorMode);
              }}
              className={`w-full p-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                isEditorMode 
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg border-2 border-red-400" 
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg border-2 border-green-400"
              }`}
            >
              <i className={`fa-solid ${isEditorMode ? 'fa-stop' : 'fa-play'} mr-2`}></i>
              {isEditorMode ? "Sair do Editor" : "Entrar no Editor"}
            </button>
          </div>

          {isEditorMode && (
            <>
              {/* Tools */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Ferramentas</h3>
                <div className="grid grid-cols-3 gap-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`p-2 rounded-lg text-xs transition-colors ${
                        selectedTool === tool.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                      title={tool.description}
                    >
                      <i className={`fa-solid ${tool.icon} block mb-1`}></i>
                      {tool.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brush Settings */}
              {(selectedTool === "terrain_height" || selectedTool === "terrain_paint") && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2 text-gray-300">Configurações do Pincel</h3>
                  
                  <div className="mb-2">
                    <label className="block text-xs text-gray-400 mb-1">
                      Tamanho: {brushSize}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Intensidade: {Math.round(brushStrength * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.01"
                      max="1"
                      step="0.01"
                      value={brushStrength}
                      onChange={(e) => setBrushStrength(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Terrain Types */}
              {selectedTool === "terrain_paint" && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2 text-gray-300">Tipo de Terreno</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {terrainTypes.map((terrain) => (
                      <button
                        key={terrain.id}
                        onClick={() => setSelectedTerrainType(terrain.id)}
                        className={`p-2 rounded-lg text-xs transition-colors border-2 ${
                          selectedTerrainType === terrain.id
                            ? "border-white"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: terrain.color }}
                      >
                        {terrain.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Properties */}
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Propriedades do Mapa</h3>
                
                <div className="mb-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Tamanho do Grid: {gridSize}x{gridSize}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Altura Máxima: {maxHeight}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showGrid"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="showGrid" className="text-xs text-gray-400">
                    Mostrar Grid
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={clearTerrain}
                  className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm transition-colors"
                >
                  <i className="fa-solid fa-trash mr-2"></i>
                  Limpar Terreno
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExport}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-sm transition-colors"
                  >
                    <i className="fa-solid fa-download mr-1"></i>
                    Exportar
                  </button>
                  
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg text-sm transition-colors"
                  >
                    <i className="fa-solid fa-upload mr-1"></i>
                    Importar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 max-h-96">
            <h3 className="text-lg font-bold text-white mb-4">Exportar Mapa</h3>
            <textarea
              value={exportData}
              readOnly
              className="w-full h-48 bg-gray-800 text-white p-2 rounded border resize-none text-xs font-mono"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex-1"
              >
                Copiar
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 max-h-96">
            <h3 className="text-lg font-bold text-white mb-4">Importar Mapa</h3>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Cole os dados do mapa aqui..."
              className="w-full h-48 bg-gray-800 text-white p-2 rounded border resize-none text-xs font-mono"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleImport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1"
                disabled={!importData.trim()}
              >
                Importar
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData("");
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapEditorPanel;
