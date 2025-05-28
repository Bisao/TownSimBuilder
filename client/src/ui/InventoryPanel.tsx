
import React, { useState } from "react";
import { NPC } from "../game/stores/useNpcStore";
import { useDraggable } from "../hooks/useDraggable";

interface InventoryPanelProps {
  npc: NPC;
  onClose: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  type: "tool" | "weapon" | "resource";
  tier: number;
  icon: string;
  skill?: string;
  equipped?: boolean;
}

interface EquipmentSlot {
  id: string;
  name: string;
  type: "weapon" | "tool" | "head" | "chest" | "boots" | "cape" | "bag" | "food" | "potion" | "mount";
  equipped?: InventoryItem;
}

const InventoryPanel = ({ npc, onClose }: InventoryPanelProps) => {
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 250 }
  });

  // Itens iniciais T1 baseados nas habilidades
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    // Ferramentas T1
    { id: "pickaxe_t1", name: "Picareta T1", type: "tool", tier: 1, icon: "⛏️", skill: "mining" },
    { id: "axe_t1", name: "Machado T1", type: "tool", tier: 1, icon: "🪓", skill: "lumberjack" },
    { id: "sickle_t1", name: "Foice T1", type: "tool", tier: 1, icon: "🗡️", skill: "farming" },
    { id: "skinning_knife_t1", name: "Faca de Esfolamento T1", type: "tool", tier: 1, icon: "🔪", skill: "skinning" },
    
    // Armas T1
    { id: "sword_t1", name: "Espada T1", type: "weapon", tier: 1, icon: "⚔️", skill: "sword" },
    { id: "bow_t1", name: "Arco T1", type: "weapon", tier: 1, icon: "🏹", skill: "bow" },
    { id: "staff_t1", name: "Cajado T1", type: "weapon", tier: 1, icon: "🪄", skill: "arcane_staff" },
    { id: "dagger_t1", name: "Adaga T1", type: "weapon", tier: 1, icon: "🗡️", skill: "dagger" },
    { id: "hammer_t1", name: "Martelo T1", type: "weapon", tier: 1, icon: "🔨", skill: "hammer" },
    { id: "spear_t1", name: "Lança T1", type: "weapon", tier: 1, icon: "🗡️", skill: "spear" },
    { id: "mace_t1", name: "Maça T1", type: "weapon", tier: 1, icon: "🏏", skill: "mace" },
    { id: "crossbow_t1", name: "Besta T1", type: "weapon", tier: 1, icon: "🏹", skill: "crossbow" },
    { id: "fire_staff_t1", name: "Cajado de Fogo T1", type: "weapon", tier: 1, icon: "🔥", skill: "fire_staff" },
    { id: "frost_staff_t1", name: "Cajado de Gelo T1", type: "weapon", tier: 1, icon: "❄️", skill: "frost_staff" },
    { id: "holy_staff_t1", name: "Cajado Sagrado T1", type: "weapon", tier: 1, icon: "✨", skill: "holy_staff" },
    { id: "nature_staff_t1", name: "Cajado da Natureza T1", type: "weapon", tier: 1, icon: "🌿", skill: "nature_staff" },
    
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
    { id: "weapon", name: "Arma Principal", type: "weapon" },
    { id: "tool", name: "Ferramenta", type: "tool" },
    { id: "head", name: "Cabeça", type: "head" },
    { id: "chest", name: "Peito", type: "chest" },
    { id: "boots", name: "Botas", type: "boots" },
    { id: "cape", name: "Capa", type: "cape" },
    { id: "bag", name: "Mochila", type: "bag" },
    { id: "food", name: "Comida", type: "food" },
    { id: "potion", name: "Poção", type: "potion" },
    { id: "mount", name: "Montaria", type: "mount" }
  ]);

  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);

  const handleDragStart = (item: InventoryItem) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDropOnSlot = (slotId: string) => {
    if (!draggedItem) return;

    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot) return;

    // Verificar se o item pode ser equipado no slot
    const canEquip = (
      (slot.type === "weapon" && draggedItem.type === "weapon") ||
      (slot.type === "tool" && draggedItem.type === "tool")
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
  };

  const handleUnequip = (slotId: string) => {
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
  };

  // Criar grid de 48 slots para o inventário
  const inventorySlots = Array.from({ length: 48 }, (_, i) => {
    const item = inventoryItems[i];
    return (
      <div
        key={i}
        className="w-12 h-12 bg-amber-100 border border-amber-300 flex items-center justify-center relative cursor-pointer hover:bg-amber-200 transition-colors"
        draggable={!!item}
        onDragStart={() => item && handleDragStart(item)}
        onDragEnd={handleDragEnd}
      >
        {item && (
          <div className="text-lg relative group">
            {item.icon}
            <div className="absolute bottom-0 right-0 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
              {item.tier}
            </div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {item.name}
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-amber-50 rounded-lg border-2 border-amber-700 relative shadow-2xl"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '600px',
          height: '500px',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23d97706" fill-opacity="0.1"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-amber-700 bg-amber-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <h2 className="text-lg font-bold">Inventário</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-amber-200 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex h-full">
          {/* Equipment Slots */}
          <div className="w-48 p-4 border-r-2 border-amber-300">
            <h3 className="text-sm font-bold text-amber-800 mb-3">Equipamentos</h3>
            <div className="space-y-2">
              {equipmentSlots.map(slot => (
                <div
                  key={slot.id}
                  className="w-12 h-12 bg-amber-200 border-2 border-amber-400 flex items-center justify-center relative cursor-pointer hover:bg-amber-300 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnSlot(slot.id)}
                  onClick={() => slot.equipped && handleUnequip(slot.id)}
                >
                  {slot.equipped ? (
                    <div className="text-lg relative group">
                      {slot.equipped.icon}
                      <div className="absolute bottom-0 right-0 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        {slot.equipped.tier}
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {slot.equipped.name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-amber-500 text-xs text-center">
                      {slot.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-amber-800">Slots do Inventário (48)</h3>
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <span>💰 Ouro: 0</span>
                <span>🥈 Prata: 0</span>
              </div>
            </div>
            
            <div className="grid grid-cols-8 gap-1 max-h-80 overflow-y-auto">
              {inventorySlots}
            </div>
            
            {/* Info */}
            <div className="mt-4 text-xs text-amber-700 bg-amber-100 p-2 rounded">
              <p><strong>💡 Dica:</strong> Arraste itens para os slots de equipamento para equipá-los.</p>
              <p>Clique em um item equipado para desequipá-lo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
