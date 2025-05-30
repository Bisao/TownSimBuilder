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

  // Generate inventory slots (5x8 = 40 slots)
  const inventorySlotsGenerated = Array.from({ length: 40 }, (_, index) => (
    <div
      key={`inventory-${index}`}
      className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 border-2 border-amber-300 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center cursor-pointer"
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
        className="bg-gradient-to-br from-amber-50 to-yellow-50 shadow-2xl border-l-2 border-amber-200 overflow-hidden fixed right-0 top-0 h-full w-72 sm:w-80 transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-2 sm:p-3 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <i className="fa-solid fa-backpack responsive-icon-lg text-white"></i>
              </div>
              <div>
                <h2 className="responsive-text-lg font-bold text-white drop-shadow-md">
                  Inventário - {npc.name}
                </h2>
                <p className="text-xs sm:text-sm text-white/90">
                  Equipamentos e Itens
                </p>
              </div>
            </div>

            <div className="flex gap-1 sm:gap-2">
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30">
                <i className="fa-solid fa-tshirt text-white responsive-icon"></i>
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30">
                <i className="fa-solid fa-star text-white responsive-icon"></i>
              </button>
              <button 
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30"
              >
                <i className="fa-solid fa-times text-white responsive-icon"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Container principal com flex para ocupar toda altura restante */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Equipment Section - Fixed */}
          <div className="p-2 sm:p-3 pb-0 flex-shrink-0">
            {/* Equipment Grid */}
            <div className="mb-2 sm:mb-4">
              <div className="flex justify-between items-start">
                {/* Left Side - Resources */}
                <div className="flex flex-col gap-1 sm:gap-2 w-12 sm:w-16">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 border-2 border-yellow-300 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-coins text-yellow-600 text-xs"></i>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 border-2 border-purple-300 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-gem text-purple-600 text-xs"></i>
                  </div>
                </div>

                {/* Center - Equipment Grid */}
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="grid grid-cols-3 gap-1 max-w-[120px] sm:max-w-[150px] mx-auto">
                    {Array.from({ length: 12 }, (_, index) => {
                      const row = Math.floor(index / 3);
                      const col = index % 3;
                      const slot = equipmentSlots.find(s => s.position.row === row && s.position.col === col);

                      return (
                        <div
                          key={`equipment-${index}`}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            slot 
                              ? 'bg-blue-100 border-blue-300 hover:bg-blue-200 cursor-pointer' 
                              : 'bg-transparent border-transparent'
                          }`}
                          title={slot?.name}
                        >
                          {slot && (
                            <i className={`fa-solid ${slot.icon} text-blue-600 text-xs`}></i>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex flex-col gap-1 sm:gap-2 w-12 sm:w-16">
                  <button className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 border-2 border-green-300 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-tshirt text-green-600 text-xs"></i>
                  </button>
                  <button className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 border-2 border-purple-300 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-star text-purple-600 text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Weight Bar */}
            <div className="mb-2 sm:mb-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <i className="fa-solid fa-weight-hanging"></i>
                <span>Peso: 15/50 kg</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Inventory Section - flex-1 para ocupar espaço restante */}
          <div className="flex-1 px-2 sm:px-3 pb-2 sm:pb-3 overflow-hidden min-h-0">
            <div className="h-full">
              {/* Inventory Grid - Scrollable */}
              <div className="h-full overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-5 gap-1 sm:gap-2 p-2 bg-amber-50/50 rounded-lg border border-amber-200">
                  {inventorySlotsGenerated}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Fixed */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 p-2 sm:p-3 border-t border-amber-200 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-cog text-white text-xs"></i>
              </div>
              <span>Configurações</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="responsive-button bg-red-500 text-white rounded hover:bg-red-600">
                Limpar
              </button>
              <button className="responsive-button bg-blue-500 text-white rounded hover:bg-blue-600">
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