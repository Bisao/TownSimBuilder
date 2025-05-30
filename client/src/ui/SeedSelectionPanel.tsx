import React from "react";
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

  if (silos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl p-6 w-96">
          <h2 className="text-xl font-bold mb-4">⚠️ Nenhum Silo Encontrado</h2>
          <p className="text-gray-600 mb-4">
            É necessário construir pelo menos um silo para armazenar sementes.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  if (availableSeedTypes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl p-6 w-96">
          <h2 className="text-xl font-bold mb-4">📦 Nenhuma Semente Disponível</h2>
          <p className="text-gray-600 mb-4">
            Não há sementes armazenadas nos silos. Compre sementes no mercado primeiro.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Fechar
          </button>
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
          {availableSeedTypes.map(seed => {
            const amount = resources[seed.id] || 0;
            return (
              <button
                key={seed.id}
                onClick={() => onSeedSelect(seed.id)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{seed.icon}</span>
                    <div>
                      <h3 className="font-semibold">{seed.name}</h3>
                      <p className="text-sm text-gray-500">
                        Disponível: {amount} unidade(s)
                      </p>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-gray-400"></i>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 O fazendeiro lembrará da semente selecionada para próximos plantios. 
            Você pode alterar a seleção a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeedSelectionPanel;