import React, { Suspense, useEffect, useState, memo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Preload } from '@react-three/drei';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { HooksErrorBoundary } from '@/components/ui/hooks-error-boundary';
import { useAudio } from '@/lib/stores/useAudio';
import { useGame } from '@/lib/stores/useGame';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { Interface } from '@/components/ui/interface';
import NotificationContainer from '@/ui/NotificationContainer';
import World from '@/game/components/World';
import GameUI from '@/ui/GameUI';
import MarketWindow from '@/ui/MarketWindow';

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
);
import { ControlsEnum } from '@/game/types/controls';
import { BuildingType } from '@/game/constants/buildings';
import { GAME_CONFIG } from '../../../shared/constants/game';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Keyboard controls configuration
const keyboardMap = [
  { name: ControlsEnum.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: ControlsEnum.backward, keys: ['ArrowDown', 'KeyS'] },
  { name: ControlsEnum.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: ControlsEnum.right, keys: ['ArrowRight', 'KeyD'] },
  { name: ControlsEnum.jump, keys: ['Space'] },
  { name: ControlsEnum.shift, keys: ['ShiftLeft'] },
  { name: ControlsEnum.escape, keys: ['Escape'] },
  { name: ControlsEnum.enter, keys: ['Enter'] },
  { name: ControlsEnum.interact, keys: ['KeyE'] },
  { name: ControlsEnum.attack, keys: ['KeyF'] },
  { name: ControlsEnum.place, keys: ['Space'] },
  { name: ControlsEnum.cancel, keys: ['Escape'] },
  { name: ControlsEnum.inventory, keys: ['KeyI'] },
  { name: ControlsEnum.map, keys: ['KeyM'] },
  { name: ControlsEnum.skills, keys: ['KeyK'] },
  { name: ControlsEnum.buildings, keys: ['KeyB'] },
  { name: ControlsEnum.research, keys: ['KeyR'] },
  { name: ControlsEnum.economy, keys: ['KeyY'] },
];

// Game component - memoized for performance
const Game = memo(() => {
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
  const [marketBuilding, setMarketBuilding] = useState<any>(null);

  const handleBuildingSelect = useCallback((buildingType: BuildingType | null) => {
    setSelectedBuildingType(buildingType);
  }, []);

  const handleMarketSelect = useCallback((building: any) => {
    setMarketBuilding(building);
  }, []);

  const handleMarketClose = useCallback(() => {
    setMarketBuilding(null);
  }, []);

  try {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-blue-600">
          <KeyboardControls map={keyboardMap}>
            <Canvas
              camera={{
                position: [10, 10, 10],
                fov: 60,
                near: 0.1,
                far: 1000
              }}
              shadows
              className="w-full h-full"
            >
              <Suspense fallback={<LoadingSpinner />}>
                <World
                  selectedBuildingType={selectedBuildingType}
                  onMarketSelect={handleMarketSelect}
                />
                <Preload all />
              </Suspense>
            </Canvas>
          </KeyboardControls>
        </div>

        <GameUI onBuildingSelect={handleBuildingSelect} />

        {marketBuilding && (
          <MarketWindow
            building={marketBuilding}
            onClose={handleMarketClose}
          />
        )}
      </>
    );
  } catch (error) {
    console.error('Error in Game component:', error);
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-red-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Erro no Jogo</h2>
          <p>Ocorreu um erro ao carregar o jogo. Recarregue a página.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
});

Game.displayName = 'Game';

// Main App component
function App() {
  const { phase } = useGame();
  const { initAudio } = useAudio();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    console.log('🚀 Starting application in development mode');

    if (typeof window !== 'undefined') {
      console.log('📊 React DevTools available');
    }

    console.log('✅ Application initialized successfully');
  }, []);

  useEffect(() => {
    // Initialize audio system
    const handleFirstUserInteraction = () => {
      initAudio();
      console.log('Sistema de áudio inicializado com sucesso');

      // Remove event listeners after first interaction
      document.removeEventListener('click', handleFirstUserInteraction);
      document.removeEventListener('keydown', handleFirstUserInteraction);
      document.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    // Add event listeners for first user interaction
    document.addEventListener('click', handleFirstUserInteraction);
    document.addEventListener('keydown', handleFirstUserInteraction);
    document.addEventListener('touchstart', handleFirstUserInteraction);

    return () => {
      document.removeEventListener('click', handleFirstUserInteraction);
      document.removeEventListener('keydown', handleFirstUserInteraction);
      document.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, [initAudio]);

  useEffect(() => {
    // Global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      console.log('Global error:', event.error);
      addNotification({
        type: 'error',
        title: 'Erro no Sistema',
        message: 'Ocorreu um erro inesperado. Verifique o console para detalhes.',
      });
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, [addNotification]);

  useEffect(() => {
    console.log('Aplicação inicializada com sucesso');
  }, []);

  return (
    <ErrorBoundary>
      <HooksErrorBoundary>
        <div className="w-screen h-screen overflow-hidden bg-gray-900 text-white">
          {phase === 'login' && <Interface />}
          {phase === 'playing' && <Game />}
          <NotificationContainer />
        </div>
      </HooksErrorBoundary>
    </ErrorBoundary>
  );
}

// App wrapper with error boundary
const AppWrapper = () => {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
};

export default AppWrapper;
const keyMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'up', keys: ['KeyR'] },
  { name: 'down', keys: ['KeyF'] },
  { name: 'zoomIn', keys: ['Equal', 'NumpadAdd'] },
  { name: 'zoomOut', keys: ['Minus', 'NumpadSubtract'] },
  { name: 'rotateCW', keys: ['KeyE'] },
  { name: 'rotateCCW', keys: ['KeyQ'] },
  { name: 'place', keys: ['Space'] },
  { name: 'cancel', keys: ['Escape'] },
  { name: 'pause', keys: ['KeyP'] },
  { name: 'resume', keys: ['KeyO'] },
  { name: 'increaseSpeed', keys: ['Period'] },
  { name: 'decreaseSpeed', keys: ['Comma'] },
  { name: 'toggleResources', keys: ['KeyZ'] },
  { name: 'toggleBuildings', keys: ['KeyX'] },
  { name: 'toggleNpcMetrics', keys: ['KeyC'] },
];