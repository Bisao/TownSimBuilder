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
      
      // Tocar som de sucesso
      playSuccess();
      
      // Adicionar o item ao inventário (por enquanto, apenas mostra um alerta)
      alert(`Você comprou: ${item.name}`);
    } else {
      alert("Moedas insuficientes!");
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
          {filteredItems.map((item) => (
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
                  <p className="text-sm text-gray-300">
                    Preço: <span className="text-yellow-400">{item.price}</span>
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">
                {item.description}
              </p>
              
              <button
                className="mt-auto bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => buyItem(item.id)}
                disabled={(resources.coins || 0) < item.price}
              >
                Comprar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketWindow;