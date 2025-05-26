import { useEffect, useState, useRef } from "react";
import { useGameStore, Controls } from "../game/stores/useGameStore";
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
const GameUI = () => {
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  const { timeOfDay, dayCount, isPaused, timeSpeed } = useGameStore();
  const [showControls, setShowControls] = useState(false);
  const [showBuildingPanel, setShowBuildingPanel] = useState(false);
  const [showResourcePanel, setShowResourcePanel] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const isMobile = useIsMobile();

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

    window.addEventListener('npcClick', handleNpcClick as EventListener);
    window.addEventListener('npcHouseClick', handleNpcHouseClick as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('npcClick', handleNpcClick as EventListener);
      window.removeEventListener('npcHouseClick', handleNpcHouseClick as EventListener);
    };
  }, []);

  // Play background music
  useEffect(() => {
    if (backgroundMusic) {
      backgroundMusic.play().catch((error) => {
        console.log("Background music autoplay prevented:", error);
      });
    }

    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [backgroundMusic]);

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

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 flex gap-2 pointer-events-auto">
        <button
          onClick={() => setShowBuildingPanel(!showBuildingPanel)}
          className="bg-black/80 text-white p-2 rounded-lg"
          title="Painel de Construção"
        >
          <i className="fa-solid fa-hammer"></i>
        </button>
        <button
          onClick={() => setShowResourcePanel(!showResourcePanel)}
          className="bg-black/80 text-white p-2 rounded-lg"
          title="Painel de Recursos"
        >
          <i className="fa-solid fa-box"></i>
        </button>
      </div>
      <ResourcePanel isVisible={showResourcePanel} />
      <div className="pointer-events-auto">
        <BuildingPanel isVisible={showBuildingPanel} />
      </div>
      <div className="absolute top-4 right-4 pointer-events-auto">
        {/* Time display panel */}
        <div className="bg-black/80 rounded-lg p-2 text-white mb-2">
          <div>Dia {dayCount}</div>
          <div>{getTimeString()} ({getTimeOfDayName()})</div>
        </div>
        
        {/* Time control buttons */}
        <div className="bg-black/80 rounded-lg p-2 text-white flex gap-1">
          <button
            onClick={() => {
              const gameStore = useGameStore.getState();
              if (gameStore.isPaused) {
                gameStore.resumeTime();
              } else {
                gameStore.pauseTime();
              }
            }}
            className={`${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} px-2 py-1 rounded text-sm transition-colors`}
            title={isPaused ? "Continuar (P)" : "Pausar (P)"}
          >
            {isPaused ? "▶️" : "⏸️"}
          </button>
          
          <button
            onClick={() => useGameStore.getState().decreaseTimeSpeed()}
            className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-sm transition-colors"
            title="Diminuir velocidade ([)"
          >
            ⬇️
          </button>
          
          <button
            onClick={() => useGameStore.getState().increaseTimeSpeed()}
            className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-sm transition-colors"
            title="Aumentar velocidade (])"
          >
            ⬆️
          </button>
        </div>
        
        {/* Speed indicator */}
        <div className="bg-black/80 rounded-lg p-2 text-white text-center text-sm mt-1">
          {isPaused ? "PAUSADO" : `${timeSpeed}x`}
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <button 
          className="bg-black/80 text-white p-2 rounded-full"
          onClick={() => setShowControls(!showControls)}
        >
          <i className="fa-solid fa-keyboard"></i>
        </button>
        {showControls && (
          <div className="absolute bottom-12 right-0 bg-black/80 rounded-lg p-3 text-white w-64">
            <h3 className="font-bold mb-2">Controles</h3>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div>Mover Câmera:</div>
              <div>W,A,S,D / Setas</div>
              <div>Girar Câmera:</div>
              <div>Q, E</div>
              <div>Zoom:</div>
              <div>+, -</div>
              <div>Colocar Edifício:</div>
              <div>Espaço</div>
              <div>Cancelar:</div>
              <div>Esc</div>
              <div>Pausar/Continuar:</div>
              <div>P</div>
              <div>Velocidade Tempo:</div>
              <div>[ ]</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute top-4 left-64 flex gap-2 pointer-events-auto">
        <button 
          onClick={toggleMute}
          className="bg-black/80 p-2 rounded-lg text-white"
          title={isMuted ? "Ativar som" : "Silenciar"}
        >
          <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
        </button>
        <button 
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG' }))}
          className="bg-black/80 p-2 rounded-lg text-white"
          title="Alternar Grid (G)"
        >
          <i className="fa-solid fa-grid-2"></i>
        </button>
      </div>
      {selectedNpc && (
        <NpcPanel npc={selectedNpc} onClose={() => setSelectedNpc(null)} />
      )}
    </div>
  );
};

export default GameUI;