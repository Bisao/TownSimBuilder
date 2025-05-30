import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from '@react-three/drei';
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import World from './game/components/World';
import GameUI from './ui/GameUI';
import MarketWindow from './ui/MarketWindow';
import { ControlsEnum } from './game/types/controls';
import { buildingTypes, BuildingType } from './game/constants/buildings';
import { Interface } from './components/ui/interface';
import "@fontsource/inter";

// Texture verification utility
const verifyTextures = async () => {
  const textureUrls = ['/textures/wood.jpg', '/textures/grass.png'];

  for (const url of textureUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Texture not found: ${url}`);
      }
    } catch (error) {
      console.warn(`Failed to verify texture: ${url}`, error);
    }
  }
};

function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const { setBackgroundMusic } = useAudio();
  const [selectedMarket, setSelectedMarket] = useState<BuildingType | null>(null);
  const { phase, playerData } = useGame();

  // Define keyboard controls mapping
  const keyboardMap = [
    { name: ControlsEnum.forward, keys: ["ArrowUp", "KeyW"] },
    { name: ControlsEnum.backward, keys: ["ArrowDown", "KeyS"] },
    { name: ControlsEnum.leftward, keys: ["ArrowLeft", "KeyA"] },
    { name: ControlsEnum.rightward, keys: ["ArrowRight", "KeyD"] },
    { name: ControlsEnum.zoomIn, keys: ["Equal", "NumpadAdd"] },
    { name: ControlsEnum.zoomOut, keys: ["Minus", "NumpadSubtract"] },
    { name: ControlsEnum.rotateCW, keys: ["KeyE"] },
    { name: ControlsEnum.rotateCCW, keys: ["KeyQ"] },
    { name: ControlsEnum.place, keys: ["Space"] },
    { name: ControlsEnum.cancel, keys: ["Escape"] },
    { name: ControlsEnum.pauseTime, keys: ["KeyP"] },
    { name: ControlsEnum.increaseTimeSpeed, keys: ["BracketRight"] },
    { name: ControlsEnum.decreaseTimeSpeed, keys: ["BracketLeft"] },
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

  // Se não estiver na fase de playing, usar Interface para gerenciar login/ended
  if (phase !== "playing") {
    return <Interface />;
  }

  // Renderizar o jogo 3D
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