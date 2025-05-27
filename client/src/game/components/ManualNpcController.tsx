
import { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';

const ManualNpcController = () => {
  const { isManualControl, controlledNpcId, updateManualControlKeys, setControlledNpc } = useGameStore();

  useEffect(() => {
    if (!isManualControl || !controlledNpcId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'w':
          updateManualControlKeys({ forward: true });
          break;
        case 's':
          updateManualControlKeys({ backward: true });
          break;
        case 'a':
          updateManualControlKeys({ left: true });
          break;
        case 'd':
          updateManualControlKeys({ right: true });
          break;
        case 'e':
          event.preventDefault();
          updateManualControlKeys({ action: true });
          break;
        case 'escape':
          // Sair do controle manual
          setControlledNpc(null);
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'w':
          updateManualControlKeys({ forward: false });
          break;
        case 's':
          updateManualControlKeys({ backward: false });
          break;
        case 'a':
          updateManualControlKeys({ left: false });
          break;
        case 'd':
          updateManualControlKeys({ right: false });
          break;
        case 'e':
          updateManualControlKeys({ action: false });
          break;
      }
    };

    // Adicionar listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Reset todas as teclas quando sair
      updateManualControlKeys({
        forward: false,
        backward: false,
        left: false,
        right: false,
        action: false,
      });
    };
  }, [isManualControl, controlledNpcId, updateManualControlKeys, setControlledNpc]);

  return null; // Este componente não renderiza nada
};

export default ManualNpcController;
