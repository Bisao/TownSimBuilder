
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { KeyboardControls } from '@react-three/drei';
import { useGame } from '@/lib/stores/useGame';
import { useAudio } from '@/lib/stores/useAudio';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import World from '@/game/components/World';
import GameUI from '@/ui/GameUI';
import MarketWindow from '@/ui/MarketWindow';
import { ControlsEnum } from '@/game/types/controls';
import { buildingTypes } from '@/game/constants/buildings';

const controlsMap = [
  { name: ControlsEnum.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: ControlsEnum.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: ControlsEnum.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: ControlsEnum.right, keys: ['KeyD', 'ArrowRight'] },
  { name: ControlsEnum.jump, keys: ['Space'] },
  { name: ControlsEnum.run, keys: ['ShiftLeft'] },
  { name: ControlsEnum.crouch, keys: ['KeyC'] },
  { name: ControlsEnum.interact, keys: ['KeyE'] },
  { name: ControlsEnum.inventory, keys: ['KeyI'] },
  { name: ControlsEnum.pause, keys: ['Escape'] },
  ...buildingTypes.map((building, index) => ({
    name: `building_${building.id}` as ControlsEnum,
    keys: [(index + 1).toString()]
  }))
];

export default function GamePage() {
  const navigate = useNavigate();
  const { phase } = useGame();
  const { initializeAudio } = useAudio();

  useEffect(() => {
    // Verifica se o jogador está logado
    if (phase === 'login') {
      navigate('/');
      return;
    }

    // Inicializa o sistema de áudio
    initializeAudio();
  }, [phase, navigate, initializeAudio]);

  if (phase === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <KeyboardControls map={controlsMap}>
        <div className="relative h-full w-full">
          {/* 3D Canvas */}
          <Canvas
            shadows
            camera={{
              position: [0, 10, 10],
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance"
            }}
            style={{ background: '#1a1a1a' }}
          >
            <Suspense fallback={null}>
              <World />
            </Suspense>
          </Canvas>

          {/* Game UI Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="pointer-events-auto">
              <GameUI />
              <MarketWindow />
            </div>
          </div>

          {/* Loading Overlay */}
          <Suspense fallback={
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }>
            <div /> {/* Empty div to trigger Suspense */}
          </Suspense>
        </div>
      </KeyboardControls>
    </div>
  );
}
