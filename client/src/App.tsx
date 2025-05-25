import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from '@react-three/drei';
import { useAudio } from "./lib/stores/useAudio";
import World from './game/components/World';
import GameUI from './ui/GameUI';
import MarketWindow from './ui/MarketWindow';
import { Controls } from './game/stores/useGameStore';
import "@fontsource/inter";
import { Building } from './game/stores/useBuildingStore';

type BuildingType = {
  name: string;
  cost: number;
  description: string;
};

function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const { setBackgroundMusic } = useAudio();
  const [selectedMarket, setSelectedMarket] = useState<BuildingType | null>(null);

  // Define keyboard controls mapping
  const keyboardMap = [
    { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
    { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
    { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
    { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
    { name: Controls.zoomIn, keys: ["Equal", "NumpadAdd", "BracketRight"] },
    { name: Controls.zoomOut, keys: ["Minus", "NumpadSubtract", "BracketLeft"] },
    { name: Controls.rotateCW, keys: ["KeyE"] },
    { name: Controls.rotateCCW, keys: ["KeyQ"] },
    { name: Controls.place, keys: ["Space"] },
    { name: Controls.cancel, keys: ["Escape"] },
  ];

  // Load audio assets
  useEffect(() => {
    // Create and set the background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    // Criar sons de efeitos
    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.5;

    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.5;

    // Set sound effects
    useAudio.getState().setHitSound(hitSound);
    useAudio.getState().setSuccessSound(successSound);

    console.log("Sistema de áudio inicializado");

    // Show the canvas once everything is loaded
    setShowCanvas(true);
  }, []);

  if (!showCanvas) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{
            position: [20, 20, 20],
            fov: 50,
            near: 0.1,
            far: 1000,
          }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#87CEEB"]} />
          <Suspense fallback={null}>
            <World onMarketSelect={(building) => setSelectedMarket(building)} />
          </Suspense>
        </Canvas>
        <GameUI />
        <MarketWindow
          isOpen={selectedMarket !== null}
          onClose={() => setSelectedMarket(null)}
        />
      </KeyboardControls>
    </div>
  );
}

export default App;