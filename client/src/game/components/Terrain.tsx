import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

const GRID_SIZE = 50;

const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load grass texture
  const grassTexture = useTexture("/textures/grass.png");
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(GRID_SIZE/2, GRID_SIZE/2);
  
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
        args={[GRID_SIZE, GRID_SIZE, "#444", "#444"]} 
        position={[GRID_SIZE/2 - 0.5, 0, GRID_SIZE/2 - 0.5]} 
      />
    </group>
  );
};

export default Terrain;
