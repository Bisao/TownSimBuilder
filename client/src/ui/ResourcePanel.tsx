import React from "react";
import { useResourceStore } from "../game/stores/useResourceStore";
import { useDraggable } from "../hooks/useDraggable";

interface ResourcePanelProps {
  isVisible: boolean;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ isVisible }) => {
  const { resources } = useResourceStore();
  const { isDragging, position, handleMouseDown } = useDraggable("resource-panel");

  if (!isVisible) return null;

  return (
    <div
      className={`absolute bg-gray-800 text-white p-3 lg:p-4 rounded-lg shadow-lg responsive-panel ui-panel ${
        isDragging ? "z-50" : "z-10"
      }`}
      style={{
        left: position.x,
        top: position.y,
        pointerEvents: "auto",
      }}
    >
      <h2 className="text-lg font-bold mb-2">Recursos</h2>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(resourceTypes).map((resource) => (
          <div
            key={resource.id}
            className="flex items-center gap-2"
            title={resource.description}
          >
            <i className={`${resource.icon} text-lg`} style={{ color: resource.color }}></i>
            <div className="text-white text-sm">
              <div className="flex justify-between">
                <span>{resource.name}:</span>
                <span className="ml-2 font-bold">
                  {resources[resource.id] || 0}/{resource.maxAmount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcePanel;