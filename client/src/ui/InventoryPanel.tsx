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
    initialPosition: { x: window.innerWidth / 2 - 220, y: window.innerHeight / 2 - 300 }
  });

  // Itens iniciais baseados no NPC - Incluindo equipamentos de combate
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    // === COMBATE CORPO A CORPO (Warrior/Plate Fighter) ===
    { id: "iron_sword", name: "Espada de Ferro", type: "weapon", tier: 4, icon: "⚔️", skill: "sword" },
    { id: "iron_axe", name: "Machado de Ferro", type: "weapon", tier: 4, icon: "🪓", skill: "axe" },
    { id: "iron_mace", name: "Maça de Ferro", type: "weapon", tier: 4, icon: "🔨", skill: "mace" },
    { id: "iron_plate", name: "Armadura de Placas", type: "armor", tier: 4, icon: "🛡️", skill: "defense" },
    { id: "iron_helmet", name: "Capacete de Ferro", type: "armor", tier: 4, icon: "⛑️", skill: "defense" },

    // === COMBATE À DISTÂNCIA (Hunter/Archer) ===
    { id: "hunting_bow", name: "Arco de Caça", type: "weapon", tier: 3, icon: "🏹", skill: "bow" },
    { id: "crossbow", name: "Besta", type: "weapon", tier: 4, icon: "🎯", skill: "crossbow" },
    { id: "hunter_leather", name: "Couro de Caçador", type: "armor", tier: 4, icon: "🧥", skill: "defense" },
    { id: "leather_boots", name: "Botas de Couro", type: "armor", tier: 3, icon: "👢", skill: "defense" },

    // === COMBATE MÁGICO (Mage Tower) ===
    { id: "fire_staff", name: "Cajado de Fogo", type: "weapon", tier: 4, icon: "🔥", skill: "fire_magic" },
    { id: "ice_staff", name: "Cajado de Gelo", type: "weapon", tier: 4, icon: "🧊", skill: "ice_magic" },
    { id: "lightning_staff", name: "Cajado de Raio", type: "weapon", tier: 4, icon: "⚡", skill: "lightning_magic" },
    { id: "holy_staff", name: "Cajado Sagrado", type: "weapon", tier: 4, icon: "✨", skill: "holy_magic" },
    { id: "mage_robe", name: "Túnica de Mago", type: "armor", tier: 4, icon: "👘", skill: "defense" },
    { id: "mage_hood", name: "Capuz de Mago", type: "armor", tier: 4, icon: "🎩", skill: "defense" },

    // === COMBATE HÍBRIDO ===
    { id: "enchanted_sword", name: "Espada Encantada", type: "weapon", tier: 5, icon: "🗡️", skill: "hybrid_combat" },
    { id: "battle_mage_staff", name: "Cajado de Batalha", type: "weapon", tier: 5, icon: "🪄", skill: "battle_magic" },

    // === CONSUMÍVEIS ===
    { id: "health_potion", name: "Poção de Vida", type: "consumable", tier: 1, icon: "🧪", skill: "alchemy" },
    { id: "mana_potion", name: "Poção de Mana", type: "consumable", tier: 1, icon: "💙", skill: "alchemy" },
    { id: "bread", name: "Pão", type: "consumable", tier: 1, icon: "🍞", skill: "cooking" },
    { id: "travel_bag", name: "Bolsa de Viagem", type: "consumable", tier: 2, icon: "🎒", skill: "utility" },

    // === FERRAMENTAS BÁSICAS ===
    { id: "pickaxe_t1", name: "Picareta T1", type: "tool", tier: 1, icon: "⛏️", skill: "mining" },
    { id: "axe_t1", name: "Machado T1", type: "tool", tier: 1, icon: "🪓", skill: "lumberjack" },
    { id: "sickle_t1", name: "Foice T1", type: "tool", tier: 1, icon: "🗡️", skill: "farming" },

    // === FLECHAS ESPECIAIS ===
    { id: "fire_arrows", name: "Flechas de Fogo", type: "consumable", tier: 3, icon: "🔥", skill: "archery" },
    { id: "ice_arrows", name: "Flechas de Gelo", type: "consumable", tier: 3, icon: "🧊", skill: "archery" },
    { id: "explosive_bolts", name: "Virotes Explosivos", type: "consumable", tier: 4, icon: "💥", skill: "crossbow" },

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

  const handleDragStart = useCallback((item: InventoryItem, e: React.DragEvent) => {
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", item.id);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Só limpar se não foi um drop bem-sucedido
    setTimeout(() => setDraggedItem(null), 100);
  }, []);

  const handleDropOnSlot = useCallback((e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot) return;

    // Verificar se o tipo do item é compatível com o slot
    const isCompatible = (
      (slot.type === "weapon" && (draggedItem.type === "weapon" || draggedItem.type === "tool")) ||
      (slot.type === "armor" && draggedItem.type === "armor") ||
      (slot.type === "head" && draggedItem.type === "armor") ||
      (slot.type === "chest" && draggedItem.type === "armor") ||
      (slot.type === "boots" && draggedItem.type === "armor") ||
      (slot.type === "cape" && draggedItem.type === "armor") ||
      (slot.type === "bag" && draggedItem.type === "consumable") ||
      (slot.type === "food" && draggedItem.type === "consumable") ||
      (slot.type === "potion" && draggedItem.type === "consumable") ||
      (slot.type === "mount" && draggedItem.type === "consumable") ||
      (slot.type === "offhand" && (draggedItem.type === "weapon" || draggedItem.type === "armor"))
    );

    if (!isCompatible) {
      console.log(`Item ${draggedItem.name} não é compatível com slot ${slot.name}`);
      return;
    }

    // Se já há um item equipado, retorná-lo ao inventário
    if (slot.equipped) {
      setInventoryItems(prev => {
        const newItems = [...prev];
        // Encontrar o primeiro slot vazio
        const emptyIndex = newItems.findIndex((item, index) => !item);
        if (emptyIndex !== -1) {
          newItems[emptyIndex] = { ...slot.equipped!, equipped: false };
        } else {
          newItems.push({ ...slot.equipped!, equipped: false });
        }
        return newItems;
      });
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
    console.log(`✅ ${draggedItem.name} equipado em ${slot.name}`);
    
    // Feedback visual opcional
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[10000]';
    notification.textContent = `${draggedItem.name} equipado!`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  }, [draggedItem, equipmentSlots]);

  const handleDropOnInventory = useCallback((e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    // Se o item veio de um slot de equipamento, removê-lo de lá
    const equippedSlot = equipmentSlots.find(s => s.equipped?.id === draggedItem.id);
    if (equippedSlot) {
      setEquipmentSlots(prev => 
        prev.map(s => 
          s.id === equippedSlot.id 
            ? { ...s, equipped: undefined }
            : s
        )
      );
    }

    // Adicionar item ao inventário se não estiver lá
    if (!inventoryItems.find(item => item.id === draggedItem.id)) {
      setInventoryItems(prev => {
        const newItems = [...prev];
        // Se o slot está vazio, colocar o item lá
        if (!newItems[slotIndex]) {
          newItems[slotIndex] = { ...draggedItem, equipped: false };
        } else {
          // Encontrar primeiro slot vazio
          const emptyIndex = newItems.findIndex((item, index) => !item);
          if (emptyIndex !== -1) {
            newItems[emptyIndex] = { ...draggedItem, equipped: false };
          } else {
            newItems.push({ ...draggedItem, equipped: false });
          }
        }
        return newItems;
      });
    }

    setDraggedItem(null);
  }, [draggedItem, equipmentSlots, inventoryItems]);

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
          className="w-10 h-10 bg-white/20 border border-gray-300/50 rounded-lg flex items-center justify-center relative cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDropOnInventory(e, i)}
        >
          {item && (
            <div 
              className="text-lg relative group cursor-grab active:cursor-grabbing select-none"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart(item, e);
              }}
              onDragEnd={handleDragEnd}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {item.icon}
              <div className="absolute -bottom-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] border border-white">
                {item.tier}
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {item.name}
              </div>
            </div>
          )}
        </div>
      );
    }), [inventoryItems, handleDragStart, handleDragEnd, handleDropOnInventory]);

  const EquipmentSlotComponent = ({ slotId, label }: { slotId: string; label: string }) => {
    const slot = equipmentSlots.find(s => s.id === slotId);

    return (
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-600 mb-1 font-medium">{label}</span>
        <div
          className={`w-12 h-12 bg-white/30 border-2 ${
            draggedItem ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300/60'
          } rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/40 transition-colors backdrop-blur-sm shadow-sm`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('border-green-400', 'bg-green-50/50');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-green-400', 'bg-green-50/50');
          }}
          onDrop={(e) => {
            e.currentTarget.classList.remove('border-green-400', 'bg-green-50/50');
            handleDropOnSlot(e, slotId);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (slot?.equipped) handleUnequip(slotId);
          }}
        >
          {slot?.equipped ? (
            <div
              className="text-lg relative group cursor-grab active:cursor-grabbing select-none"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart(slot.equipped, e);
              }}
              onDragEnd={handleDragEnd}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {slot.equipped.icon}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {slot.equipped.name}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-[480px] max-h-[90vh] overflow-hidden relative border border-gray-200"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
      >
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <i className="fa-solid fa-backpack text-2xl text-white"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">Inventário</h2>
                  <p className="text-white/90 font-medium">{npc.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/30"
              >
                <i className="fa-solid fa-times text-white"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto custom-scrollbar">

          {/* Details Section */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-user-gear text-amber-600"></i>
              Equipamentos
            </h3>

            {/* Equipment Slots Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Row 1 */}
              <EquipmentSlotComponent slotId="bag" label="Bolsa" />
              <EquipmentSlotComponent slotId="head" label="Cabeça" />
              <EquipmentSlotComponent slotId="cape" label="Capa" />

              {/* Row 2 */}
              <EquipmentSlotComponent slotId="mainhand" label="Mão Principal" />
              <EquipmentSlotComponent slotId="chest" label="Peito" />
              <EquipmentSlotComponent slotId="offhand" label="Mão Secundária" />

              {/* Row 3 */}
              <EquipmentSlotComponent slotId="potion" label="Poção" />
              <EquipmentSlotComponent slotId="boots" label="Botas" />
              <EquipmentSlotComponent slotId="food" label="Comida" />
            </div>

            {/* Currency and Mount */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full border border-yellow-600"></div>
                    <span className="text-sm font-medium text-gray-700">Ouro</span>
                  </div>
                  <span className="font-bold text-yellow-600">{gold}</span>
                </div>
              </div>

              <div className="bg-white/50 p-3 rounded-lg border border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded-full border border-gray-500"></div>
                    <span className="text-sm font-medium text-gray-700">Prata</span>
                  </div>
                  <span className="font-bold text-gray-600">{silver}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">Montaria</span>
              <EquipmentSlotComponent slotId="mount" label="" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all text-sm">
                <i className="fa-solid fa-layer-group mr-2"></i>
                Organizar
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all text-sm">
                <i className="fa-solid fa-sort mr-2"></i>
                Classificar
              </button>
            </div>

            {/* Weight bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Peso</span>
                <span className="text-sm text-gray-600">0%</span>
              </div>
              <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                <div className="w-1/4 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"></div>
              </div>
            </div>
          </div>

          {/* Inventory Slots */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-boxes-stacked text-gray-600"></i>
                Slots do Inventário (48)
              </h3>
              <div className="text-sm text-gray-600">
                {inventoryItems.length}/48 itens
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2 p-4 bg-white/50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar">
              {inventorySlots}
            </div>
          </div>

          {/* Market Value */}
          <div className="text-center text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-gray-200">
            <i className="fa-solid fa-coins mr-2 text-yellow-500"></i>
            Valor Estimado de Mercado: 0 moedas
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;