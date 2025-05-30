
import React, { useState } from "react";
import { useMapEditorStore } from "../game/stores/useMapEditorStore";
import { getPanelClasses, getHeaderClasses, getContentClasses, getButtonClasses, cn } from "../lib/ui-system";
import { Map, Brush, Mountain, Trees, Droplets } from "lucide-react";

interface MapEditorPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const MapEditorPanel: React.FC<MapEditorPanelProps> = ({ isVisible, onClose }) => {
  const [selectedTool, setSelectedTool] = useState<string>('terrain');
  const [brushSize, setBrushSize] = useState(1);

  if (!isVisible) return null;

  const tools = [
    { id: 'terrain', name: 'Terreno', icon: Mountain, color: 'text-brown-400' },
    { id: 'vegetation', name: 'Vegetação', icon: Trees, color: 'text-green-400' },
    { id: 'water', name: 'Água', icon: Droplets, color: 'text-blue-400' },
    { id: 'brush', name: 'Pincel', icon: Brush, color: 'text-gray-400' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={cn(getPanelClasses('modal'), "w-96 max-h-[600px]")}>
        {/* Header */}
        <div className={getHeaderClasses()}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Editor de Mapa</h2>
                <p className="text-sm text-gray-400">Ferramentas de edição</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <i className="fa-solid fa-times" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={getContentClasses()}>
          <div className="space-y-6">
            {/* Tools */}
            <div>
              <h3 className="text-md font-semibold text-white mb-3">Ferramentas</h3>
              <div className="grid grid-cols-2 gap-2">
                {tools.map(tool => {
                  const IconComponent = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all duration-200",
                        selectedTool === tool.id
                          ? "border-blue-400 bg-blue-500/20"
                          : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <IconComponent className={cn("w-6 h-6", tool.color)} />
                        <span className="text-sm text-white">{tool.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <h3 className="text-md font-semibold text-white mb-3">Tamanho do Pincel</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-gray-300">{brushSize}x{brushSize}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button className={cn(getButtonClasses('success'), "w-full")}>
                <i className="fa-solid fa-save mr-2" />
                Salvar Mapa
              </button>
              <button className={cn(getButtonClasses('warning'), "w-full")}>
                <i className="fa-solid fa-undo mr-2" />
                Resetar Mudanças
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-600/30">
              <div className="text-sm text-blue-200">
                <i className="fa-solid fa-info-circle mr-2" />
                Use as ferramentas para modificar o terreno. Clique no mapa para aplicar as mudanças.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapEditorPanel;
