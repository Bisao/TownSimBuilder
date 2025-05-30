
import React, { Suspense, useEffect, useState, memo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Preload } from '@react-three/drei';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { HooksErrorBoundary } from '@/components/ui/hooks-error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAudio } from '@/lib/stores/useAudio';
import { useGame } from '@/lib/stores/useGame';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { Interface } from '@/components/ui/interface';
import { NotificationContainer } from '@/ui/NotificationContainer';
import World from '@/game/components/World';
import GameUI from '@/ui/GameUI';
import MarketWindow from '@/ui/MarketWindow';
import { ControlsEnum } from '@/game/types/controls';
import { BuildingType } from '@/game/constants/buildings';
import { GAME_CONFIG } from '@shared/constants/game';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Keyboard controls configuration
const KEYBOARD_MAP = [
  { name: ControlsEnum.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: ControlsEnum.backward, keys: ['ArrowDown', 'KeyS'] },
  { name: ControlsEnum.leftward, keys: ['ArrowLeft', 'KeyA'] },
  { name: ControlsEnum.rightward, keys: ['ArrowRight', 'KeyD'] },
  { name: ControlsEnum.zoomIn, keys: ['Equal', 'NumpadAdd'] },
  { name: ControlsEnum.zoomOut, keys: ['Minus', 'NumpadSubtract'] },
  { name: ControlsEnum.rotateCW, keys: ['KeyE'] },
  { name: ControlsEnum.rotateCCW, keys: ['KeyQ'] },
  { name: ControlsEnum.place, keys: ['Space'] },
  { name: ControlsEnum.cancel, keys: ['Escape'] },
  { name: ControlsEnum.pauseTime, keys: ['KeyP'] },
  { name: ControlsEnum.increaseTimeSpeed, keys: ['BracketRight'] },
  { name: ControlsEnum.decreaseTimeSpeed, keys: ['BracketLeft'] },
] as const;

// Canvas configuration
const CANVAS_CONFIG = {
  shadows: true,
  camera: {
    position: [20, 20, 20] as [number, number, number],
    fov: 50,
    near: 0.1,
    far: 1000,
  },
  gl: {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance' as const,
  },
} as const;

// Audio assets configuration
const AUDIO_ASSETS = {
  background: {
    src: '/sounds/background.mp3',
    loop: true,
    volume: 0.3,
  },
  hit: {
    src: '/sounds/hit.mp3',
    volume: 0.5,
  },
  success: {
    src: '/sounds/success.mp3',
    volume: 0.5,
  },
} as const;

// Loading component
const LoadingScreen = memo(() => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-primary">
    <div className="text-center space-y-4">
      <LoadingSpinner className="w-12 h-12 mx-auto" />
      <div className="text-xl font-semibold text-white">
        Carregando jogo...
      </div>
      <div className="text-sm text-white/80">
        Preparando o mundo virtual
      </div>
    </div>
  </div>
));

LoadingScreen.displayName = 'LoadingScreen';

// Error fallback component
const ErrorFallback = memo(({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-red-50">
    <div className="text-center space-y-4 p-8 max-w-md">
      <div className="text-2xl font-bold text-red-600">
        Oops! Algo deu errado
      </div>
      <div className="text-gray-600">
        {error.message || 'Erro inesperado no jogo'}
      </div>
      <button
        onClick={resetError}
        className="btn btn-primary"
      >
        Tentar novamente
      </button>
    </div>
  </div>
));

ErrorFallback.displayName = 'ErrorFallback';

// Game canvas component
const GameCanvas = memo(({ onMarketSelect }: { onMarketSelect: (building: BuildingType | null) => void }) => (
  <Canvas {...CANVAS_CONFIG}>
    <color attach="background" args={['#87CEEB']} />
    <Suspense fallback={null}>
      <World onMarketSelect={onMarketSelect} />
      <Preload all />
    </Suspense>
  </Canvas>
));

GameCanvas.displayName = 'GameCanvas';

// Audio hook
const useAudioSetup = () => {
  const audioStore = useAudio();
  const notificationStore = useNotificationStore();
  
  // Safety guards
  if (!audioStore || !notificationStore) {
    console.warn('Audio or notification store not available');
    return;
  }
  
  const { setBackgroundMusic, setHitSound, setSuccessSound } = audioStore;
  const { addNotification } = notificationStore;

  useEffect(() => {
    const loadAudio = async () => {
      try {
        // Background music
        const bgMusic = new Audio(AUDIO_ASSETS.background.src);
        bgMusic.loop = AUDIO_ASSETS.background.loop;
        bgMusic.volume = AUDIO_ASSETS.background.volume;
        setBackgroundMusic(bgMusic);

        // Sound effects
        const hitSound = new Audio(AUDIO_ASSETS.hit.src);
        hitSound.volume = AUDIO_ASSETS.hit.volume;
        setHitSound(hitSound);

        const successSound = new Audio(AUDIO_ASSETS.success.src);
        successSound.volume = AUDIO_ASSETS.success.volume;
        setSuccessSound(successSound);

        console.log('Sistema de áudio inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao carregar áudio:', error);
        addNotification({
          id: Date.now().toString(),
          type: 'warning',
          title: 'Áudio',
          message: 'Não foi possível carregar alguns arquivos de áudio',
          duration: 5000,
        });
      }
    };

    loadAudio();
  }, [setBackgroundMusic, setHitSound, setSuccessSound, addNotification]);
};

// Game component
const Game = memo(() => {
  const [selectedMarket, setSelectedMarket] = useState<BuildingType | null>(null);

  const handleMarketSelect = useCallback((building: BuildingType | null) => {
    setSelectedMarket(building);
  }, []);

  const handleMarketClose = useCallback(() => {
    setSelectedMarket(null);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <KeyboardControls map={KEYBOARD_MAP}>
        <ErrorBoundary
          fallback={ErrorFallback}
          onError={(error) => {
            console.error('Erro no canvas 3D:', error);
          }}
        >
          <GameCanvas onMarketSelect={handleMarketSelect} />
        </ErrorBoundary>
        
        <GameUI />
        
        <MarketWindow
          isOpen={selectedMarket !== null}
          onClose={handleMarketClose}
        />
      </KeyboardControls>
      
      <NotificationContainer />
    </div>
  );
});

Game.displayName = 'Game';

// Main App component
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { phase } = useGame();

  // Setup audio
  useAudioSetup();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate some initialization time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Aplicação inicializada com sucesso');
        setIsLoading(false);
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show interface for non-playing phases
  if (phase !== 'playing') {
    return (
      <ErrorBoundary fallback={ErrorFallback}>
        <Interface />
        <NotificationContainer />
      </ErrorBoundary>
    );
  }

  // Show game
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <HooksErrorBoundary>
        <Game />
      </HooksErrorBoundary>
    </ErrorBoundary>
  );
};

export default memo(App);
