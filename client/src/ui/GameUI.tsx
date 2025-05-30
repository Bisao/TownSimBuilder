import { useEffect, useState, useRef, useCallback } from "react";
import { useGameStore } from "../game/stores/useGameStore";
import { Controls } from "../game/types/controls";
import { useResourceStore } from "../game/stores/useResourceStore";
import { useBuildingStore } from "../game/stores/useBuildingStore";
import { useNpcStore } from "../game/stores/useNpcStore";
import { useAudio } from "../lib/stores/useAudio";
import { Building } from "../game/stores/useBuildingStore";
import ResourcePanel from "./ResourcePanel";
import BuildingPanel from "./BuildingPanel";
import NpcPanel from "./NpcPanel";
import { useKeyboardControls } from "@react-three/drei";
import { NPC } from "../game/stores/useNpcStore";
import { useIsMobile } from "../hooks/use-is-mobile";
import NpcMetricsPanel from "./NpcMetricsPanel";
import SeedSelectionPanel from "./SeedSelectionPanel";
import SiloPanel from "./SiloPanel";
import CombatPanel from "./CombatPanel";
import DummyStatsPanel from "./DummyStatsPanel";
import { useDraggable } from "../hooks/useDraggable";

const GameUI = () => {
  // Game stores
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
  const isMobile = useIsMobile();

  // UI State
  const [showResourcePanel, setShowResourcePanel] = useState(true);
  const [showBuildingPanel, setShowBuildingPanel] = useState(true);
  const [showNpcMetrics, setShowNpcMetrics] = useState(false);
  const [showSeedSelection, setShowSeedSelection] = useState(false);
  const [showSiloPanel, setShowSiloPanel] = useState(false);
  const [showNpcPanel, setShowNpcPanel] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [showDummyStats, setShowDummyStats] = useState(false);

  // Selection state
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [selectedSiloId, setSelectedSiloId] = useState<string | null>(null);
  const [selectedCombatEntityId, setSelectedCombatEntityId] = useState<string | null>(null);

  // Refs for cleanup
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Error handling state
  const [errors, setErrors] = useState<string[]>([]);

  // Game initialization with error handling
  useEffect(() => {
    if (isInitializedRef.current) return;

    const initializeSystems = async () => {
      try {
        console.log("Initializing game systems...");

        // Initialize resource store with error handling
        const resourceStore = useResourceStore.getState();
        if (resourceStore && typeof resourceStore.initResources === 'function') {
          resourceStore.initResources();
        } else {
          console.warn("Resource store initialization method not available");
        }

        isInitializedRef.current = true;
        console.log("Game systems initialized successfully");
        
        // Initialize audio system
        initAudio();
      } catch (error) {
        console.error("Error initializing game systems:", error);
        setErrors(prev => [...prev, "Failed to initialize game systems"]);
      }
    };

    initializeSystems();
  }, []);

  // Optimized game loop with better error handling
  useEffect(() => {
    if (isPaused || !isInitializedRef.current) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const updateGameSystems = () => {
      try {
        const deltaTime = 0.016; // ~60 FPS
        const currentTime = Date.now();

        // Update NPCs with safety checks
        const npcStore = useNpcStore.getState();
        if (npcStore && typeof npcStore.updateNPCs === 'function') {
          npcStore.updateNPCs(deltaTime);
        }

        // Update building production with safety checks
        const buildingStore = useBuildingStore.getState();
        if (buildingStore && typeof buildingStore.updateProduction === 'function') {
          buildingStore.updateProduction(currentTime);
        }

        // Clear old errors
        setErrors([]);
      } catch (error) {
        console.error("Error in game loop:", error);
        setErrors(prev => [...prev.slice(-4), `Game loop error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      }
    };

    gameLoopRef.current = setInterval(updateGameSystems, 16);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isPaused]);

  // Keyboard shortcuts with improved error handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    try {
      // Prevent default browser shortcuts
      if (event.ctrlKey || event.metaKey) return;

      switch (event.key.toLowerCase()) {
        case 'r':
          setShowResourcePanel(prev => !prev);
          break;
        case 'b':
          setShowBuildingPanel(prev => !prev);
          break;
        case 'n':
          setShowNpcMetrics(prev => !prev);
          break;
        case 'u':
          toggleMute();
          break;
        case 'p':
          const gameStore = useGameStore.getState();
          if (gameStore) {
            if (gameStore.isPaused) {
              gameStore.resumeTime();
            } else {
              gameStore.pauseTime();
            }
          }
          break;
        case '[':
          useGameStore.getState()?.decreaseTimeSpeed?.();
          break;
        case ']':
          useGameStore.getState()?.increaseTimeSpeed?.();
          break;
        case 'escape':
          // Close all panels
          setSelectedNpc(null);
          setShowNpcPanel(false);
          setShowSiloPanel(false);
          setShowSeedSelection(false);
          setShowCombat(false);
          setShowDummyStats(false);
          break;
      }
    } catch (error) {
      console.error("Error handling keyboard shortcut:", error);
      setErrors(prev => [...prev.slice(-4), `Keyboard error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  }, [toggleMute]);

  // Game event handlers
  const handleNpcClick = useCallback((event: CustomEvent) => {
    try {
      setSelectedNpc(event.detail);
      setShowNpcPanel(true);
    } catch (error) {
      console.error("Error handling NPC click:", error);
    }
  }, []);

  const handleHouseClick = useCallback((e: CustomEvent<{building: Building, npc: NPC | null, hasNpc: boolean}>) => {
    try {
      const { building, npc, hasNpc } = e.detail;

      if (hasNpc && npc) {
        setSelectedNpc(npc);
      } else {
        // Create temporary NPC for house display
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
          },
          currentLevel: 1,
          equipment: {}
        };
        setSelectedNpc(tempNpc);
      }

      setShowNpcPanel(true);
    } catch (error) {
      console.error("Error handling house click:", error);
    }
  }, []);

  const handleSiloClick = useCallback((event: CustomEvent<Building>) => {
    try {
      const building = event.detail;
      setSelectedSiloId(building.id);
      setShowSiloPanel(true);
    } catch (error) {
      console.error("Error handling silo click:", error);
    }
  }, []);

  const handleCombatStart = useCallback((event: CustomEvent<{entityId: string}>) => {
    try {
      const { entityId } = event.detail;
      setSelectedCombatEntityId(entityId);
      setShowCombat(true);
    } catch (error) {
      console.error("Error handling combat start:", error);
    }
  }, []);

  // Event listeners setup
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('npcClick', handleNpcClick as EventListener);
    window.addEventListener('houseClick', handleHouseClick as EventListener);
    window.addEventListener('siloClick', handleSiloClick as EventListener);
    window.addEventListener('combatStart', handleCombatStart as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('npcClick', handleNpcClick as EventListener);
      window.removeEventListener('houseClick', handleHouseClick as EventListener);
      window.removeEventListener('siloClick', handleSiloClick as EventListener);
      window.removeEventListener('combatStart', handleCombatStart as EventListener);
    };
  }, [handleKeyDown, handleNpcClick, handleHouseClick, handleSiloClick, handleCombatStart]);

  // Utility functions
  const formatTime = useCallback((cycle: number) => {
    const hours = Math.floor(cycle * 24);
    const minutes = Math.floor((cycle * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, []);

  const getTimePeriod = useCallback((cycle: number) => {
    const hours = cycle * 24;
    if (hours >= 6 && hours < 12) return "Manhã";
    if (hours >= 12 && hours < 18) return "Tarde";
    if (hours >= 18 && hours < 24) return "Noite";
    return "Madrugada";
  }, []);

  const handleSeedSelect = useCallback((seedType: string) => {
    try {
      if (selectedNpcId) {
        const targetNpc = npcs.find(n => n.id === selectedNpcId);
        if (targetNpc) {
          updateNpc(selectedNpcId, {
            farmerData: {
              ...(targetNpc.farmerData || {}),
              selectedSeed: seedType
            }
          });
        }
      }
      setShowSeedSelection(false);
    } catch (error) {
      console.error("Error selecting seed:", error);
    }
  }, [selectedNpcId, npcs, updateNpc]);

  const closeSiloPanel = useCallback(() => {
    setShowSiloPanel(false);
    setSelectedSiloId(null);
  }, []);

  const closeNpcPanel = useCallback(() => {
    setSelectedNpc(null);
    setShowNpcPanel(false);
  }, []);

  const closeCombatPanel = useCallback(() => {
    setShowCombat(false);
    setSelectedCombatEntityId(null);
  }, []);

  return (
    <>
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="absolute top-16 right-4 z-50 bg-red-900/90 text-white p-3 rounded-lg max-w-md">
          <h4 className="font-bold text-sm mb-2">Errors:</h4>
          {errors.map((error, index) => (
            <p key={index} className="text-xs mb-1">{error}</p>
          ))}
          <button 
            onClick={() => setErrors([])}
            className="text-xs bg-red-700 px-2 py-1 rounded mt-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Top HUD */}
      <div className="absolute top-1 left-1 right-1 sm:top-2 sm:left-2 sm:right-2 lg:top-4 lg:left-4 lg:right-4 z-10 pointer-events-none">
        <div className="flex justify-between items-start gap-2">
          {/* Left side - Game info */}
          <div className="bg-black/50 text-white p-1.5 sm:p-2 lg:p-3 rounded-lg backdrop-blur-sm pointer-events-auto min-w-0 flex-1 max-w-[45%]">
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <div className="responsive-text min-w-0">
                <div className="font-semibold truncate">{formatTime(timeCycle)}</div>
                <div className="text-[10px] sm:text-xs opacity-80 truncate">{getTimePeriod(timeCycle)}</div>
              </div>
              <div className="responsive-text min-w-0">
                <div className="font-semibold truncate">Vel: {timeSpeed.toFixed(1)}x</div>
                <div className="text-[10px] sm:text-xs opacity-80 truncate">{isPaused ? "PAUSADO" : "RODANDO"}</div>
              </div>
            </div>
          </div>

          {/* Right side - Mode info */}
          <div className="bg-black/50 text-white p-1.5 sm:p-2 lg:p-3 rounded-lg backdrop-blur-sm pointer-events-auto min-w-0 flex-1 max-w-[45%]">
            <div className="responsive-text min-w-0">
              <div className="font-semibold truncate">Modo: {gameMode === "build" ? "Construção" : "Visualização"}</div>
              {isManualControl && controlledNpcId && (
                <div className="text-[10px] sm:text-xs opacity-80 truncate">Controlando: {controlledNpcId}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player Info Panel - Above Skills */}
      {selectedNpc && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none max-w-[95vw]">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1 sm:py-2 border border-gray-600 pointer-events-auto">
            <div className="flex items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm overflow-x-auto">
              {/* NPC Avatar and Name */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white/30">
                  <i className="fa-solid fa-user text-white text-[10px] sm:text-xs"></i>
                </div>
                <span className="font-semibold truncate max-w-20 sm:max-w-none">{selectedNpc.name}</span>
              </div>

              {/* Level */}
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-star text-yellow-400"></i>
                <span>Nv. {selectedNpc.currentLevel}</span>
              </div>

              {/* Health */}
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-heart text-red-400"></i>
                <span>{selectedNpc.currentHealth}/{selectedNpc.maxHealth}</span>
              </div>

              {/* Energy */}
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-bolt text-blue-400"></i>
                <span>{selectedNpc.currentEnergy}/{selectedNpc.maxEnergy}</span>
              </div>

              {/* Fame Points */}
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-trophy text-yellow-400"></i>
                <span>{selectedNpc.famePoints || 0}</span>
              </div>

              {/* Current Activity */}
              {selectedNpc.currentActivity && (
                <div className="flex items-center gap-1">
                  <i className="fa-solid fa-cog text-green-400 animate-spin"></i>
                  <span className="text-green-300">{selectedNpc.currentActivity}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skills Bar */}
      <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto overflow-x-auto max-w-[95vw] px-2">
          {/* Skill buttons with circular design similar to Albion Online */}
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative flex-shrink-0">
            <i className="fa-solid fa-axe text-white text-sm sm:text-lg"></i>
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-5 sm:h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-[8px] sm:text-xs text-white font-bold">Q</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Machado de Lenhador
            </div>
          </div>

          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-b from-orange-500 to-red-600 rounded-full border-2 border-orange-400 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative flex-shrink-0">
            <i className="fa-solid fa-fire text-white text-sm sm:text-lg"></i>
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-5 sm:h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-[8px] sm:text-xs text-white font-bold">W</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Bola de Fogo
            </div>
          </div>

          <div className="w-12 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative">
            <i className="fa-solid fa-sword text-white text-lg"></i>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-xs text-white font-bold">E</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Espada
            </div>
          </div>

          <div className="w-12 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative">
            <i className="fa-solid fa-shield text-white text-lg"></i>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-xs text-white font-bold">R</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Escudo
            </div>
          </div>

          <div className="w-12 h-12 bg-gradient-to-b from-green-500 to-green-700 rounded-full border-2 border-green-400 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative">
            <i className="fa-solid fa-leaf text-white text-lg"></i>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-xs text-white font-bold">T</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Cura Natural
            </div>
          </div>

          <div className="w-12 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative">
            <i className="fa-solid fa-pickaxe text-white text-lg"></i>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-xs text-white font-bold">Y</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Picareta de Mineração
            </div>
          </div>

          <div className="w-12 h-12 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full border-2 border-blue-400 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative">
            <i className="fa-solid fa-wind text-white text-lg"></i>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-xs text-white font-bold">U</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Velocidade do Vento
            </div>
          </div>

          <div className="w-12 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative">
            <i className="fa-solid fa-user text-white text-lg"></i>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-xs text-white font-bold">I</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Personagem
            </div>
          </div>

          <div className="w-12 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative">
            <i className="fa-solid fa-tools text-white text-lg"></i>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-xs text-white font-bold">O</span>
            </div>
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Ferramentas
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel - moved higher */}
      <div className="absolute bottom-12 sm:bottom-16 lg:bottom-20 left-1 right-1 sm:left-2 sm:right-2 lg:left-4 lg:right-4 z-10 pointer-events-none">
        <div className="flex justify-center">
          <div className="bg-black/50 text-white p-1 sm:p-2 lg:p-3 rounded-lg backdrop-blur-sm pointer-events-auto max-w-full overflow-x-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-2 text-[10px] sm:text-xs min-w-max">
              <button
                onClick={() => setShowResourcePanel(!showResourcePanel)}
                className={`px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded whitespace-nowrap ${showResourcePanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
                title="Toggle Resource Panel (R)"
              >
                <span className="sm:hidden">Rec</span>
                <span className="hidden sm:inline">Recursos (R)</span>
              </button>
              <button
                onClick={() => setShowBuildingPanel(!showBuildingPanel)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showBuildingPanel ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
                title="Toggle Building Panel (B)"
              >
                Construções (B)
              </button>
              <button
                onClick={() => setShowNpcMetrics(!showNpcMetrics)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showNpcMetrics ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}
                title="Toggle NPC Metrics (N)"
              >
                Métricas (N)
              </button>
              <button
                onClick={toggleMute}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${!isMuted ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700 transition-colors`}
                title="Toggle Audio (U)"
              >
                Áudio (U)
              </button>
              <button
                onClick={() => setShowDummyStats(!showDummyStats)}
                className={`px-2 lg:px-3 py-1 rounded whitespace-nowrap responsive-text ${showDummyStats ? 'bg-purple-600' : 'bg-gray-600'} hover:bg-purple-700 transition-colors`}
                title="Toggle Dummy Stats"
              >
                Dummy Stats
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panels */}
      {showResourcePanel && <ResourcePanel isVisible={showResourcePanel} />}
      {showBuildingPanel && <BuildingPanel isVisible={showBuildingPanel} />}
      {showNpcMetrics && <NpcMetricsPanel />}

      {/* Modal Panels */}
      {selectedNpc && showNpcPanel && (
        <NpcPanel npc={selectedNpc} onClose={closeNpcPanel} />
      )}

      {showSeedSelection && (
        <SeedSelectionPanel
          isOpen={showSeedSelection}
          onClose={() => setShowSeedSelection(false)}
          onSeedSelect={handleSeedSelect}
        />
      )}

      {showSiloPanel && selectedSiloId && (
        <SiloPanel
          isOpen={showSiloPanel}
          onClose={closeSiloPanel}
          siloId={selectedSiloId}
        />
      )}

      {showCombat && selectedCombatEntityId && (
        <CombatPanel
          entityId={selectedCombatEntityId}
          onClose={closeCombatPanel}
        />
      )}

      {showDummyStats && (
        <DummyStatsPanel 
          isVisible={showDummyStats}
          onClose={() => setShowDummyStats(false)}
        />
      )}
    </>
  );
};

export default GameUI;