
import React, { useState } from "react";
import { useResourceStore } from "../game/stores/useResourceStore";
import { resourceTypes } from "../game/constants/resources";
import { getPanelClasses, getHeaderClasses, getContentClasses, getButtonClasses, cn } from "../lib/ui-system";
import { ShoppingCart, Coins, TrendingUp, TrendingDown } from "lucide-react";

interface MarketWindowProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MarketItem {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  demand: 'high' | 'medium' | 'low';
}

const MarketWindow: React.FC<MarketWindowProps> = ({ isVisible, onClose }) => {
  const { resources, addResource, removeResource } = useResourceStore();
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [playerGold] = useState(1000); // Mock gold amount

  if (!isVisible) return null;

  // Mock market data
  const marketItems: MarketItem[] = [
    { id: 'wood', name: 'Madeira', buyPrice: 10, sellPrice: 8, stock: 50, demand: 'high' },
    { id: 'stone', name: 'Pedra', buyPrice: 15, sellPrice: 12, stock: 30, demand: 'medium' },
    { id: 'wheat', name: 'Trigo', buyPrice: 5, sellPrice: 3, stock: 100, demand: 'low' },
    { id: 'bread', name: 'Pão', buyPrice: 8, sellPrice: 6, stock: 25, demand: 'high' },
  ];

  const handleBuy = (item: MarketItem) => {
    if (playerGold >= item.buyPrice) {
      addResource(item.id, 1);
      // Deduct gold logic would go here
      console.log(`Bought 1 ${item.name} for ${item.buyPrice} gold`);
    }
  };

  const handleSell = (item: MarketItem) => {
    const currentAmount = resources[item.id] || 0;
    if (currentAmount > 0) {
      removeResource(item.id, 1);
      // Add gold logic would go here
      console.log(`Sold 1 ${item.name} for ${item.sellPrice} gold`);
    }
  };

  const getDemandIcon = (demand: string) => {
    switch (demand) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'low': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4 bg-yellow-400 rounded-full" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={cn(getPanelClasses('modal'), "w-[500px] max-h-[600px]")}>
        {/* Header */}
        <div className={getHeaderClasses()}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Mercado</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Coins className="w-4 h-4" />
                  <span>{playerGold} moedas</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <i className="fa-solid fa-times" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600">
          <button
            onClick={() => setSelectedTab('buy')}
            className={cn(
              "flex-1 py-3 px-4 text-center transition-colors",
              selectedTab === 'buy'
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
          >
            Comprar
          </button>
          <button
            onClick={() => setSelectedTab('sell')}
            className={cn(
              "flex-1 py-3 px-4 text-center transition-colors",
              selectedTab === 'sell'
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
          >
            Vender
          </button>
        </div>

        {/* Content */}
        <div className={getContentClasses()}>
          <div className="space-y-3">
            {marketItems.map(item => {
              const resource = resourceTypes[item.id];
              const currentAmount = resources[item.id] || 0;
              const price = selectedTab === 'buy' ? item.buyPrice : item.sellPrice;
              const canAfford = selectedTab === 'buy' ? playerGold >= price : currentAmount > 0;

              return (
                <div 
                  key={item.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {resource && (
                        <i 
                          className={`${resource.icon} text-lg`}
                          style={{ color: resource.color }}
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          {getDemandIcon(item.demand)}
                          <span>Demanda: {item.demand}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-400">
                        {price} <Coins className="w-4 h-4 inline" />
                      </div>
                      {selectedTab === 'buy' && (
                        <div className="text-sm text-gray-400">
                          Estoque: {item.stock}
                        </div>
                      )}
                      {selectedTab === 'sell' && (
                        <div className="text-sm text-gray-400">
                          Você tem: {currentAmount}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => selectedTab === 'buy' ? handleBuy(item) : handleSell(item)}
                      disabled={!canAfford}
                      className={cn(
                        getButtonClasses(selectedTab === 'buy' ? 'success' : 'warning', 'sm'),
                        !canAfford && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {selectedTab === 'buy' ? 'Comprar' : 'Vender'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketWindow;
