import { useTexture } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState, useEffect, useMemo } from "react";
import { useMapEditorStore } from "../stores/useMapEditorStore";

const GRID_SIZE = 50;

const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  const { camera } = useThree();
  const [isGridVisible, setIsGridVisible] = useState(true);
  
  const { 
    isEditorMode, 
    gridSize: editorGridSize, 
    showGrid: editorShowGrid,
    terrainTiles 
  } = useMapEditorStore();
  
  const currentGridSize = isEditorMode ? editorGridSize : GRID_SIZE;
  const shouldShowGrid = isEditorMode ? editorShowGrid : isGridVisible;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'KeyG' && !isEditorMode) {
        setIsGridVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEditorMode]);

  // Load grass texture
  const grassTexture = useTexture("/textures/grass.png");
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(currentGridSize/2, currentGridSize/2);
  
  // Generate terrain geometry with height data
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(
      currentGridSize, 
      currentGridSize, 
      currentGridSize - 1, 
      currentGridSize - 1
    );
    
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Apply height data from editor
    for (let i = 0; i < positions.length; i += 3) {
      const x = Math.floor(positions[i] + currentGridSize / 2);
      const z = Math.floor(positions[i + 1] + currentGridSize / 2);
      const key = `${x},${z}`;
      const tile = terrainTiles.get(key);
      
      if (tile) {
        positions[i + 2] = tile.height;
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, [currentGridSize, terrainTiles]);

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
        position={[currentGridSize/2 - 0.5, -0.1, currentGridSize/2 - 0.5]} 
        receiveShadow
        geometry={terrainGeometry}
      >
        <meshStandardMaterial 
          map={grassTexture} 
          color="#4CAF50"
          wireframe={isEditorMode && shouldShowGrid}
        />
      </mesh>

      {/* Grid lines for building placement */}
      <gridHelper 
        ref={gridRef}
        args={[currentGridSize, currentGridSize, "#000", "#444"]} 
        position={[currentGridSize/2 - 0.5, 0, currentGridSize/2 - 0.5]}
        visible={shouldShowGrid && !isEditorMode}
      >
        <meshBasicMaterial transparent opacity={0.5} />
      </gridHelper>
    </group>
  );
};

export default Terrain;