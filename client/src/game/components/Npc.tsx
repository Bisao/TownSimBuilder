import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NPC } from "../stores/useNpcStore";
import { npcTypes } from "../constants/npcs";

interface NpcProps {
  npc: NPC;
}

const Npc = ({ npc }: NpcProps) => {
  const ref = useRef<THREE.Mesh>(null);
  
  // Definições do NPC
  const npcType = npcTypes[npc.type];
  if (!npcType) return null;
  
  // Animação simples baseada no estado
  useFrame(({ clock }) => {
    if (!ref.current) return;
    
    // Pulsação quando está trabalhando
    if (npc.state === "working") {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 5) * 0.1;
      ref.current.scale.set(scale, scale, scale);
    } else {
      ref.current.scale.set(1, 1, 1);
    }
    
    // Pequena flutuação para todos os NPCs
    ref.current.position.y = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
  });
  
  return (
    <mesh
      ref={ref}
      position={[npc.position[0], 0.5, npc.position[2]]}
      castShadow
    >
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color={npcType.color} />
    </mesh>
  );
};

export default Npc;