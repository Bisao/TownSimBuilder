
<old_str>import React from "react";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useResourceStore } from "../game/stores/useResourceStore";
import { resourceTypes } from "../game/constants/resources";
import { useDraggable } from "../hooks/useDraggable";

interface SeedSelectionPanelProps {
  onSeedSelect: (seedType: string) => void;
  onClose: () => void;
}

const SeedSelectionPanel = ({ onSeedSelect, onClose }: SeedSelectionPanelProps) => {
  const buildings = useBuildingStore(state => state.buildings);
  const resources = useResourceStore(state => state.resources);
  
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 }
  });

  // Verificar se há silos e obter sementes disponíveis
  const silos = buildings.filter(b => b.type === 'silo');
  const availableSeeds = Object.entries(resources).filter(([type, amount]) => 
    type.includes('seed') && amount > 0
  );

  // Adicionar sementes padrão se houver no sistema
  const allSeedTypes = [
    { id: 'seeds', name: 'Sementes de Trigo', icon: '🌾' },
    { id: 'corn_seeds', name: 'Sementes de Milho', icon: '🌽' },
    { id: 'carrot_seeds', name: 'Sementes de Cenoura', icon: '🥕' },
  ];

  const availableSeedTypes = allSeedTypes.filter(seed => 
    availableSeeds.some(([type]) => type === seed.id)
  );

  if (availableSeedTypes.length === 0) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div 
          className="bg-white rounded-xl p-6 w-96"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-bold mb-2">Nenhuma semente disponível</h3>
            <p className="text-gray-600 mb-4">
              Você precisa comprar sementes no mercado primeiro.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🌱 Selecionar Semente
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Escolha qual tipo de semente o fazendeiro deve plantar:
        </p>

        <div className="space-y-3">
          {availableSeedTypes.map((seed) => {
            const amount = resources[seed.id] || 0;
            
            return (
              <button
                key={seed.id}
                onClick={() => onSeedSelect(seed.id)}
                className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{seed.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-green-800">{seed.name}</div>
                    <div className="text-sm text-green-600">
                      Disponível: {amount} unidades
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-green-500"></i>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <i className="fa-solid fa-info-circle mr-1"></i>
            O fazendeiro usará automaticamente as sementes do silo mais próximo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeedSelectionPanel;</old_str>
<new_str>import React from "react";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useResourceStore } from "../game/stores/useResourceStore";
import { resourceTypes } from "../game/constants/resources";
import { useDraggable } from "../hooks/useDraggable";

interface SeedSelectionPanelProps {
  onSeedSelect: (seedType: string) => void;
  onClose: () => void;
}

const SeedSelectionPanel = ({ onSeedSelect, onClose }: SeedSelectionPanelProps) => {
  const buildings = useBuildingStore(state => state.buildings);
  const resources = useResourceStore(state => state.resources);
  
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 }
  });

  // Verificar se há silos e obter sementes disponíveis
  const silos = buildings.filter(b => b.type === 'silo');
  const availableSeeds = Object.entries(resources).filter(([type, amount]) => 
    type.includes('seed') && amount > 0
  );

  // Adicionar sementes padrão se houver no sistema
  const allSeedTypes = [
    { id: 'seeds', name: 'Sementes de Trigo', icon: '🌾' },
    { id: 'corn_seeds', name: 'Sementes de Milho', icon: '🌽' },
    { id: 'carrot_seeds', name: 'Sementes de Cenoura', icon: '🥕' },
  ];

  const availableSeedTypes = allSeedTypes.filter(seed => 
    availableSeeds.some(([type]) => type === seed.id)
  );

  if (availableSeedTypes.length === 0) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
          e.stopPropagation();
        }}
      >
        <div 
          className="bg-white rounded-xl p-6 w-96 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌱</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-800">Nenhuma semente disponível</h3>
            <p className="text-gray-600 mb-6">
              Você precisa comprar sementes no mercado primeiro.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        className="bg-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto relative shadow-xl"
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
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fa-solid fa-seedling text-xl text-green-600"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Selecionar Semente</h2>
              <p className="text-sm text-gray-600">Escolha o tipo de semente para plantar</p>
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
          <h3 className="font-semibold text-gray-700 border-b pb-2">Sementes Disponíveis</h3>
          
          {availableSeedTypes.map((seed) => {
            const amount = resources[seed.id] || 0;
            
            return (
              <button
                key={seed.id}
                onClick={() => onSeedSelect(seed.id)}
                className="w-full p-4 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-300 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                    <span className="text-2xl">{seed.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 group-hover:text-green-800">{seed.name}</div>
                    <div className="text-sm text-gray-600">
                      Disponível: <span className="font-medium text-green-600">{amount}</span> unidades
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-green-500 transition-colors"></i>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <i className="fa-solid fa-info-circle text-blue-500 mt-0.5"></i>
            <p className="text-sm text-blue-700">
              O fazendeiro usará automaticamente as sementes do silo mais próximo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedSelectionPanel;</new_str>
