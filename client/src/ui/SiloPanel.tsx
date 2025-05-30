
import React, { useState } from 'react';
import { useResourceStore } from '../game/stores/useResourceStore';
import { useBuildingStore } from '../game/stores/useBuildingStore';
import { useDraggable } from '../hooks/useDraggable';
import { useIsMobile } from '../hooks/useIsMobile';

interface SiloPanelProps {
  isOpen: boolean;
  onClose: () => void;
  siloId: string;
}

const SiloPanel: React.FC<SiloPanelProps> = ({ isOpen, onClose, siloId }) => {
  const { resources, updateResource } = useResourceStore();
  const { buildings } = useBuildingStore();
  const isMobile = useIsMobile();
  
  const [selectedTab, setSelectedTab] = useState<'storage' | 'transfer' | 'settings'>('storage');

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 300 },
    disabled: isMobile
  });

  const silo = buildings.find(b => b.id === siloId);

  const tabs = {
    storage: { label: 'Armazenamento', icon: 'fa-boxes' },
    transfer: { label: 'Transferir', icon: 'fa-exchange-alt' },
    settings: { label: 'Configurações', icon: 'fa-cog' }
  };

  const resourceIcons: Record<string, string> = {
    wood: 'fa-tree',
    stone: 'fa-cube',
    food: 'fa-apple-alt',
    gold: 'fa-coins',
    iron: 'fa-hammer',
    cloth: 'fa-tshirt',
    gems: 'fa-gem',
    herbs: 'fa-leaf'
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStorageCapacity = () => {
    // Base capacity + upgrades
    return 1000 + (silo?.level || 1) * 500;
  };

  const getTotalStored = () => {
    return Object.values(resources).reduce((total, amount) => total + amount, 0);
  };

  const getStoragePercentage = () => {
    const total = getTotalStored();
    const capacity = getStorageCapacity();
    return Math.min((total / capacity) * 100, 100);
  };

  const renderStorageTab = () => (
    <div className="space-y-4">
      {/* Storage Overview */}
      <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <i className="fa-solid fa-chart-bar text-blue-600"></i>
            Capacidade de Armazenamento
          </h3>
          <span className="text-xs text-gray-600">
            {formatNumber(getTotalStored())} / {formatNumber(getStorageCapacity())}
          </span>
        </div>
        
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              getStoragePercentage() > 90 ? 'bg-red-500' :
              getStoragePercentage() > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${getStoragePercentage()}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs text-gray-600">
          {getStoragePercentage() > 90 && (
            <div className="flex items-center gap-1 text-red-600">
              <i className="fa-solid fa-exclamation-triangle"></i>
              <span>Armazenamento quase cheio!</span>
            </div>
          )}
        </div>
      </div>

      {/* Resource List */}
      <div className="space-y-2">
        {Object.entries(resources).map(([resourceId, amount]) => (
          <div key={resourceId} className="bg-white/40 rounded-lg p-3 backdrop-blur-sm
                                         hover:bg-white/60 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 
                              rounded-lg flex items-center justify-center">
                  <i className={`fa-solid ${resourceIcons[resourceId] || 'fa-cube'} text-white text-sm`}></i>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 text-sm capitalize">{resourceId}</h4>
                  <p className="text-xs text-gray-600">
                    {((amount / getTotalStored()) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-gray-800">{formatNumber(amount)}</div>
                <div className="text-xs text-gray-500">unidades</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransferTab = () => (
    <div className="space-y-4">
      <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-truck text-blue-600"></i>
          Transferir Recursos
        </h3>
        
        <div className="text-center py-8 text-gray-500 text-sm">
          <i className="fa-solid fa-wrench text-2xl mb-2"></i>
          <p>Sistema de transferência em desenvolvimento</p>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-cog text-blue-600"></i>
          Configurações do Silo
        </h3>
        
        {/* Auto-collect toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-medium text-gray-700">Coleta Automática</span>
            <p className="text-xs text-gray-600">NPCs coletam recursos automaticamente</p>
          </div>
          <button className="w-12 h-6 bg-green-500 rounded-full relative transition-colors duration-200">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform duration-200"></div>
          </button>
        </div>
        
        {/* Priority settings */}
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700">Prioridade de Recursos</span>
          <div className="mt-2 space-y-2">
            {Object.keys(resources).slice(0, 3).map((resource) => (
              <div key={resource} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{resource}</span>
                <select className="text-xs bg-white border border-gray-300 rounded px-2 py-1">
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen || !silo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center 
                    z-50 pointer-events-auto">
      <div
        ref={dragRef}
        className={`
          silo-panel relative
          ${isMobile 
            ? 'w-full h-full max-w-none max-h-none rounded-none' 
            : 'w-96 max-h-screen rounded-xl'
          }
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        style={!isMobile ? { 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        } : {}}
      >
        <div className="panel-base bg-glass-bg backdrop-blur-lg border border-glass-border 
                        rounded-xl shadow-lg overflow-hidden h-full">
          {/* Header */}
          <div 
            className="panel-header bg-gradient-to-r from-yellow-600 to-orange-600 
                       p-4 cursor-grab active:cursor-grabbing"
            onMouseDown={!isMobile ? handleMouseDown : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-warehouse text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Silo de Recursos</h2>
                  <p className="text-white/80 text-sm">Nível {silo.level || 1}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg 
                         flex items-center justify-center transition-colors duration-200"
                aria-label="Fechar painel do silo"
              >
                <i className="fa-solid fa-times text-white"></i>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-4">
            <div className="flex gap-1 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
              {Object.entries(tabs).map(([key, tab]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key as any)}
                  className={`
                    flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    flex items-center justify-center gap-1
                    ${selectedTab === key 
                      ? 'bg-white text-yellow-600 shadow-sm' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <i className={`fa-solid ${tab.icon}`}></i>
                  {!isMobile && <span>{tab.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="panel-content p-4 flex-1 overflow-y-auto custom-scrollbar">
            {selectedTab === 'storage' && renderStorageTab()}
            {selectedTab === 'transfer' && renderTransferTab()}
            {selectedTab === 'settings' && renderSettingsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiloPanel;
