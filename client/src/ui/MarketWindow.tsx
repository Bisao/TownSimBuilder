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
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 384, y: window.innerHeight / 2 - 300 }
  });
  
  // Filtrar itens pela categoria selecionada
  const filteredItems = Object.values(marketItems).filter(
    (item) => item.category === activeCategory
  );
  
  // Função para comprar um item
  const { playSuccess } = useAudio();
  
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
      className="fixed inset-0 z-50 bg-black/50 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        ref={dragRef}
        className={`bg-gray-800 text-white rounded-lg w-full max-w-3xl p-4 max-h-[80vh] overflow-auto absolute shadow-2xl ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-2xl font-bold">Mercado</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            &times;
          </button>
        </div>
        
        {/* Toggle Buy/Sell Mode */}
        <div className="flex bg-gray-700 rounded-lg p-1 mb-4">
          <button
            className={cn(
              "flex-1 py-2 px-4 rounded-md font-medium transition-colors",
              marketMode === "buy"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            )}
            onClick={() => setMarketMode("buy")}
          >
            Comprar
          </button>
          <button
            className={cn(
              "flex-1 py-2 px-4 rounded-md font-medium transition-colors",
              marketMode === "sell"
                ? "bg-orange-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            )}
            onClick={() => setMarketMode("sell")}
          >
            Vender
          </button>
        </div>
        
        {/* Abas de categorias */}
        <div className="flex border-b border-gray-700 mb-4">
          {marketCategories.map((category) => (
            <button
              key={category.id}
              className={cn(
                "px-4 py-2 flex items-center gap-2 border-b-2 font-medium",
                activeCategory === category.id
                  ? "border-yellow-500 text-yellow-500"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              {/* Substituir ícones FontAwesome por texto simples */}
              <span className="text-sm">{category.name.charAt(0)}</span>
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Exibição das moedas */}
        <div className="flex items-center gap-2 mb-4 text-yellow-400">
          <span>💰</span>
          <span className="font-bold">{resources.coins || 0}</span>
        </div>
        
        {/* Lista de itens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const canSell = item.resourceType && (resources[item.resourceType] || 0) >= (item.amount || 1);
            const sellPrice = Math.floor(item.price * 0.7);
            const hasEnoughStock = marketMode === "sell" ? canSell : true;
            const currentStock = item.resourceType ? (resources[item.resourceType] || 0) : 0;
            
            return (
              <div
                key={item.id}
                className="bg-gray-700 rounded-lg p-3 flex flex-col hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    {/* Substituir ícones FontAwesome por emoji ou texto */}
                    <span>🔖</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    {marketMode === "buy" ? (
                      <p className="text-sm text-gray-300">
                        Preço: <span className="text-yellow-400">{item.price}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-300">
                        Vende por: <span className="text-orange-400">{sellPrice}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">
                  {item.description}
                </p>
                
                {marketMode === "sell" && (
                  <p className="text-sm text-blue-300 mb-3">
                    Estoque: {currentStock} unidade(s)
                  </p>
                )}
                
                <button
                  className={cn(
                    "mt-auto text-white py-1 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
                    marketMode === "buy" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-orange-600 hover:bg-orange-700"
                  )}
                  onClick={() => marketMode === "buy" ? buyItem(item.id) : sellItem(item.id)}
                  disabled={
                    marketMode === "buy" 
                      ? (resources.coins || 0) < item.price
                      : !canSell
                  }
                >
                  {marketMode === "buy" ? "Comprar" : "Vender"}
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