import { useEffect, useState } from "react";
import { useAudio } from "../lib/stores/useAudio";
import { useGameStore } from "../game/stores/useGameStore";
import BuildingPanel from "./BuildingPanel";
import ResourcePanel from "./ResourcePanel";

const GameUI = () => {
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  const { timeOfDay, dayCount } = useGameStore();
  const [showControls, setShowControls] = useState(false);
  
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
    switch (timeOfDay) {
      case "dawn": return "06:00";
      case "day": return "12:00";
      case "dusk": return "18:00";
      case "night": return "00:00";
      default: return "12:00";
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
        <div>Day {dayCount}</div>
        <div>{getTimeString()} ({timeOfDay})</div>
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
            <h3 className="font-bold mb-2">Controls</h3>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div>Move Camera:</div>
              <div>W,A,S,D / Arrows</div>
              <div>Rotate Camera:</div>
              <div>Q, E</div>
              <div>Zoom:</div>
              <div>+, -</div>
              <div>Place Building:</div>
              <div>Space</div>
              <div>Cancel:</div>
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
    </div>
  );
};

export default GameUI;
