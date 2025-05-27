
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

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'KeyG') {
        setIsGridVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Gerar decorações aleatórias do ambiente
  const environmentDecorations = useMemo(() => {
    const decorations: Array<{
      type: 'flower' | 'rock' | 'path';
      position: [number, number, number];
      scale: number;
      rotation: number;
      color?: string;
    }> = [];

    // Flores silvestres espalhadas
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * GRID_SIZE * 0.8;
      const z = (Math.random() - 0.5) * GRID_SIZE * 0.8;
      const y = Math.sin(x * 0.1) * 0.5 + Math.cos(z * 0.1) * 0.3;
      
      decorations.push({
        type: 'flower',
        position: [x, y + 0.1, z],
        scale: 0.3 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2,
        color: ['#FF69B4', '#FFD700', '#FF4500', '#9370DB', '#00CED1'][Math.floor(Math.random() * 5)]
      });
    }

    // Pedras espalhadas
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * GRID_SIZE * 0.9;
      const z = (Math.random() - 0.5) * GRID_SIZE * 0.9;
      const y = Math.sin(x * 0.08) * 0.6 + Math.cos(z * 0.08) * 0.4;
      
      decorations.push({
        type: 'rock',
        position: [x, y + 0.05, z],
        scale: 0.2 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2
      });
    }

    // Caminhos de terra
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * GRID_SIZE * 0.7;
      const z = (Math.random() - 0.5) * GRID_SIZE * 0.7;
      const y = Math.sin(x * 0.1) * 0.3 + Math.cos(z * 0.1) * 0.2;
      
      decorations.push({
        type: 'path',
        position: [x, y + 0.02, z],
        scale: 1 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2
      });
    }

    return decorations;
  }, []);

  // Criar geometria do terreno com elevações
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, 32, 32);
    const positions = geometry.attributes.position;
    
    // Adicionar elevações lowpoly ao terreno
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      // Criar ondulações suaves
      const elevation = Math.sin(x * 0.1) * 0.8 + 
                       Math.cos(z * 0.08) * 0.6 + 
                       Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.4 +
                       Math.random() * 0.2 - 0.1;
      
      positions.setY(i, elevation);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  useFrame(() => {
    if (gridRef.current) {
      const distanceToCamera = camera.position.y;
      const opacity = Math.min(1, Math.max(0.2, 20 / distanceToCamera));
      if (gridRef.current.material instanceof THREE.Material) {
        gridRef.current.material.opacity = opacity;
      }
    }
  });

  return (
    <group>
      {/* Terreno principal com elevações */}
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[GRID_SIZE/2 - 0.5, -0.1, GRID_SIZE/2 - 0.5]} 
        receiveShadow
        geometry={terrainGeometry}
      >
        <meshStandardMaterial 
          color="#4CAF50"
          flatShading
        />
      </mesh>

      {/* Decorações do ambiente */}
      {environmentDecorations.map((decoration, index) => (
        <group key={index} position={[
          decoration.position[0] + GRID_SIZE/2 - 0.5,
          decoration.position[1],
          decoration.position[2] + GRID_SIZE/2 - 0.5
        ]}>
          {decoration.type === 'flower' && (
            <group rotation={[0, decoration.rotation, 0]} scale={decoration.scale}>
              {/* Caule */}
              <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.02, 0.03, 0.3, 4]} />
                <meshStandardMaterial color="#228B22" flatShading />
              </mesh>
              {/* Flor */}
              <mesh position={[0, 0.35, 0]}>
                <dodecahedronGeometry args={[0.08]} />
                <meshStandardMaterial color={decoration.color} flatShading />
              </mesh>
              {/* Pétalas */}
              {[0, 1, 2, 3, 4].map(i => {
                const angle = (i / 5) * Math.PI * 2;
                const x = Math.cos(angle) * 0.1;
                const z = Math.sin(angle) * 0.1;
                return (
                  <mesh key={i} position={[x, 0.35, z]} rotation={[0, angle, 0]}>
                    <coneGeometry args={[0.04, 0.08, 3]} />
                    <meshStandardMaterial color={decoration.color} flatShading />
                  </mesh>
                );
              })}
            </group>
          )}

          {decoration.type === 'rock' && (
            <group rotation={[0, decoration.rotation, 0]} scale={decoration.scale}>
              <mesh>
                <octahedronGeometry args={[0.3]} />
                <meshStandardMaterial color="#708090" flatShading />
              </mesh>
              <mesh position={[0.2, 0, 0.1]} rotation={[0.2, 0.8, 0.1]}>
                <tetrahedronGeometry args={[0.15]} />
                <meshStandardMaterial color="#696969" flatShading />
              </mesh>
            </group>
          )}

          {decoration.type === 'path' && (
            <group rotation={[0, decoration.rotation, 0]} scale={decoration.scale}>
              <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[0.8, 1, 0.1, 8]} />
                <meshStandardMaterial color="#8B4513" flatShading />
              </mesh>
              {/* Pedrinhas no caminho */}
              {[0, 1, 2].map(i => {
                const angle = (i / 3) * Math.PI * 2;
                const x = Math.cos(angle) * 0.4;
                const z = Math.sin(angle) * 0.4;
                return (
                  <mesh key={i} position={[x, 0, z]}>
                    <tetrahedronGeometry args={[0.05]} />
                    <meshStandardMaterial color="#654321" flatShading />
                  </mesh>
                );
              })}
            </group>
          )}
        </group>
      ))}

      {/* Base plana para o grid */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[GRID_SIZE/2 - 0.5, 0, GRID_SIZE/2 - 0.5]} 
        visible={false}
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Grid lines para posicionamento */}
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
