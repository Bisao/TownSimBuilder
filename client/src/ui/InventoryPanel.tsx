
import React, { useState, useCallback, useMemo } from "react";
import { NPC } from "../game/stores/useNpcStore";
import { useDraggable } from "../hooks/useDraggable";

interface InventoryPanelProps {
  npc: NPC;
  onClose: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  type: "tool" | "weapon" | "resource" | "armor" | "consumable";
  tier: number;
  icon: string;
  skill?: string;
  equipped?: boolean;
  rarity?: "common" | "rare" | "epic" | "legendary";
  description?: string;
  stats?: {
    damage?: number;
    defense?: number;
    speed?: number;
  };
}

interface EquipmentSlot {
  id: string;
  name: string;
  type: "weapon" | "tool" | "head" | "chest" | "boots" | "cape" | "bag" | "food" | "potion" | "mount" | "offhand";
  equipped?: InventoryItem;
  acceptedTypes?: string[];
}

const InventoryPanel = ({ npc, onClose }: InventoryPanelProps) => {
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 350, y: window.innerHeight / 2 - 350 }
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    // === ARMAS LENDÁRIAS ===
    { 
      id: "excalibur", 
      name: "Excalibur", 
      type: "weapon", 
      tier: 6, 
      icon: "⚔️", 
      skill: "sword", 
      rarity: "legendary",
      description: "Espada lendária dos reis",
      stats: { damage: 95, speed: 85 }
    },
    { 
      id: "mjolnir", 
      name: "Mjolnir", 
      type: "weapon", 
      tier: 6, 
      icon: "🔨", 
      skill: "hammer", 
      rarity: "legendary",
      description: "Martelo dos deuses",
      stats: { damage: 100, speed: 60 }
    },

    // === COMBATE CORPO A CORPO ===
    { 
      id: "iron_sword", 
      name: "Espada de Ferro", 
      type: "weapon", 
      tier: 4, 
      icon: "⚔️", 
      skill: "sword",
      rarity: "common",
      description: "Espada resistente de ferro forjado",
      stats: { damage: 45, speed: 70 }
    },
    { 
      id: "iron_axe", 
      name: "Machado de Ferro", 
      type: "weapon", 
      tier: 4, 
      icon: "🪓", 
      skill: "axe",
      rarity: "common",
      description: "Machado pesado para combate",
      stats: { damage: 50, speed: 55 }
    },
    { 
      id: "enchanted_blade", 
      name: "Lâmina Encantada", 
      type: "weapon", 
      tier: 5, 
      icon: "🗡️", 
      skill: "sword",
      rarity: "epic",
      description: "Espada imbuída com magia",
      stats: { damage: 70, speed: 85 }
    },

    // === ARMADURAS ===
    { 
      id: "dragon_plate", 
      name: "Armadura de Dragão", 
      type: "armor", 
      tier: 6, 
      icon: "🛡️", 
      skill: "defense",
      rarity: "legendary",
      description: "Feita com escamas de dragão",
      stats: { defense: 90 }
    },
    { 
      id: "iron_helmet", 
      name: "Capacete de Ferro", 
      type: "armor", 
      tier: 4, 
      icon: "⛑️", 
      skill: "defense",
      rarity: "common",
      description: "Proteção sólida para a cabeça",
      stats: { defense: 35 }
    },

    // === CONSUMÍVEIS ===
    { 
      id: "greater_health", 
      name: "Grande Poção de Vida", 
      type: "consumable", 
      tier: 4, 
      icon: "🧪", 
      skill: "alchemy",
      rarity: "rare",
      description: "Restaura muito HP",
    },
    { 
      id: "mana_crystal", 
      name: "Cristal de Mana", 
      type: "consumable", 
      tier: 5, 
      icon: "💎", 
      skill: "magic",
      rarity: "epic",
      description: "Energia mágica pura",
    },

    // === FERRAMENTAS ===
    { 
      id: "master_pickaxe", 
      name: "Picareta Mestre", 
      type: "tool", 
      tier: 5, 
      icon: "⛏️", 
      skill: "mining",
      rarity: "rare",
      description: "Extrai minérios raros",
    },

    // Recursos do NPC
    ...(npc.inventory.amount > 0 ? [{
      id: `resource_${npc.inventory.type}`,
      name: npc.inventory.type,
      type: "resource" as const,
      tier: 1,
      icon: npc.inventory.type === "wood" ? "🪵" : npc.inventory.type === "stone" ? "🪨" : "🌾",
      rarity: "common" as const,
      description: `${npc.inventory.amount}x ${npc.inventory.type}`
    }] : [])
  ]);

  const [equipmentSlots, setEquipmentSlots] = useState<EquipmentSlot[]>([
    { 
      id: "head", 
      name: "Capacete", 
      type: "head",
      acceptedTypes: ["armor"]
    },
    { 
      id: "cape", 
      name: "Capa", 
      type: "cape",
      acceptedTypes: ["armor"]
    },
    { 
      id: "bag", 
      name: "Bolsa", 
      type: "bag",
      acceptedTypes: ["consumable"]
    },
    { 
      id: "mainhand", 
      name: "Mão Principal", 
      type: "weapon",
      acceptedTypes: ["weapon", "tool"]
    },
    { 
      id: "chest", 
      name: "Peitoral", 
      type: "chest",
      acceptedTypes: ["armor"]
    },
    { 
      id: "offhand", 
      name: "Mão Secundária", 
      type: "offhand",
      acceptedTypes: ["weapon", "armor", "tool"]
    },
    { 
      id: "potion", 
      name: "Poção", 
      type: "potion",
      acceptedTypes: ["consumable"]
    },
    { 
      id: "boots", 
      name: "Botas", 
      type: "boots",
      acceptedTypes: ["armor"]
    },
    { 
      id: "food", 
      name: "Comida", 
      type: "food",
      acceptedTypes: ["consumable"]
    }
  ]);

  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("tier");

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "legendary": return "from-yellow-400 to-orange-500";
      case "epic": return "from-purple-400 to-pink-500";
      case "rare": return "from-blue-400 to-indigo-500";
      default: return "from-gray-300 to-gray-400";
    }
  };

  const getRarityBorder = (rarity?: string) => {
    switch (rarity) {
      case "legendary": return "border-yellow-400 shadow-yellow-400/50";
      case "epic": return "border-purple-400 shadow-purple-400/50";
      case "rare": return "border-blue-400 shadow-blue-400/50";
      default: return "border-gray-300 shadow-gray-300/20";
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = inventoryItems;
    
    if (filter !== "all") {
      filtered = filtered.filter(item => item.type === filter);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "tier") return b.tier - a.tier;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "type") return a.type.localeCompare(b.type);
      return 0;
    });
  }, [inventoryItems, filter, sortBy]);

  const handleDragStart = useCallback((item: InventoryItem, e: React.DragEvent) => {
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => setDraggedItem(null), 100);
  }, []);

  const handleDropOnSlot = useCallback((e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot) return;

    const isCompatible = slot.acceptedTypes?.includes(draggedItem.type);

    if (!isCompatible) {
      // Feedback visual de erro
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[10000] animate-bounce';
      notification.textContent = `${draggedItem.name} não pode ser equipado em ${slot.name}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      return;
    }

    // Se já há um item equipado, retorná-lo ao inventário
    if (slot.equipped) {
      setInventoryItems(prev => [...prev, { ...slot.equipped!, equipped: false }]);
    }

    // Remover item do inventário
    setInventoryItems(prev => prev.filter(item => item.id !== draggedItem.id));

    // Equipar item no slot
    setEquipmentSlots(prev => 
      prev.map(s => 
        s.id === slotId 
          ? { ...s, equipped: { ...draggedItem, equipped: true } }
          : s
      )
    );

    setDraggedItem(null);

    // Feedback de sucesso
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[10000] animate-pulse';
    notification.textContent = `✓ ${draggedItem.name} equipado!`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  }, [draggedItem, equipmentSlots]);

  const handleUnequip = useCallback((slotId: string) => {
    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot?.equipped) return;

    setInventoryItems(prev => [...prev, { ...slot.equipped!, equipped: false }]);
    setEquipmentSlots(prev => prev.map(s => 
      s.id === slotId ? { ...s, equipped: undefined } : s
    ));
  }, [equipmentSlots]);

  const ItemComponent = ({ item, index }: { item: InventoryItem; index: number }) => (
    <div
      className={`relative group cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:z-10 ${
        selectedItem?.id === item.id ? 'ring-2 ring-blue-400' : ''
      }`}
      draggable
      onDragStart={(e) => handleDragStart(item, e)}
      onDragEnd={handleDragEnd}
      onClick={() => setSelectedItem(item)}
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded-lg border-2 ${getRarityBorder(item.rarity)} flex items-center justify-center shadow-lg backdrop-blur-sm relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <span className="text-xl relative z-10">{item.icon}</span>
        <div className="absolute -bottom-0.5 -right-0.5 text-xs bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-white font-bold">
          {item.tier}
        </div>
        {item.rarity === "legendary" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        )}
      </div>
      
      {/* Tooltip melhorado */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700 min-w-max max-w-xs">
          <div className="font-bold text-center mb-1">{item.name}</div>
          {item.description && (
            <div className="text-gray-300 text-center mb-2">{item.description}</div>
          )}
          {item.stats && (
            <div className="space-y-1">
              {item.stats.damage && <div className="text-red-400">⚔️ Dano: {item.stats.damage}</div>}
              {item.stats.defense && <div className="text-blue-400">🛡️ Defesa: {item.stats.defense}</div>}
              {item.stats.speed && <div className="text-green-400">⚡ Velocidade: {item.stats.speed}</div>}
            </div>
          )}
          <div className={`text-center mt-2 font-semibold ${
            item.rarity === "legendary" ? "text-yellow-400" :
            item.rarity === "epic" ? "text-purple-400" :
            item.rarity === "rare" ? "text-blue-400" : "text-gray-400"
          }`}>
            {item.rarity?.toUpperCase() || "COMUM"}
          </div>
        </div>
      </div>
    </div>
  );

  const EquipmentSlotComponent = ({ slotId, label }: { slotId: string; label: string }) => {
    const slot = equipmentSlots.find(s => s.id === slotId);
    const canAccept = draggedItem && slot?.acceptedTypes?.includes(draggedItem.type);

    return (
      <div className="flex flex-col items-center space-y-2">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <div
          data-slot={slotId}
          className={`w-14 h-14 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center relative overflow-hidden ${
            draggedItem 
              ? canAccept 
                ? 'border-green-400 bg-green-50 shadow-lg scale-105' 
                : 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-white/30'
          } hover:bg-white/50`}
          onDragOver={(e) => {
            e.preventDefault();
            if (canAccept) {
              e.currentTarget.classList.add('animate-pulse');
            }
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('animate-pulse');
          }}
          onDrop={(e) => {
            e.currentTarget.classList.remove('animate-pulse');
            handleDropOnSlot(e, slotId);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (slot?.equipped) handleUnequip(slotId);
          }}
        >
          {slot?.equipped ? (
            <div className="relative group">
              <div className={`text-2xl bg-gradient-to-br ${getRarityColor(slot.equipped.rarity)} rounded-lg p-2 border ${getRarityBorder(slot.equipped.rarity)}`}>
                {slot.equipped.icon}
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {slot.equipped.name}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-2xl">+</div>
          )}
        </div>
      </div>
    );
  };

  const inventorySlots = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => {
      const item = filteredItems[i];
      return (
        <div
          key={i}
          className="w-12 h-12 bg-white/20 border border-gray-300/50 rounded-lg flex items-center justify-center relative transition-all duration-200 hover:bg-white/40 hover:border-gray-400/70"
        >
          {item && <ItemComponent item={item} index={i} />}
        </div>
      );
    }), [filteredItems]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl w-[700px] h-[720px] overflow-hidden relative border border-gray-200"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={(e) => {
          // Não arrastar o painel se estamos clicando em itens ou slots
          const target = e.target as HTMLElement;
          const isInteractiveElement = target.closest('[draggable="true"]') || 
                                     target.closest('[data-slot]') || 
                                     target.closest('button') || 
                                     target.closest('input') || 
                                     target.closest('select');
          
          if (!isInteractiveElement) {
            handleMouseDown(e);
          }
        }}
      >
        {/* Header Aprimorado */}
        <div 
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <i className="fa-solid fa-treasure-chest text-2xl text-white"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">Inventário</h2>
                  <p className="text-white/90 font-medium">{npc.name}</p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all duration-200 border border-white/30 hover:scale-105"
              >
                <i className="fa-solid fa-times text-white text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 h-full overflow-y-auto">
          {/* Controles de Filtro e Ordenação */}
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-2">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white/80 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="weapon">Armas</option>
                  <option value="armor">Armaduras</option>
                  <option value="tool">Ferramentas</option>
                  <option value="consumable">Consumíveis</option>
                  <option value="resource">Recursos</option>
                </select>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white/80 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="tier">Por Tier</option>
                  <option value="name">Por Nome</option>
                  <option value="type">Por Tipo</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {filteredItems.length} / 60 itens
              </div>
            </div>
          </div>

          {/* Equipamentos */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-amber-600"></i>
              Equipamentos
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <EquipmentSlotComponent slotId="bag" label="Bolsa" />
              <EquipmentSlotComponent slotId="head" label="Capacete" />
              <EquipmentSlotComponent slotId="cape" label="Capa" />
              <EquipmentSlotComponent slotId="mainhand" label="Mão Principal" />
              <EquipmentSlotComponent slotId="chest" label="Peitoral" />
              <EquipmentSlotComponent slotId="offhand" label="Mão Secundária" />
              <EquipmentSlotComponent slotId="potion" label="Poção" />
              <EquipmentSlotComponent slotId="boots" label="Botas" />
              <EquipmentSlotComponent slotId="food" label="Comida" />
            </div>
          </div>

          {/* Grid de Inventário */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-gray-600"></i>
              Inventário
            </h3>
            <div className="grid grid-cols-10 gap-2 p-4 bg-white/50 rounded-xl border border-gray-200 max-h-80 overflow-y-auto custom-scrollbar">
              {inventorySlots}
            </div>
          </div>

          {/* Painel de Detalhes do Item Selecionado */}
          {selectedItem && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-blue-600"></i>
                Detalhes do Item
              </h3>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${getRarityColor(selectedItem.rarity)} rounded-xl border-2 ${getRarityBorder(selectedItem.rarity)} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{selectedItem.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800">{selectedItem.name}</h4>
                  <p className="text-gray-600 mb-2">{selectedItem.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-2 py-1 bg-gray-200 rounded-lg font-medium">Tier {selectedItem.tier}</span>
                    <span className={`px-2 py-1 rounded-lg font-medium ${
                      selectedItem.rarity === "legendary" ? "bg-yellow-200 text-yellow-800" :
                      selectedItem.rarity === "epic" ? "bg-purple-200 text-purple-800" :
                      selectedItem.rarity === "rare" ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"
                    }`}>
                      {selectedItem.rarity?.toUpperCase() || "COMUM"}
                    </span>
                  </div>
                  {selectedItem.stats && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {selectedItem.stats.damage && (
                        <div className="flex items-center gap-1 text-red-600">
                          <i className="fa-solid fa-sword"></i>
                          <span className="font-medium">{selectedItem.stats.damage}</span>
                        </div>
                      )}
                      {selectedItem.stats.defense && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <i className="fa-solid fa-shield"></i>
                          <span className="font-medium">{selectedItem.stats.defense}</span>
                        </div>
                      )}
                      {selectedItem.stats.speed && (
                        <div className="flex items-center gap-1 text-green-600">
                          <i className="fa-solid fa-bolt"></i>
                          <span className="font-medium">{selectedItem.stats.speed}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
