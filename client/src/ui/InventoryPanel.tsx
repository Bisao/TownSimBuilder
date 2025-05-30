import React, { useState, useCallback, useMemo, useEffect } from "react";
import { NPC, NPCEquipment, useNpcStore } from "../game/stores/useNpcStore";
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
    health?: number;
  };
  durability?: {
    current: number;
    max: number;
  };
  requirements?: {
    level?: number;
    skills?: Record<string, number>;
  };
  slot?: string;
  weight?: number;
  value?: number;
}

interface EquipmentSlot {
  id: string;
  name: string;
  type: "weapon" | "tool" | "head" | "chest" | "boots" | "cape" | "bag" | "food" | "potion" | "mount" | "offhand" | "pants" | "gloves" | "shoes";
  equipped?: InventoryItem;
  acceptedTypes?: string[];
  acceptedSlots?: string[];
  position: { x: number; y: number };
}

const InventoryPanel = ({ npc, onClose }: InventoryPanelProps) => {
  const { updateNpc } = useNpcStore();
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 400 }
  });

  // Sincronizar equipamentos quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Garantir que equipamentos estejam salvos no NPC ao fechar
      const finalEquipment: Record<string, NPCEquipment> = {};
      equipmentSlots.forEach(slot => {
        if (slot.equipped) {
          finalEquipment[slot.id] = {
            id: slot.equipped.id,
            name: slot.equipped.name,
            type: slot.equipped.type,
            tier: slot.equipped.tier,
            icon: slot.equipped.icon,
            skill: slot.equipped.skill,
            equipped: true,
            rarity: slot.equipped.rarity,
            description: slot.equipped.description,
            stats: slot.equipped.stats,
            durability: slot.equipped.durability,
            requirements: slot.equipped.requirements,
            slot: slot.equipped.slot
          };
        }
      });
      updateNpc(npc.id, { equipment: finalEquipment });
    };
  }, [equipmentSlots, updateNpc, npc.id]);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    { 
      id: "wooden_sword", 
      name: "Espada de Madeira", 
      type: "weapon", 
      tier: 1, 
      icon: "🗡️", 
      skill: "sword",
      rarity: "common",
      description: "Espada básica de madeira para treino",
      stats: { damage: 8, speed: 45 },
      slot: "mainhand",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { sword: 1 } },
      weight: 2,
      value: 15
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
      stats: { defense: 35, health: 20 },
      slot: "head",
      durability: { current: 75, max: 100 },
      requirements: { level: 8, skills: { defense: 15 } },
      weight: 3,
      value: 45
    },
    {
      id: "leather_boots",
      name: "Botas de Couro",
      type: "armor",
      tier: 2,
      icon: "👢",
      skill: "defense",
      rarity: "common",
      description: "Botas resistentes de couro",
      stats: { defense: 15, speed: 10 },
      slot: "boots",
      durability: { current: 60, max: 100 },
      requirements: { level: 3, skills: { defense: 5 } },
      weight: 1,
      value: 25
    },
    { 
      id: "small_health_potion",
      name: "Poção Pequena de Vida",
      type: "consumable",
      tier: 1,
      icon: "🧪",
      skill: "alchemy",
      rarity: "common",
      description: "Restaura pouca vida",
      stats: { health: 15 },
      slot: "potion",
      weight: 0.5,
      value: 10
    },
    ...(npc.inventory.amount > 0 ? [{
      id: `resource_${npc.inventory.type}`,
      name: npc.inventory.type,
      type: "resource" as const,
      tier: 1,
      icon: npc.inventory.type === "wood" ? "🪵" : npc.inventory.type === "stone" ? "🪨" : "🌾",
      rarity: "common" as const,
      description: `${npc.inventory.amount}x ${npc.inventory.type}`,
      weight: 0.1,
      value: 2
    }] : [])
  ]);

  const [equipmentSlots, setEquipmentSlots] = useState<EquipmentSlot[]>(() => {
    const defaultSlots = [
      { id: "head", name: "Capacete", type: "head" as const, position: { x: 1, y: 0 } },
      { id: "cape", name: "Capa", type: "cape" as const, position: { x: 2, y: 0 } },
      { id: "bag", name: "Bolsa", type: "bag" as const, position: { x: 0, y: 0 } },
      { id: "mainhand", name: "Mão Principal", type: "weapon" as const, position: { x: 0, y: 1 } },
      { id: "chest", name: "Peitoral", type: "chest" as const, position: { x: 1, y: 1 } },
      { id: "offhand", name: "Mão Secundária", type: "offhand" as const, position: { x: 2, y: 1 } },
      { id: "gloves", name: "Luvas", type: "gloves" as const, position: { x: 0, y: 2 } },
      { id: "pants", name: "Calças", type: "pants" as const, position: { x: 1, y: 2 } },
      { id: "shoes", name: "Sapatos", type: "shoes" as const, position: { x: 2, y: 2 } },
      { id: "potion", name: "Poção", type: "potion" as const, position: { x: 0, y: 3 } },
      { id: "boots", name: "Botas", type: "boots" as const, position: { x: 1, y: 3 } },
      { id: "food", name: "Comida", type: "food" as const, position: { x: 2, y: 3 } }
    ];

    if (npc.equipment) {
      return defaultSlots.map(slot => ({
        ...slot,
        equipped: npc.equipment[slot.id] || undefined
      }));
    }

    return defaultSlots;
  });

  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-[10000] animate-bounce`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }, []);

  const calculateTotalWeight = useCallback(() => {
    let totalWeight = 0;
    inventoryItems.forEach(item => {
      totalWeight += (item.weight || 0);
    });
    equipmentSlots.forEach(slot => {
      if (slot.equipped?.weight) {
        totalWeight += slot.equipped.weight;
      }
    });
    return totalWeight;
  }, [inventoryItems, equipmentSlots]);

  const calculateTotalValue = useCallback(() => {
    let totalValue = 0;
    inventoryItems.forEach(item => {
      totalValue += (item.value || 0);
    });
    equipmentSlots.forEach(slot => {
      if (slot.equipped?.value) {
        totalValue += slot.equipped.value;
      }
    });
    return totalValue;
  }, [inventoryItems, equipmentSlots]);

  const handleDragStart = useCallback((item: InventoryItem, e: React.DragEvent, fromSlot?: string) => {
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setData("application/json", JSON.stringify({ ...item, fromSlot }));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => {
      setDraggedItem(null);
    }, 50);
  }, []);

  const handleDropOnSlot = useCallback((e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const itemId = e.dataTransfer.getData("text/plain");
    let itemData: InventoryItem | null = null;
    let fromSlot: string | null = null;

    try {
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        const parsedData = JSON.parse(jsonData);
        itemData = parsedData;
        fromSlot = parsedData.fromSlot;
      }
    } catch (error) {
      // Handle parse errors
    }

    if (!itemData) {
      itemData = draggedItem || inventoryItems.find(item => item.id === itemId);
    }

    if (!itemData) {
      showNotification("Item não encontrado", 'error');
      return;
    }

    const targetSlot = equipmentSlots.find(s => s.id === slotId);
    if (!targetSlot) {
      showNotification("Slot não encontrado", 'error');
      return;
    }

    const currentEquippedItem = targetSlot.equipped;

    if (fromSlot && fromSlot !== slotId) {
      setEquipmentSlots(prev => {
        const newSlots = prev.map(slot => {
          if (slot.id === fromSlot) {
            return { ...slot, equipped: currentEquippedItem };
          } else if (slot.id === slotId) {
            return { ...slot, equipped: { ...itemData!, equipped: true } };
          }
          return slot;
        });
        
        // Sincronizar com o NPC store
        const newEquipment: Record<string, NPCEquipment> = {};
        newSlots.forEach(slot => {
          if (slot.equipped) {
            newEquipment[slot.id] = {
              id: slot.equipped.id,
              name: slot.equipped.name,
              type: slot.equipped.type,
              tier: slot.equipped.tier,
              icon: slot.equipped.icon,
              skill: slot.equipped.skill,
              equipped: true,
              rarity: slot.equipped.rarity,
              description: slot.equipped.description,
              stats: slot.equipped.stats,
              durability: slot.equipped.durability,
              requirements: slot.equipped.requirements,
              slot: slot.equipped.slot
            };
          }
        });
        updateNpc(npc.id, { equipment: newEquipment });
        
        return newSlots;
      });
    } else {
      setInventoryItems(prev => {
        let newItems = [...prev];
        if (currentEquippedItem) {
          newItems.push({ ...currentEquippedItem, equipped: false });
        }
        newItems = newItems.filter(item => item.id !== itemData!.id);
        return newItems;
      });

      setEquipmentSlots(prev => {
        const newSlots = prev.map(s => 
          s.id === slotId 
            ? { ...s, equipped: { ...itemData!, equipped: true } }
            : s
        );
        
        // Sincronizar com o NPC store
        const newEquipment: Record<string, NPCEquipment> = {};
        newSlots.forEach(slot => {
          if (slot.equipped) {
            newEquipment[slot.id] = {
              id: slot.equipped.id,
              name: slot.equipped.name,
              type: slot.equipped.type,
              tier: slot.equipped.tier,
              icon: slot.equipped.icon,
              skill: slot.equipped.skill,
              equipped: true,
              rarity: slot.equipped.rarity,
              description: slot.equipped.description,
              stats: slot.equipped.stats,
              durability: slot.equipped.durability,
              requirements: slot.equipped.requirements,
              slot: slot.equipped.slot
            };
          }
        });
        updateNpc(npc.id, { equipment: newEquipment });
        
        return newSlots;
      });
    }

    setDraggedItem(null);
    showNotification(`✓ ${itemData.name} equipado!`, 'success');
  }, [draggedItem, equipmentSlots, inventoryItems, showNotification, updateNpc, npc.id]);

  const handleUnequip = useCallback((slotId: string) => {
    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot?.equipped) return;

    const equippedItem = slot.equipped;

    setInventoryItems(prev => [...prev, { ...equippedItem, equipped: false }]);
    setEquipmentSlots(prev => {
      const newSlots = prev.map(s => 
        s.id === slotId ? { ...s, equipped: undefined } : s
      );
      
      // Sincronizar com o NPC store
      const newEquipment: Record<string, NPCEquipment> = {};
      newSlots.forEach(slot => {
        if (slot.equipped) {
          newEquipment[slot.id] = {
            id: slot.equipped.id,
            name: slot.equipped.name,
            type: slot.equipped.type,
            tier: slot.equipped.tier,
            icon: slot.equipped.icon,
            skill: slot.equipped.skill,
            equipped: true,
            rarity: slot.equipped.rarity,
            description: slot.equipped.description,
            stats: slot.equipped.stats,
            durability: slot.equipped.durability,
            requirements: slot.equipped.requirements,
            slot: slot.equipped.slot
          };
        }
      });
      updateNpc(npc.id, { equipment: newEquipment });
      
      return newSlots;
    });

    showNotification(`✓ ${equippedItem.name} desequipado!`, 'success');
  }, [equipmentSlots, showNotification, updateNpc, npc.id]);

  const totalWeight = calculateTotalWeight();
  const maxWeight = 100;
  const weightPercentage = (totalWeight / maxWeight) * 100;
  const totalValue = calculateTotalValue();

  const inventorySlots = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => {
      const item = inventoryItems[i];
      return (
        <div
          key={i}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100/60 border border-amber-300/50 rounded-lg flex items-center justify-center relative hover:bg-amber-200/60 transition-colors"
          onDragOver={(e) => {
            if (!item) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
            }
          }}
          onDrop={(e) => {
            if (!item && draggedItem) {
              e.preventDefault();
              e.stopPropagation();
              const equippedSlot = equipmentSlots.find(slot => slot.equipped?.id === draggedItem.id);
              if (equippedSlot) {
                handleUnequip(equippedSlot.id);
              }
            }
          }}
        >
          {item && (
            <div
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing relative group"
              draggable
              onDragStart={(e) => handleDragStart(item, e)}
              onDragEnd={handleDragEnd}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {item.name}
              </div>
            </div>
          )}
        </div>
      );
    }), [inventoryItems, draggedItem, equipmentSlots, handleDragStart, handleDragEnd, handleUnequip]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-gradient-to-b from-amber-200 via-amber-100 to-amber-50 rounded-2xl shadow-2xl overflow-hidden relative border-2 border-amber-300
                   w-[95vw] max-w-[400px] h-[85vh] max-h-[700px] min-w-[320px] min-h-[500px]
                   sm:w-[400px] sm:h-[700px]"
        style={{
          position: 'absolute',
          left: `${Math.max(10, Math.min(position.x, window.innerWidth - 400))}px`,
          top: `${Math.max(10, Math.min(position.y, window.innerHeight - 700))}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          const isInteractiveElement = target.closest('[draggable="true"]') || 
                                    target.closest('[data-slot]') || 
                                    target.closest('button');
          if (!isInteractiveElement) {
            handleMouseDown(e);
          }
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-2 sm:p-4 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <i className="fa-solid fa-user text-sm sm:text-xl"></i>
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-bold">{npc.name}'s</h2>
                <p className="text-xs sm:text-sm text-amber-100">Inventory</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-times text-white text-xs sm:text-sm"></i>
            </button>
          </div>
        </div>

        {/* Equipment Section - Fixed */}
        <div className="p-2 sm:p-4 pb-0">
          {/* Equipment Grid */}
          <div className="mb-2 sm:mb-4">
            <div className="flex justify-between items-start gap-1 sm:gap-0">
              {/* Left Side - Resources */}
              <div className="flex flex-col gap-1 sm:gap-2 w-12 sm:w-16">
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <span className="text-yellow-600">💰</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <span className="text-blue-600">💎</span>
                  <span className="font-medium">17</span>
                </div>
              </div>

              {/* Center - Equipment Slots */}
              <div className="flex-1 px-1 sm:px-4">
                <div className="relative">
                  {/* Character Silhouette Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <i className="fa-solid fa-user text-4xl sm:text-8xl text-gray-500"></i>
                  </div>

                  {/* Equipment Grid 3x4 */}
                  <div className="relative z-10 grid grid-cols-3 gap-1 sm:gap-2">
                    {equipmentSlots.map((slot) => (
                      <div
                        key={slot.id}
                        data-slot={slot.id}
                        className={`w-10 h-10 sm:w-14 sm:h-14 bg-amber-100/60 border-2 border-amber-300/50 rounded-lg flex items-center justify-center relative cursor-pointer transition-all hover:bg-amber-200/60 ${
                          draggedItem ? 'hover:border-green-400 hover:bg-green-50' : ''
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedItem) {
                            e.dataTransfer.dropEffect = "move";
                          }
                        }}
                        onDrop={(e) => handleDropOnSlot(e, slot.id)}
                        onClick={() => {
                          if (slot.equipped) {
                            handleUnequip(slot.id);
                          }
                        }}
                        title={slot.equipped ? `${slot.equipped.name} - Clique para desequipar` : `${slot.name}`}
                      >
                        {slot.equipped ? (
                          <div 
                            className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing group"
                            draggable
                            onDragStart={(e) => handleDragStart(slot.equipped!, e, slot.id)}
                            onDragEnd={handleDragEnd}
                          >
                            <span className="text-sm sm:text-xl">{slot.equipped.icon}</span>
                            <div className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <i className="fa-solid fa-times text-white text-[8px] sm:text-xs"></i>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm sm:text-lg">+</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Buttons */}
              <div className="flex flex-col gap-1 sm:gap-2 w-16 sm:w-20">
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-1 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1">
                  <i className="fa-solid fa-list text-xs sm:text-sm"></i>
                  <span className="hidden sm:inline">Loadouts</span>
                </button>
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-1 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1">
                  <i className="fa-solid fa-shirt text-xs sm:text-sm"></i>
                  <span className="hidden sm:inline">Wardrobe</span>
                </button>
              </div>
            </div>
          </div>

          {/* Weight Bar */}
          <div className="mb-2 sm:mb-4">
            <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
              <span className="text-gray-600">Weight</span>
              <span className="text-gray-800">{totalWeight.toFixed(1)}/{maxWeight}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1.5 sm:h-2">
              <div 
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  weightPercentage > 90 ? 'bg-red-500' :
                  weightPercentage > 75 ? 'bg-orange-500' :
                  weightPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(weightPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Inventory Section */}
        <div className="flex-1 px-2 sm:px-4 pb-2 sm:pb-4 overflow-hidden">
          <div className="h-full flex">
            {/* Inventory Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 p-1 sm:p-2 bg-amber-50/50 rounded-lg border border-amber-200">
                {inventorySlots}
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="flex flex-col justify-center ml-2">
              <div className="w-2 h-20 bg-gray-300 rounded-full relative">
                <div className="w-2 h-8 bg-gray-600 rounded-full absolute top-0"></div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-amber-200">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-cog text-white text-[10px] sm:text-xs"></i>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user text-white text-[10px] sm:text-xs"></i>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-coins text-white text-[10px] sm:text-xs"></i>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-white text-[10px] sm:text-xs"></i>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] sm:text-xs text-gray-500">Est. Market Value</div>
              <div className="font-bold text-gray-800 text-xs sm:text-sm">{totalValue}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;