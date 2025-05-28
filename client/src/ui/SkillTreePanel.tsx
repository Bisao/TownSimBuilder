
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
  category: 'warrior' | 'mage' | 'hunter' | 'gathering' | 'crafting' | 'farming' | 'cooking' | 'utility';
  position: { x: number; y: number };
  connections: string[];
  tier?: number;
}

interface SkillTreePanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const SkillTreePanel = ({ npc, onClose }: SkillTreePanelProps) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 500, y: window.innerHeight / 2 - 400 }
  });

  if (!npc) return null;

  // Complete Albion Online skill tree system
  const getAllSkills = (): SkillNode[] => {
    return [
      // CORE SKILLS (Center)
      {
        id: 'core',
        name: 'Núcleo',
        description: 'Habilidades básicas para todos os NPCs',
        maxLevel: 100,
        currentLevel: Math.max(1, Math.floor((npc.skills?.efficiency || 10) / 10)),
        cost: 0,
        requirements: [],
        category: 'utility',
        position: { x: 400, y: 400 },
        connections: ['warrior_path', 'mage_path', 'hunter_path', 'gathering_path', 'crafting_path'],
        tier: 1
      },

      // WARRIOR PATH (Red - Top Left)
      {
        id: 'warrior_path',
        name: 'Caminho do Guerreiro',
        description: 'Desbloqueia habilidades de combate corpo a corpo',
        maxLevel: 100,
        currentLevel: 1,
        cost: 100,
        requirements: ['core'],
        category: 'warrior',
        position: { x: 200, y: 200 },
        connections: ['sword_mastery', 'axe_mastery', 'mace_mastery', 'spear_mastery', 'heavy_armor'],
        tier: 2
      },
      {
        id: 'sword_mastery',
        name: 'Domínio de Espada',
        description: 'Especialização em espadas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['warrior_path'],
        category: 'warrior',
        position: { x: 100, y: 100 },
        connections: ['broadsword', 'claymore', 'dual_swords'],
        tier: 3
      },
      {
        id: 'broadsword',
        name: 'Espada Larga',
        description: 'Espada básica de uma mão',
        maxLevel: 100,
        currentLevel: 0,
        cost: 300,
        requirements: ['sword_mastery'],
        category: 'warrior',
        position: { x: 50, y: 50 },
        connections: ['kingmaker'],
        tier: 4
      },
      {
        id: 'claymore',
        name: 'Montante',
        description: 'Espada pesada de duas mãos',
        maxLevel: 100,
        currentLevel: 0,
        cost: 300,
        requirements: ['sword_mastery'],
        category: 'warrior',
        position: { x: 100, y: 30 },
        connections: ['galatine'],
        tier: 4
      },
      {
        id: 'dual_swords',
        name: 'Espadas Duplas',
        description: 'Duas espadas para combate ágil',
        maxLevel: 100,
        currentLevel: 0,
        cost: 300,
        requirements: ['sword_mastery'],
        category: 'warrior',
        position: { x: 150, y: 50 },
        connections: ['bridled_fury'],
        tier: 4
      },
      {
        id: 'axe_mastery',
        name: 'Domínio de Machado',
        description: 'Especialização em machados',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['warrior_path'],
        category: 'warrior',
        position: { x: 150, y: 120 },
        connections: ['battle_axe', 'great_axe', 'halberd'],
        tier: 3
      },
      {
        id: 'mace_mastery',
        name: 'Domínio de Maça',
        description: 'Especialização em maças',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['warrior_path'],
        category: 'warrior',
        position: { x: 200, y: 120 },
        connections: ['mace', 'morning_star', 'polehammer'],
        tier: 3
      },
      {
        id: 'spear_mastery',
        name: 'Domínio de Lança',
        description: 'Especialização em lanças',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['warrior_path'],
        category: 'warrior',
        position: { x: 250, y: 120 },
        connections: ['spear', 'pike', 'glaive'],
        tier: 3
      },

      // MAGE PATH (Blue - Top)
      {
        id: 'mage_path',
        name: 'Caminho do Mago',
        description: 'Desbloqueia habilidades mágicas',
        maxLevel: 100,
        currentLevel: 1,
        cost: 100,
        requirements: ['core'],
        category: 'mage',
        position: { x: 400, y: 200 },
        connections: ['fire_staff', 'frost_staff', 'arcane_staff', 'holy_staff', 'nature_staff'],
        tier: 2
      },
      {
        id: 'fire_staff',
        name: 'Cajado de Fogo',
        description: 'Magia de fogo destrutiva',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['mage_path'],
        category: 'mage',
        position: { x: 300, y: 100 },
        connections: ['great_fire_staff', 'infernal_staff', 'blazing_staff'],
        tier: 3
      },
      {
        id: 'frost_staff',
        name: 'Cajado de Gelo',
        description: 'Magia de gelo e controle',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['mage_path'],
        category: 'mage',
        position: { x: 350, y: 80 },
        connections: ['great_frost_staff', 'glacial_staff', 'hoarfrost_staff'],
        tier: 3
      },
      {
        id: 'arcane_staff',
        name: 'Cajado Arcano',
        description: 'Magia arcana pura',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['mage_path'],
        category: 'mage',
        position: { x: 400, y: 80 },
        connections: ['great_arcane_staff', 'enigmatic_staff', 'occult_staff'],
        tier: 3
      },
      {
        id: 'holy_staff',
        name: 'Cajado Sagrado',
        description: 'Magia de cura e proteção',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['mage_path'],
        category: 'mage',
        position: { x: 450, y: 80 },
        connections: ['great_holy_staff', 'divine_staff', 'redemption_staff'],
        tier: 3
      },
      {
        id: 'nature_staff',
        name: 'Cajado da Natureza',
        description: 'Magia da natureza e cura',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['mage_path'],
        category: 'mage',
        position: { x: 500, y: 100 },
        connections: ['great_nature_staff', 'wild_staff', 'druidic_staff'],
        tier: 3
      },

      // HUNTER PATH (Green - Top Right)
      {
        id: 'hunter_path',
        name: 'Caminho do Caçador',
        description: 'Desbloqueia habilidades de combate à distância',
        maxLevel: 100,
        currentLevel: 1,
        cost: 100,
        requirements: ['core'],
        category: 'hunter',
        position: { x: 600, y: 200 },
        connections: ['bow_mastery', 'crossbow_mastery', 'throwing_mastery'],
        tier: 2
      },
      {
        id: 'bow_mastery',
        name: 'Domínio de Arco',
        description: 'Especialização em arcos',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['hunter_path'],
        category: 'hunter',
        position: { x: 550, y: 120 },
        connections: ['bow', 'warbow', 'longbow'],
        tier: 3
      },
      {
        id: 'crossbow_mastery',
        name: 'Domínio de Besta',
        description: 'Especialização em bestas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['hunter_path'],
        category: 'hunter',
        position: { x: 600, y: 120 },
        connections: ['light_crossbow', 'heavy_crossbow', 'siegebow'],
        tier: 3
      },
      {
        id: 'throwing_mastery',
        name: 'Domínio de Arremesso',
        description: 'Especialização em armas de arremesso',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['hunter_path'],
        category: 'hunter',
        position: { x: 650, y: 120 },
        connections: ['dagger_pair', 'claws', 'quarterstaff'],
        tier: 3
      },

      // GATHERING PATH (Orange - Left)
      {
        id: 'gathering_path',
        name: 'Caminho da Coleta',
        description: 'Desbloqueia habilidades de coleta de recursos',
        maxLevel: 100,
        currentLevel: Math.max(1, Math.floor((npc.skills?.gathering || 10) / 10)),
        cost: 100,
        requirements: ['core'],
        category: 'gathering',
        position: { x: 200, y: 400 },
        connections: ['mining', 'lumberjacking', 'skinning', 'quarrying', 'fiber_gathering'],
        tier: 2
      },
      {
        id: 'mining',
        name: 'Mineração',
        description: 'Coleta de minérios e metais',
        maxLevel: 100,
        currentLevel: npc.type === 'miner' ? Math.max(1, Math.floor((npc.skills?.gathering || 10) / 5)) : 0,
        cost: 200,
        requirements: ['gathering_path'],
        category: 'gathering',
        position: { x: 100, y: 350 },
        connections: ['copper_mining', 'iron_mining', 'precious_mining'],
        tier: 3
      },
      {
        id: 'lumberjacking',
        name: 'Lenhador',
        description: 'Coleta de madeira',
        maxLevel: 100,
        currentLevel: npc.type === 'lumberjack' ? Math.max(1, Math.floor((npc.skills?.gathering || 10) / 5)) : 0,
        cost: 200,
        requirements: ['gathering_path'],
        category: 'gathering',
        position: { x: 150, y: 350 },
        connections: ['normal_wood', 'hardwood', 'exotic_wood'],
        tier: 3
      },
      {
        id: 'skinning',
        name: 'Esfolamento',
        description: 'Coleta de couro de animais',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['gathering_path'],
        category: 'gathering',
        position: { x: 200, y: 350 },
        connections: ['hide_skinning', 'leather_skinning', 'scale_skinning'],
        tier: 3
      },
      {
        id: 'quarrying',
        name: 'Pedreira',
        description: 'Coleta de pedra',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['gathering_path'],
        category: 'gathering',
        position: { x: 250, y: 350 },
        connections: ['sandstone', 'limestone', 'marble'],
        tier: 3
      },
      {
        id: 'fiber_gathering',
        name: 'Coleta de Fibras',
        description: 'Coleta de fibras têxteis',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['gathering_path'],
        category: 'gathering',
        position: { x: 100, y: 400 },
        connections: ['cotton', 'flax', 'hemp'],
        tier: 3
      },

      // CRAFTING PATH (Yellow - Right)
      {
        id: 'crafting_path',
        name: 'Caminho da Criação',
        description: 'Desbloqueia habilidades de criação',
        maxLevel: 100,
        currentLevel: Math.max(1, Math.floor((npc.skills?.working || 10) / 10)),
        cost: 100,
        requirements: ['core'],
        category: 'crafting',
        position: { x: 600, y: 400 },
        connections: ['weaponsmith', 'armorsmith', 'toolmaker', 'scholar', 'tanner'],
        tier: 2
      },
      {
        id: 'weaponsmith',
        name: 'Armeiro',
        description: 'Criação de armas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['crafting_path'],
        category: 'crafting',
        position: { x: 550, y: 350 },
        connections: ['melee_weapons', 'ranged_weapons', 'magic_weapons'],
        tier: 3
      },
      {
        id: 'armorsmith',
        name: 'Armadureiro',
        description: 'Criação de armaduras',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['crafting_path'],
        category: 'crafting',
        position: { x: 600, y: 350 },
        connections: ['cloth_armor', 'leather_armor', 'plate_armor'],
        tier: 3
      },
      {
        id: 'toolmaker',
        name: 'Fabricante de Ferramentas',
        description: 'Criação de ferramentas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['crafting_path'],
        category: 'crafting',
        position: { x: 650, y: 350 },
        connections: ['gathering_tools', 'building_tools', 'special_tools'],
        tier: 3
      },
      {
        id: 'scholar',
        name: 'Erudito',
        description: 'Criação de itens mágicos',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['crafting_path'],
        category: 'crafting',
        position: { x: 700, y: 350 },
        connections: ['tomes', 'orbs', 'totems'],
        tier: 3
      },
      {
        id: 'tanner',
        name: 'Curtidor',
        description: 'Processamento de couro',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['crafting_path'],
        category: 'crafting',
        position: { x: 550, y: 400 },
        connections: ['basic_leather', 'hardened_leather', 'reinforced_leather'],
        tier: 3
      },

      // FARMING PATH (Green - Bottom)
      {
        id: 'farming_path',
        name: 'Caminho da Agricultura',
        description: 'Desbloqueia habilidades de agricultura',
        maxLevel: 100,
        currentLevel: npc.type === 'farmer' ? Math.max(1, Math.floor((npc.skills?.working || 10) / 5)) : 0,
        cost: 100,
        requirements: ['core'],
        category: 'farming',
        position: { x: 400, y: 600 },
        connections: ['crop_farming', 'animal_breeding', 'herb_growing'],
        tier: 2
      },
      {
        id: 'crop_farming',
        name: 'Cultivo de Grãos',
        description: 'Plantio e colheita de grãos',
        maxLevel: 100,
        currentLevel: npc.type === 'farmer' ? Math.max(1, Math.floor((npc.skills?.working || 10) / 7)) : 0,
        cost: 200,
        requirements: ['farming_path'],
        category: 'farming',
        position: { x: 300, y: 550 },
        connections: ['wheat_farming', 'corn_farming', 'bean_farming'],
        tier: 3
      },
      {
        id: 'animal_breeding',
        name: 'Criação de Animais',
        description: 'Criação e cuidado de animais',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['farming_path'],
        category: 'farming',
        position: { x: 400, y: 550 },
        connections: ['poultry', 'livestock', 'mounts'],
        tier: 3
      },
      {
        id: 'herb_growing',
        name: 'Cultivo de Ervas',
        description: 'Cultivo de plantas medicinais',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['farming_path'],
        category: 'farming',
        position: { x: 500, y: 550 },
        connections: ['healing_herbs', 'poison_herbs', 'magic_herbs'],
        tier: 3
      },

      // COOKING PATH (Purple - Bottom Left)
      {
        id: 'cooking_path',
        name: 'Caminho da Culinária',
        description: 'Desbloqueia habilidades culinárias',
        maxLevel: 100,
        currentLevel: npc.type === 'baker' ? Math.max(1, Math.floor((npc.skills?.working || 10) / 5)) : 0,
        cost: 100,
        requirements: ['core'],
        category: 'cooking',
        position: { x: 200, y: 600 },
        connections: ['baking', 'brewing', 'butchering'],
        tier: 2
      },
      {
        id: 'baking',
        name: 'Panificação',
        description: 'Criação de pães e bolos',
        maxLevel: 100,
        currentLevel: npc.type === 'baker' ? Math.max(1, Math.floor((npc.skills?.working || 10) / 7)) : 0,
        cost: 200,
        requirements: ['cooking_path'],
        category: 'cooking',
        position: { x: 150, y: 550 },
        connections: ['bread_baking', 'pastry_making', 'cake_crafting'],
        tier: 3
      },
      {
        id: 'brewing',
        name: 'Cervejaria',
        description: 'Produção de bebidas',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['cooking_path'],
        category: 'cooking',
        position: { x: 200, y: 550 },
        connections: ['ale_brewing', 'wine_making', 'potion_brewing'],
        tier: 3
      },
      {
        id: 'butchering',
        name: 'Açougue',
        description: 'Processamento de carne',
        maxLevel: 100,
        currentLevel: 0,
        cost: 200,
        requirements: ['cooking_path'],
        category: 'cooking',
        position: { x: 250, y: 550 },
        connections: ['meat_processing', 'sausage_making', 'preservation'],
        tier: 3
      }
    ];
  };

  const allSkills = getAllSkills();
  const filteredSkills = activeCategory === 'all' 
    ? allSkills 
    : allSkills.filter(skill => skill.category === activeCategory);

  const selectedSkill = selectedNode ? allSkills.find(s => s.id === selectedNode) : null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'warrior': return 'text-red-400 border-red-400 bg-red-900/20';
      case 'mage': return 'text-blue-400 border-blue-400 bg-blue-900/20';
      case 'hunter': return 'text-green-400 border-green-400 bg-green-900/20';
      case 'gathering': return 'text-orange-400 border-orange-400 bg-orange-900/20';
      case 'crafting': return 'text-yellow-400 border-yellow-400 bg-yellow-900/20';
      case 'farming': return 'text-lime-400 border-lime-400 bg-lime-900/20';
      case 'cooking': return 'text-purple-400 border-purple-400 bg-purple-900/20';
      case 'utility': return 'text-gray-400 border-gray-400 bg-gray-900/20';
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
    { id: 'warrior', name: 'Guerreiro', icon: 'fa-sword', color: 'text-red-400' },
    { id: 'mage', name: 'Mago', icon: 'fa-magic', color: 'text-blue-400' },
    { id: 'hunter', name: 'Caçador', icon: 'fa-bow-arrow', color: 'text-green-400' },
    { id: 'gathering', name: 'Coleta', icon: 'fa-hammer', color: 'text-orange-400' },
    { id: 'crafting', name: 'Criação', icon: 'fa-cog', color: 'text-yellow-400' },
    { id: 'farming', name: 'Agricultura', icon: 'fa-wheat-awn', color: 'text-lime-400' },
    { id: 'cooking', name: 'Culinária', icon: 'fa-utensils', color: 'text-purple-400' },
    { id: 'utility', name: 'Utilidade', icon: 'fa-star', color: 'text-gray-400' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gray-900 rounded-xl border border-gray-600 w-[1000px] h-[800px] relative overflow-hidden"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        ref={dragRef}
        onMouseDown={handleMouseDown}
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
            <h2 className="text-xl font-bold text-white">Árvore de Habilidades Completa</h2>
            <span className="text-gray-400">- {npc.name}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <i className="fa-solid fa-times"></i>
          </button>
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

        <div className="flex h-[calc(100%-128px)]">
          {/* Skill Tree Visualization */}
          <div className="flex-1 relative bg-gray-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-gray-700 via-gray-800 to-gray-900">
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
                  <div className={`w-14 h-14 rounded-full border-3 flex items-center justify-center relative ${
                    isSkillUnlocked(skill) 
                      ? getCategoryColor(skill.category)
                      : 'text-gray-600 border-gray-600 bg-gray-800'
                  } ${
                    skill.currentLevel > 0 
                      ? 'shadow-xl ring-2 ring-white/20' 
                      : ''
                  }`}>
                    <i className={`fa-solid ${
                      skill.category === 'warrior' ? 'fa-sword' :
                      skill.category === 'mage' ? 'fa-magic' :
                      skill.category === 'hunter' ? 'fa-bow-arrow' :
                      skill.category === 'gathering' ? 'fa-hammer' :
                      skill.category === 'crafting' ? 'fa-cog' :
                      skill.category === 'farming' ? 'fa-wheat-awn' :
                      skill.category === 'cooking' ? 'fa-utensils' :
                      'fa-star'
                    } text-lg`}></i>
                    
                    {/* Level indicator */}
                    {skill.currentLevel > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg">
                        {skill.currentLevel}
                      </div>
                    )}

                    {/* Tier indicator */}
                    {skill.tier && (
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {skill.tier}
                      </div>
                    )}
                  </div>

                  {/* Skill name */}
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-300 whitespace-nowrap max-w-20 leading-tight">
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
                    {selectedSkill.tier && (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        Tier {selectedSkill.tier}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{selectedSkill.description}</p>
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
                      {selectedSkill.category === 'warrior' ? 'Guerreiro' :
                       selectedSkill.category === 'mage' ? 'Mago' :
                       selectedSkill.category === 'hunter' ? 'Caçador' :
                       selectedSkill.category === 'gathering' ? 'Coleta' :
                       selectedSkill.category === 'crafting' ? 'Criação' :
                       selectedSkill.category === 'farming' ? 'Agricultura' :
                       selectedSkill.category === 'cooking' ? 'Culinária' :
                       'Utilidade'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Custo:</span>
                    <span className="text-yellow-400 font-medium">{selectedSkill.cost} XP</span>
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
                        selectedSkill.category === 'warrior' ? 'bg-red-500' :
                        selectedSkill.category === 'mage' ? 'bg-blue-500' :
                        selectedSkill.category === 'hunter' ? 'bg-green-500' :
                        selectedSkill.category === 'gathering' ? 'bg-orange-500' :
                        selectedSkill.category === 'crafting' ? 'bg-yellow-500' :
                        selectedSkill.category === 'farming' ? 'bg-lime-500' :
                        selectedSkill.category === 'cooking' ? 'bg-purple-500' :
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
                    : 'Melhorar Habilidade'
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
