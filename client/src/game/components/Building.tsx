import React, { useMemo } from "react";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { buildingTypes } from "../constants/buildings";
import { Building as BuildingType } from "../stores/useBuildingStore";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Html } from "@react-three/drei";
import { useNpcStore } from "../stores/useNpcStore";

interface BuildingProps {
  building: BuildingType;
  onClick?: (building: BuildingType) => void;
}

const Building = ({ building, onClick }: BuildingProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const lastProducedRef = useRef<number>(building.lastProduced);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Always call hooks at component level
  const npcs = useNpcStore(state => state.npcs);

  // Get building type definition
  const buildingType = buildingTypes[building.type];

  // Early return AFTER all hooks are called
  if (!buildingType) return null;

  // Memoize house NPCs to prevent unnecessary recalculations
  const houseNpcs = useMemo(() => {
    if (!building.type.includes("House")) return [];
    return npcs.filter(npc => npc.homeId === building.id);
  }, [npcs, building.id, building.type]);

  // Load texture
  const woodTexture = useTexture("/textures/wood.jpg");

  // Calculate position (centered on grid cell)
  const [posX, posZ] = building.position;
  const [sizeX, sizeZ] = buildingType.size;

  // Center position based on building size
  const position = useMemo(() => [
    posX + sizeX / 2 - 0.5,
    buildingType.height / 2 - 0.1,
    posZ + sizeZ / 2 - 0.5
  ], [posX, posZ, sizeX, sizeZ, buildingType.height]);

  // Production animation
  useFrame(() => {
    if (!ref.current) return;

    if (buildingType.produces) {
      const now = Date.now();
      const timeSinceLastProduction = now - lastProducedRef.current;
      const productionInterval = buildingType.produces.interval * 1000;

      // If production happened, update the reference
      if (building.lastProduced !== lastProducedRef.current) {
        lastProducedRef.current = building.lastProduced;
      }

      // Pulse effect when producing
      if (timeSinceLastProduction > productionInterval * 0.9) {
        const scale = 1 + Math.sin(now * 0.01) * 0.05;
        ref.current.scale.set(scale, scale, scale);
      } else {
        ref.current.scale.set(1, 1, 1);
      }
    }

    // Efeito de destaque quando o mouse está sobre o edifício
    if (hovered) {
      // Efeito de pulso suave ao passar o mouse
      const pulseFactor = 1 + Math.sin(Date.now() * 0.005) * 0.05;
      ref.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
  });

  // Lidar com interações do mouse
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (building.type === "market") {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (building.type === "market" && onClick) {
      onClick(building);
    } else if (building.type.includes("House")) {
      // Encontrar o NPC associado a esta casa
      window.dispatchEvent(new CustomEvent('npcHouseClick', { detail: building }));
    } else if (building.type === 'silo') {
      window.dispatchEvent(new CustomEvent('siloClick', { detail: building }));
    }
  };

  const renderBuilding = () => {
    const buildingType = buildingTypes[building.type];
    if (!buildingType) return null;

    const [width, length] = buildingType.size;
    const height = buildingType.height;

    // Casa básica
    if (building.type === "house") {
      return (
        <group>
          {/* Base da casa */}
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#D2B48C" flatShading />
          </mesh>
          {/* Telhado */}
          <mesh position={[0, height + 0.3, 0]}>
            <coneGeometry args={[0.7, 0.6, 4]} />
            <meshStandardMaterial color="#8B0000" flatShading />
          </mesh>
          {/* Porta */}
          <mesh position={[0, 0.4, 0.51]}>
            <boxGeometry args={[0.3, 0.8, 0.02]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          {/* Janelas */}
          <mesh position={[0.25, 0.6, 0.51]}>
            <boxGeometry args={[0.2, 0.2, 0.02]} />
            <meshStandardMaterial color="#87CEEB" flatShading />
          </mesh>
          <mesh position={[-0.25, 0.6, 0.51]}>
            <boxGeometry args={[0.2, 0.2, 0.02]} />
            <meshStandardMaterial color="#87CEEB" flatShading />
          </mesh>
        </group>
      );
    }

    // Casa do fazendeiro
    if (building.type === "farmerHouse") {
      return (
        <group>
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#A0522D" flatShading />
          </mesh>
          {/* Telhado de palha */}
          <mesh position={[0, height + 0.2, 0]}>
            <coneGeometry args={[0.75, 0.4, 4]} />
            <meshStandardMaterial color="#DAA520" flatShading />
          </mesh>
          {/* Chaminé */}
          <mesh position={[0.3, height + 0.6, 0.3]}>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>
          {/* Porta de fazenda */}
          <mesh position={[0, 0.4, 0.51]}>
            <boxGeometry args={[0.35, 0.8, 0.02]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
        </group>
      );
    }

    // Fazenda
    if (building.type === "farm") {
      return (
        <group>
          {/* Terra arada */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.9, 0.1, 0.9]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          {/* Sulcos da terra */}
          <mesh position={[-0.2, 0.11, 0]}>
            <boxGeometry args={[0.1, 0.02, 0.8]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[0.1, 0.02, 0.8]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          <mesh position={[0.2, 0.11, 0]}>
            <boxGeometry args={[0.1, 0.02, 0.8]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          {/* Espantalho pequeno */}
          <mesh position={[0.3, 0.3, 0.3]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.3, 0.5, 0.3]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#DEB887" flatShading />
          </mesh>
        </group>
      );
    }

    // Serraria
    if (building.type === "lumberMill") {
      return (
        <group>
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          {/* Telhado da serraria */}
          <mesh position={[0, height + 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[1.2, 0.1, 1.2]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          {/* Serra circular */}
          <mesh position={[0, height / 2, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 12]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} flatShading />
          </mesh>
          {/* Toras empilhadas */}
          <mesh position={[-0.3, 0.1, -0.3]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 6]} />
            <meshStandardMaterial color="#D2691E" flatShading />
          </mesh>
          <mesh position={[-0.3, 0.26, -0.3]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 6]} />
            <meshStandardMaterial color="#CD853F" flatShading />
          </mesh>
        </group>
      );
    }

    // Poço de água
    if (building.type === "waterWell") {
      return (
        <group>
          {/* Base do poço */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>
          {/* Estrutura do teto */}
          <mesh position={[-0.3, 0.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.3, 0.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          {/* Telhado do poço */}
          <mesh position={[0, 1.3, 0]}>
            <coneGeometry args={[0.5, 0.4, 4]} />
            <meshStandardMaterial color="#8B0000" flatShading />
          </mesh>
          {/* Balde */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.15, 8]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          {/* Corda */}
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.4, 4]} />
            <meshStandardMaterial color="#DEB887" flatShading />
          </mesh>
        </group>
      );
    }

    // Padaria
    if (building.type === "bakery") {
      return (
        <group>
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#D2691E" flatShading />
          </mesh>
          {/* Telhado */}
          <mesh position={[0, height + 0.25, 0]}>
            <boxGeometry args={[1.1, 0.1, 1.1]} />
            <meshStandardMaterial color="#8B0000" flatShading />
          </mesh>
          {/* Chaminé com fumaça */}
          <mesh position={[0.3, height + 0.5, 0.3]}>
            <cylinderGeometry args={[0.08, 0.1, 0.6, 8]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>
          {/* Forno */}
          <mesh position={[0, 0.3, 0.6]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          {/* Porta do forno */}
          <mesh position={[0, 0.3, 0.8]}>
            <cylinderGeometry args={[0.12, 0.12, 0.05, 8]} />
            <meshStandardMaterial color="#2F1B14" flatShading />
          </mesh>
        </group>
      );
    }

    // Mina de pedra
    if (building.type === "stoneMine") {
      return (
        <group>
          {/* Entrada da mina */}
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.6, 0.8, 1.5, 8]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
          {/* Suporte de madeira */}
          <mesh position={[-0.4, 0.8, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.4, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          {/* Trave horizontal */}
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[1, 0.08, 0.08]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          {/* Pilha de pedras extraídas */}
          <mesh position={[0.5, 0.15, 0.5]} rotation={[0.2, 0.8, 0.1]}>
            <dodecahedronGeometry args={[0.15]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>
          <mesh position={[0.3, 0.25, 0.4]} rotation={[0.5, 1.2, 0.3]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#778899" flatShading />
          </mesh>
        </group>
      );
    }

    // Mercado
    if (building.type === "market") {
      return (
        <group>
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#DAA520" flatShading />
          </mesh>
          {/* Toldo */}
          <mesh position={[0, height + 0.1, 0.3]} rotation={[-Math.PI / 8, 0, 0]}>
            <boxGeometry args={[1.2, 0.05, 0.8]} />
            <meshStandardMaterial color="#FF6347" flatShading />
          </mesh>
          {/* Postes do toldo */}
          <mesh position={[-0.5, height / 2 + 0.3, 0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.5, height / 2 + 0.3, 0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          {/* Caixas de mercadorias */}
          <mesh position={[-0.3, 0.2, 0.4]}>
            <boxGeometry args={[0.2, 0.4, 0.2]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.3, 0.15, 0.4]}>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
        </group>
      );
    }

    // Silo
    if (building.type === "silo") {
      return (
        <group>
          {/* Base do silo */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 8]} />
            <meshStandardMaterial color="#CD853F" flatShading />
          </mesh>
          {/* Corpo principal */}
          <mesh position={[0, height / 2 + 0.2, 0]}>
            <cylinderGeometry args={[0.4, 0.4, height - 0.4, 8]} />
            <meshStandardMaterial color="#CD853F" flatShading />
          </mesh>
          {/* Topo cônico */}
          <mesh position={[0, height + 0.3, 0]}>
            <coneGeometry args={[0.4, 0.6, 8]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          {/* Escada lateral */}
          <mesh position={[0.45, height / 2, 0]}>
            <boxGeometry args={[0.05, height, 0.1]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>
          {/* Degraus da escada */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[0.47, 0.5 + i * 0.3, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.08, 0.02, 0.15]} />
              <meshStandardMaterial color="#A9A9A9" flatShading />
            </mesh>
          ))}
          {/* Porta de carregamento */}
          <mesh position={[0, 0.4, 0.51]}>
            <boxGeometry args={[0.3, 0.6, 0.02]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
        </group>
      );
    }

    // Casas especializadas (minerador/lenhador) - variações das casas básicas
    if (building.type === "minerHouse" || building.type === "lumberjackHouse") {
      const isLumberjack = building.type === "lumberjackHouse";
      return (
        <group>
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color={isLumberjack ? "#8B4513" : "#696969"} flatShading />
          </mesh>
          {/* Telhado especializado */}
          <mesh position={[0, height + 0.3, 0]}>
            <coneGeometry args={[0.7, 0.6, 4]} />
            <meshStandardMaterial color={isLumberjack ? "#2F4F2F" : "#2F2F2F"} flatShading />
          </mesh>
          {/* Ferramentas na frente */}
          {isLumberjack ? (
            <mesh position={[0.4, 0.3, 0.4]} rotation={[0, 0, Math.PI / 4]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
              <meshStandardMaterial color="#8B4513" flatShading />
            </mesh>
          ) : (
            <mesh position={[0.4, 0.2, 0.4]}>
              <octahedronGeometry args={[0.1]} />
              <meshStandardMaterial color="#696969" flatShading />
            </mesh>
          )}
        </group>
      );
    }

    // Fallback para outros tipos
    if (buildingType.model.shape === "cylinder") {
      return (
        <mesh position={[0, height / 2, 0]}>
          <cylinderGeometry args={[0.4, 0.4, height, 8]} />
          <meshStandardMaterial color={buildingType.model.color} flatShading />
        </mesh>
      );
    }

    return (
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial color={buildingType.model.color} flatShading />
      </mesh>
    );
  };

  // Calcular altura do terreno baseada na posição
  const terrainHeight = Math.sin(position[0] * 0.1) * 0.8 + 
                        Math.cos(position[2] * 0.08) * 0.6 + 
                        Math.sin(position[0] * 0.15) * Math.cos(position[2] * 0.12) * 0.4;

  return (
    <mesh
      ref={ref}
      position={[position[0], terrainHeight, position[2]]}
      rotation={[0, building.rotation, 0]}
      castShadow
      receiveShadow
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
    >
      {renderBuilding()}
      {/* Ícones de status dos NPCs para casas */}
      {building.type.includes("House") && (
        <group position={[0, buildingType.height + 0.3, 0]}>
          {houseNpcs.map((npc, index) => {
              return (
                <Html
                  key={npc.id}
                  position={[
                    -0.4 + (index * 0.4),
                    0,
                    0
                  ]}
                  occlude
                >
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: npc.isSleeping ? 'lightblue' : 'lightgreen',
                      border: '1px solid black'
                    }}
                    title={npc.name + (npc.isSleeping ? ' (Dormindo)' : ' (Ativo)')}
                  />
                </Html>
              );
            })}
        </group>
      )}
      {/* Renderizar plantação se for uma fazenda */}
      {building.type === 'farm' && building.plantation && (
        <group position={[0, 0.01, 0]}>
          {building.plantation.planted && !building.plantation.harvested && (
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
              <meshStandardMaterial 
                color={building.plantation.ready ? "#32CD32" : "#90EE90"} 
              />
            </mesh>
          )}
          {building.plantation.planted && !building.plantation.harvested && (
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial 
                color={building.plantation.ready ? "#FFD700" : "#ADFF2F"} 
              />
            </mesh>
          )}
        </group>
      )}
    </mesh>
  );
};

export default Building;