
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
}

interface EquipmentSlot {
  id: string;
  name: string;
  type: "weapon" | "tool" | "head" | "chest" | "boots" | "cape" | "bag" | "food" | "potion" | "mount" | "offhand";
  equipped?: InventoryItem;
}

const InventoryPanel = ({ npc, onClose }: InventoryPanelProps) => {
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 300 }
  });

  // Itens iniciais baseados no NPC
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    // Ferramentas T1
    { id: "pickaxe_t1", name: "Picareta T1", type: "tool", tier: 1, icon: "⛏️", skill: "mining" },
    { id: "axe_t1", name: "Machado T1", type: "tool", tier: 1, icon: "🪓", skill: "lumberjack" },
    { id: "sickle_t1", name: "Foice T1", type: "tool", tier: 1, icon: "🗡️", skill: "farming" },
    
    // Armas T1
    { id: "sword_t1", name: "Espada T1", type: "weapon", tier: 1, icon: "⚔️", skill: "sword" },
    { id: "bow_t1", name: "Arco T1", type: "weapon", tier: 1, icon: "🏹", skill: "bow" },
    
    // Recursos se o NPC tiver algum
    ...(npc.inventory.amount > 0 ? [{
      id: `resource_${npc.inventory.type}`,
      name: npc.inventory.type,
      type: "resource" as const,
      tier: 1,
      icon: npc.inventory.type === "wood" ? "🪵" : npc.inventory.type === "stone" ? "🪨" : "🌾"
    }] : [])
  ]);

  const [equipmentSlots, setEquipmentSlots] = useState<EquipmentSlot[]>([
    { id: "head", name: "Head Slot", type: "head" },
    { id: "cape", name: "Cape", type: "cape" },
    { id: "bag", name: "Bag", type: "bag" },
    { id: "mainhand", name: "Main Hand", type: "weapon" },
    { id: "chest", name: "Chest Slot", type: "chest" },
    { id: "offhand", name: "Off-Hand", type: "offhand" },
    { id: "potion", name: "Potion", type: "potion" },
    { id: "boots", name: "Foot Slot", type: "boots" },
    { id: "food", name: "Food", type: "food" },
    { id: "mount", name: "Mount", type: "mount" }
  ]);

  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);

  const handleDragStart = useCallback((item: InventoryItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDropOnSlot = useCallback((slotId: string) => {
    if (!draggedItem) return;

    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot) return;

    // Verificar se o item pode ser equipado no slot
    const canEquip = (
      (slot.type === "weapon" && draggedItem.type === "weapon") ||
      (slot.type === "tool" && draggedItem.type === "tool") ||
      (slot.type === "head" && draggedItem.type === "armor") ||
      (slot.type === "chest" && draggedItem.type === "armor") ||
      (slot.type === "boots" && draggedItem.type === "armor") ||
      (slot.type === "cape" && draggedItem.type === "armor") ||
      (slot.type === "bag" && draggedItem.type === "armor") ||
      (slot.type === "food" && draggedItem.type === "consumable") ||
      (slot.type === "potion" && draggedItem.type === "consumable")
    );

    if (!canEquip) return;

    // Desequipar item anterior se houver
    if (slot.equipped) {
      setInventoryItems(prev => [...prev, { ...slot.equipped!, equipped: false }]);
    }

    // Equipar novo item
    setEquipmentSlots(prev => prev.map(s => 
      s.id === slotId 
        ? { ...s, equipped: { ...draggedItem, equipped: true } }
        : s
    ));

    // Remover item do inventário
    setInventoryItems(prev => prev.filter(item => item.id !== draggedItem.id));
    setDraggedItem(null);
  }, [draggedItem, equipmentSlots]);

  const handleUnequip = useCallback((slotId: string) => {
    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot?.equipped) return;

    // Adicionar de volta ao inventário
    setInventoryItems(prev => [...prev, { ...slot.equipped!, equipped: false }]);

    // Remover do slot
    setEquipmentSlots(prev => prev.map(s => 
      s.id === slotId 
        ? { ...s, equipped: undefined }
        : s
    ));
  }, [equipmentSlots]);

  // Criar grid de 48 slots para o inventário
  const inventorySlots = useMemo(() => 
    Array.from({ length: 48 }, (_, i) => {
      const item = inventoryItems[i];
      return (
        <div
          key={i}
          className="w-10 h-10 bg-amber-800/30 border border-amber-700/50 flex items-center justify-center relative cursor-pointer hover:bg-amber-700/40 transition-colors"
          draggable={!!item}
          onDragStart={() => item && handleDragStart(item)}
          onDragEnd={handleDragEnd}
        >
          {item && (
            <div className="text-sm relative group">
              {item.icon}
              <div className="absolute -bottom-1 -right-1 text-xs bg-yellow-600 text-white rounded-full w-3 h-3 flex items-center justify-center text-[10px]">
                {item.tier}
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {item.name}
              </div>
            </div>
          )}
        </div>
      );
    }), [inventoryItems, handleDragStart, handleDragEnd]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg border-2 border-amber-900 relative shadow-2xl"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '400px',
          height: '600px',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundImage: 'linear-gradient(45deg, rgba(133, 77, 14, 0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(133, 77, 14, 0.1) 25%, transparent 25%)',
          backgroundSize: '20px 20px'
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b-2 border-amber-800 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-400 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <h2 className="text-lg font-bold">Inventory</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-3">
          {/* Details Section */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-amber-900 mb-2">Details</h3>
            
            {/* Equipment Slots Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {/* Row 1 */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Bag</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDropOnSlot('bag');
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const slot = equipmentSlots.find(s => s.id === 'bag');
                    if (slot?.equipped) handleUnequip('bag');
                  }}
                >
                  {(() => {
                    const slot = equipmentSlots.find(s => s.id === 'bag');
                    return slot?.equipped ? (
                      <span className="text-lg">{slot.equipped.icon}</span>
                    ) : null;
                  })()}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Head Slot</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDropOnSlot('head');
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const slot = equipmentSlots.find(s => s.id === 'head');
                    if (slot?.equipped) handleUnequip('head');
                  }}
                >
                  {(() => {
                    const slot = equipmentSlots.find(s => s.id === 'head');
                    return slot?.equipped ? (
                      <span className="text-lg">{slot.equipped.icon}</span>
                    ) : null;
                  })()}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Cape</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDropOnSlot('cape');
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const slot = equipmentSlots.find(s => s.id === 'cape');
                    if (slot?.equipped) handleUnequip('cape');
                  }}
                >
                  {(() => {
                    const slot = equipmentSlots.find(s => s.id === 'cape');
                    return slot?.equipped ? (
                      <span className="text-lg">{slot.equipped.icon}</span>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Main Hand</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot('mainhand')}
                  onClick={() => equipmentSlots.find(s => s.id === 'mainhand')?.equipped && handleUnequip('mainhand')}
                >
                  {equipmentSlots.find(s => s.id === 'mainhand')?.equipped ? (
                    <span className="text-lg">{equipmentSlots.find(s => s.id === 'mainhand')?.equipped?.icon}</span>
                  ) : null}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Chest Slot</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot('chest')}
                  onClick={() => equipmentSlots.find(s => s.id === 'chest')?.equipped && handleUnequip('chest')}
                >
                  {equipmentSlots.find(s => s.id === 'chest')?.equipped ? (
                    <span className="text-lg">{equipmentSlots.find(s => s.id === 'chest')?.equipped?.icon}</span>
                  ) : null}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Off-Hand</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot('offhand')}
                  onClick={() => equipmentSlots.find(s => s.id === 'offhand')?.equipped && handleUnequip('offhand')}
                >
                  {equipmentSlots.find(s => s.id === 'offhand')?.equipped ? (
                    <span className="text-lg">{equipmentSlots.find(s => s.id === 'offhand')?.equipped?.icon}</span>
                  ) : null}
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Potion</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot('potion')}
                  onClick={() => equipmentSlots.find(s => s.id === 'potion')?.equipped && handleUnequip('potion')}
                >
                  {equipmentSlots.find(s => s.id === 'potion')?.equipped ? (
                    <span className="text-lg">{equipmentSlots.find(s => s.id === 'potion')?.equipped?.icon}</span>
                  ) : null}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Foot Slot</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot('boots')}
                  onClick={() => equipmentSlots.find(s => s.id === 'boots')?.equipped && handleUnequip('boots')}
                >
                  {equipmentSlots.find(s => s.id === 'boots')?.equipped ? (
                    <span className="text-lg">{equipmentSlots.find(s => s.id === 'boots')?.equipped?.icon}</span>
                  ) : null}
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-800 mb-1">Food</span>
                <div
                  className="w-12 h-12 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot('food')}
                  onClick={() => equipmentSlots.find(s => s.id === 'food')?.equipped && handleUnequip('food')}
                >
                  {equipmentSlots.find(s => s.id === 'food')?.equipped ? (
                    <span className="text-lg">{equipmentSlots.find(s => s.id === 'food')?.equipped?.icon}</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Currency and Mount */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-800">Gold</span>
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="w-20 h-2 bg-amber-800 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700">Stack</button>
                <button className="px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700">Sort</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-800">Silver</span>
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <div className="w-20 h-2 bg-amber-800 rounded"></div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-amber-800">Mount</span>
              <div
                className="w-10 h-10 bg-amber-300/50 border-2 border-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-400/50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnSlot('mount')}
                onClick={() => equipmentSlots.find(s => s.id === 'mount')?.equipped && handleUnequip('mount')}
              >
                {equipmentSlots.find(s => s.id === 'mount')?.equipped ? (
                  <span className="text-sm">{equipmentSlots.find(s => s.id === 'mount')?.equipped?.icon}</span>
                ) : null}
              </div>
            </div>

            {/* Weight bar */}
            <div className="mb-4">
              <div className="w-full h-3 bg-amber-800 rounded relative">
                <div className="w-1/4 h-full bg-amber-500 rounded"></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs text-white">0%</span>
              </div>
            </div>
          </div>

          {/* Inventory Slots */}
          <div className="mb-2">
            <h3 className="text-sm font-bold text-amber-900 mb-2">Inventory Slots (48)</h3>
            <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto bg-amber-800/20 p-2 border border-amber-700">
              {inventorySlots}
            </div>
          </div>

          {/* Market Value */}
          <div className="text-xs text-amber-700 text-center">
            Est. Market Value: ⏸ 0
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
