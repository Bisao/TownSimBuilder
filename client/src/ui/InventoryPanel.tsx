import React from 'react';
import { X, Package, Shirt, Crown, Shield, Sword, Settings, Trash2, RotateCw } from 'lucide-react';
import { usePlayerStore } from '../game/stores/usePlayerStore';
import { getButtonClasses, getPanelClasses, getSlotClasses, cn } from '../lib/ui-system';

interface InventoryPanelProps {
  onClose: () => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ onClose }) => {
  const player = usePlayerStore((state) => state.player);

  return (
    <div className={cn(
      "fixed top-0 right-0 w-80 h-full flex flex-col z-40",
      "bg-gradient-to-b from-amber-900/95 via-amber-800/90 to-amber-900/95",
      "backdrop-blur-md border-l-2 border-amber-600/50 shadow-2xl"
    )}>
      {/* Header */}
      <div className="ui-panel-header flex items-center justify-between bg-gradient-to-r from-amber-800/80 to-amber-700/80 border-b border-amber-600/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 ui-rounded-full bg-gradient-to-br from-amber-300 to-amber-600 ui-flex ui-flex-center ui-shadow-medium">
            <Package className="w-6 h-6 text-amber-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-100">Inventário</h2>
            <p className="text-sm text-amber-300">Equipamentos e Itens</p>
          </div>
        </div>
        <div className="ui-flex ui-gap-2">
          <button className={cn(getButtonClasses('ghost', 'sm'), "text-amber-200 hover:text-white")}>
            <Shirt className="w-5 h-5" />
          </button>
          <button className={cn(getButtonClasses('ghost', 'sm'), "text-amber-200 hover:text-white")}>
            <Crown className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className={cn(getButtonClasses('error', 'sm'), "text-red-200 hover:text-white")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Equipment Slots */}
      <div className="ui-p-4 border-b border-amber-600/30">
        <div className="ui-grid ui-grid-cols-3 ui-gap-3 max-w-[200px] mx-auto">
          {/* Helmet */}
          <div className="col-start-2">
            <div className={cn(getSlotClasses(), "w-16 h-16 bg-gradient-to-br from-amber-200/20 to-amber-400/30 border-amber-500/50")}>
              <Crown className="w-8 h-8 text-amber-300" />
            </div>
          </div>

          {/* Armor */}
          <div className="col-start-2">
            <div className={cn(getSlotClasses(), "w-16 h-16 bg-gradient-to-br from-amber-200/20 to-amber-400/30 border-amber-500/50")}>
              <Shirt className="w-8 h-8 text-amber-300" />
            </div>
          </div>

          {/* Weapon */}
          <div className="col-start-1 row-start-2">
            <div className={cn(getSlotClasses(), "w-16 h-16 bg-gradient-to-br from-amber-200/20 to-amber-400/30 border-amber-500/50")}>
              <Sword className="w-8 h-8 text-amber-300" />
            </div>
          </div>

          {/* Shield */}
          <div className="col-start-3 row-start-2">
            <div className={cn(getSlotClasses(), "w-16 h-16 bg-gradient-to-br from-amber-200/20 to-amber-400/30 border-amber-500/50")}>
              <Shield className="w-8 h-8 text-amber-300" />
            </div>
          </div>

          {/* Boots */}
          <div className="col-start-2">
            <div className={cn(getSlotClasses(), "w-16 h-16 bg-gradient-to-br from-amber-200/20 to-amber-400/30 border-amber-500/50")}>
              <Package className="w-8 h-8 text-amber-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="ui-p-4 border-b border-amber-600/30">
        <div className="ui-flex ui-gap-3">
          <Package className="w-5 h-5 text-amber-300" />
          <div className="ui-flex-1">
            <div className="ui-flex ui-flex-between text-sm text-amber-200 mb-1">
              <span>Peso: 15/50 kg</span>
            </div>
            <div className="w-full bg-amber-800/50 ui-rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 ui-rounded-full transition-all duration-300" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="ui-flex-1 overflow-y-auto ui-p-4">
        <div className="ui-grid ui-grid-cols-5 ui-gap-2">
          {Array.from({ length: 40 }, (_, index) => (
            <div
              key={index}
              className={cn(
                getSlotClasses(),
                "aspect-square bg-gradient-to-br from-amber-200/10 to-amber-400/20 border-amber-500/30",
                "hover:bg-amber-300/20 hover:border-amber-400/60"
              )}
            >
              {/* Item placeholder */}
              <div className="w-3 h-3 bg-amber-400/30 ui-rounded-sm"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="ui-panel-footer border-t border-amber-600/30 bg-gradient-to-r from-amber-800/50 to-amber-700/50">
        <div className="ui-flex ui-gap-2">
          <button className={cn(getButtonClasses('warning'), "ui-flex-1 ui-flex ui-flex-center ui-gap-2")}>
            <Settings className="w-4 h-4" />
            Configurações
          </button>
          <button className={getButtonClasses('primary')}>
            Limpar
          </button>
          <button className={getButtonClasses('secondary')}>
            Organizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;