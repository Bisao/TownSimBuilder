
import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface DamageTextProps {
  damage: number;
  position: THREE.Vector3;
  critical?: boolean;
  type?: 'damage' | 'heal' | 'experience';
  onComplete: () => void;
}

const DamageText: React.FC<DamageTextProps> = ({ 
  damage, 
  position, 
  critical = false, 
  type = 'damage',
  onComplete 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const duration = 2000; // 2 seconds

  const getTextColor = useCallback(() => {
    switch (type) {
      case 'heal':
        return critical ? "#00FF44" : "#44FF44";
      case 'experience':
        return critical ? "#FFD700" : "#FFA500";
      case 'damage':
      default:
        return critical ? "#FF4444" : "#FFFF44";
    }
  }, [type, critical]);

  const getText = useCallback(() => {
    const prefix = critical ? "CRÍTICO! " : "";
    const suffix = type === 'experience' ? " XP" : "";
    return `${prefix}${damage}${suffix}`;
  }, [damage, critical, type]);

  useFrame(() => {
    if (!groupRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const progress = elapsed / duration;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Animation curves
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const fadeOut = 1 - Math.pow(progress, 2);

    // Movement animation
    groupRef.current.position.y = position.y + easeOut * 2;
    
    // Scale animation for critical hits
    if (critical) {
      const pulseIntensity = Math.sin(elapsed * 0.01) * 0.2;
      const baseScale = 1 + pulseIntensity * (1 - progress);
      groupRef.current.scale.setScalar(baseScale);
    } else {
      groupRef.current.scale.setScalar(1 - progress * 0.2);
    }

    // Fade out effect
    groupRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        if ('opacity' in child.material) {
          child.material.opacity = fadeOut;
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Text
        position={[0, 0, 0]}
        fontSize={critical ? 0.4 : 0.3}
        color={getTextColor()}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        font="/fonts/inter.json"
        transparent
      >
        {getText()}
      </Text>
    </group>
  );
};

export default DamageText;
