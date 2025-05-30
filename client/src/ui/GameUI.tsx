import { useEffect, useState, useRef } from "react";
import { useGameStore } from "../game/stores/useGameStore";
import { Controls } from "../game/types/controls";
import { useResourceStore } from "../game/stores/useResourceStore";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useNpcStore } from "../game/stores/useNpcStore";
import { useEconomyStore } from "../game/stores/useEconomyStore";
import { useEventStore } from "../game/stores/useEventStore";
import { useResearchStore } from "../game/stores/useResearchStore";
import { useAudio } from "../lib/stores/useAudio";
import { Building } from "../game/stores/useBuildingStore";
import ResourcePanel from "./ResourcePanel";
import BuildingPanel from "./BuildingPanel";
import NpcPanel from "./NpcPanel";
import { useKeyboardControls } from "@react-three/drei";
import { NPC } from "../game/stores/useNpcStore";
import { useIsMobile } from "../hooks/use-is-mobile";
// Sistemas removidos: Market, Research, Economy, Events, MapEditor
import NpcMetricsPanel from "./NpcMetricsPanel";
import SeedSelectionPanel from "./SeedSelectionPanel";
import SiloPanel from "./SiloPanel";
// Sistemas removidos: Market, Research, Economy, Events, MapEditor
import CombatPanel from "./CombatPanel";
import DummyStatsPanel from "./DummyStatsPanel";
import { useDraggable } from "../hooks/useDraggable";

const GameUI = () => {
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
  const { isBackgroundMusicPlaying, playBackgroundMusic, stopBackgroundMusic } = useAudio();
  const isMobile = useIsMobile();

  // UI State
  const [showResourcePanel, setShowResourcePanel] = useState(true);
  const [showBuildingPanel, setShowBuildingPanel] = useState(true);
  const [showResearchPanel, setShowResearchPanel] = useState(false);
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [showEconomyPanel, setShowEconomyPanel] = useState(false);
  const [showNpcMetrics, setShowNpcMetrics] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showSeedSelection, setShowSeedSelection] = useState(false);
  const [showSiloPanel, setShowSiloPanel] = useState(false);
  const [showNpcPanel, setShowNpcPanel] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showDummyStats, setShowDummyStats] = useState(false);

  // Selection state
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [selectedSiloId, setSelectedSiloId] = useState<string | null>(null);

  // Game loop and initialization
  useEffect(() => {
    // Initialize game systems
    const initializeSystems = () => {
      try {
        useResourceStore.getState().initResources();
        useResearchStore.getState().initResearches();
        console.log("Game systems initialized successfully");
      } catch (error) {
        console.error("Error initializing game systems:", error);
      }
    };

    initializeSystems();
  }, []);

  // Update game systems
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        try {
          // Update all game systems with error handling
          const deltaTime = 0.016; // ~60 FPS

          // Update NPCs with additional safety checks
          const npcStore = useNpcStore.getState();
          if (npcStore && typeof npcStore.updateNPCs === 'function') {
            npcStore.updateNPCs(deltaTime);
          }

          // Update building production
          const buildingStore = useBuildingStore.getState();
          if (buildingStore && typeof buildingStore.updateProduction === 'function') {
            buildingStore.updateProduction(Date.now());
          }

          // Update economy
          const economyStore = useEconomyStore.getState();
          if (economyStore && typeof economyStore.calculateTaxes === 'function') {
            economyStore.calculateTaxes();
          }

          // Update events
          const eventStore = useEventStore.getState();
          if (eventStore && typeof eventStore.updateEvents === 'function') {
            eventStore.updateEvents(deltaTime);
          }

          // Update research
          const researchStore = useResearchStore.getState();
          if (researchStore && typeof researchStore.updateResearch === 'function') {
            researchStore.updateResearch(deltaTime);
          }
        } catch (error) {
          console.error("Error in game loop:", error);
          // Optionally pause the game on critical errors
          // setPaused(true);
        }
      }, 16);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default browser shortcuts
      if (event.ctrlKey || event.metaKey) return;

      // UI toggles
      if (event.key === 'r' || event.key === 'R') {
        setShowResourcePanel(prev => !prev);
      }

      if (event.key === 'b' || event.key === 'B') {
        setShowBuildingPanel(prev => !prev);
      }

      if (event.key === 't' || event.key === 'T') {
        setShowResearchPanel(prev => !prev);
      }

      if (event.key === 'n' || event.key === 'N') {
        setShowNpcMetrics(prev => !prev);
      }

      if (event.key === 'm' || event.key === 'M') {
        setShowMapEditor(prev => !prev);
      }

      if (event.key === 'e' || event.key === 'E') {
        setShowEconomyPanel(prev => !prev);
      }

      if (event.key === 'v' || event.key === 'V') {
        setShowEventPanel(prev => !prev);
      }

      // Audio toggle
      if (event.key === 'u' || event.key === 'U') {
        if (isBackgroundMusicPlaying) {
          stopBackgroundMusic();
        } else {
          playBackgroundMusic();
        }
      }

      // Time control shortcuts
      if (event.key === 'p' || event.key === 'P') {
        const gameStore = useGameStore.getState();
        if (gameStore.isPaused) {
          gameStore.resumeTime();
        } else {
          gameStore.pauseTime();
        }
      }

      if (event.key === '[') {
        useGameStore.getState().decreaseTimeSpeed();
      }

      if (event.key === ']') {
        useGameStore.getState().increaseTimeSpeed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Event listeners for game interactions
    const handleNpcClick = (event: CustomEvent) => {
      setSelectedNpc(event.detail);
    };

    const handleHouseClick = (e: CustomEvent<{building: Building, npc: NPC | null, hasNpc: boolean}>) => {
      const { building, npc, hasNpc } = e.detail;

      if (hasNpc && npc) {
        // Se há NPC na casa, mostrar dados do NPC
        setSelectedNpc(npc);
      } else {
        // Se não há NPC, criar um NPC temporário para mostrar a casa
        const tempNpc: NPC = {
          id: `temp_${building.id}`,
          type: 'villager',
          homeId: building.id,
          position: [building.position[0] + 0.5, 0, building.position[1] + 0.5],
          targetPosition: null,
          targetBuildingId: null,
          targetResource: null,
          state: "idle",
          workProgress: 0,
          lastResourceTime: 0,
          lastMoveTime: Date.now(),
          stuckTimer: 0,
          isPlayerControlled: false,
          controlMode: "autonomous",
          inventory: { type: '', amount: 0 },
          needs: {
            energy: 100,
            satisfaction: 100,
            health: 100,
            hunger: 100
          },
          memory: {
            lastVisitedPositions: [],
            knownResources: [],
            failedAttempts: 0,
            lastTaskCompletion: Date.now(),
            efficiency: 1.0
          },
          currentSchedule: "home",
          name: `Casa ${building.type}`,
          skills: {
            gathering: 0,
            working: 0,
            efficiency: 0,
            experience: 0
          }
        };
        setSelectedNpc(tempNpc);
      }

      setShowNpcPanel(true); // Sempre abrir o painel
    };

    const handleSiloClick = (event: CustomEvent<Building>) => {
      const building = event.detail;
      setSelectedSiloId(building.id);
      setShowSiloPanel(true);
    };

    window.addEventListener('npcClick', handleNpcClick as EventListener);
    window.addEventListener('houseClick', handleHouseClick as EventListener);
    window.addEventListener('siloClick', handleSiloClick as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('npcClick', handleNpcClick as EventListener);
      window.removeEventListener('houseClick', handleHouseClick as EventListener);
      window.removeEventListener('siloClick', handleSiloClick as EventListener);
    };
  }, [isBackgroundMusicPlaying, playBackgroundMusic, stopBackgroundMusic]);

  // Format time display
  const formatTime = (cycle: number) => {
    const hours = Math.floor(cycle * 24);
    const minutes = Math.floor((cycle * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get time period
  const getTimePeriod = (cycle: number) => {
    const hours = cycle * 24;
    if (hours >= 6 && hours < 12) return "Manhã";
    if (hours >= 12 && hours < 18) return "Tarde";
    if (hours >= 18 && hours < 24) return "Noite";
    return "Madrugada";
  };

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-2 left-2 right-2 lg:top-4 lg:left-4 lg:right-4 z-10 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Left side - Game info */}
          <div className="bg-black/50 text-white p-2 lg:p-3 rounded-lg backdrop-blur-sm pointer-events-auto">
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="responsive-text">
                <div className="font-semibold">{formatTime(timeCycle)}</div>
                <div className="text-xs opacity-80">{getTimePeriod(timeCycle)}</div>
              </div>
              <div className="responsive-text">
                <div className="font-semibold">Velocidade: {timeSpeed.toFixed(1)}x</div>
                <div className="text-xs opacity-80">{isPaused ? "PAUSADO" : "RODANDO"}</div>
              </div>
            </div>
          </div>

          {/* Right side - Mode info */}
          <div className="bg-black/50 text-white p-2 lg:p-3 rounded-lg backdrop-blur-sm pointer-events-auto">
            <div className="responsive-text">
              <div className="font-semibold">Modo: {gameMode === "build" ? "Construção" : "Visualização"}</div>
              {isManualControl && controlledNpcId && (
                <div className="text-xs opacity-80">Controlando NPC: {controlledNpcId}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-2 left-2 right-2 lg:bottom-4 lg:left-4 lg:right-4 z-10 pointer-events-none">
        <div className="flex justify-center">
          <div className="bg-black/50 text-white p-2 lg:p-3 rounded-lg backdrop-blur-sm pointer-events-auto max-w-full overflow-x-auto">
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-1 lg:gap-2 text-xs min-w-max">
              <button
                onClick={() => setShowResourcePanel(!showResourcePanel)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showResourcePanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Recursos (R)
              </button>
              <button
                onClick={() => setShowBuildingPanel(!showBuildingPanel)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showBuildingPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Construções (B)
              </button>
              <button
                onClick={() => setShowResearchPanel(!showResearchPanel)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showResearchPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Pesquisa (T)
              </button>
              <button
                onClick={() => setShowEconomyPanel(!showEconomyPanel)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showEconomyPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Economia (E)
              </button>
              <button
                onClick={() => setShowEventPanel(!showEventPanel)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showEventPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Eventos (V)
              </button>
              <button
                onClick={() => setShowNpcMetrics(!showNpcMetrics)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showNpcMetrics ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Métricas (N)
              </button>
              <button
                onClick={() => setShowMapEditor(!showMapEditor)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showMapEditor ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Editor (M)
              </button>
              <button
                onClick={() => {
                  if (isBackgroundMusicPlaying) {
                    stopBackgroundMusic();
                  } else {
                    playBackgroundMusic();
                  }
                }}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${isBackgroundMusicPlaying ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700 transition-colors`}
              >
                Áudio (U)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panels */}
      <ResourcePanel isVisible={showResourcePanel} />
      <BuildingPanel isVisible={showBuildingPanel} />

      {/* Sistemas removidos: Market, Research, Economy, Events, MapEditor */}

      {showNpcMetrics && <NpcMetricsPanel />}
      <MapEditorPanel isVisible={showMapEditor} />

      {/* Sistemas removidos: Market, Research, Economy, Events, MapEditor */}

      {/* Other UI components */}
      {selectedNpc && (
        <NpcPanel npc={selectedNpc} onClose={() => setSelectedNpc(null)} />
      )}

      {showSeedSelection && (
        <SeedSelectionPanel
          isOpen={showSeedSelection}
          onClose={() => setShowSeedSelection(false)}
          onSeedSelect={(seedType) => {
            if (selectedNpcId) {
              updateNpc(selectedNpcId, {
                farmerData: {
                  ...(npcs.find(n => n.id === selectedNpcId)?.farmerData || {}),
                  selectedSeed: seedType
                }
              });
            }
            setShowSeedSelection(false);
          }}
        />
      )}

      {showSiloPanel && selectedSiloId && (
        <SiloPanel
          isOpen={showSiloPanel}
          onClose={() => {
            setShowSiloPanel(false);
            setSelectedSiloId(null);
          }}
          siloId={selectedSiloId}
        />
      )}

      {/* Painel de Eventos */}
      <EventPanel 
        isVisible={showEvents}
        onClose={() => setShowEvents(false)}
      />

      {/* Painel de Estatísticas do Dummy */}
      <DummyStatsPanel 
        isVisible={showDummyStats}
        onClose={() => setShowDummyStats(false)}
      />
    </>
  );
};

export default GameUI;