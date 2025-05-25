
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NPC } from "../stores/useNpcStore";
import { npcTypes } from "../constants/npcs";

interface NpcProps {
  npc: NPC;
}

const Npc = ({ npc }: NpcProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent('npcClick', { detail: npc }));
  };
  
  const npcType = npcTypes[npc.type];
  if (!npcType) return null;

  // Criar geometria de partículas
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(30 * 3);
    
    for(let i = 0; i < 30; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = Math.random() * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);
  
  useFrame(({ clock }) => {
    if (!ref.current || !particlesRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Efeitos baseados no estado
    if (npc.state === "working" || npc.state === "gathering") {
      // Pulsação do NPC
      const pulseScale = 1 + Math.sin(time * 8) * 0.1;
      ref.current.scale.set(pulseScale, pulseScale, pulseScale);
      
      // Animação das partículas
      particlesRef.current.visible = true;
      particlesRef.current.rotation.y = time * 2;
      particlesRef.current.position.y = Math.sin(time * 4) * 0.1;
      
      // Cor das partículas pulsando
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.size = 0.1 + Math.sin(time * 4) * 0.05;
    } else {
      // Estado normal
      ref.current.scale.set(1, 1, 1);
      if (particlesRef.current) {
        particlesRef.current.visible = false;
      }
    }
    
    // Flutuação suave
    ref.current.position.y = 0.5 + Math.sin(time * 2) * 0.05;
  });
  
  return (
    <group position={[npc.position[0], 0.5, npc.position[2]]}>
      <mesh ref={ref} castShadow onClick={handleClick}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color={npcType.color} />
      </mesh>
      
      <points ref={particlesRef}>
        <primitive object={particles} />
        <pointsMaterial
          color={npcType.color}
          size={0.1}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

export default Npc;
