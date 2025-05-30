import React, { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { NPC } from "../stores/useNpcStore";
import { npcTypes } from "../constants/npcs";
import CharacterModel from "./CharacterModel";

interface NpcProps {
  npc: NPC;
}

const Npc: React.FC<NpcProps> = ({ npc }) => {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);

  // Sempre executar todos os hooks primeiro, independente de condições
  const npcType = useMemo(() => npcTypes[npc.type] || npcTypes.villager, [npc.type]);

  const color = useMemo(() => {
    if (npc.controlMode === "manual") return "#00ff00";
    if (npc.assignedWork) {
      switch (npc.assignedWork) {
        case "miner": return "#8B4513";
        case "lumberjack": return "#228B22";
        case "farmer": return "#DAA520";
        case "baker": return "#D2691E";
        default: return npcType.color;
      }
    }
    return npcType.color;
  }, [npc.controlMode, npc.assignedWork, npcType.color]);

  const workIcon = useMemo(() => {
    if (npc.assignedWork) {
      switch (npc.assignedWork) {
        case "miner": return "⛏️";
        case "lumberjack": return "🪓";
        case "farmer": return "🌾";
        case "baker": return "🍞";
        default: return "👤";
      }
    }
    return "👤";
  }, [npc.assignedWork]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(npc.position[0], npc.position[1], npc.position[2]);
    }
    if (textRef.current) {
      textRef.current.position.set(npc.position[0], npc.position[1] + 2.5, npc.position[2]);
    }
  });

  useEffect(() => {
    const handleNpcClick = (event: any) => {
      if (event.detail && event.detail.id === npc.id) {
        window.dispatchEvent(new CustomEvent('npcClick', { detail: npc }));
      }
    };

    window.addEventListener('focusOnNpc', handleNpcClick);
    return () => window.removeEventListener('focusOnNpc', handleNpcClick);
  }, [npc]);

  // Validações após todos os hooks
  if (!npc || !npc.position) {
    return null;
  }

  const handleClick = (event: any) => {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent('npcClick', { detail: npc }));
  };

  return (
    <group>
      {/* NPC Body */}
      <group
        ref={groupRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      >
        <CharacterModel
          position={[0, 0, 0]}
          color={color}
          scale={0.8}
          rotation={[0, 0, 0]}
        />
      </group>

      {/* Status Indicator */}
      {npc.controlMode === "manual" && (
        <mesh position={[npc.position[0] + 0.5, npc.position[1] + 1, npc.position[2]]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Work Progress Bar */}
      {npc.workProgress > 0 && (
        <group position={[npc.position[0], npc.position[1] + 2, npc.position[2]]}>
          {/* Background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.8} />
          </mesh>
          {/* Progress */}
          <mesh position={[-(1 - npc.workProgress) / 2, 0, 0.01]}>
            <planeGeometry args={[npc.workProgress, 0.08]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {/* NPC Name and Status */}
      <group ref={textRef} position={[npc.position[0], npc.position[1] + 1.5, npc.position[2]]}>
        <Text
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {`${workIcon} ${npc.name}`}
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.15}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {npc.state === "moving" ? "Movendo" :
           npc.state === "working" ? "Trabalhando" :
           npc.state === "gathering" ? "Coletando" :
           npc.state === "resting" ? "Descansando" :
           npc.state === "searching" ? "Procurando" :
           npc.state === "attacking" ? "Atacando" : "Parado"}
        </Text>
      </group>

      {/* Energy/Health indicators */}
      {npc.needs.energy < 30 && (
        <mesh position={[npc.position[0] - 0.6, npc.position[1] + 1.2, npc.position[2]]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
        </mesh>
      )}

      {npc.inventory.amount > 0 && (
        <mesh position={[npc.position[0] + 0.6, npc.position[1] + 1.2, npc.position[2]]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
    </group>
  );
};

export default Npc;