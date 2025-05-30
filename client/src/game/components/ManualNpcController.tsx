import React, { useEffect, useRef } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { useGameStore } from '../stores/useGameStore';
import { useNpcStore } from '../stores/useNpcStore';
import { Controls } from '../types/controls';

const ManualNpcController: React.FC = () => {
  const { isManualControl, controlledNpcId, setManualControl } = useGameStore();
  const { npcs, moveNpc } = useNpcStore();

  const lastMoveTime = useRef(0);
  const moveDelay = 200; // milliseconds between moves

  // Keyboard controls
  const forward = useKeyboardControls<Controls>((state) => state.forward);
  const backward = useKeyboardControls<Controls>((state) => state.backward);
  const leftward = useKeyboardControls<Controls>((state) => state.leftward);
  const rightward = useKeyboardControls<Controls>((state) => state.rightward);
  const escape = useKeyboardControls<Controls>((state) => state.escape);

  // Exit manual control on escape
  useEffect(() => {
    if (escape && isManualControl) {
      setManualControl(false, null);
    }
  }, [escape, isManualControl, setManualControl]);

  // Movement logic
  useEffect(() => {
    if (!isManualControl || !controlledNpcId) return;

    const now = Date.now();
    if (now - lastMoveTime.current < moveDelay) return;

    const controlledNpc = npcs.find(npc => npc.id === controlledNpcId);
    if (!controlledNpc) return;

    const [currentX, currentY, currentZ] = controlledNpc.position;
    let newX = currentX;
    let newZ = currentZ;

    // Calculate movement
    if (forward) newZ -= 1;
    if (backward) newZ += 1;
    if (leftward) newX -= 1;
    if (rightward) newX += 1;

    // Only move if position changed
    if (newX !== currentX || newZ !== currentZ) {
      moveNpc(controlledNpcId, [newX, currentY, newZ]);
      lastMoveTime.current = now;
    }
  }, [forward, backward, leftward, rightward, isManualControl, controlledNpcId, npcs, moveNpc]);

  return null;
};

export default ManualNpcController;