import React, { useState, useEffect } from 'react';
import { useCombatStore } from '../game/stores/useCombatStore';
import { CombatEntity, CombatAction, Weapon, Spell } from '../game/types/combat';
import { WEAPONS_DATABASE } from '../game/constants/weapons';
import { useDraggable } from '../hooks/useDraggable';

interface CombatPanelProps {
  entityId: string;
  onClose: () => void;
}

const CombatPanel: React.FC<CombatPanelProps> = ({ entityId, onClose }) => {
  const [selectedAction, setSelectedAction] = useState<'attack' | 'spell' | 'defend' | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);

  const {
    combatEntities,
    activeCombats,
    isEntityInCombat,
    getActiveCombatForEntity,
    executeCombatAction,
    castSpell
  } = useCombatStore();

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 }
  });

  const entity = combatEntities.get(entityId);
  const combat = getActiveCombatForEntity(entityId);
  const isMyTurn = combat?.currentTurn === entityId;

  useEffect(() => {
    if (!entity || !isEntityInCombat(entityId)) {
      onClose();
    }
  }, [entity, entityId, isEntityInCombat, onClose]);

  if (!entity || !combat) {
    return null;
  }

  const availableTargets = combat.participants.filter(id => id !== entityId);
  const availableWeapons = entity.equipment.weapon ? [entity.equipment.weapon] : [];

  const handleExecuteAction = () => {
    if (!isMyTurn || !selectedAction || !selectedTarget) return;

    const action: CombatAction = {
      id: `action_${Date.now()}`,
      type: selectedAction,
      targetId: selectedTarget,
      weaponId: selectedWeapon || undefined,
      spellId: selectedSpell || undefined
    };

    executeCombatAction(combat.id, entityId, action);

    // Reset selections
    setSelectedAction(null);
    setSelectedTarget(null);
    setSelectedWeapon(null);
    setSelectedSpell(null);
  };

  const getHealthPercentage = (entity: CombatEntity) => {
    return (entity.stats.health / entity.stats.maxHealth) * 100;
  };

  const getManaPercentage = (entity: CombatEntity) => {
    return (entity.stats.mana / entity.stats.maxMana) * 100;
  };

  const getStaminaPercentage = (entity: CombatEntity) => {
    return (entity.stats.stamina / entity.stats.maxStamina) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-lg lg:max-w-xl h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
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
        <div className="bg-gradient-to-r from-red-800 to-red-600 p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-sword"></i>
              Combate - {entity.name}
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200"
            >
              <i className="fa-solid fa-times text-white"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
        {/* Status do Combatente */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Status</h3>

          {/* Vida */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Vida</span>
              <span className="text-red-400">{entity.stats.health}/{entity.stats.maxHealth}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getHealthPercentage(entity)}%` }}
              ></div>
            </div>
          </div>

          {/* Mana */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Mana</span>
              <span className="text-blue-400">{entity.stats.mana}/{entity.stats.maxMana}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getManaPercentage(entity)}%` }}
              ></div>
            </div>
          </div>

          {/* Stamina */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Stamina</span>
              <span className="text-yellow-400">{entity.stats.stamina}/{entity.stats.maxStamina}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getStaminaPercentage(entity)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Informações do Turno */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Turno</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isMyTurn 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {isMyTurn ? 'Seu Turno' : 'Aguardando'}
            </div>
          </div>

          {combat.currentTurn && (
            <p className="text-gray-300 mt-2">
              Turno atual: {combatEntities.get(combat.currentTurn)?.name || 'Desconhecido'}
            </p>
          )}
        </div>

        {/* Ações de Combate */}
        {isMyTurn && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Ações</h3>

            {/* Botões de Ação */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedAction('attack')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedAction === 'attack'
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-red-400 hover:text-red-400'
                }`}
              >
                <i className="fa-solid fa-sword mr-2"></i>
                Atacar
              </button>

              <button
                onClick={() => setSelectedAction('spell')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedAction === 'spell'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-blue-400 hover:text-blue-400'
                }`}
              >
                <i className="fa-solid fa-magic mr-2"></i>
                Magia
              </button>

              <button
                onClick={() => setSelectedAction('defend')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedAction === 'defend'
                    ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-yellow-400 hover:text-yellow-400'
                }`}
              >
                <i className="fa-solid fa-shield mr-2"></i>
                Defender
              </button>

              <button
                className="p-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-gray-300 hover:border-purple-400 hover:text-purple-400 transition-all duration-200"
              >
                <i className="fa-solid fa-flask mr-2"></i>
                Item
              </button>
            </div>

            {/* Seleção de Alvo */}
            {(selectedAction === 'attack' || selectedAction === 'spell') && (
              <div className="mb-4">
                <h4 className="text-md font-medium text-white mb-2">Selecionar Alvo:</h4>
                <div className="space-y-2">
                  {availableTargets.map(targetId => {
                    const target = combatEntities.get(targetId);
                    if (!target) return null;

                    return (
                      <button
                        key={targetId}
                        onClick={() => setSelectedTarget(targetId)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                          selectedTarget === targetId
                            ? 'border-red-500 bg-red-500/20'
                            : 'border-gray-600 bg-gray-700 hover:border-red-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{target.name}</span>
                          <span className="text-red-400">
                            {target.stats.health}/{target.stats.maxHealth} HP
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${getHealthPercentage(target)}%` }}
                          ></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seleção de Arma */}
            {selectedAction === 'attack' && availableWeapons.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium text-white mb-2">Arma:</h4>
                <div className="space-y-2">
                  {availableWeapons.map(weapon => (
                    <button
                      key={weapon.id}
                      onClick={() => setSelectedWeapon(weapon.id)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                        selectedWeapon === weapon.id
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-gray-600 bg-gray-700 hover:border-orange-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{weapon.name}</span>
                        <span className="text-orange-400">Dano: {weapon.damage}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botão Executar Ação */}
            <button
              onClick={handleExecuteAction}
              disabled={!selectedAction || (selectedAction !== 'defend' && !selectedTarget)}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Executar Ação
            </button>
          </div>
        )}

        {/* Lista de Participantes */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Participantes</h3>
          <div className="space-y-3">
            {combat.participants.map(participantId => {
              const participant = combatEntities.get(participantId);
              if (!participant) return null;

              return (
                <div key={participantId} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{participant.name}</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      participant.combatState === 'dead' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-green-600 text-white'
                    }`}>
                      {participant.combatState === 'dead' ? 'Morto' : 'Vivo'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 text-sm">
                      {participant.stats.health}/{participant.stats.maxHealth} HP
                    </div>
                    <div className="w-20 bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${getHealthPercentage(participant)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CombatPanel;