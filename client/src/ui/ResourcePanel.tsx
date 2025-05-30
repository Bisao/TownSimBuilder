
import React from "react";
import { useResourceStore } from "../game/stores/useResourceStore";
import { resourceTypes } from "../game/constants/resources";
import { useDraggable } from "../hooks/useDraggable";
import { getPanelClasses, getHeaderClasses, getContentClasses, cn } from "../lib/ui-system";
import { Package } from "lucide-react";

interface ResourcePanelProps {
  isVisible: boolean;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ isVisible }) => {
  const { resources } = useResourceStore();
  const { isDragging, position, dragRef, handleMouseDown } = useDraggable({
    initialPosition: { x: 20, y: 100 }
  });

  if (!isVisible) return null;

  const resourceEntries = Object.values(resourceTypes);

  return (
    <div
      ref={dragRef}
      className={cn(
        getPanelClasses('primary'),
        "fixed w-80 max-h-[500px] z-30",
        isDragging && "scale-105 shadow-2xl"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: "auto"
      }}
    >
      {/* Header */}
      <div 
        className={cn(getHeaderClasses(), "cursor-move")}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-amber-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-100">Recursos</h2>
            <p className="text-sm text-amber-300">Inventário Global</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={getContentClasses()}>
        <div className="space-y-3">
          {resourceEntries.map((resource) => {
            const currentAmount = resources[resource.id] || 0;
            const percentage = (currentAmount / resource.maxAmount) * 100;
            
            return (
              <div
                key={resource.id}
                className="bg-gradient-to-r from-amber-200/10 to-amber-400/20 rounded-lg p-3 border border-amber-500/30 hover:border-amber-400/60 transition-all duration-200"
                title={resource.description}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300/20 to-amber-500/30 flex items-center justify-center">
                    <i 
                      className={`${resource.icon} text-lg`} 
                      style={{ color: resource.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-amber-100">{resource.name}</span>
                      <span className="text-lg font-bold text-amber-300">
                        {currentAmount}
                      </span>
                    </div>
                    <div className="text-xs text-amber-400">
                      Máximo: {resource.maxAmount}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-amber-800/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                {/* Storage warning */}
                {percentage > 90 && (
                  <div className="mt-2 text-xs text-red-300 flex items-center gap-1">
                    <i className="fa-solid fa-warning" />
                    Armazenamento quase cheio!
                  </div>
                )}
              </div>
            );
          })}
          
          {resourceEntries.length === 0 && (
            <div className="text-center py-8 text-amber-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum recurso disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcePanel;
