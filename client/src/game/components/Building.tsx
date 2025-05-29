
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
      // Encontrar o NPC associado a esta casa e disparar evento
      const houseNpc = houseNpcs[0]; // Pegar o primeiro NPC da casa
      if (houseNpc) {
        // Disparar evento customizado para abrir o painel do NPC
        window.dispatchEvent(new CustomEvent('npcHouseClick', { 
          detail: { npc: houseNpc, building: building }
        }));
      }
    } else if (building.type === 'silo') {
      window.dispatchEvent(new CustomEvent('siloClick', { detail: building }));
    }
  };

  const renderBuilding = () => {
    const buildingType = buildingTypes[building.type];
    if (!buildingType) return null;

    const [width, length] = buildingType.size;
    const height = buildingType.height;

    // Casa básica - Design lowpoly melhorado
    if (building.type === "house") {
      return (
        <group>
          {/* Base da casa */}
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#E6D3B7" flatShading />
          </mesh>
          
          {/* Detalhes da parede */}
          <mesh position={[0, height / 2, 0.51]}>
            <boxGeometry args={[width - 0.1, height - 0.2, 0.01]} />
            <meshStandardMaterial color="#D2B48C" flatShading />
          </mesh>
          
          {/* Telhado principal */}
          <mesh position={[0, height + 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.8, 0.6, 4]} />
            <meshStandardMaterial color="#8B0000" flatShading />
          </mesh>
          
          {/* Cumeeira do telhado */}
          <mesh position={[0, height + 0.58, 0]}>
            <boxGeometry args={[0.8, 0.05, 0.05]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          
          {/* Porta com batente */}
          <mesh position={[0, 0.4, 0.52]}>
            <boxGeometry args={[0.3, 0.8, 0.03]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          <mesh position={[0, 0.4, 0.51]}>
            <boxGeometry args={[0.32, 0.82, 0.01]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Maçaneta */}
          <mesh position={[0.1, 0.4, 0.53]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} flatShading />
          </mesh>
          
          {/* Janelas com moldura */}
          <mesh position={[0.25, 0.6, 0.52]}>
            <boxGeometry args={[0.22, 0.22, 0.02]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.25, 0.6, 0.53]}>
            <boxGeometry args={[0.18, 0.18, 0.01]} />
            <meshStandardMaterial color="#87CEEB" flatShading />
          </mesh>
          <mesh position={[-0.25, 0.6, 0.52]}>
            <boxGeometry args={[0.22, 0.22, 0.02]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[-0.25, 0.6, 0.53]}>
            <boxGeometry args={[0.18, 0.18, 0.01]} />
            <meshStandardMaterial color="#87CEEB" flatShading />
          </mesh>
          
          {/* Base/fundação */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[width + 0.1, 0.1, length + 0.1]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>
        </group>
      );
    }

    // Casa do fazendeiro - Estilo rústico melhorado
    if (building.type === "farmerHouse") {
      return (
        <group>
          {/* Base da casa */}
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#A0522D" flatShading />
          </mesh>
          
          {/* Telhado de palha com textura */}
          <mesh position={[0, height + 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.8, 0.5, 4]} />
            <meshStandardMaterial color="#DAA520" flatShading />
          </mesh>
          
          {/* Camadas do telhado de palha */}
          <mesh position={[0, height + 0.1, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.85, 0.1, 4]} />
            <meshStandardMaterial color="#B8860B" flatShading />
          </mesh>
          
          {/* Chaminé com detalhes */}
          <mesh position={[0.3, height + 0.6, 0.3]}>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>
          <mesh position={[0.3, height + 0.92, 0.3]}>
            <boxGeometry args={[0.18, 0.04, 0.18]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
          
          {/* Fumaça da chaminé */}
          <mesh position={[0.3, height + 1.1, 0.3]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#D3D3D3" transparent opacity={0.6} flatShading />
          </mesh>
          
          {/* Porta rústica */}
          <mesh position={[0, 0.4, 0.52]}>
            <boxGeometry args={[0.35, 0.8, 0.03]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Dobradiças */}
          <mesh position={[-0.15, 0.6, 0.53]}>
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
          <mesh position={[-0.15, 0.2, 0.53]}>
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
          
          {/* Cesto de verduras na entrada */}
          <mesh position={[0.4, 0.15, 0.4]}>
            <cylinderGeometry args={[0.1, 0.08, 0.3, 8]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.4, 0.32, 0.4]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#228B22" flatShading />
          </mesh>
        </group>
      );
    }

    // Fazenda - Design mais realista
    if (building.type === "farm") {
      return (
        <group>
          {/* Terra arada com textura */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.9, 0.1, 0.9]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Sulcos detalhados */}
          {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
            <mesh key={i} position={[x, 0.11, 0]}>
              <boxGeometry args={[0.05, 0.02, 0.8]} />
              <meshStandardMaterial color="#654321" flatShading />
            </mesh>
          ))}
          
          {/* Cerca ao redor */}
          {[-0.45, 0.45].map((x, i) => (
            <mesh key={i} position={[x, 0.25, 0]}>
              <boxGeometry args={[0.02, 0.5, 0.9]} />
              <meshStandardMaterial color="#8B4513" flatShading />
            </mesh>
          ))}
          {[-0.45, 0.45].map((z, i) => (
            <mesh key={i} position={[0, 0.25, z]}>
              <boxGeometry args={[0.9, 0.5, 0.02]} />
              <meshStandardMaterial color="#8B4513" flatShading />
            </mesh>
          ))}
          
          {/* Espantalho melhorado */}
          <mesh position={[0.3, 0.4, 0.3]}>
            <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          {/* Corpo do espantalho */}
          <mesh position={[0.3, 0.55, 0.3]}>
            <boxGeometry args={[0.15, 0.2, 0.08]} />
            <meshStandardMaterial color="#4169E1" flatShading />
          </mesh>
          {/* Cabeça */}
          <mesh position={[0.3, 0.7, 0.3]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#DEB887" flatShading />
          </mesh>
          {/* Chapéu */}
          <mesh position={[0.3, 0.78, 0.3]}>
            <cylinderGeometry args={[0.1, 0.08, 0.06, 8]} />
            <meshStandardMaterial color="#8B0000" flatShading />
          </mesh>
          {/* Braços */}
          <mesh position={[0.3, 0.55, 0.3]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Regador */}
          <mesh position={[-0.3, 0.1, -0.3]}>
            <cylinderGeometry args={[0.08, 0.06, 0.12, 8]} />
            <meshStandardMaterial color="#708090" flatShading />
          </mesh>
          <mesh position={[-0.22, 0.14, -0.3]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.01, 0.01, 0.15, 6]} />
            <meshStandardMaterial color="#708090" flatShading />
          </mesh>
        </group>
      );
    }

    // Serraria - Design industrial lowpoly
    if (building.type === "lumberMill") {
      return (
        <group>
          {/* Estrutura principal */}
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Telhado metálico */}
          <mesh position={[0, height + 0.2, 0]}>
            <boxGeometry args={[1.1, 0.05, 1.1]} />
            <meshStandardMaterial color="#708090" metalness={0.6} flatShading />
          </mesh>
          <mesh position={[0, height + 0.3, 0]}>
            <boxGeometry args={[1.05, 0.05, 1.05]} />
            <meshStandardMaterial color="#696969" metalness={0.6} flatShading />
          </mesh>
          
          {/* Serra circular grande */}
          <mesh position={[0, height / 2, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.03, 16]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} flatShading />
          </mesh>
          
          {/* Dentes da serra */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.37, height / 2, 0.6 + Math.sin(angle) * 0.37]}
                rotation={[Math.PI / 2, angle, 0]}
              >
                <coneGeometry args={[0.02, 0.04, 3]} />
                <meshStandardMaterial color="#A0A0A0" metalness={0.8} flatShading />
              </mesh>
            );
          })}
          
          {/* Mesa de corte */}
          <mesh position={[0, height / 2 - 0.2, 0.6]}>
            <boxGeometry args={[0.8, 0.05, 0.4]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          
          {/* Pilha de toras */}
          {[0, 1, 2].map((layer) => (
            <group key={layer}>
              {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
                <mesh
                  key={i}
                  position={[x, 0.08 + layer * 0.16, -0.3]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
                  <meshStandardMaterial color={layer % 2 === 0 ? "#D2691E" : "#CD853F"} flatShading />
                </mesh>
              ))}
            </group>
          ))}
          
          {/* Esteira transportadora */}
          <mesh position={[0.3, height / 2 - 0.1, 0]}>
            <boxGeometry args={[0.1, 0.02, 0.8]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
        </group>
      );
    }

    // Poço de água - Design medieval
    if (building.type === "waterWell") {
      return (
        <group>
          {/* Base do poço com pedras */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.6, 12]} />
            <meshStandardMaterial color="#696969" flatShading />
          </mesh>
          
          {/* Pedras individuais na base */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.42, 0.2 + Math.random() * 0.1, Math.sin(angle) * 0.42]}
                rotation={[Math.random(), Math.random(), Math.random()]}
              >
                <boxGeometry args={[0.08, 0.15, 0.06]} />
                <meshStandardMaterial color="#778899" flatShading />
              </mesh>
            );
          })}
          
          {/* Estrutura do teto */}
          <mesh position={[-0.3, 0.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.3, 0.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Viga superior */}
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.6, 0.06, 0.06]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Roldana */}
          <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          
          {/* Telhado do poço */}
          <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.5, 0.4, 4]} />
            <meshStandardMaterial color="#8B0000" flatShading />
          </mesh>
          
          {/* Balde */}
          <mesh position={[0.15, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.06, 0.12, 8]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          
          {/* Alça do balde */}
          <mesh position={[0.15, 0.58, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.05, 0.01, 8, 16]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
          
          {/* Corda */}
          <mesh position={[0.15, 0.85, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.7, 6]} />
            <meshStandardMaterial color="#DEB887" flatShading />
          </mesh>
        </group>
      );
    }

    // Padaria - Design aconchegante
    if (building.type === "bakery") {
      return (
        <group>
          {/* Base da padaria */}
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#D2691E" flatShading />
          </mesh>
          
          {/* Telhado com telhas */}
          <mesh position={[0, height + 0.25, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.8, 0.5, 4]} />
            <meshStandardMaterial color="#8B0000" flatShading />
          </mesh>
          
          {/* Fileiras de telhas */}
          {[0.1, 0.2, 0.3].map((y, i) => (
            <mesh key={i} position={[0, height + y, 0]} rotation={[0, Math.PI / 4, 0]}>
              <torusGeometry args={[0.7 - i * 0.1, 0.02, 8, 16]} />
              <meshStandardMaterial color="#A0522D" flatShading />
            </mesh>
          ))}
          
          {/* Chaminé com tijolos */}
          <mesh position={[0.3, height + 0.5, 0.3]}>
            <boxGeometry args={[0.12, 0.6, 0.12]} />
            <meshStandardMaterial color="#B22222" flatShading />
          </mesh>
          
          {/* Padrão de tijolos na chaminé */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[0.3, height + 0.2 + i * 0.1, 0.3]}>
              <boxGeometry args={[0.13, 0.02, 0.13]} />
              <meshStandardMaterial color="#8B0000" flatShading />
            </mesh>
          ))}
          
          {/* Fumaça da chaminé */}
          {[1.0, 1.2, 1.4].map((y, i) => (
            <mesh key={i} position={[0.3 + Math.sin(i) * 0.05, height + y, 0.3 + Math.cos(i) * 0.05]}>
              <sphereGeometry args={[0.04 + i * 0.01, 8, 8]} />
              <meshStandardMaterial color="#F0F0F0" transparent opacity={0.7 - i * 0.2} flatShading />
            </mesh>
          ))}
          
          {/* Forno externo */}
          <mesh position={[0, 0.4, 0.6]}>
            <sphereGeometry args={[0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Porta do forno com detalhes */}
          <mesh position={[0, 0.4, 0.85]}>
            <cylinderGeometry args={[0.15, 0.15, 0.03, 12]} />
            <meshStandardMaterial color="#2F1B14" flatShading />
          </mesh>
          <mesh position={[0, 0.4, 0.87]}>
            <cylinderGeometry args={[0.12, 0.12, 0.01, 12]} />
            <meshStandardMaterial color="#000000" flatShading />
          </mesh>
          
          {/* Vitrine da padaria */}
          <mesh position={[0.4, 0.3, 0.4]}>
            <boxGeometry args={[0.15, 0.6, 0.2]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.4, 0.35, 0.51]}>
            <boxGeometry args={[0.12, 0.3, 0.01]} />
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} flatShading />
          </mesh>
          
          {/* Pães na vitrine */}
          <mesh position={[0.4, 0.25, 0.45]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#DEB887" flatShading />
          </mesh>
          <mesh position={[0.37, 0.25, 0.42]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#D2B48C" flatShading />
          </mesh>
        </group>
      );
    }

    // Mina de pedra - Design realista de entrada de mina
    if (building.type === "stoneMine") {
      return (
        <group>
          {/* Entrada da mina escavada */}
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.6, 0.8, 1.5, 12]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
          
          {/* Rochas ao redor da entrada */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 0.9 + Math.random() * 0.3;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * distance,
                  0.1 + Math.random() * 0.2,
                  Math.sin(angle) * distance
                ]}
                rotation={[Math.random(), Math.random(), Math.random()]}
              >
                <dodecahedronGeometry args={[0.15 + Math.random() * 0.1]} />
                <meshStandardMaterial color="#696969" flatShading />
              </mesh>
            );
          })}
          
          {/* Estrutura de suporte em madeira */}
          <mesh position={[-0.4, 0.8, 0]} rotation={[0, 0, Math.PI / 8]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.4, 0.8, 0]} rotation={[0, 0, -Math.PI / 8]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Trave horizontal */}
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[1, 0.08, 0.08]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Vigas de suporte adicionais */}
          <mesh position={[0, 0.4, 0.5]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.8, 0.06, 0.06]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          
          {/* Trilhos da mina */}
          <mesh position={[-0.15, 0.02, 0]}>
            <boxGeometry args={[0.02, 0.02, 1]} />
            <meshStandardMaterial color="#A0A0A0" metalness={0.8} flatShading />
          </mesh>
          <mesh position={[0.15, 0.02, 0]}>
            <boxGeometry args={[0.02, 0.02, 1]} />
            <meshStandardMaterial color="#A0A0A0" metalness={0.8} flatShading />
          </mesh>
          
          {/* Dormentes dos trilhos */}
          {[-0.4, -0.2, 0, 0.2, 0.4].map((z, i) => (
            <mesh key={i} position={[0, 0.01, z]}>
              <boxGeometry args={[0.4, 0.03, 0.08]} />
              <meshStandardMaterial color="#654321" flatShading />
            </mesh>
          ))}
          
          {/* Carrinho de mineração */}
          <mesh position={[0, 0.15, 0.3]}>
            <boxGeometry args={[0.25, 0.15, 0.3]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Rodas do carrinho */}
          {[-0.1, 0.1].map((x, i) => (
            <group key={i}>
              <mesh position={[x, 0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
                <meshStandardMaterial color="#2F2F2F" flatShading />
              </mesh>
              <mesh position={[x, 0.05, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
                <meshStandardMaterial color="#2F2F2F" flatShading />
              </mesh>
            </group>
          ))}
          
          {/* Pilha de pedras extraídas */}
          <group position={[0.6, 0, 0.4]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  (Math.random() - 0.5) * 0.3,
                  i * 0.08 + Math.random() * 0.05,
                  (Math.random() - 0.5) * 0.3
                ]}
                rotation={[Math.random(), Math.random(), Math.random()]}
              >
                <octahedronGeometry args={[0.08 + Math.random() * 0.05]} />
                <meshStandardMaterial color={i % 2 === 0 ? "#696969" : "#778899"} flatShading />
              </mesh>
            ))}
          </group>
          
          {/* Lanterna na entrada */}
          <mesh position={[0.5, 1.1, 0.2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
          <mesh position={[0.5, 1.18, 0.2]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} flatShading />
          </mesh>
        </group>
      );
    }

    // Mercado - Design comercial atrativo
    if (building.type === "market") {
      return (
        <group>
          {/* Base do mercado */}
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#DAA520" flatShading />
          </mesh>
          
          {/* Toldo listrado */}
          <mesh position={[0, height + 0.1, 0.3]} rotation={[-Math.PI / 8, 0, 0]}>
            <boxGeometry args={[1.2, 0.05, 0.8]} />
            <meshStandardMaterial color="#FF6347" flatShading />
          </mesh>
          <mesh position={[0, height + 0.12, 0.3]} rotation={[-Math.PI / 8, 0, 0]}>
            <boxGeometry args={[1.15, 0.02, 0.75]} />
            <meshStandardMaterial color="#FFFFFF" flatShading />
          </mesh>
          
          {/* Listras do toldo */}
          {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
            <mesh key={i} position={[x, height + 0.13, 0.3]} rotation={[-Math.PI / 8, 0, 0]}>
              <boxGeometry args={[0.1, 0.01, 0.75]} />
              <meshStandardMaterial color="#FF4500" flatShading />
            </mesh>
          ))}
          
          {/* Postes do toldo */}
          <mesh position={[-0.5, height / 2 + 0.3, 0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.5, height / 2 + 0.3, 0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Balcão de vendas */}
          <mesh position={[0, 0.4, 0.4]}>
            <boxGeometry args={[0.8, 0.8, 0.15]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Produtos expostos */}
          <mesh position={[-0.25, 0.85, 0.45]}>
            <boxGeometry args={[0.15, 0.3, 0.1]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[-0.25, 1.0, 0.45]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#FF0000" flatShading />
          </mesh>
          <mesh position={[-0.22, 1.0, 0.42]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#FFD700" flatShading />
          </mesh>
          
          <mesh position={[0, 0.85, 0.45]}>
            <boxGeometry args={[0.15, 0.3, 0.1]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          <mesh position={[0, 1.0, 0.45]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
            <meshStandardMaterial color="#DEB887" flatShading />
          </mesh>
          
          <mesh position={[0.25, 0.85, 0.45]}>
            <boxGeometry args={[0.15, 0.3, 0.1]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.25, 1.0, 0.45]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          
          {/* Placa do mercado */}
          <mesh position={[0, height + 0.5, 0.1]}>
            <boxGeometry args={[0.6, 0.2, 0.02]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          <mesh position={[0, height + 0.5, 0.11]}>
            <boxGeometry args={[0.55, 0.15, 0.01]} />
            <meshStandardMaterial color="#FFFFFF" flatShading />
          </mesh>
          
          {/* Cestas de produtos */}
          <mesh position={[0.4, 0.1, 0.3]}>
            <cylinderGeometry args={[0.08, 0.06, 0.15, 8]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[0.4, 0.2, 0.3]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#32CD32" flatShading />
          </mesh>
          
          <mesh position={[-0.4, 0.1, 0.3]}>
            <cylinderGeometry args={[0.08, 0.06, 0.15, 8]} />
            <meshStandardMaterial color="#8B4513" flatShading />
          </mesh>
          <mesh position={[-0.4, 0.2, 0.3]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#FF4500" flatShading />
          </mesh>
        </group>
      );
    }

    // Silo - Design agrícola moderno
    if (building.type === "silo") {
      return (
        <group>
          {/* Base do silo */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.52, 0.52, 0.3, 12]} />
            <meshStandardMaterial color="#A0A0A0" flatShading />
          </mesh>
          
          {/* Corpo principal com nervuras */}
          <mesh position={[0, height / 2 + 0.15, 0]}>
            <cylinderGeometry args={[0.45, 0.45, height - 0.3, 16]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.6} flatShading />
          </mesh>
          
          {/* Nervuras verticais */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.46, height / 2 + 0.15, Math.sin(angle) * 0.46]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.02, height - 0.3, 0.03]} />
                <meshStandardMaterial color="#A0A0A0" flatShading />
              </mesh>
            );
          })}
          
          {/* Anéis horizontais */}
          {[0.3, 0.8, 1.3, 1.8].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <torusGeometry args={[0.46, 0.02, 8, 16]} />
              <meshStandardMaterial color="#808080" flatShading />
            </mesh>
          ))}
          
          {/* Topo cônico com ventilação */}
          <mesh position={[0, height + 0.3, 0]}>
            <coneGeometry args={[0.45, 0.6, 12]} />
            <meshStandardMaterial color="#696969" metalness={0.7} flatShading />
          </mesh>
          
          {/* Respiradouros no topo */}
          {Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / 4) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.2, height + 0.5, Math.sin(angle) * 0.2]}
              >
                <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
                <meshStandardMaterial color="#2F2F2F" flatShading />
              </mesh>
            );
          })}
          
          {/* Escada em espiral */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const y = 0.3 + (i / 12) * (height - 0.6);
            return (
              <group key={i}>
                <mesh position={[Math.cos(angle) * 0.5, y, Math.sin(angle) * 0.5]}>
                  <boxGeometry args={[0.15, 0.02, 0.03]} />
                  <meshStandardMaterial color="#FFD700" flatShading />
                </mesh>
                <mesh position={[Math.cos(angle) * 0.47, y + 0.15, Math.sin(angle) * 0.47]}>
                  <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
                  <meshStandardMaterial color="#FFD700" flatShading />
                </mesh>
              </group>
            );
          })}
          
          {/* Porta de carregamento com detalhes */}
          <mesh position={[0, 0.4, 0.52]}>
            <boxGeometry args={[0.3, 0.6, 0.02]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
          <mesh position={[0, 0.4, 0.53]}>
            <boxGeometry args={[0.28, 0.58, 0.01]} />
            <meshStandardMaterial color="#4169E1" flatShading />
          </mesh>
          
          {/* Dobradiças da porta */}
          <mesh position={[-0.13, 0.6, 0.53]}>
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <meshStandardMaterial color="#A0A0A0" flatShading />
          </mesh>
          <mesh position={[-0.13, 0.2, 0.53]}>
            <boxGeometry args={[0.03, 0.08, 0.01]} />
            <meshStandardMaterial color="#A0A0A0" flatShading />
          </mesh>
          
          {/* Válvula de descarga */}
          <mesh position={[0, 0.25, 0.52]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} flatShading />
          </mesh>
          
          {/* Indicador de nível */}
          <mesh position={[0.47, height / 2, 0]}>
            <boxGeometry args={[0.02, 0.4, 0.1]} />
            <meshStandardMaterial color="#FFFFFF" flatShading />
          </mesh>
          <mesh position={[0.48, height / 2 + 0.1, 0]}>
            <boxGeometry args={[0.01, 0.2, 0.08]} />
            <meshStandardMaterial color="#FF0000" flatShading />
          </mesh>
        </group>
      );
    }

    // Casas especializadas com mais detalhes
    if (building.type === "minerHouse" || building.type === "lumberjackHouse") {
      const isLumberjack = building.type === "lumberjackHouse";
      return (
        <group>
          {/* Base da casa */}
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color={isLumberjack ? "#8B4513" : "#696969"} flatShading />
          </mesh>
          
          {/* Telhado especializado */}
          <mesh position={[0, height + 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.8, 0.6, 4]} />
            <meshStandardMaterial color={isLumberjack ? "#2F4F2F" : "#2F2F2F"} flatShading />
          </mesh>
          
          {/* Detalhes específicos da profissão */}
          {isLumberjack ? (
            <group>
              {/* Machado encostado na parede */}
              <mesh position={[0.4, 0.4, 0.3]} rotation={[0, 0, Math.PI / 6]}>
                <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
                <meshStandardMaterial color="#8B4513" flatShading />
              </mesh>
              <mesh position={[0.5, 0.7, 0.3]} rotation={[0, 0, Math.PI / 6]}>
                <cylinderGeometry args={[0.1, 0.05, 0.03, 8]} />
                <meshStandardMaterial color="#A0A0A0" flatShading />
              </mesh>
              
              {/* Pilha de lenha */}
              {Array.from({ length: 6 }).map((_, i) => (
                <mesh
                  key={i}
                  position={[-0.4, 0.05 + (i % 3) * 0.08, 0.2 + Math.floor(i / 3) * 0.16]}
                  rotation={[0, i * 0.1, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.03, 0.04, 0.25, 8]} />
                  <meshStandardMaterial color={i % 2 === 0 ? "#D2691E" : "#CD853F"} flatShading />
                </mesh>
              ))}
            </group>
          ) : (
            <group>
              {/* Picareta e martelo */}
              <mesh position={[0.4, 0.3, 0.4]} rotation={[0.3, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
                <meshStandardMaterial color="#8B4513" flatShading />
              </mesh>
              <mesh position={[0.4, 0.55, 0.5]} rotation={[0.3, 0, Math.PI / 2]}>
                <boxGeometry args={[0.2, 0.05, 0.05]} />
                <meshStandardMaterial color="#A0A0A0" flatShading />
              </mesh>
              
              {/* Pedras e minerais */}
              {Array.from({ length: 4 }).map((_, i) => (
                <mesh
                  key={i}
                  position={[-0.4 + i * 0.1, 0.08, 0.3]}
                  rotation={[Math.random(), Math.random(), Math.random()]}
                >
                  <octahedronGeometry args={[0.05]} />
                  <meshStandardMaterial color={i % 2 === 0 ? "#696969" : "#C0C0C0"} flatShading />
                </mesh>
              ))}
            </group>
          )}
          
          {/* Janela com moldura */}
          <mesh position={[0.3, 0.6, 0.52]}>
            <boxGeometry args={[0.22, 0.22, 0.02]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          <mesh position={[0.3, 0.6, 0.53]}>
            <boxGeometry args={[0.18, 0.18, 0.01]} />
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} flatShading />
          </mesh>
          
          {/* Porta */}
          <mesh position={[-0.2, 0.4, 0.52]}>
            <boxGeometry args={[0.3, 0.8, 0.02]} />
            <meshStandardMaterial color="#654321" flatShading />
          </mesh>
          
          {/* Fundação */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[width + 0.1, 0.1, length + 0.1]} />
            <meshStandardMaterial color="#2F2F2F" flatShading />
          </mesh>
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

  return (
    <mesh
      ref={ref}
      position={position as [number, number, number]}
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
                flatShading
              />
            </mesh>
          )}
          {building.plantation.planted && !building.plantation.harvested && (
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial 
                color={building.plantation.ready ? "#FFD700" : "#ADFF2F"} 
                flatShading
              />
            </mesh>
          )}
        </group>
      )}
    </mesh>
  );
};

export default Building;
