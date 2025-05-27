import React from "react";
import { resourceTypes } from "../constants/resources";

interface ResourceProps {
  type: string;
  position: [number, number];
}

const Resource: React.FC<ResourceProps> = ({ type, position }) => {
  const resourceType = resourceTypes[type];

  if (!resourceType) {
    return null;
  }

  const isTree = type === 'wood';
  const isStone = type === 'stone';

  // Calcular altura do terreno baseada na posição
  const terrainHeight = Math.sin(position[0] * 0.1) * 0.8 + 
                        Math.cos(position[1] * 0.08) * 0.6 + 
                        Math.sin(position[0] * 0.15) * Math.cos(position[1] * 0.12) * 0.4;

  return (
    <group position={[position[0], terrainHeight, position[1]]}>
      {isTree && (
        <>
          {/* Tronco lowpoly */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1, 6]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>

          {/* Textura da casca */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 6]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.1, 6]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>

          {/* Copa lowpoly em camadas */}
          <mesh position={[0, 1.1, 0]}>
            <coneGeometry args={[0.7, 0.8, 8]} />
            <meshStandardMaterial color="#228B22" flatShading />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.5, 0.6, 8]} />
            <meshStandardMaterial color="#32CD32" flatShading />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <coneGeometry args={[0.3, 0.4, 8]} />
            <meshStandardMaterial color="#90EE90" flatShading />
          </mesh>

          {/* Galhos pequenos */}
          <mesh position={[0.2, 0.8, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.02, 0.03, 0.3, 4]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[-0.15, 0.9, 0.1]} rotation={[0, Math.PI / 4, -Math.PI / 8]}>
            <cylinderGeometry args={[0.02, 0.03, 0.25, 4]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
        </>
      )}

      {isStone && (
        <group>
          {/* Rocha principal lowpoly */}
          <mesh position={[0, 0.25, 0]}>
            <dodecahedronGeometry args={[0.4]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>

          {/* Rochas menores ao redor */}
          <mesh position={[0.3, 0.1, 0.2]} rotation={[0.3, 0.8, 0.2]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial color="#778899" flatShading />
          </mesh>
          <mesh position={[-0.2, 0.08, 0.3]} rotation={[0.5, 1.2, 0.1]}>
            <tetrahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#708090" flatShading />
          </mesh>
          <mesh position={[0.1, 0.05, -0.3]} rotation={[0.2, 0.5, 0.8]}>
            <octahedronGeometry args={[0.1]} />
            <meshStandardMaterial color="#A9A9A9" flatShading />
          </mesh>

          {/* Pequenos cristais/minerais */}
          <mesh position={[0, 0.5, 0]} rotation={[0.3, 0.7, 0.1]}>
            <octahedronGeometry args={[0.08]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} flatShading />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Resource;