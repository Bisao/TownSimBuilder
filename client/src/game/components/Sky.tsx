import React from "react";

const Sky: React.FC = () => {
  return (
    <group>
      {/* Céu de fundo lowpoly */}
      <mesh>
        <sphereGeometry args={[100, 12, 6]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          side={2} // DoubleSide para renderizar por dentro
          flatShading
        />
      </mesh>

      {/* Sol lowpoly */}
      <mesh position={[30, 40, 30]}>
        <dodecahedronGeometry args={[3]} />
        <meshBasicMaterial 
          color="#FFD700" 
          emissive="#FFD700" 
          emissiveIntensity={0.4}
          flatShading
        />
      </mesh>

      {/* Raios de sol */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 5;
        const z = Math.sin(angle) * 5;

        return (
          <mesh key={i} position={[30 + x, 40, 30 + z]} rotation={[0, angle, 0]}>
            <coneGeometry args={[0.1, 1.5, 3]} />
            <meshBasicMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={0.2}
              flatShading
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Nuvens lowpoly */}
      <group position={[20, 25, 15]}>
        <mesh position={[0, 0, 0]}>
          <dodecahedronGeometry args={[2]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.8} transparent flatShading />
        </mesh>
        <mesh position={[3, 0, 1]}>
          <icosahedronGeometry args={[1.5]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.8} transparent flatShading />
        </mesh>
        <mesh position={[-2, 0, 1]}>
          <octahedronGeometry args={[1.8]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.8} transparent flatShading />
        </mesh>
        <mesh position={[1, 1, -1]}>
          <tetrahedronGeometry args={[1]} />
          <meshBasicMaterial color="#F8F8FF" opacity={0.7} transparent flatShading />
        </mesh>
      </group>

      <group position={[-25, 20, 35]}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.8]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.7} transparent flatShading />
        </mesh>
        <mesh position={[2.5, 0, 0]}>
          <dodecahedronGeometry args={[1.2]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.7} transparent flatShading />
        </mesh>
        <mesh position={[-1, 0.8, 0.5]}>
          <octahedronGeometry args={[0.8]} />
          <meshBasicMaterial color="#F8F8FF" opacity={0.6} transparent flatShading />
        </mesh>
      </group>

      <group position={[40, 30, -20]}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[2.5]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.6} transparent flatShading />
        </mesh>
        <mesh position={[4, -0.5, 1]}>
          <dodecahedronGeometry args={[2]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.6} transparent flatShading />
        </mesh>
        <mesh position={[-3, 0.5, 0]}>
          <octahedronGeometry args={[1.5]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.6} transparent flatShading />
        </mesh>
        <mesh position={[2, 1.2, -1]}>
          <tetrahedronGeometry args={[1.2]} />
          <meshBasicMaterial color="#F8F8FF" opacity={0.5} transparent flatShading />
        </mesh>
      </group>

      {/* Nuvens distantes menores */}
      <group position={[60, 35, 10]}>
        <mesh position={[0, 0, 0]}>
          <tetrahedronGeometry args={[1]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.4} transparent flatShading />
        </mesh>
        <mesh position={[1.5, 0.2, 0.5]}>
          <octahedronGeometry args={[0.7]} />
          <meshBasicMaterial color="#F8F8FF" opacity={0.4} transparent flatShading />
        </mesh>
      </group>

      <group position={[-60, 32, -25]}>
        <mesh position={[0, 0, 0]}>
          <dodecahedronGeometry args={[1.2]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.3} transparent flatShading />
        </mesh>
        <mesh position={[2, 0, 1]}>
          <icosahedronGeometry args={[0.8]} />
          <meshBasicMaterial color="#F8F8FF" opacity={0.3} transparent flatShading />
        </mesh>
      </group>
    </group>
  );
};

export default Sky;