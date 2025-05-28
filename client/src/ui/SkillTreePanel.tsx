
import React, { useState } from 'react';
import { NPC, useNpcStore } from '../game/stores/useNpcStore';
import { useDraggable } from '../hooks/useDraggable';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  cost: number;
  requirements: string[];
  category: 'adventurer' | 'crafting' | 'gathering' | 'farming' | 'combat' | 'refining';
  subcategory?: string;
  position: { x: number; y: number };
  connections: string[];
  tier: number;
  unlocks?: string[];
}

interface SkillTreePanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const SkillTreePanel = ({ npc, onClose }: SkillTreePanelProps) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 600, y: window.innerHeight / 2 - 400 }
  });

  if (!npc) return null;

  const getAllSkills = (): SkillNode[] => {
    const skills: SkillNode[] = [];

    // CAMINHO DO AVENTUREIRO
    const adventurerSkills = [
      {
        id: 'novice_adventurer',
        name: 'Aventureiro Novato',
        description: 'Primeiro passo na jornada de aventura',
        maxLevel: 100,
        currentLevel: 1,
        cost: 0,
        requirements: [],
        category: 'adventurer' as const,
        position: { x: 800, y: 100 },
        connections: ['journeyman_adventurer'],
        tier: 1
      },
      {
        id: 'journeyman_adventurer',
        name: 'Aventureiro Oficial',
        description: 'Aventureiro com experiência básica',
        maxLevel: 100,
        currentLevel: 0,
        cost: 50,
        requirements: ['novice_adventurer'],
        category: 'adventurer' as const,
        position: { x: 800, y: 200 },
        connections: ['adept_adventurer'],
        tier: 2
      },
      {
        id: 'adept_adventurer',
        name: 'Aventureiro Adepto',
        description: 'Aventureiro competente',
        maxLevel: 100,
        currentLevel: 0,
        cost: 100,
        requirements: ['journeyman_adventurer'],
        category: 'adventurer' as const,
        position: { x: 800, y: 300 },
        connections: ['expert_adventurer', 'crafting_branch', 'gathering_branch', 'combat_branch'],
        tier: 3
      },
      {
        id: 'expert_adventurer',
        name: 'Aventureiro Expert',
        description: 'Aventureiro experiente',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['adept_adventurer'],
        category: 'adventurer' as const,
        position: { x: 800, y: 400 },
        connections: ['master_adventurer'],
        tier: 4
      },
      {
        id: 'master_adventurer',
        name: 'Aventureiro Mestre',
        description: 'Aventureiro mestre em sua arte',
        maxLevel: 100,
        currentLevel: 0,
        cost: 400,
        requirements: ['expert_adventurer'],
        category: 'adventurer' as const,
        position: { x: 800, y: 500 },
        connections: ['grandmaster_adventurer'],
        tier: 5
      },
      {
        id: 'grandmaster_adventurer',
        name: 'Grão-Mestre Aventureiro',
        description: 'Aventureiro de elite',
        maxLevel: 100,
        currentLevel: 0,
        cost: 800,
        requirements: ['master_adventurer'],
        category: 'adventurer' as const,
        position: { x: 800, y: 600 },
        connections: ['elder_adventurer'],
        tier: 6
      },
      {
        id: 'elder_adventurer',
        name: 'Aventureiro Ancião',
        description: 'O mais alto nível de aventureiro',
        maxLevel: 100,
        currentLevel: 0,
        cost: 1600,
        requirements: ['grandmaster_adventurer'],
        category: 'adventurer' as const,
        position: { x: 800, y: 700 },
        connections: [],
        tier: 7
      }
    ];

    // CRAFTING BRANCH
    const craftingSkills = [
      // Crafting Root
      {
        id: 'crafting_branch',
        name: 'Ramo da Criação',
        description: 'Desbloqueia as habilidades de criação',
        maxLevel: 100,
        currentLevel: 0,
        cost: 100,
        requirements: ['adept_adventurer'],
        category: 'crafting' as const,
        position: { x: 300, y: 300 },
        connections: ['warrior_forge', 'hunter_lodge', 'mage_tower', 'toolmaker', 'alchemist', 'cook'],
        tier: 3
      },

      // WARRIOR'S FORGE
      {
        id: 'warrior_forge',
        name: 'Forja do Guerreiro',
        description: 'Criação de equipamentos de guerreiro',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['crafting_branch'],
        category: 'crafting' as const,
        subcategory: 'warrior_forge',
        position: { x: 100, y: 450 },
        connections: ['plate_armor_crafter', 'sword_crafter', 'axe_crafter', 'mace_crafter', 'hammer_crafter', 'war_gloves_crafter', 'crossbow_crafter', 'shield_crafter'],
        tier: 4
      },

      // Plate Armor
      {
        id: 'plate_armor_crafter',
        name: 'Criador de Armadura de Placa',
        description: 'Especialista em armaduras pesadas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['warrior_forge'],
        category: 'crafting' as const,
        subcategory: 'warrior_forge',
        position: { x: 50, y: 600 },
        connections: ['plate_helmet_specialist', 'plate_armor_specialist', 'plate_boots_specialist'],
        tier: 5
      },
      {
        id: 'plate_helmet_specialist',
        name: 'Especialista em Elmos de Placa',
        description: 'Cria elmos de placa avançados',
        maxLevel: 100,
        currentLevel: 0,
        cost: 300,
        requirements: ['plate_armor_crafter'],
        category: 'crafting' as const,
        subcategory: 'warrior_forge',
        position: { x: 20, y: 750 },
        connections: [],
        tier: 6
      },
      {
        id: 'plate_armor_specialist',
        name: 'Especialista em Armadura de Placa',
        description: 'Cria armaduras de placa avançadas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 300,
        requirements: ['plate_armor_crafter'],
        category: 'crafting' as const,
        subcategory: 'warrior_forge',
        position: { x: 50, y: 750 },
        connections: [],
        tier: 6
      },
      {
        id: 'plate_boots_specialist',
        name: 'Especialista em Botas de Placa',
        description: 'Cria botas de placa avançadas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 300,
        requirements: ['plate_armor_crafter'],
        category: 'crafting' as const,
        subcategory: 'warrior_forge',
        position: { x: 80, y: 750 },
        connections: [],
        tier: 6
      },

      // Weapons
      {
        id: 'sword_crafter',
        name: 'Ferreiro de Espadas',
        description: 'Especialista em espadas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['warrior_forge'],
        category: 'crafting' as const,
        subcategory: 'warrior_forge',
        position: { x: 120, y: 600 },
        connections: ['claymore_specialist', 'dual_swords_specialist'],
        tier: 5
      },
      {
        id: 'axe_crafter',
        name: 'Ferreiro de Machados',
        description: 'Especialista em machados',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['warrior_forge'],
        category: 'crafting' as const,
        subcategory: 'warrior_forge',
        position: { x: 150, y: 600 },
        connections: ['greataxe_specialist', 'halberd_specialist'],
        tier: 5
      },

      // HUNTER'S LODGE
      {
        id: 'hunter_lodge',
        name: 'Cabana do Caçador',
        description: 'Criação de equipamentos de caçador',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['crafting_branch'],
        category: 'crafting' as const,
        subcategory: 'hunter_lodge',
        position: { x: 300, y: 450 },
        connections: ['leather_armor_crafter', 'bow_crafter', 'spear_crafter', 'nature_staff_crafter', 'dagger_crafter', 'quarterstaff_crafter'],
        tier: 4
      },

      // MAGE'S TOWER
      {
        id: 'mage_tower',
        name: 'Torre do Mago',
        description: 'Criação de equipamentos mágicos',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['crafting_branch'],
        category: 'crafting' as const,
        subcategory: 'mage_tower',
        position: { x: 500, y: 450 },
        connections: ['cloth_armor_crafter', 'fire_staff_crafter', 'holy_staff_crafter', 'arcane_staff_crafter', 'frost_staff_crafter', 'cursed_staff_crafter', 'tome_crafter'],
        tier: 4
      },

      // TOOLMAKER
      {
        id: 'toolmaker',
        name: 'Ferramenteiro',
        description: 'Criação de ferramentas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['crafting_branch'],
        category: 'crafting' as const,
        subcategory: 'toolmaker',
        position: { x: 700, y: 450 },
        connections: ['gathering_tools_specialist', 'accessories_specialist'],
        tier: 4
      }
    ];

    // GATHERING BRANCH
    const gatheringSkills = [
      {
        id: 'gathering_branch',
        name: 'Ramo da Coleta',
        description: 'Desbloqueia habilidades de coleta',
        maxLevel: 100,
        currentLevel: Math.max(1, Math.floor((npc.skills?.gathering || 10) / 10)),
        cost: 100,
        requirements: ['adept_adventurer'],
        category: 'gathering' as const,
        position: { x: 1300, y: 300 },
        connections: ['lumberjack', 'quarrier', 'miner', 'harvester', 'skinner', 'fisherman'],
        tier: 3
      },

      // Gathering Professions
      {
        id: 'lumberjack',
        name: 'Lenhador',
        description: 'Especialista em coleta de madeira',
        maxLevel: 100,
        currentLevel: npc.type === 'lumberjack' ? Math.max(1, Math.floor((npc.skills?.gathering || 10) / 5)) : 0,
        cost: 150,
        requirements: ['gathering_branch'],
        category: 'gathering' as const,
        position: { x: 1100, y: 450 },
        connections: ['adept_lumberjack', 'lumberjack_tools', 'wood_specialist'],
        tier: 4
      },
      {
        id: 'miner',
        name: 'Minerador',
        description: 'Especialista em mineração',
        maxLevel: 100,
        currentLevel: npc.type === 'miner' ? Math.max(1, Math.floor((npc.skills?.gathering || 10) / 5)) : 0,
        cost: 150,
        requirements: ['gathering_branch'],
        category: 'gathering' as const,
        position: { x: 1300, y: 450 },
        connections: ['adept_miner', 'miner_tools', 'ore_specialist'],
        tier: 4
      },
      {
        id: 'quarrier',
        name: 'Extrator de Pedra',
        description: 'Especialista em extração de pedra',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['gathering_branch'],
        category: 'gathering' as const,
        position: { x: 1500, y: 450 },
        connections: ['adept_quarrier', 'quarrier_tools', 'stone_specialist'],
        tier: 4
      },
      {
        id: 'harvester',
        name: 'Ceifador',
        description: 'Especialista em coleta de fibras',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['gathering_branch'],
        category: 'gathering' as const,
        position: { x: 1200, y: 600 },
        connections: ['adept_harvester', 'harvester_tools', 'fiber_specialist'],
        tier: 4
      },
      {
        id: 'skinner',
        name: 'Esfolador',
        description: 'Especialista em esfolamento',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['gathering_branch'],
        category: 'gathering' as const,
        position: { x: 1400, y: 600 },
        connections: ['adept_skinner', 'skinner_tools', 'hide_specialist'],
        tier: 4
      },
      {
        id: 'fisherman',
        name: 'Pescador',
        description: 'Especialista em pesca',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['gathering_branch'],
        category: 'gathering' as const,
        position: { x: 1300, y: 750 },
        connections: ['adept_fisherman', 'fishing_gear', 'fish_specialist'],
        tier: 4
      }
    ];

    // FARMING BRANCH
    const farmingSkills = [
      {
        id: 'farming_branch',
        name: 'Ramo da Agricultura',
        description: 'Habilidades de agricultura e criação',
        maxLevel: 100,
        currentLevel: npc.type === 'farmer' ? Math.max(1, Math.floor((npc.skills?.working || 10) / 5)) : 0,
        cost: 100,
        requirements: ['adept_adventurer'],
        category: 'farming' as const,
        position: { x: 800, y: 900 },
        connections: ['crop_farmer', 'herb_grower', 'animal_breeder'],
        tier: 3
      },
      {
        id: 'crop_farmer',
        name: 'Fazendeiro de Grãos',
        description: 'Especialista em cultivo de grãos',
        maxLevel: 100,
        currentLevel: npc.type === 'farmer' ? Math.max(1, Math.floor((npc.skills?.working || 10) / 7)) : 0,
        cost: 150,
        requirements: ['farming_branch'],
        category: 'farming' as const,
        position: { x: 600, y: 1000 },
        connections: ['adept_crop_farmer', 'crop_specialist'],
        tier: 4
      },
      {
        id: 'herb_grower',
        name: 'Cultivador de Ervas',
        description: 'Especialista em cultivo de ervas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['farming_branch'],
        category: 'farming' as const,
        position: { x: 800, y: 1000 },
        connections: ['adept_herb_grower', 'herb_specialist'],
        tier: 4
      },
      {
        id: 'animal_breeder',
        name: 'Criador de Animais',
        description: 'Especialista em criação de animais',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['farming_branch'],
        category: 'farming' as const,
        position: { x: 1000, y: 1000 },
        connections: ['adept_animal_breeder', 'animal_specialist'],
        tier: 4
      }
    ];

    // COMBAT BRANCH
    const combatSkills = [
      {
        id: 'combat_branch',
        name: 'Ramo do Combate',
        description: 'Habilidades de combate',
        maxLevel: 100,
        currentLevel: 0,
        cost: 100,
        requirements: ['adept_adventurer'],
        category: 'combat' as const,
        position: { x: 400, y: 1200 },
        connections: ['warrior_combat', 'hunter_combat', 'mage_combat', 'reaver'],
        tier: 3
      },
      {
        id: 'reaver',
        name: 'Ceifador',
        description: 'Combatente versátil',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['combat_branch'],
        category: 'combat' as const,
        position: { x: 200, y: 1350 },
        connections: ['adept_reaver'],
        tier: 4
      },
      {
        id: 'warrior_combat',
        name: 'Combate de Guerreiro',
        description: 'Especialização em combate corpo a corpo',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['combat_branch'],
        category: 'combat' as const,
        position: { x: 300, y: 1350 },
        connections: ['plate_fighter', 'sword_fighter', 'axe_fighter'],
        tier: 4
      },
      {
        id: 'hunter_combat',
        name: 'Combate de Caçador',
        description: 'Especialização em combate à distância',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['combat_branch'],
        category: 'combat' as const,
        position: { x: 500, y: 1350 },
        connections: ['leather_fighter', 'bow_fighter', 'spear_fighter'],
        tier: 4
      },
      {
        id: 'mage_combat',
        name: 'Combate de Mago',
        description: 'Especialização em combate mágico',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['combat_branch'],
        category: 'combat' as const,
        position: { x: 600, y: 1350 },
        connections: ['cloth_fighter', 'fire_fighter', 'holy_fighter'],
        tier: 4
      }
    ];

    // REFINING BRANCH
    const refiningSkills = [
      {
        id: 'refining_branch',
        name: 'Ramo do Refinamento',
        description: 'Habilidades de refinamento de recursos',
        maxLevel: 100,
        currentLevel: 0,
        cost: 100,
        requirements: ['adept_adventurer'],
        category: 'refining' as const,
        position: { x: 1800, y: 300 },
        connections: ['wood_refiner', 'stone_refiner', 'ore_refiner', 'leather_refiner', 'fiber_refiner'],
        tier: 3
      },
      {
        id: 'wood_refiner',
        name: 'Refinador de Madeira',
        description: 'Especialista em refinar madeira',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['refining_branch'],
        category: 'refining' as const,
        position: { x: 1650, y: 450 },
        connections: ['adept_wood_refiner', 'planks_specialist'],
        tier: 4
      },
      {
        id: 'ore_refiner',
        name: 'Refinador de Minério',
        description: 'Especialista em refinar minérios',
        maxLevel: 100,
        currentLevel: 0,
        cost: 150,
        requirements: ['refining_branch'],
        category: 'refining' as const,
        position: { x: 1950, y: 450 },
        connections: ['adept_ore_refiner', 'metal_bar_specialist'],
        tier: 4
      }
    ];

    return [
      ...adventurerSkills,
      ...craftingSkills,
      ...gatheringSkills,
      ...farmingSkills,
      ...combatSkills,
      ...refiningSkills
    ];
  };

  const allSkills = getAllSkills();
  const filteredSkills = activeCategory === 'all' 
    ? allSkills 
    : allSkills.filter(skill => skill.category === activeCategory);

  const selectedSkill = selectedNode ? allSkills.find(s => s.id === selectedNode) : null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'adventurer': return 'text-gray-400 border-gray-400 bg-gray-900/20';
      case 'crafting': return 'text-yellow-400 border-yellow-400 bg-yellow-900/20';
      case 'gathering': return 'text-green-400 border-green-400 bg-green-900/20';
      case 'farming': return 'text-lime-400 border-lime-400 bg-lime-900/20';
      case 'combat': return 'text-red-400 border-red-400 bg-red-900/20';
      case 'refining': return 'text-purple-400 border-purple-400 bg-purple-900/20';
      default: return 'text-gray-400 border-gray-400 bg-gray-900/20';
    }
  };

  const isSkillUnlocked = (skill: SkillNode) => {
    if (skill.requirements.length === 0) return true;
    return skill.requirements.every(req => {
      const reqSkill = allSkills.find(s => s.id === req);
      return reqSkill && reqSkill.currentLevel > 0;
    });
  };

  const canUpgradeSkill = (skill: SkillNode) => {
    return isSkillUnlocked(skill) && skill.currentLevel < skill.maxLevel;
  };

  const upgradeSkill = (skillId: string) => {
    const skill = allSkills.find(s => s.id === skillId);
    if (!skill || !canUpgradeSkill(skill)) return;

    console.log(`Upgrading skill ${skill.name} for NPC ${npc.id}`);
  };

  const categories = [
    { id: 'all', name: 'Todas', icon: 'fa-globe', color: 'text-white' },
    { id: 'adventurer', name: 'Aventureiro', icon: 'fa-user', color: 'text-gray-400' },
    { id: 'crafting', name: 'Criação', icon: 'fa-hammer', color: 'text-yellow-400' },
    { id: 'gathering', name: 'Coleta', icon: 'fa-tree', color: 'text-green-400' },
    { id: 'farming', name: 'Agricultura', icon: 'fa-wheat-awn', color: 'text-lime-400' },
    { id: 'combat', name: 'Combate', icon: 'fa-sword', color: 'text-red-400' },
    { id: 'refining', name: 'Refinamento', icon: 'fa-cog', color: 'text-purple-400' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gray-900 w-full h-full relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-600 bg-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              npc.type === "miner" ? "bg-orange-100" :
              npc.type === "lumberjack" ? "bg-green-100" :
              npc.type === "farmer" ? "bg-yellow-100" : "bg-blue-100"
            }`}>
              <i className={`fa-solid ${
                npc.type === "miner" ? "fa-helmet-safety" :
                npc.type === "lumberjack" ? "fa-tree" :
                npc.type === "farmer" ? "fa-wheat-awn" : "fa-bread-slice"
              } text-sm ${
                npc.type === "miner" ? "text-orange-600" :
                npc.type === "lumberjack" ? "text-green-600" :
                npc.type === "farmer" ? "text-yellow-600" : "text-blue-600"
              }`}></i>
            </div>
            <h2 className="text-xl font-bold text-white">Tábua de Destinos - Albion Online</h2>
            <span className="text-gray-400">- {npc.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              {viewMode === 'overview' ? 'Visão Detalhada' : 'Visão Geral'}
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-600 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === category.id
                  ? `${category.color} bg-gray-700`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <i className={`fa-solid ${category.icon}`}></i>
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex h-[calc(100%-140px)]">
          {/* Skill Tree Visualization */}
          <div className="flex-1 relative bg-gray-800 overflow-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" style={{ width: '2500px', height: '2000px' }}>
              <svg className="absolute inset-0 w-full h-full">
                {/* Render connections */}
                {filteredSkills.map(skill => 
                  skill.connections.map(connectionId => {
                    const connectedSkill = allSkills.find(s => s.id === connectionId);
                    if (!connectedSkill || (activeCategory !== 'all' && !filteredSkills.find(s => s.id === connectionId))) return null;
                    
                    return (
                      <line
                        key={`${skill.id}-${connectionId}`}
                        x1={skill.position.x}
                        y1={skill.position.y}
                        x2={connectedSkill.position.x}
                        y2={connectedSkill.position.y}
                        stroke={isSkillUnlocked(connectedSkill) ? "#4ade80" : "#374151"}
                        strokeWidth="2"
                        strokeDasharray={isSkillUnlocked(connectedSkill) ? "0" : "5,5"}
                        opacity="0.6"
                      />
                    );
                  })
                )}
              </svg>

              {/* Render skill nodes */}
              {filteredSkills.map(skill => (
                <div
                  key={skill.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                    selectedNode === skill.id ? 'scale-110 z-10' : 'scale-100'
                  }`}
                  style={{
                    left: skill.position.x,
                    top: skill.position.y,
                  }}
                  onClick={() => setSelectedNode(skill.id)}
                >
                  <div className={`w-16 h-16 rounded-full border-3 flex items-center justify-center relative ${
                    isSkillUnlocked(skill) 
                      ? getCategoryColor(skill.category)
                      : 'text-gray-600 border-gray-600 bg-gray-800'
                  } ${
                    skill.currentLevel > 0 
                      ? 'shadow-xl ring-2 ring-white/20' 
                      : ''
                  }`}>
                    <i className={`fa-solid ${
                      skill.category === 'adventurer' ? 'fa-user' :
                      skill.category === 'crafting' ? 'fa-hammer' :
                      skill.category === 'gathering' ? 'fa-tree' :
                      skill.category === 'farming' ? 'fa-wheat-awn' :
                      skill.category === 'combat' ? 'fa-sword' :
                      skill.category === 'refining' ? 'fa-cog' :
                      'fa-star'
                    } text-lg`}></i>
                    
                    {/* Level indicator */}
                    {skill.currentLevel > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg">
                        {skill.currentLevel}
                      </div>
                    )}

                    {/* Tier indicator */}
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white">
                      T{skill.tier}
                    </div>
                  </div>

                  {/* Skill name */}
                  <div className="absolute top-18 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-300 whitespace-nowrap max-w-24 leading-tight">
                    {skill.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Details Panel */}
          <div className="w-80 bg-gray-900 border-l border-gray-600 p-4 overflow-y-auto">
            {selectedSkill ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{selectedSkill.name}</h3>
                    <span className="px-2 py-1 bg-blue-700 rounded text-xs text-white">
                      Tier {selectedSkill.tier}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{selectedSkill.description}</p>
                  {selectedSkill.subcategory && (
                    <div className="text-xs text-gray-400 mb-2">
                      Subcategoria: {selectedSkill.subcategory}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nível:</span>
                    <span className="text-white font-medium">
                      {selectedSkill.currentLevel} / {selectedSkill.maxLevel}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Categoria:</span>
                    <span className={`font-medium capitalize ${getCategoryColor(selectedSkill.category).split(' ')[0]}`}>
                      {selectedSkill.category === 'adventurer' ? 'Aventureiro' :
                       selectedSkill.category === 'crafting' ? 'Criação' :
                       selectedSkill.category === 'gathering' ? 'Coleta' :
                       selectedSkill.category === 'farming' ? 'Agricultura' :
                       selectedSkill.category === 'combat' ? 'Combate' :
                       selectedSkill.category === 'refining' ? 'Refinamento' :
                       'Outro'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Custo:</span>
                    <span className="text-yellow-400 font-medium">{selectedSkill.cost} Fame</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-gray-300">
                      {Math.round((selectedSkill.currentLevel / selectedSkill.maxLevel) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        selectedSkill.category === 'adventurer' ? 'bg-gray-500' :
                        selectedSkill.category === 'crafting' ? 'bg-yellow-500' :
                        selectedSkill.category === 'gathering' ? 'bg-green-500' :
                        selectedSkill.category === 'farming' ? 'bg-lime-500' :
                        selectedSkill.category === 'combat' ? 'bg-red-500' :
                        selectedSkill.category === 'refining' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${(selectedSkill.currentLevel / selectedSkill.maxLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Requirements */}
                {selectedSkill.requirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Requisitos:</h4>
                    <div className="space-y-1">
                      {selectedSkill.requirements.map(reqId => {
                        const reqSkill = allSkills.find(s => s.id === reqId);
                        const isUnlocked = reqSkill && reqSkill.currentLevel > 0;
                        return (
                          <div key={reqId} className={`text-sm ${isUnlocked ? 'text-green-400' : 'text-red-400'}`}>
                            <i className={`fa-solid ${isUnlocked ? 'fa-check' : 'fa-times'} mr-2`}></i>
                            {reqSkill?.name || reqId}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Connected skills */}
                {selectedSkill.connections.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Desbloqueia:</h4>
                    <div className="space-y-1">
                      {selectedSkill.connections.map(connId => {
                        const connSkill = allSkills.find(s => s.id === connId);
                        return (
                          <div key={connId} className="text-sm text-blue-400">
                            <i className="fa-solid fa-arrow-right mr-2"></i>
                            {connSkill?.name || connId}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Unlocks */}
                {selectedSkill.unlocks && selectedSkill.unlocks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Fornece Acesso a:</h4>
                    <div className="space-y-1">
                      {selectedSkill.unlocks.map(unlock => (
                        <div key={unlock} className="text-sm text-purple-400">
                          <i className="fa-solid fa-star mr-2"></i>
                          {unlock}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upgrade button */}
                <button
                  onClick={() => upgradeSkill(selectedSkill.id)}
                  disabled={!canUpgradeSkill(selectedSkill)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    canUpgradeSkill(selectedSkill)
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedSkill.currentLevel >= selectedSkill.maxLevel 
                    ? 'Maximizado' 
                    : `Atualizar para Nível ${selectedSkill.currentLevel + 1}`
                  }
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-8">
                <i className="fa-solid fa-mouse-pointer text-3xl mb-3"></i>
                <p>Clique em uma habilidade para ver os detalhes</p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Total: {filteredSkills.length} habilidades</p>
                  <p>Desbloqueadas: {filteredSkills.filter(s => s.currentLevel > 0).length}</p>
                  <p>Categoria: {activeCategory === 'all' ? 'Todas' : categories.find(c => c.id === activeCategory)?.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreePanel;
