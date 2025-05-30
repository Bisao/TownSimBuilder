import React, { useState, useCallback, useMemo, useEffect } from "react";
import { NPC, useNpcStore } from "../game/stores/useNpcStore";
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
  slot?: string; // Slot específico que o item pode ocupar
}

interface EquipmentSlot {
  id: string;
  name: string;
  type: "weapon" | "tool" | "head" | "chest" | "boots" | "cape" | "bag" | "food" | "potion" | "mount" | "offhand";
  equipped?: InventoryItem;
  acceptedTypes?: string[];
  acceptedSlots?: string[]; // Slots específicos que este slot aceita
}

const InventoryPanel = ({ npc, onClose }: InventoryPanelProps) => {
  const { updateNpc } = useNpcStore();
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 350, y: window.innerHeight / 2 - 350 }
  });



  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    // === ITEMS NÍVEL 1 ===
    // Armas Básicas
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
      requirements: { level: 1, skills: { sword: 1 } }
    },
    { 
      id: "wooden_club", 
      name: "Porrete de Madeira", 
      type: "weapon", 
      tier: 1, 
      icon: "🏏", 
      skill: "club",
      rarity: "common",
      description: "Porrete simples de madeira",
      stats: { damage: 10, speed: 35 },
      slot: "mainhand",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { club: 1 } }
    },
    { 
      id: "wooden_dagger", 
      name: "Adaga de Madeira", 
      type: "weapon", 
      tier: 1, 
      icon: "🗡️", 
      skill: "dagger",
      rarity: "common",
      description: "Adaga leve para ataques rápidos",
      stats: { damage: 6, speed: 65 },
      slot: "mainhand",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { dagger: 1 } }
    },

    // Armaduras Básicas
    { 
      id: "cloth_cap", 
      name: "Capuz de Pano", 
      type: "armor", 
      tier: 1, 
      icon: "🧢", 
      skill: "defense",
      rarity: "common",
      description: "Proteção básica para a cabeça",
      stats: { defense: 5, health: 5 },
      slot: "head",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { defense: 1 } }
    },
    { 
      id: "cloth_tunic", 
      name: "Túnica de Pano", 
      type: "armor", 
      tier: 1, 
      icon: "👔", 
      skill: "defense",
      rarity: "common",
      description: "Roupa básica para proteção",
      stats: { defense: 8, health: 10 },
      slot: "chest",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { defense: 1 } }
    },
    {
      id: "cloth_shoes",
      name: "Sapatos de Pano",
      type: "armor",
      tier: 1,
      icon: "👟",
      skill: "defense",
      rarity: "common",
      description: "Calçado básico e confortável",
      stats: { defense: 3, speed: 5 },
      slot: "boots",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { defense: 1 } }
    },
    { 
      id: "cloth_gloves", 
      name: "Luvas de Pano", 
      type: "armor", 
      tier: 1, 
      icon: "🧤", 
      skill: "defense",
      rarity: "common",
      description: "Proteção básica para as mãos",
      stats: { defense: 2, speed: 3 },
      slot: "offhand",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { defense: 1 } }
    },

    // Ferramentas Básicas
    { 
      id: "wooden_pickaxe", 
      name: "Picareta de Madeira", 
      type: "tool", 
      tier: 1, 
      icon: "⛏️", 
      skill: "mining",
      rarity: "common",
      description: "Ferramenta básica para mineração",
      stats: { speed: 5 },
      slot: "tool",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { mining: 1 } }
    },
    { 
      id: "wooden_axe", 
      name: "Machado de Madeira", 
      type: "tool", 
      tier: 1, 
      icon: "🪓", 
      skill: "lumberjack",
      rarity: "common",
      description: "Ferramenta básica para cortar madeira",
      stats: { speed: 5 },
      slot: "tool",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { lumberjack: 1 } }
    },
    { 
      id: "wooden_hoe", 
      name: "Enxada de Madeira", 
      type: "tool", 
      tier: 1, 
      icon: "🌾", 
      skill: "farming",
      rarity: "common",
      description: "Ferramenta básica para agricultura",
      stats: { speed: 5 },
      slot: "tool",
      durability: { current: 100, max: 100 },
      requirements: { level: 1, skills: { farming: 1 } }
    },

    // Consumíveis Básicos
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
      slot: "potion"
    },
    {
      id: "bread",
      name: "Pão",
      type: "consumable",
      tier: 1,
      icon: "🍞",
      skill: "cooking",
      rarity: "common",
      description: "Comida nutritiva",
      stats: { health: 25 },
      slot: "food"
    },
    {
      id: "apple",
      name: "Maçã",
      type: "consumable",
      tier: 1,
      icon: "🍎",
      skill: "gathering",
      rarity: "common",
      description: "Fruta fresca e saudável",
      stats: { health: 10 },
      slot: "food"
    },
    {
      id: "water_bottle",
      name: "Garrafa de Água",
      type: "consumable",
      tier: 1,
      icon: "💧",
      skill: "survival",
      rarity: "common",
      description: "Hidratação essencial",
      stats: { health: 5 },
      slot: "potion"
    },

    // Recursos Básicos
    {
      id: "basic_wood",
      name: "Madeira Básica",
      type: "resource",
      tier: 1,
      icon: "🪵",
      rarity: "common",
      description: "Material básico para construção"
    },
    {
      id: "basic_stone",
      name: "Pedra Básica",
      type: "resource",
      tier: 1,
      icon: "🪨",
      rarity: "common",
      description: "Material básico para construção"
    },
    {
      id: "basic_fiber",
      name: "Fibra Básica",
      type: "resource",
      tier: 1,
      icon: "🌱",
      rarity: "common",
      description: "Material básico para tecidos"
    },
    {
      id: "basic_ore",
      name: "Minério Básico",
      type: "resource",
      tier: 1,
      icon: "⛰️",
      rarity: "common",
      description: "Minério básico para fundição"
    },

    // === ITEMS DE NÍVEL SUPERIOR ===
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
      stats: { damage: 95, speed: 85 },
      slot: "mainhand",
      durability: { current: 100, max: 100 },
      requirements: { level: 50, skills: { sword: 80 } }
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
      stats: { damage: 100, speed: 60 },
      slot: "mainhand",
      durability: { current: 100, max: 100 },
      requirements: { level: 45, skills: { hammer: 75 } }
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
      stats: { damage: 45, speed: 70 },
      slot: "mainhand",
      durability: { current: 80, max: 100 },
      requirements: { level: 10, skills: { sword: 20 } }
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
      stats: { damage: 50, speed: 55 },
      slot: "mainhand",
      durability: { current: 90, max: 100 },
      requirements: { level: 12, skills: { axe: 25 } }
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
      stats: { damage: 70, speed: 85 },
      slot: "mainhand",
      durability: { current: 95, max: 100 },
      requirements: { level: 30, skills: { sword: 50, magic: 25 } }
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
      stats: { defense: 90, health: 50 },
      slot: "chest",
      durability: { current: 100, max: 100 },
      requirements: { level: 40, skills: { defense: 60 } }
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
      requirements: { level: 8, skills: { defense: 15 } }
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
      requirements: { level: 3, skills: { defense: 5 } }
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
      stats: { health: 100 },
      slot: "potion"
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
      slot: "potion"
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
      stats: { speed: 20 },
      slot: "tool",
      durability: { current: 85, max: 100 },
      requirements: { level: 20, skills: { mining: 40 } }
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

  // Sistema de slots com validação aprimorada
  const [equipmentSlots, setEquipmentSlots] = useState<EquipmentSlot[]>(() => {
    const defaultSlots = [
      { 
        id: "head", 
        name: "Capacete", 
        type: "head" as const,
        acceptedTypes: ["armor"],
        acceptedSlots: ["head"]
      },
      { 
        id: "cape", 
        name: "Capa", 
        type: "cape" as const,
        acceptedTypes: ["armor"],
        acceptedSlots: ["cape"]
      },
      { 
        id: "bag", 
        name: "Bolsa", 
        type: "bag" as const,
        acceptedTypes: ["consumable"],
        acceptedSlots: ["bag"]
      },
      { 
        id: "mainhand", 
        name: "Mão Principal", 
        type: "weapon" as const,
        acceptedTypes: ["weapon", "tool"],
        acceptedSlots: ["mainhand", "tool"]
      },
      { 
        id: "chest", 
        name: "Peitoral", 
        type: "chest" as const,
        acceptedTypes: ["armor"],
        acceptedSlots: ["chest"]
      },
      { 
        id: "offhand", 
        name: "Mão Secundária", 
        type: "offhand" as const,
        acceptedTypes: ["weapon", "armor"],
        acceptedSlots: ["offhand", "shield"]
      },
      { 
        id: "potion", 
        name: "Poção", 
        type: "potion" as const,
        acceptedTypes: ["consumable"],
        acceptedSlots: ["potion"]
      },
      { 
        id: "boots", 
        name: "Botas", 
        type: "boots" as const,
        acceptedTypes: ["armor"],
        acceptedSlots: ["boots"]
      },
      { 
        id: "food", 
        name: "Comida", 
        type: "food" as const,
        acceptedTypes: ["consumable"],
        acceptedSlots: ["food"]
      }
    ];

    // Carregar equipamentos do NPC se existirem
    if (npc.equipment) {
      return defaultSlots.map(slot => ({
        ...slot,
        equipped: npc.equipment[slot.id] || undefined
      }));
    }

    return defaultSlots;
  });

  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("tier");
  const [validationError, setValidationError] = useState<string>("");

  // Sistema de notificações melhorado
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

  // Sincronizar equipamentos quando o NPC muda
  useEffect(() => {
    if (npc.equipment) {
      setEquipmentSlots(prev => 
        prev.map(slot => ({
          ...slot,
          equipped: npc.equipment?.[slot.id] || undefined
        }))
      );
    }
  }, [npc.equipment]);

  // Cache para validações para evitar recálculos desnecessários
  const validationCache = useMemo(() => new Map<string, { valid: boolean; reason?: string }>(), []);

  // Sistema de validação de equipamentos otimizado
  const validateEquipment = useMemo(() => {
    const cache = new Map<string, boolean>();

    return (item: any, targetSlot: string) => {
      if (!item) return false;

      const cacheKey = `${item.id || item.name}-${targetSlot}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }

      let isValid = false;

      // Verificar se é uma arma
      if (item.type === 'weapon') {
        isValid = targetSlot === 'mainHand' || targetSlot === 'offHand';
      }
      // Verificar se é uma armadura
      else if (item.type === 'armor') {
        isValid = item.slot === targetSlot;
      }
      // Para outros itens, permitir apenas no bag
      else {
        isValid = targetSlot === 'bag';
      }

      cache.set(cacheKey, isValid);
      return isValid;
    };
  }, []);

  // Limpar cache quando equipamentos ou npc mudam
  useEffect(() => {
    validationCache.clear();
  }, [equipmentSlots, npc.currentLevel, npc.skills, validationCache]);

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

  // Função para calcular stats totais
  const calculateTotalStats = useCallback(() => {
    let totalStats = { damage: 0, defense: 0, speed: 0, health: 0 };

    equipmentSlots.forEach(slot => {
      if (slot.equipped?.stats) {
        totalStats.damage += slot.equipped.stats.damage || 0;
        totalStats.defense += slot.equipped.stats.defense || 0;
        totalStats.speed += slot.equipped.stats.speed || 0;
        totalStats.health += slot.equipped.stats.health || 0;
      }
    });

    return totalStats;
  }, [equipmentSlots]);

  const filteredItems = useMemo(() => {
    let filtered = inventoryItems;

    if (filter !== "all") {
      filtered = filtered.filter(item => item.type === filter);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "tier") return b.tier - a.tier;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "type") return a.type.localeCompare(b.type);
      if (sortBy === "durability") {
        const aDurability = a.durability ? (a.durability.current / a.durability.max) : 1;
        const bDurability = b.durability ? (b.durability.current / b.durability.max) : 1;
        return bDurability - aDurability;
      }
      return 0;
    });
  }, [inventoryItems, filter, sortBy]);

  const handleDragStart = useCallback((item: InventoryItem, e: React.DragEvent, fromSlot?: string) => {
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setData("application/json", JSON.stringify({ ...item, fromSlot }));
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";
    setValidationError("");
  }, []);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => {
      setDraggedItem(null);
      setValidationError("");
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
      // Silently handle parse errors
    }

    // Fallback para buscar o item
    if (!itemData) {
      itemData = draggedItem || inventoryItems.find(item => item.id === itemId);
    }

    if (!itemData) {
      showNotification("Item não encontrado", 'error');
      return;
    }

    // Validar equipamento
    //const validation = validateEquipment(itemData, slotId);
    //if (!validation.valid) {
    //  showNotification(validation.reason || "Não é possível equipar este item", 'error');
    //  setValidationError(validation.reason || "");
    //  return;
    //}

    const targetSlot = equipmentSlots.find(s => s.id === slotId);
    if (!targetSlot) {
      showNotification("Slot não encontrado", 'error');
      return;
    }

    // Sistema de troca segura de equipamentos
    const currentEquippedItem = targetSlot.equipped;

    // Se o item vem de outro slot, trocar os itens
    if (fromSlot && fromSlot !== slotId) {
      setEquipmentSlots(prev => {
        const newSlots = prev.map(slot => {
          if (slot.id === fromSlot) {
            // Slot de origem recebe o item que estava no slot de destino
            return { ...slot, equipped: currentEquippedItem };
          } else if (slot.id === slotId) {
            // Slot de destino recebe o item arrastado
            return { ...slot, equipped: { ...itemData!, equipped: true } };
          }
          return slot;
        });

        // Salvar equipamentos no NPC
        const equipment = newSlots.reduce((acc, slot) => {
          if (slot.equipped) {
            acc[slot.id] = slot.equipped;
          }
          return acc;
        }, {} as Record<string, InventoryItem>);

        updateNpc(npc.id, { equipment });

        return newSlots;
      });
    } else {
      // Item vem do inventário
      setInventoryItems(prev => {
        let newItems = [...prev];

        // Se há item equipado no slot, adicionar de volta ao inventário
        if (currentEquippedItem) {
          newItems.push({ ...currentEquippedItem, equipped: false });
        }

        // Remover o item que está sendo equipado do inventário
        newItems = newItems.filter(item => item.id !== itemData!.id);

        return newItems;
      });

      // Equipar item no slot
      setEquipmentSlots(prev => {
        const newSlots = prev.map(s => 
          s.id === slotId 
            ? { ...s, equipped: { ...itemData!, equipped: true } }
            : s
        );

        // Salvar equipamentos no NPC
        const equipment = newSlots.reduce((acc, slot) => {
          if (slot.equipped) {
            acc[slot.id] = slot.equipped;
          }
          return acc;
        }, {} as Record<string, InventoryItem>);

        updateNpc(npc.id, { equipment });

        return newSlots;
      });
    }

    setDraggedItem(null);
    showNotification(`✓ ${itemData.name} equipado em ${targetSlot.name}!`, 'success');
  }, [draggedItem, equipmentSlots, inventoryItems, showNotification, updateNpc, npc.id]);

  const handleUnequip = useCallback((slotId: string) => {
    const slot = equipmentSlots.find(s => s.id === slotId);
    if (!slot?.equipped) return;

    const equippedItem = slot.equipped;

    // Verificar se há espaço no inventário
    if (inventoryItems.length >= 60) {
      showNotification("Inventário cheio! Não é possível desequipar o item.", 'error');
      return;
    }

    // Adicionar item de volta ao inventário
    setInventoryItems(prev => [...prev, { ...equippedItem, equipped: false }]);

    // Remover item do slot de equipamento
    setEquipmentSlots(prev => {
      const newSlots = prev.map(s => 
        s.id === slotId ? { ...s, equipped: undefined } : s
      );

      // Salvar equipamentos no NPC
      const equipment = newSlots.reduce((acc, slot) => {
        if (slot.equipped) {
          acc[slot.id] = slot.equipped;
        }
        return acc;
      }, {} as Record<string, InventoryItem>);

      updateNpc(npc.id, { equipment });

      return newSlots;
    });

    showNotification(`✓ ${equippedItem.name} desequipado!`, 'success');
  }, [equipmentSlots, inventoryItems, showNotification, updateNpc, npc.id]);

  // Função para reparar item
  const repairItem = useCallback((itemId: string) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === itemId && item.durability
          ? { ...item, durability: { ...item.durability, current: item.durability.max } }
          : item
      )
    );

    setEquipmentSlots(prev =>
      prev.map(slot =>
        slot.equipped?.id === itemId && slot.equipped.durability
          ? { ...slot, equipped: { ...slot.equipped, durability: { ...slot.equipped.durability, current: slot.equipped.durability.max } } }
          : slot
      )
    );

    showNotification("Item reparado!", 'success');
  }, [showNotification]);

  const ItemComponent = ({ item, index }: { item: InventoryItem; index: number }) => {
    const durabilityPercentage = item.durability ? (item.durability.current / item.durability.max) * 100 : 100;
    const isDamaged = durabilityPercentage < 50;
    const isBroken = durabilityPercentage <= 0;

    return (
      <div
        className={`relative group cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:z-10 ${
          selectedItem?.id === item.id ? 'ring-2 ring-blue-400' : ''
        } ${draggedItem?.id === item.id ? 'opacity-50' : ''} ${isBroken ? 'opacity-50 grayscale' : ''}`}
        draggable={!isBroken}
        onDragStart={(e) => {
          if (!isBroken) {
            handleDragStart(item, e);
          }
        }}
        onDragEnd={handleDragEnd}
        onClick={() => setSelectedItem(item)}
      >
        <div
          className={`w-10 h-10 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded-lg border-2 ${getRarityBorder(item.rarity)} flex items-center justify-center shadow-lg backdrop-blur-sm relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <span className="text-lg relative z-10">{item.icon}</span>

          {/* Indicador de tier */}
          <div className="absolute -bottom-0.5 -right-0.5 text-xs bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-white font-bold">
            {item.tier}
          </div>

          {/* Barra de durabilidade */}
          {item.durability && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/50">
              <div 
                className={`h-full transition-all duration-300 ${
                  durabilityPercentage > 75 ? 'bg-green-500' :
                  durabilityPercentage > 50 ? 'bg-yellow-500' :
                  durabilityPercentage > 25 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${durabilityPercentage}%` }}
              />
            </div>
          )}

          {/* Indicador de item quebrado */}
          {isBroken && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <i className="fa-solid fa-times text-red-500 text-lg"></i>
            </div>
          )}

          {item.rarity === "legendary" && !isBroken && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          )}
        </div>

        {/* Tooltip melhorado */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg shadow-xl border border-gray-700 min-w-max max-w-xs whitespace-normal">
            <div className="font-bold text-center text-xs">{item.name}</div>
            {item.description && (
              <div className="text-gray-300 text-center text-xs break-words">{item.description}</div>
            )}

            {/* Stats */}
            {item.stats && (
              <div className="space-y-1 mb-2">
                {item.stats.damage && <div className="text-red-400">⚔️ Dano: {item.stats.damage}</div>}
                {item.stats.defense && <div className="text-blue-400">🛡️ Defesa: {item.stats.defense}</div>}
                {item.stats.speed && <div className="text-green-400">⚡ Velocidade: {item.stats.speed}</div>}
                {item.stats.health && <div className="text-pink-400">❤️ Vida: {item.stats.health}</div>}
              </div>
            )}

            {/* Durabilidade */}
            {item.durability && (
              <div className="mb-2">
                <div className={`text-center ${isDamaged ? 'text-orange-400' : 'text-gray-300'}`}>
                  🔧 Durabilidade: {item.durability.current}/{item.durability.max}
                </div>
                {isBroken && (
                  <div className="text-red-400 text-center font-bold">QUEBRADO</div>
                )}
              </div>
            )}

            {/* Requisitos */}
            {item.requirements && (
              <div className="mb-2 text-yellow-400">
                <div className="text-center font-semibold">Requisitos:</div>
                {item.requirements.level && <div>Nível: {item.requirements.level}</div>}
                {item.requirements.skills && Object.entries(item.requirements.skills).map(([skill, level]) => (
                  <div key={skill}>{skill}: {level}</div>
                ))}
              </div>
            )}

            <div className={`text-center mt-2 font-semibold ${
              item.rarity === "legendary" ? "text-yellow-400" :
              item.rarity === "epic" ? "text-purple-400" :
              item.rarity === "rare" ? "text-blue-400" : "text-gray-400"
            }`}>
              {item.rarity?.toUpperCase() || "COMUM"}
            </div>

            {/* Botão de reparo para itens danificados */}
            {item.durability && durabilityPercentage < 100 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  repairItem(item.id);
                }}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs pointer-events-auto"
              >
                Reparar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EquipmentSlotComponent = ({ slotId, label }: { slotId: string; label: string }) => {
    const slot = equipmentSlots.find(s => s.id === slotId);

    // Validação apenas quando necessário (quando há item sendo arrastado)
    const validation = useMemo(() => {
      if (!draggedItem || !slot) return null;
      return validateEquipment(draggedItem, slotId);
    }, [draggedItem, slot, slotId, validateEquipment]);

    const canAccept = validation ?? false;
    const hasValidationError = validation === false;

    return (
      <div className="flex flex-col items-center space-y-2">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <div
          data-slot={slotId}
          className={`w-14 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center relative overflow-hidden cursor-pointer ${
            draggedItem 
              ? canAccept 
                ? 'border-green-400 bg-green-50 shadow-lg scale-105 border-solid' 
                : 'border-red-400 bg-red-50 border-solid'
              : slot?.equipped 
                ? 'border-blue-300 bg-blue-50 border-solid'
                : 'border-gray-300 bg-white/30 border-dashed'
          } hover:bg-white/50 ${slot?.equipped ? 'hover:border-red-400 hover:bg-red-50' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedItem) {
              e.dataTransfer.dropEffect = canAccept ? "move" : "none";
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            handleDropOnSlot(e, slotId);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (slot?.equipped) {
              handleUnequip(slotId);
            }
          }}
          title={slot?.equipped ? `Clique para desequipar ${slot.equipped.name}` : `Arraste um item para equipar em ${label}`}
        >
          {slot?.equipped ? (
            <div 
              className="relative group w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={(e) => {
                handleDragStart(slot.equipped!, e, slotId);
              }}
              onDragEnd={handleDragEnd}
            >
              <div className={`text-2xl bg-gradient-to-br ${getRarityColor(slot.equipped.rarity)} rounded-lg p-2 border ${getRarityBorder(slot.equipped.rarity)} w-full h-full flex items-center justify-center transition-all duration-200 hover:scale-105`}>
                {slot.equipped.icon}
              </div>

              {/* Durabilidade do item equipado */}
              {slot.equipped.durability && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/50">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      (slot.equipped.durability.current / slot.equipped.durability.max) > 0.75 ? 'bg-green-500' :
                      (slot.equipped.durability.current / slot.equipped.durability.max) > 0.5 ? 'bg-yellow-500' :
                      (slot.equipped.durability.current / slot.equipped.durability.max) > 0.25 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(slot.equipped.durability.current / slot.equipped.durability.max) * 100}%` }}
                  />
                </div>
              )}

              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {slot.equipped.name} - Arraste para mover ou clique para desequipar
              </div>

              {/* Indicador visual para desequipar */}
              <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <i className="fa-solid fa-times text-white text-xs"></i>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-2xl">+</div>
          )}

          {/* Indicador de aceitação de drop */}
          {draggedItem && canAccept && (
            <div className="absolute inset-0 bg-green-500/20 border-2 border-green-500 rounded-xl animate-pulse"></div>
          )}

          {/* Erro de validação */}
          {hasValidationError && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
              {/*validateEquipment(draggedItem!, slotId).reason*/}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleDropOnInventory = useCallback((e: React.DragEvent, slotIndex: number) => {
    const item = filteredItems[slotIndex];
    if (!item && draggedItem) {
      e.preventDefault();
      e.stopPropagation();

      // Se o item vem de um slot de equipamento, desequipá-lo
      const equippedSlot = equipmentSlots.find(slot => slot.equipped?.id === draggedItem.id);
      if (equippedSlot) {
        handleUnequip(equippedSlot.id);
      }
    }
  }, [filteredItems, draggedItem, equipmentSlots, handleUnequip]);

  const inventorySlots = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => {
      const item = filteredItems[i];
      return (
        <div
          key={i}
          className={`w-10 h-10 bg-white/20 border border-gray-300/50 rounded-lg flex items-center justify-center relative transition-all duration-200 hover:bg-white/40 hover:border-gray-400/70 ${
            draggedItem && !item ? 'border-blue-300 bg-blue-50' : ''
          }`}
          onDragOver={(e) => {
            if (!item) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
            }
          }}
          onDragEnter={(e) => {
            if (!item) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => handleDropOnInventory(e, i)}
        >
          {item && <ItemComponent item={item} index={i} />}
        </div>
      );
    }), [filteredItems, draggedItem, handleDropOnInventory]);

  const totalStats = calculateTotalStats();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl w-[800px] h-[750px] overflow-hidden relative border border-gray-200"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={(e) => {
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
                  <p className="text-white/90 font-medium">{npc.name} - Nível {npc.currentLevel}</p>
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
                  <option value="durability">Por Durabilidade</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {filteredItems.length} / 60 itens
              </div>
            </div>
          </div>

          {/* Stats Totais */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border-2 border-green-200 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-green-600"></i>
              Status do Equipamento
            </h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-red-500 text-xl">⚔️</div>
                <div className="font-bold text-gray-700">{totalStats.damage}</div>
                <div className="text-xs text-gray-500">Dano</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-blue-500 text-xl">🛡️</div>
                <div className="font-bold text-gray-700">{totalStats.defense}</div>
                <div className="text-xs text-gray-500">Defesa</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-green-500 text-xl">⚡</div>
                <div className="font-bold text-gray-700">{totalStats.speed}</div>
                <div className="text-xs text-gray-500">Velocidade</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-pink-500 text-xl">❤️</div>
                <div className="font-bold text-gray-700">{totalStats.health}</div>
                <div className="text-xs text-gray-500">Vida</div>
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
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${getRarityColor(selectedItem.rarity)} rounded-xl border-2 ${getRarityBorder(selectedItem.rarity)} flex items-center justify-center shadow-lg relative`}
                >
                  <span className="text-lg">{selectedItem.icon}</span>
                  {selectedItem.durability && (
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-800/50 rounded-b-xl">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (selectedItem.durability.current / selectedItem.durability.max) > 0.75 ? 'bg-green-500' :
                          (selectedItem.durability.current / selectedItem.durability.max) > 0.5 ? 'bg-yellow-500' :
                          (selectedItem.durability.current / selectedItem.durability.max) > 0.25 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(selectedItem.durability.current / selectedItem.durability.max) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800">{selectedItem.name}</h4>
                  <p className="text-gray-600 mb-2">{selectedItem.description}</p>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="px-2 py-1 bg-gray-200 rounded-lg font-medium">Tier {selectedItem.tier}</span>
                    <span className={`px-2 py-1 rounded-lg font-medium ${
                      selectedItem.rarity === "legendary" ? "bg-yellow-200 text-yellow-800" :
                      selectedItem.rarity === "epic" ? "bg-purple-200 text-purple-800" :
                      selectedItem.rarity === "rare" ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"
                    }`}>
                      {selectedItem.rarity?.toUpperCase() || "COMUM"}
                    </span>
                    {selectedItem.slot && (
                      <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-lg font-medium">
                        {selectedItem.slot}
                      </span>
                    )}
                  </div>

                  {/* Stats detalhados */}
                  {selectedItem.stats && (
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {selectedItem.stats.damage && (
                        <div className="flex items-center gap-1 text-red-600 bg-red-50 rounded px-2 py-1">
                          <i className="fa-solid fa-sword"></i>
                          <span className="font-medium">{selectedItem.stats.damage} Dano</span>
                        </div>
                      )}
                      {selectedItem.stats.defense && (
                        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 rounded px-2 py-1">
                          <i className="fa-solid fa-shield"></i>
                          <span className="font-medium">{selectedItem.stats.defense} Defesa</span>
                        </div>
                      )}
                      {selectedItem.stats.speed && (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 rounded px-2 py-1">
                          <i className="fa-solid fa-bolt"></i>
                          <span className="font-medium">{selectedItem.stats.speed} Velocidade</span>
                        </div>
                      )}
                      {selectedItem.stats.health && (
                        <div className="flex items-center gap-1 text-pink-600 bg-pink-50 rounded px-2 py-1">
                          <i className="fa-solid fa-heart"></i>
                          <span className="font-medium">{selectedItem.stats.health} Vida</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Durabilidade detalhada */}
                  {selectedItem.durability && (
                    <div className="mb-3 bg-gray-50 rounded-lg p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Durabilidade</span>
                        <span className="text-sm text-gray-600">
                          {selectedItem.durability.current}/{selectedItem.durability.max}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (selectedItem.durability.current / selectedItem.durability.max) > 0.75 ? 'bg-green-500' :
                            (selectedItem.durability.current / selectedItem.durability.max) > 0.5 ? 'bg-yellow-500' :
                            (selectedItem.durability.current / selectedItem.durability.max) > 0.25 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(selectedItem.durability.current / selectedItem.durability.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Requisitos */}
                  {selectedItem.requirements && (
                    <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                      <div className="text-sm font-medium text-yellow-800 mb-1">Requisitos:</div>
                      {selectedItem.requirements.level && (
                        <div className={`text-sm ${npc.currentLevel >= selectedItem.requirements.level ? 'text-green-600' : 'text-red-600'}`}>
                          Nível: {selectedItem.requirements.level} {npc.currentLevel >= selectedItem.requirements.level ? '✓' : '✗'}
                        </div>
                      )}
                      {selectedItem.requirements.skills && Object.entries(selectedItem.requirements.skills).map(([skill, level]) => {
                        const npcSkillLevel = npc.skills[skill as keyof typeof npc.skills] || 0;
                        return (
                          <div key={skill} className={`text-sm ${npcSkillLevel >= level ? 'text-green-600' : 'text-red-600'}`}>
                            {skill}: {level} {npcSkillLevel >= level ? '✓' : '✗'}
                          </div>
                        );
                      })}
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