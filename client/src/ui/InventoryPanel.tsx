
import React from 'react';
import { NPC } from '../game/stores/useNpcStore';
import { useDraggable } from '../hooks/useDraggable';

interface InventoryPanelProps {
  npc: NPC;
  onClose: () => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ npc, onClose }) => {

  // Equipment slots configuration
  const equipmentSlots = [
    { id: 'helmet', name: 'Capacete', icon: 'fa-helmet-safety', position: { row: 0, col: 1 } },
    { id: 'weapon', name: 'Arma', icon: 'fa-sword', position: { row: 1, col: 0 } },
    { id: 'chest', name: 'Peitoral', icon: 'fa-vest', position: { row: 1, col: 1 } },
    { id: 'shield', name: 'Escudo', icon: 'fa-shield', position: { row: 1, col: 2 } },
    { id: 'legs', name: 'Pernas', icon: 'fa-socks', position: { row: 2, col: 1 } },
    { id: 'boots', name: 'Botas', icon: 'fa-shoe-prints', position: { row: 3, col: 1 } }
  ];

  // Generate inventory slots (8x5 = 40 slots como na imagem)
  const inventorySlotsGenerated = Array.from({ length: 40 }, (_, index) => (
    <div
      key={`inventory-${index}`}
      className="w-12 h-12 bg-amber-100 border-2 border-amber-300 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center cursor-pointer"
    >
    </div>
  ));

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-br from-amber-50 to-yellow-50 shadow-2xl border-l-2 border-amber-200 overflow-hidden fixed right-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-3 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <i className="fa-solid fa-backpack text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white drop-shadow-md">
                  Inventário - {npc.name}
                </h2>
                <p className="text-sm text-white/90">
                  Equipamentos e Itens
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30">
                <i className="fa-solid fa-tshirt text-white"></i>
              </button>
              <button className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30">
                <i className="fa-solid fa-star text-white"></i>
              </button>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30"
              >
                <i className="fa-solid fa-times text-white"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Container principal com flex para ocupar toda altura restante */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Equipment Section - Fixed */}
          <div className="p-4 pb-2 flex-shrink-0">
            {/* Equipment Grid */}
            <div className="mb-4">
              <div className="flex justify-between items-start">
                {/* Left Side - Resources */}
                <div className="flex flex-col gap-2 w-16">
                  <div className="w-12 h-12 bg-yellow-100 border-2 border-yellow-300 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-coins text-yellow-600"></i>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 border-2 border-purple-300 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-gem text-purple-600"></i>
                  </div>
                </div>

                {/* Center - Equipment Grid */}
                <div className="flex-1 mx-4">
                  <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                    {Array.from({ length: 12 }, (_, index) => {
                      const row = Math.floor(index / 3);
                      const col = index % 3;
                      const slot = equipmentSlots.find(s => s.position.row === row && s.position.col === col);

                      return (
                        <div
                          key={`equipment-${index}`}
                          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            slot 
                              ? 'bg-blue-100 border-blue-300 hover:bg-blue-200 cursor-pointer' 
                              : 'bg-transparent border-transparent'
                          }`}
                          title={slot?.name}
                        >
                          {slot && (
                            <i className={`fa-solid ${slot.icon} text-blue-600`}></i>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex flex-col gap-2 w-16">
                  <button className="w-12 h-12 bg-green-100 border-2 border-green-300 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-tshirt text-green-600"></i>
                  </button>
                  <button className="w-12 h-12 bg-purple-100 border-2 border-purple-300 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-star text-purple-600"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Weight Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="fa-solid fa-weight-hanging"></i>
                <span>Peso: 15/50 kg</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Inventory Section - 8 rows x 5 columns */}
          <div className="flex-1 px-4 pb-4 overflow-hidden min-h-0">
            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-5 gap-2 p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                {inventorySlotsGenerated}
              </div>
            </div>
          </div>

          {/* Bottom Bar - Fixed */}
          <div className="flex items-center justify-between text-sm text-gray-600 p-4 border-t border-amber-200 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-cog text-white text-sm"></i>
              </div>
              <span>Configurações</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium">
                Limpar
              </button>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium">
                Organizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
