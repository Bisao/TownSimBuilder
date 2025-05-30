
import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterModelProps {
  position: [number, number, number];
  color?: string;
  scale?: number;
  rotation?: [number, number, number];
  animationState?: 'idle' | 'walking' | 'working' | 'resting';
}

const CharacterModel: React.FC<CharacterModelProps> = ({ 
  position, 
  color = "#808080", 
  scale = 1,
  rotation = [0, 0, 0],
  animationState = 'idle'
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const animationTime = useRef(0);
  
  // Load model with error handling
  const { scene, error } = useGLTF('/models/character-base.glb', undefined, undefined, (error) => {
    console.warn('Failed to load character model:', error);
  });
  
  // Clone and customize the scene
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    
    try {
      const cloned = scene.clone();
      
      // Apply color to all meshes
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material instanceof Array 
            ? child.material[0].clone() 
            : child.material.clone();
            
          if (material instanceof THREE.MeshStandardMaterial) {
            material.color = new THREE.Color(color);
            material.flatShading = true;
          }
          
          child.material = material;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      return cloned;
    } catch (err) {
      console.error('Error cloning character scene:', err);
      return null;
    }
  }, [scene, color]);

  // Animation logic
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    animationTime.current += delta;
    
    // Position update
    groupRef.current.position.set(position[0], position[1] + 1, position[2]);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    groupRef.current.scale.setScalar(scale);
    
    // Simple animations based on state
    switch (animationState) {
      case 'walking':
        // Bobbing animation while walking
        groupRef.current.position.y = position[1] + 1 + Math.sin(animationTime.current * 8) * 0.05;
        break;
        
      case 'working':
        // Slight movement while working
        groupRef.current.rotation.y = rotation[1] + Math.sin(animationTime.current * 4) * 0.1;
        break;
        
      case 'resting':
        // Slower breathing-like animation
        groupRef.current.scale.setScalar(scale + Math.sin(animationTime.current * 2) * 0.02);
        break;
        
      case 'idle':
      default:
        // Subtle idle animation
        groupRef.current.position.y = position[1] + 1 + Math.sin(animationTime.current * 3) * 0.02;
        break;
    }
  });

  // Fallback mesh if model fails to load
  if (error || !clonedScene) {
    return (
      <group ref={groupRef}>
        <mesh position={[position[0], position[1] + 1, position[2]]} castShadow>
          <boxGeometry args={[0.6, 1.8, 0.3]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position={[position[0], position[1] + 1.8, position[2]]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
};

// Preload the model
useGLTF.preload('/models/character-base.glb');

export default CharacterModel;
