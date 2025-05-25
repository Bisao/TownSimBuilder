
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NPC } from "../stores/useNpcStore";
import { npcTypes } from "../constants/npcs";

interface NpcProps {
  npc: NPC;
}

const Npc = ({ npc }: NpcProps) => {
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
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
    if (!bodyRef.current || !particlesRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Animação do corpo ao andar
    if (npc.state === "moving") {
      // Movimento de balanço do corpo
      bodyRef.current.position.y = 0.5 + Math.sin(time * 5) * 0.05;
      
      // Movimento das pernas
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(time * 5) * 0.5;
        rightLegRef.current.rotation.x = -Math.sin(time * 5) * 0.5;
      }
      
      // Movimento dos braços
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(time * 5) * 0.5;
        rightArmRef.current.rotation.x = Math.sin(time * 5) * 0.5;
      }
    } else if (npc.state === "working" || npc.state === "gathering") {
      // Animação de trabalho
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time * 3) * 0.3;
        rightArmRef.current.rotation.x = Math.sin(time * 3) * 0.3;
      }
      
      // Partículas de trabalho
      particlesRef.current.visible = true;
      particlesRef.current.rotation.y = time * 2;
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.size = 0.1 + Math.sin(time * 4) * 0.05;
    } else {
      // Estado parado
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.02;
      }
      if (particlesRef.current) {
        particlesRef.current.visible = false;
      }
    }
  });
  
  return (
    <group position={[npc.position[0], 0.01, npc.position[2]]} onClick={handleClick}>
      <group ref={bodyRef}>
        {/* Cabeça */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={npcType.color} />
        </mesh>
        
        {/* Corpo */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.3, 0.5, 0.2]} />
          <meshStandardMaterial color={npcType.color} />
        </mesh>
        
        {/* Braço Esquerdo */}
        <mesh ref={leftArmRef} position={[-0.2, 0.5, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={npcType.color} />
        </mesh>
        
        {/* Braço Direito */}
        <mesh ref={rightArmRef} position={[0.2, 0.5, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={npcType.color} />
        </mesh>
        
        {/* Perna Esquerda */}
        <mesh ref={leftLegRef} position={[-0.1, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={npcType.color} />
        </mesh>
        
        {/* Perna Direita */}
        <mesh ref={rightLegRef} position={[0.1, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={npcType.color} />
        </mesh>
      </group>
      
      {/* Partículas de efeito */}
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
