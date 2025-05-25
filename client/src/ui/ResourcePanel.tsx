import { useResourceStore } from "../game/stores/useResourceStore";
import { resourceTypes } from "../game/constants/resources";

const ResourcePanel = ({ isVisible }: { isVisible: boolean }) => {
  const { resources } = useResourceStore();
  
  if (!isVisible) return null;
  
  return (
    <div className="absolute top-16 left-4 bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl p-4 shadow-lg border border-gray-800">
      <h2 className="text-white text-center font-bold mb-2">Recursos</h2>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(resourceTypes).map((resource) => (
          <div 
            key={resource.id} 
            className="flex items-center gap-2" 
            title={resource.description}
          >
            <i className={`${resource.icon} text-lg`} style={{ color: resource.color }}></i>
            <div className="text-white">
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
