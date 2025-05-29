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
import MarketWindow from "./MarketWindow";
import NpcMetricsPanel from "./NpcMetricsPanel";
import SeedSelectionPanel from "./SeedSelectionPanel";
import SiloPanel from "./SiloPanel";
import MapEditorPanel from "./MapEditorPanel";
import ResearchPanel from "./ResearchPanel";
import EconomyPanel from "./EconomyPanel";

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

          // Update NPCs
          useNpcStore.getState().updateNPCs(deltaTime);

          // Update building production
          useBuildingStore.getState().updateProduction(Date.now());

          // Update economy
          useEconomyStore.getState().calculateTaxes();

          // Update events
          useEventStore.getState().updateEvents(deltaTime);

          // Update research
          useResearchStore.getState().updateResearch(deltaTime);
        } catch (error) {
          console.error("Error in game loop:", error);
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

    const handleNpcHouseClick = (e: CustomEvent<{npc: NPC, building: Building}>) => {
      const { npc } = e.detail;
      if (npc) {
        setSelectedNpc(npc);
        setShowNpcPanel(true); // Open NPC panel when house is clicked
      }
    };

    const handleSiloClick = (event: CustomEvent<Building>) => {
      const building = event.detail;
      setSelectedSiloId(building.id);
      setShowSiloPanel(true);
    };

    window.addEventListener('npcClick', handleNpcClick as EventListener);
    window.addEventListener('npcHouseClick', handleNpcHouseClick as EventListener);
    window.addEventListener('siloClick', handleSiloClick as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('npcClick', handleNpcClick as EventListener);
      window.removeEventListener('npcHouseClick', handleNpcHouseClick as EventListener);
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
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Left side - Game info */}
          <div className="bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm pointer-events-auto">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <div className="font-semibold">{formatTime(timeCycle)}</div>
                <div className="text-xs opacity-80">{getTimePeriod(timeCycle)}</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">Velocidade: {timeSpeed.toFixed(1)}x</div>
                <div className="text-xs opacity-80">{isPaused ? "PAUSADO" : "RODANDO"}</div>
              </div>
            </div>
          </div>

          {/* Right side - Mode info */}
          <div className="bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm pointer-events-auto">
            <div className="text-sm">
              <div className="font-semibold">Modo: {gameMode === "build" ? "Construção" : "Visualização"}</div>
              {isManualControl && controlledNpcId && (
                <div className="text-xs opacity-80">Controlando NPC: {controlledNpcId}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <div className="flex justify-center">
          <div className="bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm pointer-events-auto">
            <div className="grid grid-cols-8 gap-2 text-xs">
              <button
                onClick={() => setShowResourcePanel(!showResourcePanel)}
                className={`px-3 py-1 rounded ${showResourcePanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Recursos (R)
              </button>
              <button
                onClick={() => setShowBuildingPanel(!showBuildingPanel)}
                className={`px-3 py-1 rounded ${showBuildingPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Construções (B)
              </button>
              <button
                onClick={() => setShowResearchPanel(!showResearchPanel)}
                className={`px-3 py-1 rounded ${showResearchPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Pesquisa (T)
              </button>
              <button
                onClick={() => setShowEconomyPanel(!showEconomyPanel)}
                className={`px-3 py-1 rounded ${showEconomyPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Economia (E)
              </button>
              <button
                onClick={() => setShowEventPanel(!showEventPanel)}
                className={`px-3 py-1 rounded ${showEventPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Eventos (V)
              </button>
              <button
                onClick={() => setShowNpcMetrics(!showNpcMetrics)}
                className={`px-3 py-1 rounded ${showNpcMetrics ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
              >
                Métricas (N)
              </button>
              <button
                onClick={() => setShowMapEditor(!showMapEditor)}
                className={`px-3 py-1 rounded ${showMapEditor ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
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
                className={`px-3 py-1 rounded ${isBackgroundMusicPlaying ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700 transition-colors`}
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

      {showResearchPanel && <ResearchPanel />}
      {showEventPanel && <EventPanel />}
      {showEconomyPanel && <EconomyPanel />}
      {showNpcMetrics && <NpcMetricsPanel />}
      {showMapEditor && <MapEditorPanel isVisible={showMapEditor} />}

      {/* Market Window */}
      {showMarket && (
        <div className="absolute top-16 left-4 z-20">
          <MarketWindow />
        </div>
      )}

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
    </>
  );
};

export default GameUI;