
import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterModelProps {
  position: [number, number, number];
  color?: string;
  scale?: number;
  rotation?: [number, number, number];
}

const CharacterModel: React.FC<CharacterModelProps> = ({ 
  position, 
  color = "#808080", 
  scale = 1,
  rotation = [0, 0, 0]
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/character-base.glb');
  
  // Clone the scene to avoid sharing materials between instances
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    // Apply color to all meshes in the model
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.Material) {
          const material = child.material.clone();
          if (material instanceof THREE.MeshStandardMaterial) {
            material.color = new THREE.Color(color);
          }
          child.material = material;
        }
      }
    });
    
    return cloned;
  }, [scene, color]);

  useFrame(() => {
    if (groupRef.current) {
      // Ajustar a posição Y para que o modelo fique no nível do chão
      groupRef.current.position.set(position[0], position[1] + 1, position[2]);
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

// Preload the model
useGLTF.preload('/models/character-base.glb');

export default CharacterModel;
