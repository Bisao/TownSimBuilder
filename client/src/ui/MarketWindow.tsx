import { useState } from "react";
import { marketCategories, marketItems } from "../game/constants/market";
import { useResourceStore } from "../game/stores/useResourceStore";
import { useAudio } from "../lib/stores/useAudio";
import { cn } from "../lib/utils";
import { useDraggable } from "../hooks/useDraggable";

interface MarketWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const MarketWindow = ({ isOpen, onClose }: MarketWindowProps) => {
  const [activeCategory, setActiveCategory] = useState("seeds");
  const [marketMode, setMarketMode] = useState<"buy" | "sell">("buy");
  const { resources, updateResource } = useResourceStore();
  const { playSuccess } = useAudio();
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 384, y: window.innerHeight / 2 - 300 }
  });

  // Filtrar itens pela categoria selecionada
  const filteredItems = Object.values(marketItems).filter(
    (item) => item.category === activeCategory
  );

  // Função para comprar um item
  const buyItem = (itemId: string) => {
    const item = marketItems[itemId];
    if (!item) return;

    // Verificar se o jogador tem moedas suficientes
    if ((resources.coins || 0) >= item.price) {
      // Deduzir o preço
      updateResource("coins", -item.price);

      // Se o item tem um tipo de recurso, adicionar ao inventário
      if (item.resourceType && item.amount) {
        updateResource(item.resourceType, item.amount);
      }

      // Tocar som de sucesso
      playSuccess();

      alert(`Você comprou: ${item.name}${item.amount ? ` (${item.amount} unidades)` : ''}`);
    } else {
      alert("Moedas insuficientes!");
    }
  };

  // Função para vender um item
  const sellItem = (itemId: string) => {
    const item = marketItems[itemId];
    if (!item || !item.resourceType || !item.amount) return;

    const currentAmount = resources[item.resourceType] || 0;

    // Verificar se o jogador tem o recurso para vender
    if (currentAmount >= item.amount) {
      // Remover o recurso do inventário
      updateResource(item.resourceType, -item.amount);

      // Adicionar moedas (venda por 70% do preço de compra)
      const sellPrice = Math.floor(item.price * 0.7);
      updateResource("coins", sellPrice);

      // Tocar som de sucesso
      playSuccess();

      alert(`Você vendeu: ${item.name} por ${sellPrice} moedas`);
    } else {
      alert(`Você não tem ${item.name} suficiente para vender!`);
    }
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative shadow-xl"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Mercado</h2>
              <p className="text-sm text-gray-600">Compre e venda recursos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            ×
          </button>
        </div>

        <div className="px-6">
          {/* Exibição das moedas */}
          <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-2xl">💰</span>
            <span className="font-bold text-lg text-yellow-700">{resources.coins || 0} Moedas</span>
          </div>

          {/* Toggle Buy/Sell Mode */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              className={cn(
                "flex-1 py-3 px-4 rounded-md font-medium transition-colors",
                marketMode === "buy"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              )}
              onClick={() => setMarketMode("buy")}
            >
              💰 Comprar
            </button>
            <button
              className={cn(
                "flex-1 py-3 px-4 rounded-md font-medium transition-colors",
                marketMode === "sell"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              )}
              onClick={() => setMarketMode("sell")}
            >
              💸 Vender
            </button>
          </div>

          {/* Abas de categorias */}
          <div className="flex border-b border-gray-200 mb-6">
            {marketCategories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  "px-4 py-3 flex items-center gap-2 border-b-2 font-medium transition-colors",
                  activeCategory === category.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="text-lg">
                  {category.id === "seeds" ? "🌱" : 
                   category.id === "tools" ? "🔧" : 
                   category.id === "supplies" ? "📦" : "🏷️"}
                </span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de itens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 pt-0">
          {filteredItems.map((item) => {
            const canSell = item.resourceType && (resources[item.resourceType] || 0) >= (item.amount || 1);
            const sellPrice = Math.floor(item.price * 0.7);
            const currentStock = item.resourceType ? (resources[item.resourceType] || 0) : 0;

            return (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-4 flex flex-col hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    {marketMode === "buy" ? (
                      <p className="text-sm text-gray-600">
                        Preço: <span className="text-green-600 font-medium">{item.price} 💰</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Vende por: <span className="text-orange-600 font-medium">{sellPrice} 💰</span>
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 flex-1">
                  {item.description}
                </p>

                {marketMode === "sell" && (
                  <p className="text-sm text-blue-600 mb-3 bg-blue-50 p-2 rounded border border-blue-200">
                    📦 Estoque: {currentStock} unidade(s)
                  </p>
                )}

                <button
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    marketMode === "buy" 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  )}
                  onClick={() => marketMode === "buy" ? buyItem(item.id) : sellItem(item.id)}
                  disabled={
                    marketMode === "buy" 
                      ? (resources.coins || 0) < item.price
                      : !canSell
                  }
                >
                  {marketMode === "buy" ? "💰 Comprar" : "💸 Vender"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketWindow;