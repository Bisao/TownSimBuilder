import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ResourceProps {
  type: string;
  position: [number, number, number];
  color: string;
  scale?: number;
}

const Resource = ({ type, position, color, scale = 1 }: ResourceProps) => {
  const ref = useRef<THREE.Mesh>(null);
  
  // Simple animation for resource objects
  useFrame(({ clock }) => {
    if (!ref.current) return;
    
    // Floating animation
    ref.current.position.y = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    
    // Slow rotation
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
  });
  
  return (
    <mesh
      ref={ref}
      position={position}
      castShadow
      receiveShadow
    >
      {type === "wood" && (
        <cylinderGeometry args={[0.1 * scale, 0.1 * scale, 1 * scale, 8]} />
      )}
      {type === "stone" && (
        <dodecahedronGeometry args={[0.3 * scale]} />
      )}
      {type === "wheat" && (
        <coneGeometry args={[0.2 * scale, 0.8 * scale, 8]} />
      )}
      {type === "water" && (
        <sphereGeometry args={[0.3 * scale, 16, 16]} />
      )}
      {type === "bread" && (
        <boxGeometry args={[0.4 * scale, 0.2 * scale, 0.2 * scale]} />
      )}
      {type === "coins" && (
        <cylinderGeometry args={[0.2 * scale, 0.2 * scale, 0.05 * scale, 16]} />
      )}
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Resource;
