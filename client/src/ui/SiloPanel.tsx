
import React from "react";
import { useResourceStore } from "../game/stores/useResourceStore";
import { resourceTypes } from "../game/constants/resources";
import { useDraggable } from "../hooks/useDraggable";

interface SiloPanelProps {
  isOpen: boolean;
  onClose: () => void;
  siloId: string;
}

const SiloPanel = ({ isOpen, onClose, siloId }: SiloPanelProps) => {
  const { resources } = useResourceStore();
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 }
  });

  if (!isOpen) return null;

  // Recursos que podem ser armazenados no silo
  const storableResources = ['wheat', 'seeds', 'bread'];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        ref={dragRef}
        className="bg-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto relative"
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
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <i className="fa-solid fa-warehouse text-xl text-yellow-600"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Silo</h2>
              <p className="text-sm text-gray-600">Armazenamento de Recursos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2">Recursos Armazenados</h3>
          
          {storableResources.map(resourceId => {
            const resource = resourceTypes[resourceId];
            const amount = resources[resourceId] || 0;
            
            return (
              <div key={resourceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className={`${resource.icon} text-lg`} style={{ color: resource.color }}></i>
                  <div>
                    <div className="font-medium text-gray-800">{resource.name}</div>
                    <div className="text-sm text-gray-600">{resource.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">{amount}</div>
                  <div className="text-sm text-gray-600">unidades</div>
                </div>
              </div>
            );
          })}
          
          {storableResources.every(id => (resources[id] || 0) === 0) && (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-box-open text-3xl mb-2"></i>
              <p>Silo vazio</p>
              <p className="text-sm">Nenhum recurso armazenado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiloPanel;
