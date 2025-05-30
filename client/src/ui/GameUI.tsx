import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGameStore } from "../game/stores/useGameStore";
import { useResourceStore } from "../game/stores/useResourceStore";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useNpcStore, NPC } from "../game/stores/useNpcStore";
import { useAudio } from "../lib/stores/useAudio";
import { useKeyboardControls } from "@react-three/drei";
import { useIsMobile } from "../hooks/useIsMobile";

// Import UI Components
import ResourcePanel from "./ResourcePanel";
import BuildingPanel from "./BuildingPanel";
import NpcPanel from "./NpcPanel";
import NpcMetricsPanel from "./NpcMetricsPanel";
import SeedSelectionPanel from "./SeedSelectionPanel";
import SiloPanel from "./SiloPanel";
import CombatPanel from "./CombatPanel";
import DummyStatsPanel from "./DummyStatsPanel";
import NotificationContainer from "./NotificationContainer";

// Import Controls
import { Controls } from "../game/types/controls";

interface GameUIProps {
  className?: string;
}

const GameUI: React.FC<GameUIProps> = ({ className = "" }) => {
  // Game state
  const {
    isPaused,
    timeSpeed,
    timeCycle,
    gameMode,
    isManualControl,
    controlledNpcId,
    pauseTime,
    resumeTime,
    increaseTimeSpeed,
    decreaseTimeSpeed,
  } = useGameStore();

  const { buildings } = useBuildingStore();
  const { resources } = useResourceStore();
  const { npcs, updateNpc } = useNpcStore();
  const { isMuted, toggleMute, initAudio } = useAudio();

  // Device detection
  const isMobile = useIsMobile();

  // Panel visibility state
  const [panels, setPanels] = useState({
    resources: false,
    buildings: false,
    npcMetrics: false,
    seedSelection: false,
    silo: false,
    npc: false,
    combat: false,
    dummyStats: false,
  });

  // Selection state
  const [selectedEntities, setSelectedEntities] = useState({
    npc: null as NPC | null,
    npcId: null as string | null,
    siloId: null as string | null,
    combatEntityId: null as string | null,
  });

  // Keyboard controls
  const [, get] = useKeyboardControls<Controls>();

  // Refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Panel management utilities
  const togglePanel = useCallback((panelName: keyof typeof panels) => {
    setPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  }, []);

  const closePanel = useCallback((panelName: keyof typeof panels) => {
    setPanels(prev => ({
      ...prev,
      [panelName]: false
    }));
  }, []);

  const openPanel = useCallback((panelName: keyof typeof panels) => {
    setPanels(prev => ({
      ...prev,
      [panelName]: true
    }));
  }, []);

  // Entity selection utilities
  const selectEntity = useCallback((entityType: keyof typeof selectedEntities, entity: any) => {
    setSelectedEntities(prev => ({
      ...prev,
      [entityType]: entity
    }));
  }, []);

  const clearSelection = useCallback((entityType: keyof typeof selectedEntities) => {
    setSelectedEntities(prev => ({
      ...prev,
      [entityType]: null
    }));
  }, []);

  // Event handlers
  const handleNpcClick = useCallback((event: CustomEvent) => {
    const npc = event.detail as NPC;
    selectEntity('npc', npc);
    openPanel('npc');
  }, [selectEntity, openPanel]);

  const handleSiloClick = useCallback((event: CustomEvent) => {
    const siloId = event.detail as string;
    selectEntity('siloId', siloId);
    openPanel('silo');
  }, [selectEntity, openPanel]);

  const handleCombatEntityClick = useCallback((event: CustomEvent) => {
    const entityId = event.detail as string;
    selectEntity('combatEntityId', entityId);
    openPanel('combat');
  }, [selectEntity, openPanel]);

  const handleSeedSelect = useCallback((seedType: string) => {
    if (selectedEntities.npc) {
      updateNpc(selectedEntities.npc.id, {
        farmerData: {
          ...selectedEntities.npc.farmerData,
          selectedSeed: seedType
        }
      });
    }
    closePanel('seedSelection');
  }, [selectedEntities.npc, updateNpc, closePanel]);

  const handleKeyboardControls = useCallback(() => {
    const controls = get();

    // Time controls
    if (controls.pause) pauseTime();
    if (controls.resume) resumeTime();
    if (controls.increaseSpeed) increaseTimeSpeed();
    if (controls.decreaseSpeed) decreaseTimeSpeed();

    // Panel toggles
    if (controls.toggleResources) togglePanel('resources');
    if (controls.toggleBuildings) togglePanel('buildings');
    if (controls.toggleNpcMetrics) togglePanel('npcMetrics');
  }, [get, pauseTime, resumeTime, increaseTimeSpeed, decreaseTimeSpeed, togglePanel]);

  // Initialize audio and setup event listeners
  useEffect(() => {
    if (!isInitializedRef.current) {
      initAudio();
      isInitializedRef.current = true;
    }

    // Add event listeners
    window.addEventListener('npcClick', handleNpcClick as EventListener);
    window.addEventListener('siloClick', handleSiloClick as EventListener);
    window.addEventListener('combatEntityClick', handleCombatEntityClick as EventListener);

    return () => {
      window.removeEventListener('npcClick', handleNpcClick as EventListener);
      window.removeEventListener('siloClick', handleSiloClick as EventListener);
      window.removeEventListener('combatEntityClick', handleCombatEntityClick as EventListener);
    };
  }, [handleNpcClick, handleSiloClick, handleCombatEntityClick, initAudio]);

  // Game loop for keyboard controls
  useEffect(() => {
    const gameLoop = () => {
      handleKeyboardControls();
    };

    gameLoopRef.current = setInterval(gameLoop, 16); // ~60 FPS

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [handleKeyboardControls]);

  // Format time cycle display
  const formatTime = useCallback((timeValue: number) => {
    const hours = Math.floor(timeValue / 60);
    const minutes = Math.floor(timeValue % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, []);

  // Format time speed display
  const getTimeSpeedDisplay = useCallback(() => {
    const speedMap: Record<number, string> = {
      0: "Pausado",
      1: "Normal",
      2: "2x",
      3: "3x",
      4: "4x",
      5: "5x"
    };
    return speedMap[timeSpeed] || `${timeSpeed}x`;
  }, [timeSpeed]);

  return (
    <div className={`game-ui ${className}`}>
      {/* Game Controls HUD */}
      <div className="fixed top-4 left-4 z-40 space-y-2">
        {/* Time and Game Info */}
        <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-4 text-white text-sm">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-clock text-fantasy-accent"></i>
              <span className="font-medium">{formatTime(timeCycle.currentTime)}</span>
            </div>

            <div className="flex items-center gap-2">
              <i className={`fa-solid ${isPaused ? 'fa-pause' : 'fa-play'} text-fantasy-accent`}></i>
              <span className="font-medium">{getTimeSpeedDisplay()}</span>
            </div>

            {isManualControl && controlledNpcId && (
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-gamepad text-green-400"></i>
                <span className="text-green-400 font-medium">Controle Manual</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Mode Indicator */}
        <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2 text-white text-xs">
            <i className="fa-solid fa-gamepad text-fantasy-accent"></i>
            <span className="capitalize font-medium">{gameMode}</span>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={toggleMute}
          className="w-10 h-10 bg-glass-bg backdrop-blur-lg border border-glass-border rounded-lg 
                     flex items-center justify-center text-white hover:bg-glass-bg-bright 
                     transition-all duration-200 shadow-lg"
          aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
        >
          <i className={`fa-solid ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-fantasy-accent`}></i>
        </button>
      </div>

      {/* Bottom Panel Controls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 bg-glass-bg backdrop-blur-lg border border-glass-border 
                        rounded-xl p-2 shadow-lg">
          <button
            onClick={() => togglePanel('resources')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
                       flex items-center gap-2 ${
                         panels.resources 
                           ? 'bg-fantasy-primary text-white shadow-md' 
                           : 'text-fantasy-light hover:bg-glass-bg-bright'
                       }`}
            aria-label="Toggle resources panel"
          >
            <i className="fa-solid fa-coins"></i>
            {!isMobile && <span>Recursos</span>}
          </button>

          <button
            onClick={() => togglePanel('buildings')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
                       flex items-center gap-2 ${
                         panels.buildings 
                           ? 'bg-fantasy-primary text-white shadow-md' 
                           : 'text-fantasy-light hover:bg-glass-bg-bright'
                       }`}
            aria-label="Toggle buildings panel"
          >
            <i className="fa-solid fa-building"></i>
            {!isMobile && <span>Construções</span>}
          </button>

          <button
            onClick={() => togglePanel('npcMetrics')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
                       flex items-center gap-2 ${
                         panels.npcMetrics 
                           ? 'bg-fantasy-primary text-white shadow-md' 
                           : 'text-fantasy-light hover:bg-glass-bg-bright'
                       }`}
            aria-label="Toggle NPC metrics panel"
          >
            <i className="fa-solid fa-users"></i>
            {!isMobile && <span>NPCs</span>}
          </button>

          <button
            onClick={() => togglePanel('dummyStats')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
                       flex items-center gap-2 ${
                         panels.dummyStats 
                           ? 'bg-fantasy-primary text-white shadow-md' 
                           : 'text-fantasy-light hover:bg-glass-bg-bright'
                       }`}
            aria-label="Toggle dummy stats panel"
          >
            <i className="fa-solid fa-crosshairs"></i>
            {!isMobile && <span>Treino</span>}
          </button>
        </div>
      </div>

      {/* Persistent Panels */}
      {panels.resources && (
        <ResourcePanel 
          isVisible={panels.resources} 
          onClose={() => closePanel('resources')} 
        />
      )}

      {panels.buildings && (
        <BuildingPanel 
          isVisible={panels.buildings} 
          onClose={() => closePanel('buildings')} 
        />
      )}

      {panels.npcMetrics && (
        <NpcMetricsPanel 
          isVisible={panels.npcMetrics} 
          onClose={() => closePanel('npcMetrics')} 
        />
      )}

      {panels.dummyStats && (
        <DummyStatsPanel 
          isVisible={panels.dummyStats}
          onClose={() => closePanel('dummyStats')}
        />
      )}

      {/* Modal Panels */}
      {panels.npc && selectedEntities.npc && (
        <NpcPanel 
          npc={selectedEntities.npc} 
          onClose={() => {
            closePanel('npc');
            clearSelection('npc');
          }} 
        />
      )}

      {panels.seedSelection && (
        <SeedSelectionPanel
          isOpen={panels.seedSelection}
          onClose={() => closePanel('seedSelection')}
          onSeedSelect={handleSeedSelect}
        />
      )}

      {panels.silo && selectedEntities.siloId && (
        <SiloPanel
          isOpen={panels.silo}
          onClose={() => {
            closePanel('silo');
            clearSelection('siloId');
          }}
          siloId={selectedEntities.siloId}
        />
      )}

      {panels.combat && selectedEntities.combatEntityId && (
        <CombatPanel
          entityId={selectedEntities.combatEntityId}
          onClose={() => {
            closePanel('combat');
            clearSelection('combatEntityId');
          }}
        />
      )}

      {/* Notification System */}
      <NotificationContainer />
    </div>
  );
};

export default GameUI;