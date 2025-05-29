
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

  // Generate terrain geometry based on editor data
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(currentGridSize, currentGridSize, currentGridSize - 1, currentGridSize - 1);
    const positions = geometry.attributes.position.array as Float32Array;
    
    if (isEditorMode && Object.keys(terrainTiles).length > 0) {
      // Apply editor modifications
      for (let i = 0; i < currentGridSize; i++) {
        for (let j = 0; j < currentGridSize; j++) {
          const tile = terrainTiles[`${i},${j}`];
          if (tile) {
            const index = (i * currentGridSize + j) * 3 + 2; // Z component
            if (index < positions.length) {
              positions[index] = tile.height;
            }
          }
        }
      }
      geometry.attributes.position.needsUpdate = true;
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, [currentGridSize, terrainTiles, isEditorMode]);

  // Generate terrain colors based on terrain types
  const terrainColors = useMemo(() => {
    if (!isEditorMode || Object.keys(terrainTiles).length === 0) {
      return null;
    }

    const colors = new Float32Array(currentGridSize * currentGridSize * 3);
    
    for (let i = 0; i < currentGridSize; i++) {
      for (let j = 0; j < currentGridSize; j++) {
        const tile = terrainTiles[`${i},${j}`];
        const index = (i * currentGridSize + j) * 3;
        
        let color = new THREE.Color("#4CAF50"); // Default grass color
        
        if (tile) {
          switch (tile.type) {
            case "grass":
              color = new THREE.Color("#4CAF50");
              break;
            case "dirt":
              color = new THREE.Color("#8B4513");
              break;
            case "sand":
              color = new THREE.Color("#F4A460");
              break;
            case "stone":
              color = new THREE.Color("#708090");
              break;
            case "water":
              color = new THREE.Color("#4FC3F7");
              break;
          }
        }
        
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
      }
    }
    
    return colors;
  }, [currentGridSize, terrainTiles, isEditorMode]);

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
          color={isEditorMode ? "#ffffff" : "#4CAF50"}
          vertexColors={isEditorMode && terrainColors ? true : false}
        />
        {terrainColors && isEditorMode && (
          <bufferAttribute
            attach="attributes-color"
            args={[terrainColors, 3]}
          />
        )}
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
