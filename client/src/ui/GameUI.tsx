import { useEffect, useState, useRef } from "react";
import { useGameStore, Controls } from "../game/stores/useGameStore";
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
import EventPanel from "./EventPanel";
const GameUI = () => {
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  const { timeOfDay, dayCount, isPaused, timeSpeed } = useGameStore();
  const [showControls, setShowControls] = useState(false);
  const [showBuildingPanel, setShowBuildingPanel] = useState(false);
  const [showResourcePanel, setShowResourcePanel] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<any>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const isMobile = useIsMobile();
  const { npcs, updateNpc } = useNpcStore();
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [showSeedSelection, setShowSeedSelection] = useState(false);
  const [showSiloPanel, setShowSiloPanel] = useState(false);
  const [selectedSiloId, setSelectedSiloId] = useState<string | null>(null);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [showEconomyPanel, setShowEconomyPanel] = useState(false);
  const [showResearchPanel, setShowResearchPanel] = useState(false);
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [showNpcMetrics, setShowNpcMetrics] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedNpc(null);
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

    const handleNpcClick = (event: CustomEvent) => {
      setSelectedNpc(event.detail);
    };

    const handleNpcHouseClick = (e: CustomEvent<Building>) => {
      const house = e.detail;
      const npc = useNpcStore.getState().npcs.find(n => n.homeId === house.id);
      if (npc) {
        setSelectedNpc(npc);
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
  }, []);

  // Play background music
  useEffect(() => {
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch((error) => {
        console.log("Background music autoplay prevented:", error);
      });
    }

    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [backgroundMusic, isMuted]);

  // Convert time of day to formatted time
  const getTimeString = () => {
    const gameStore = useGameStore.getState();
    const hours = Math.floor(gameStore.timeCycle * 24);
    const minutes = Math.floor((gameStore.timeCycle * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTimeOfDayName = () => {
    switch (timeOfDay) {
      case "dawn": return "amanhecer";
      case "day": return "dia";
      case "dusk": return "entardecer";
      case "night": return "noite";
      default: return "dia";
    }
  };

    // Update NPCs
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        // Update all game systems
        useNpcStore.getState().updateNPCs(0.016); // ~60 FPS
        useEconomyStore.getState().calculateTaxes();
        useEventStore.getState().updateEvents(0.016);
        useResearchStore.getState().updateResearch(0.016);
      }, 16);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  // Initialize systems
  useEffect(() => {
    useResourceStore.getState().initResources();
    useResearchStore.getState().initResearches();
  }, []);

  return (
    <>
      {/* Time Control */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg">
        <div className="text-sm">
          Dia {dayCount} - {getTimeString()} ({getTimeOfDayName()})
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              const gameStore = useGameStore.getState();
              if (gameStore.isPaused) {
                gameStore.resumeTime();
              } else {
                gameStore.pauseTime();
              }
            }}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            {isPaused ? "▶️" : "⏸️"}
          </button>
          <button
            onClick={() => useGameStore.getState().decreaseTimeSpeed()}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
          >
            -
          </button>
          <span className="px-2 py-1 text-xs">{timeSpeed}x</span>
          <button
            onClick={() => useGameStore.getState().increaseTimeSpeed()}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
          >
            +
          </button>
        </div>
      </div>

      {/* UI Panels */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setShowBuildingPanel(!showBuildingPanel)}
          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
        >
          Estruturas
        </button>
        <button
          onClick={() => setShowResearchPanel(!showResearchPanel)}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          Pesquisa
        </button>
        <button
          onClick={() => setShowEventPanel(!showEventPanel)}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
        >
          Eventos
        </button>
        <button
          onClick={() => setShowEconomyPanel(!showEconomyPanel)}
          className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
        >
          Economia
        </button>
        <button
          onClick={() => setShowNpcMetrics(!showNpcMetrics)}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
        >
          Métricas NPCs
        </button>
        <button
          onClick={() => setShowMapEditor(!showMapEditor)}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
        >
          Editor Mapa
        </button>
      </div>

      {/* Panels */}
      <ResourcePanel isVisible={showResourcePanel} />
      <BuildingPanel isVisible={showBuildingPanel} />
      
      {showResearchPanel && <ResearchPanel />}
      {showEventPanel && <EventPanel />}
      {showEconomyPanel && <EconomyPanel />}
      {showMetrics && <NpcMetricsPanel />}
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