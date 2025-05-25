import { useEffect, useState } from "react";
import { useAudio } from "../lib/stores/useAudio";
import { useGameStore } from "../game/stores/useGameStore";
import BuildingPanel from "./BuildingPanel";
import ResourcePanel from "./ResourcePanel";
import NpcPanel from "./NpcPanel";
import { NPC } from "../game/stores/useNpcStore";

const GameUI = () => {
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  const { timeOfDay, dayCount } = useGameStore();
  const [showControls, setShowControls] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);

  useEffect(() => {
    const handleNpcClick = (event: CustomEvent) => {
      setSelectedNpc(event.detail);
    };

    window.addEventListener('npcClick', handleNpcClick as EventListener);
    return () => window.removeEventListener('npcClick', handleNpcClick as EventListener);
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
    const timeCycle = useGameStore.getState().timeCycle;
    // Converter o ciclo (0-1) para horas (0-24)
    const hours = Math.floor(timeCycle * 24);
    const minutes = Math.floor((timeCycle * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Traduzir o período do dia
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
      {/* Resource Panel */}
      <ResourcePanel />
      
      {/* Building Panel */}
      <div className="pointer-events-auto">
        <BuildingPanel />
      </div>
      
      {/* Time display */}
      <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-2 text-white">
        <div>Dia {dayCount}</div>
        <div>{getTimeString()} ({getTimeOfDayName()})</div>
      </div>
      
      {/* Controls button and panel */}
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
              <div>+, -, [ ]</div>
              <div>Colocar Edifício:</div>
              <div>Espaço</div>
              <div>Cancelar:</div>
              <div>Esc</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Sound toggle */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-32 bg-black/80 p-2 rounded-lg text-white pointer-events-auto"
      >
        <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
      </button>
    {/* NPC Panel */}
      <NpcPanel npc={selectedNpc} onClose={() => setSelectedNpc(null)} />
    </div>
  );
};

export default GameUI;
