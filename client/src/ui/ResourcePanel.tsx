import React from "react";
import { useResourceStore } from "../game/stores/useResourceStore";
import { resourceTypes } from "../game/constants/resources";
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
      className={`absolute bg-gray-800 text-white p-2 sm:p-3 rounded-lg shadow-lg ui-panel panel-positioned ${
        isDragging ? "z-50" : "z-10"
      }`}
      style={{
        left: position.x,
        top: position.y,
        pointerEvents: "auto",
        width: "min(90vw, 280px)",
        height: "100vh",
        maxHeight: "100vh"
      }}
    >
      <h2 className="responsive-text-lg font-bold mb-2">Recursos</h2>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
      </div>
        {Object.values(resourceTypes).map((resource) => (
            <div
              key={resource.id}
              className="flex items-center gap-2"
              title={resource.description}
            >
              <i className={`${resource.icon} responsive-icon-lg`} style={{ color: resource.color }}></i>
              <div className="text-white responsive-text">
                <div className="flex justify-between">
                  <span>{resource.name}:</span>
                  <span className="ml-1 sm:ml-2 font-bold">
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