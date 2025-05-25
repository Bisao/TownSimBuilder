
import { useTexture } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState, useEffect } from "react";

const GRID_SIZE = 50;

const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  const { camera } = useThree();
  const [isGridVisible, setIsGridVisible] = useState(true);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'KeyG') {
        setIsGridVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Load grass texture
  const grassTexture = useTexture("/textures/grass.png");
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(GRID_SIZE/2, GRID_SIZE/2);

  useFrame(() => {
    if (gridRef.current) {
      const distanceToCamera = camera.position.y;
      // Ajusta a opacidade do grid baseado na distância
      const opacity = Math.min(1, Math.max(0.2, 20 / distanceToCamera));
      if (gridRef.current.material instanceof THREE.Material) {
        gridRef.current.material.opacity = opacity;
      }
    }
  });
  
  return (
    <group>
      {/* Main terrain */}
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[GRID_SIZE/2 - 0.5, -0.1, GRID_SIZE/2 - 0.5]} 
        receiveShadow
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE, 1, 1]} />
        <meshStandardMaterial 
          map={grassTexture} 
          color="#4CAF50"
        />
      </mesh>
      
      {/* Grid lines for building placement */}
      <gridHelper 
        ref={gridRef}
        args={[GRID_SIZE, GRID_SIZE, "#000", "#444"]} 
        position={[GRID_SIZE/2 - 0.5, 0, GRID_SIZE/2 - 0.5]}
        visible={isGridVisible}
      >
        <meshBasicMaterial transparent opacity={0.5} />
      </gridHelper>
    </group>
  );
};

export default Terrain;
