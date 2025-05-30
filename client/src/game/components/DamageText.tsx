
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface DamageTextProps {
  damage: number;
  position: THREE.Vector3;
  critical?: boolean;
  onComplete: () => void;
}

const DamageText: React.FC<DamageTextProps> = ({ damage, position, critical = false, onComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const duration = 2000; // 2 segundos

  useFrame(() => {
    if (!groupRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const progress = elapsed / duration;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Animação de movimento para cima
    groupRef.current.position.y = position.y + progress * 2;
    
    // Fade out
    const opacity = 1 - progress;
    groupRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        child.material.opacity = opacity;
      }
    });

    // Escala para críticos
    if (critical) {
      const scale = 1 + Math.sin(elapsed * 0.01) * 0.2;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Text
        position={[0, 0, 0]}
        fontSize={critical ? 0.4 : 0.3}
        color={critical ? "#FF4444" : "#FFFF44"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        font="/fonts/inter.json"
      >
        {critical ? `CRÍTICO! ${damage}` : damage.toString()}
      </Text>
    </group>
  );
};

export default DamageText;
