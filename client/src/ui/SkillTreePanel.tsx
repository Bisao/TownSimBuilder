
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
  category: 'combat' | 'gathering' | 'crafting' | 'utility';
  position: { x: number; y: number };
  connections: string[];
}

interface SkillTreePanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const SkillTreePanel = ({ npc, onClose }: SkillTreePanelProps) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 400, y: window.innerHeight / 2 - 300 }
  });

  if (!npc) return null;

  // Skill tree data based on NPC type
  const getSkillTree = (npcType: string): SkillNode[] => {
    const baseSkills = [
      {
        id: 'core',
        name: 'Core Skills',
        description: 'Basic abilities for all NPCs',
        maxLevel: 10,
        currentLevel: npc.skills?.efficiency ? Math.floor(npc.skills.efficiency / 10) : 1,
        cost: 0,
        requirements: [],
        category: 'utility' as const,
        position: { x: 400, y: 300 },
        connections: ['efficiency', 'stamina', 'speed']
      },
      {
        id: 'efficiency',
        name: 'Work Efficiency',
        description: 'Increases work speed and quality',
        maxLevel: 15,
        currentLevel: npc.skills?.efficiency ? Math.floor(npc.skills.efficiency / 7) : 1,
        cost: 10,
        requirements: ['core'],
        category: 'utility' as const,
        position: { x: 300, y: 200 },
        connections: ['master_efficiency']
      },
      {
        id: 'stamina',
        name: 'Energy Management',
        description: 'Reduces energy consumption',
        maxLevel: 12,
        currentLevel: Math.floor((npc.needs.energy || 50) / 8),
        cost: 15,
        requirements: ['core'],
        category: 'utility' as const,
        position: { x: 400, y: 150 },
        connections: ['energy_mastery']
      },
      {
        id: 'speed',
        name: 'Movement Speed',
        description: 'Increases movement speed',
        maxLevel: 10,
        currentLevel: 1,
        cost: 12,
        requirements: ['core'],
        category: 'utility' as const,
        position: { x: 500, y: 200 },
        connections: ['sprint_mastery']
      }
    ];

    // Type-specific skills
    const typeSpecificSkills: Record<string, SkillNode[]> = {
      miner: [
        {
          id: 'mining_power',
          name: 'Mining Power',
          description: 'Increases stone collection rate',
          maxLevel: 20,
          currentLevel: npc.skills?.gathering ? Math.floor(npc.skills.gathering / 5) : 1,
          cost: 20,
          requirements: ['efficiency'],
          category: 'gathering' as const,
          position: { x: 200, y: 100 },
          connections: ['vein_detection', 'ore_mastery']
        },
        {
          id: 'vein_detection',
          name: 'Vein Detection',
          description: 'Find resources faster',
          maxLevel: 8,
          currentLevel: 1,
          cost: 25,
          requirements: ['mining_power'],
          category: 'gathering' as const,
          position: { x: 150, y: 50 },
          connections: ['legendary_miner']
        },
        {
          id: 'ore_mastery',
          name: 'Ore Mastery',
          description: 'Chance for bonus resources',
          maxLevel: 15,
          currentLevel: 1,
          cost: 30,
          requirements: ['mining_power'],
          category: 'gathering' as const,
          position: { x: 250, y: 50 },
          connections: ['legendary_miner']
        },
        {
          id: 'legendary_miner',
          name: 'Legendary Miner',
          description: 'Ultimate mining mastery',
          maxLevel: 5,
          currentLevel: 0,
          cost: 100,
          requirements: ['vein_detection', 'ore_mastery'],
          category: 'gathering' as const,
          position: { x: 200, y: 20 },
          connections: []
        }
      ],
      lumberjack: [
        {
          id: 'woodcutting_power',
          name: 'Woodcutting Power',
          description: 'Increases wood collection rate',
          maxLevel: 20,
          currentLevel: npc.skills?.gathering ? Math.floor(npc.skills.gathering / 5) : 1,
          cost: 20,
          requirements: ['efficiency'],
          category: 'gathering' as const,
          position: { x: 200, y: 100 },
          connections: ['tree_sense', 'lumber_mastery']
        },
        {
          id: 'tree_sense',
          name: 'Tree Sense',
          description: 'Locate trees efficiently',
          maxLevel: 8,
          currentLevel: 1,
          cost: 25,
          requirements: ['woodcutting_power'],
          category: 'gathering' as const,
          position: { x: 150, y: 50 },
          connections: ['forest_guardian']
        },
        {
          id: 'lumber_mastery',
          name: 'Lumber Mastery',
          description: 'Chance for rare wood types',
          maxLevel: 15,
          currentLevel: 1,
          cost: 30,
          requirements: ['woodcutting_power'],
          category: 'gathering' as const,
          position: { x: 250, y: 50 },
          connections: ['forest_guardian']
        },
        {
          id: 'forest_guardian',
          name: 'Forest Guardian',
          description: 'Master of all forestry',
          maxLevel: 5,
          currentLevel: 0,
          cost: 100,
          requirements: ['tree_sense', 'lumber_mastery'],
          category: 'gathering' as const,
          position: { x: 200, y: 20 },
          connections: []
        }
      ],
      farmer: [
        {
          id: 'farming_knowledge',
          name: 'Farming Knowledge',
          description: 'Improves crop yield and growth speed',
          maxLevel: 20,
          currentLevel: npc.skills?.working ? Math.floor(npc.skills.working / 5) : 1,
          cost: 20,
          requirements: ['efficiency'],
          category: 'crafting' as const,
          position: { x: 200, y: 100 },
          connections: ['crop_rotation', 'harvest_mastery']
        },
        {
          id: 'crop_rotation',
          name: 'Crop Rotation',
          description: 'Plant multiple crop types efficiently',
          maxLevel: 10,
          currentLevel: 1,
          cost: 25,
          requirements: ['farming_knowledge'],
          category: 'crafting' as const,
          position: { x: 150, y: 50 },
          connections: ['agricultural_master']
        },
        {
          id: 'harvest_mastery',
          name: 'Harvest Mastery',
          description: 'Increased harvest yield',
          maxLevel: 15,
          currentLevel: 1,
          cost: 30,
          requirements: ['farming_knowledge'],
          category: 'crafting' as const,
          position: { x: 250, y: 50 },
          connections: ['agricultural_master']
        },
        {
          id: 'agricultural_master',
          name: 'Agricultural Master',
          description: 'Supreme farming expertise',
          maxLevel: 5,
          currentLevel: 0,
          cost: 100,
          requirements: ['crop_rotation', 'harvest_mastery'],
          category: 'crafting' as const,
          position: { x: 200, y: 20 },
          connections: []
        }
      ],
      baker: [
        {
          id: 'baking_skill',
          name: 'Baking Skill',
          description: 'Improves baking speed and quality',
          maxLevel: 20,
          currentLevel: npc.skills?.working ? Math.floor(npc.skills.working / 5) : 1,
          cost: 20,
          requirements: ['efficiency'],
          category: 'crafting' as const,
          position: { x: 200, y: 100 },
          connections: ['recipe_knowledge', 'quality_control']
        },
        {
          id: 'recipe_knowledge',
          name: 'Recipe Knowledge',
          description: 'Learn advanced recipes',
          maxLevel: 12,
          currentLevel: 1,
          cost: 25,
          requirements: ['baking_skill'],
          category: 'crafting' as const,
          position: { x: 150, y: 50 },
          connections: ['master_baker']
        },
        {
          id: 'quality_control',
          name: 'Quality Control',
          description: 'Produce higher quality goods',
          maxLevel: 15,
          currentLevel: 1,
          cost: 30,
          requirements: ['baking_skill'],
          category: 'crafting' as const,
          position: { x: 250, y: 50 },
          connections: ['master_baker']
        },
        {
          id: 'master_baker',
          name: 'Master Baker',
          description: 'Ultimate baking mastery',
          maxLevel: 5,
          currentLevel: 0,
          cost: 100,
          requirements: ['recipe_knowledge', 'quality_control'],
          category: 'crafting' as const,
          position: { x: 200, y: 20 },
          connections: []
        }
      ]
    };

    return [...baseSkills, ...(typeSpecificSkills[npcType] || [])];
  };

  const skillTree = getSkillTree(npc.type);
  const selectedSkill = selectedNode ? skillTree.find(s => s.id === selectedNode) : null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat': return 'text-red-400 border-red-400';
      case 'gathering': return 'text-orange-400 border-orange-400';
      case 'crafting': return 'text-green-400 border-green-400';
      case 'utility': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const isSkillUnlocked = (skill: SkillNode) => {
    if (skill.requirements.length === 0) return true;
    return skill.requirements.every(req => {
      const reqSkill = skillTree.find(s => s.id === req);
      return reqSkill && reqSkill.currentLevel > 0;
    });
  };

  const canUpgradeSkill = (skill: SkillNode) => {
    return isSkillUnlocked(skill) && skill.currentLevel < skill.maxLevel;
  };

  const upgradeSkill = (skillId: string) => {
    const skill = skillTree.find(s => s.id === skillId);
    if (!skill || !canUpgradeSkill(skill)) return;

    // TODO: Implement skill upgrade logic with experience/currency system
    console.log(`Upgrading skill ${skill.name} for NPC ${npc.id}`);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-gray-900 rounded-xl border border-gray-600 w-[900px] h-[700px] relative overflow-hidden"
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
            <h2 className="text-xl font-bold text-white">Árvore de Habilidades</h2>
            <span className="text-gray-400">- {npc.name}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="flex h-[calc(100%-64px)]">
          {/* Skill Tree Visualization */}
          <div className="flex-1 relative bg-gray-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-gray-700 via-gray-800 to-gray-900">
              <svg className="absolute inset-0 w-full h-full">
                {/* Render connections */}
                {skillTree.map(skill => 
                  skill.connections.map(connectionId => {
                    const connectedSkill = skillTree.find(s => s.id === connectionId);
                    if (!connectedSkill) return null;
                    
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
                      />
                    );
                  })
                )}
              </svg>

              {/* Render skill nodes */}
              {skillTree.map(skill => (
                <div
                  key={skill.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                    selectedNode === skill.id ? 'scale-110' : 'scale-100'
                  }`}
                  style={{
                    left: skill.position.x,
                    top: skill.position.y,
                  }}
                  onClick={() => setSelectedNode(skill.id)}
                >
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative ${
                    isSkillUnlocked(skill) 
                      ? getCategoryColor(skill.category)
                      : 'text-gray-600 border-gray-600'
                  } ${
                    skill.currentLevel > 0 
                      ? 'bg-gray-700 shadow-lg' 
                      : 'bg-gray-800'
                  }`}>
                    <i className={`fa-solid ${
                      skill.category === 'combat' ? 'fa-sword' :
                      skill.category === 'gathering' ? 'fa-hammer' :
                      skill.category === 'crafting' ? 'fa-cog' :
                      'fa-star'
                    } text-sm`}></i>
                    
                    {/* Level indicator */}
                    {skill.currentLevel > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        {skill.currentLevel}
                      </div>
                    )}
                  </div>

                  {/* Skill name */}
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-300 whitespace-nowrap">
                    {skill.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Details Panel */}
          <div className="w-80 bg-gray-900 border-l border-gray-600 p-4">
            {selectedSkill ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{selectedSkill.name}</h3>
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
                      {selectedSkill.category}
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
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
                        const reqSkill = skillTree.find(s => s.id === reqId);
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreePanel;
