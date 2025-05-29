import { useTexture } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState, useEffect, useMemo } from "react";

const GRID_SIZE = 50;

const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  const { camera } = useThree();
  const [isGridVisible, setIsGridVisible] = useState(true);

  const currentGridSize = GRID_SIZE;
  const shouldShowGrid = isGridVisible;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'KeyG') {
        setIsGridVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Generate basic terrain geometry
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(currentGridSize, currentGridSize, currentGridSize - 1, currentGridSize - 1);
    geometry.computeVertexNormals();
    return geometry;
  }, [currentGridSize]);

  return (
    <group>
      {/* Terrain Mesh */}
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[currentGridSize / 2 - 0.5, 0, currentGridSize / 2 - 0.5]}
        receiveShadow
      >
        <primitive object={terrainGeometry} />
        <meshLambertMaterial 
          color="#4CAF50"
        />
      </mesh>

      {/* Grid Helper */}
      {shouldShowGrid && (
        <gridHelper 
          ref={gridRef}
          args={[currentGridSize, currentGridSize, "#888888", "#888888"]} 
          position={[currentGridSize / 2 - 0.5, 0.01, currentGridSize / 2 - 0.5]}
        />
      )}
    </group>
  );
};

export default Terrain;