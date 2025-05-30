import React, { useState, useEffect } from 'react';
import { NPC, useNpcStore } from '../game/stores/useNpcStore';
import { useDraggable } from '../hooks/useDraggable';
import { useSkillStore, SkillNode } from '../game/stores/useSkillStore';

interface SkillTreePanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const SkillTreePanel = ({ npc, onClose }: SkillTreePanelProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const { 
    skills, 
    playerResources, 
    selectedSkill,
    isLoading,
    initializeSkills,
    upgradeSkill,
    selectSkill,
    isSkillUnlocked,
    canUpgradeSkill,
    getSkillCost,
    addExperience,
    addFamePoints
  } = useSkillStore();

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 600, y: window.innerHeight / 2 - 400 }
  });

  useEffect(() => {
    if (Object.keys(skills).length === 0) {
      initializeSkills();
    }
  }, []);

  if (!npc) return null;

  const allSkills = Object.values(skills);
  const filteredSkills = activeCategory === 'all' 
    ? allSkills 
    : allSkills.filter(skill => skill.category === activeCategory);

  const selectedSkillData = selectedSkill ? skills[selectedSkill] : null;

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

  const handleUpgradeSkill = async (skillId: string) => {
    const success = await upgradeSkill(skillId);
    if (success) {
      // Adicionar experiência base para atividades relacionadas
      const skill = skills[skillId];
      if (skill) {
        // Simular ganho de experiência em atividades do NPC
        if (skill.category === 'gathering' && npc.type === 'lumberjack') {
          addExperience('lumberjack', 50);
        } else if (skill.category === 'gathering' && npc.type === 'miner') {
          addExperience('miner', 50);
        } else if (skill.category === 'farming' && npc.type === 'farmer') {
          addExperience('crop_farmer', 50);
        }
      }
    }
  };

  // Simulação de ganho de pontos de Fame baseado na atividade do NPC
  const simulateActivityReward = () => {
    if (npc.type === 'lumberjack') {
      addFamePoints(25);
      addExperience('lumberjack', 30);
    } else if (npc.type === 'miner') {
      addFamePoints(25);
      addExperience('miner', 30);
    } else if (npc.type === 'farmer') {
      addFamePoints(20);
      addExperience('crop_farmer', 25);
    }
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/90 z-[9999] pointer-events-auto flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-600">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-white">Carregando árvore de habilidades...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div className="bg-gray-900 w-full h-full relative overflow-hidden">
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

          {/* Resources Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded">
              <i className="fa-solid fa-star text-yellow-400"></i>
              <span className="text-white font-medium">{playerResources.famePoints}</span>
              <span className="text-gray-400 text-sm">Fame</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded">
              <i className="fa-solid fa-coins text-yellow-500"></i>
              <span className="text-white font-medium">{playerResources.silver}</span>
              <span className="text-gray-400 text-sm">Silver</span>
            </div>

            {/* Test buttons */}
            <button
              onClick={simulateActivityReward}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              title="Simular recompensa de atividade"
            >
              <i className="fa-solid fa-gift mr-1"></i>
              Atividade
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              {viewMode === 'overview' ? 'Detalhado' : 'Geral'}
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
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" style={{ width: '2000px', height: '1600px' }}>
              <svg className="absolute inset-0 w-full h-full">
                {/* Render connections */}
                {filteredSkills.map(skill => 
                  skill.connections.map(connectionId => {
                    const connectedSkill = skills[connectionId];
                    if (!connectedSkill || (activeCategory !== 'all' && !filteredSkills.find(s => s.id === connectionId))) return null;

                    const isUnlocked = isSkillUnlocked(connectionId);

                    return (
                      <line
                        key={`${skill.id}-${connectionId}`}
                        x1={skill.position.x}
                        y1={skill.position.y}
                        x2={connectedSkill.position.x}
                        y2={connectedSkill.position.y}
                        stroke={isUnlocked ? "#4ade80" : "#374151"}
                        strokeWidth="2"
                        strokeDasharray={isUnlocked ? "0" : "5,5"}
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
                    selectedSkill === skill.id ? 'scale-110 z-10' : 'scale-100'
                  }`}
                  style={{
                    left: skill.position.x,
                    top: skill.position.y,
                  }}
                  onClick={() => selectSkill(skill.id)}
                >
                  <div className={`w-18 h-18 rounded-full border-3 flex items-center justify-center relative ${
                    isSkillUnlocked(skill.id) 
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
                    } text-xl`}></i>

                    {/* Level indicator */}
                    {skill.currentLevel > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg">
                        {skill.currentLevel}
                      </div>
                    )}

                    {/* Tier indicator */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white">
                      T{skill.tier}
                    </div>

                    {/* Unlock indicator */}
                    {!isSkillUnlocked(skill.id) && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <i className="fa-solid fa-lock text-gray-500"></i>
                      </div>
                    )}
                  </div>

                  {/* Skill name */}
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-300 whitespace-nowrap max-w-28 leading-tight">
                    {skill.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Details Panel */}
          <div className="w-80 bg-gray-900 border-l border-gray-600 p-4 overflow-y-auto">
            {selectedSkillData ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{selectedSkillData.name}</h3>
                    <span className="px-2 py-1 bg-blue-700 rounded text-xs text-white">
                      Tier {selectedSkillData.tier}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{selectedSkillData.description}</p>
                  {selectedSkillData.subcategory && (
                    <div className="text-xs text-gray-400 mb-2">
                      Subcategoria: {selectedSkillData.subcategory}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nível:</span>
                    <span className="text-white font-medium">
                      {selectedSkillData.currentLevel} / {selectedSkillData.maxLevel}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Experiência:</span>
                    <span className="text-blue-400 font-medium">
                      {selectedSkillData.currentExperience} XP
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Categoria:</span>
                    <span className={`font-medium capitalize ${getCategoryColor(selectedSkillData.category).split(' ')[0]}`}>
                      {selectedSkillData.category === 'adventurer' ? 'Aventureiro' :
                       selectedSkillData.category === 'crafting' ? 'Criação' :
                       selectedSkillData.category === 'gathering' ? 'Coleta' :
                       selectedSkillData.category === 'farming' ? 'Agricultura' :
                       selectedSkillData.category === 'combat' ? 'Combate' :
                       selectedSkillData.category === 'refining' ? 'Refinamento' :
                       'Outro'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Custo:</span>
                    <span className="text-yellow-400 font-medium">
                      {getSkillCost(selectedSkillData.id)} Fame
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${
                      isSkillUnlocked(selectedSkillData.id) ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isSkillUnlocked(selectedSkillData.id) ? 'Desbloqueada' : 'Bloqueada'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-gray-300">
                      {Math.round((selectedSkillData.currentLevel / selectedSkillData.maxLevel) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        selectedSkillData.category === 'adventurer' ? 'bg-gray-500' :
                        selectedSkillData.category === 'crafting' ? 'bg-yellow-500' :
                        selectedSkillData.category === 'gathering' ? 'bg-green-500' :
                        selectedSkillData.category === 'farming' ? 'bg-lime-500' :
                        selectedSkillData.category === 'combat' ? 'bg-red-500' :
                        selectedSkillData.category === 'refining' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${(selectedSkillData.currentLevel / selectedSkillData.maxLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Requirements */}
                {selectedSkillData.requirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Requisitos:</h4>
                    <div className="space-y-1">
                      {selectedSkillData.requirements.map(reqId => {
                        const reqSkill = skills[reqId];
                        const isMet = reqSkill && reqSkill.currentLevel > 0;
                        return (
                          <div key={reqId} className={`text-sm ${isMet ? 'text-green-400' : 'text-red-400'}`}>
                            <i className={`fa-solid ${isMet ? 'fa-check' : 'fa-times'} mr-2`}></i>
                            {reqSkill?.name || reqId} {isMet ? `(Nível ${reqSkill.currentLevel})` : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Connected skills */}
                {selectedSkillData.connections.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Desbloqueia:</h4>
                    <div className="space-y-1">
                      {selectedSkillData.connections.map(connId => {
                        const connSkill = skills[connId];
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
                {selectedSkillData.unlocks && selectedSkillData.unlocks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Benefícios:</h4>
                    <div className="space-y-1">
                      {selectedSkillData.unlocks.map((unlock, index) => (
                        <div key={index} className="text-sm text-purple-400">
                          <i className="fa-solid fa-star mr-2"></i>
                          {unlock}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upgrade button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleUpgradeSkill(selectedSkillData.id)}
                    disabled={!canUpgradeSkill(selectedSkillData.id) || playerResources.famePoints < getSkillCost(selectedSkillData.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      canUpgradeSkill(selectedSkillData.id) && playerResources.famePoints >= getSkillCost(selectedSkillData.id)
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedSkillData.currentLevel >= selectedSkillData.maxLevel 
                      ? 'Maximizada' 
                      : !isSkillUnlocked(selectedSkillData.id)
                      ? 'Bloqueada'
                      : playerResources.famePoints < getSkillCost(selectedSkillData.id)
                      ? `Insuficiente (${getSkillCost(selectedSkillData.id)} Fame)`
                      : `Melhorar para Nível ${selectedSkillData.currentLevel + 1}`
                    }
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-8">
                <i className="fa-solid fa-mouse-pointer text-3xl mb-3"></i>
                <p>Clique em uma habilidade para ver os detalhes</p>
                <div className="mt-4 text-sm text-gray-500 space-y-1">
                  <p>Total: {filteredSkills.length} habilidades</p>
                  <p>Desbloqueadas: {filteredSkills.filter(s => s.currentLevel > 0).length}</p>
                  <p>Fame: {playerResources.famePoints} pontos</p>
                  <p>Silver: {playerResources.silver}</p>
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