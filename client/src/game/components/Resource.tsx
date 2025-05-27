import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { useResourceStore } from "../stores/useResourceStore";
import { useNpcStore } from "../stores/useNpcStore";
import { useGameStore } from "../stores/useGameStore";
import { resourceTypes } from "../constants/resources";

interface ResourceProps {
  id: string;
  type: string;
  position: [number, number];
  amount: number;
}

const Resource = ({ id, type, position, amount }: ResourceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { removeResource } = useResourceStore();
  const { npcs } = useNpcStore();
  const { controlledNpcId, isManualControl } = useGameStore();

  const resourceConfig = resourceTypes[type];
  if (!resourceConfig) return null;

  // Verificar se há um NPC próximo que pode coletar este recurso
  const canBeCollected = npcs.some(npc => {
    if (!isManualControl || npc.id !== controlledNpcId) return false;

    const npcTileX = Math.round(npc.position[0]);
    const npcTileZ = Math.round(npc.position[2]);
    const resourceTileX = Math.round(position[0]);
    const resourceTileZ = Math.round(position[1]);

    const canCollectType = (npc.type === "miner" && type === "stone") || 
                          (npc.type === "lumberjack" && type === "wood");

    return canCollectType && 
           npcTileX === resourceTileX && 
           npcTileZ === resourceTileZ &&
           npc.inventory.amount < 10; // MAX_INVENTORY
  });

  // Posição no mundo 3D
  const worldPosition: [number, number, number] = [
    position[0],
    resourceConfig.height / 2,
    position[1],
  ];

  // Animação de flutuação sutil
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        resourceConfig.height / 2 +
        Math.sin(state.clock.elapsedTime * 2 + position[0] + position[1]) * 0.1;
    }

    // Animação do brilho para recursos coletáveis
    if (glowRef.current && canBeCollected) {
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      glowRef.current.scale.setScalar(1.2 + intensity * 0.3);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }
  });

return (
    <group position={worldPosition}>
      {/* Efeito de brilho para recursos coletáveis */}
      {canBeCollected && (
        <mesh ref={glowRef}>
          <ringGeometry args={[0.6, 1.0, 16]} />
          <meshBasicMaterial 
            color="#00ff00" 
            transparent 
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (hovered) {
            removeResource(id);
          }
        }}
      >
        <boxGeometry args={resourceConfig.size} />
        <meshLambertMaterial
          color={hovered ? resourceConfig.hoverColor : canBeCollected ? '#90EE90' : resourceConfig.color}
          flatShading
        />
      </mesh>
    </group>
  );
};

export default Resource;