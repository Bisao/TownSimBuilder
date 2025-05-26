import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { buildingTypes } from "../constants/buildings";
import { Building as BuildingType } from "../stores/useBuildingStore";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface BuildingProps {
  building: BuildingType;
  onClick?: (building: BuildingType) => void;
}

const Building = ({ building, onClick }: BuildingProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const lastProducedRef = useRef<number>(building.lastProduced);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Get building type definition
  const buildingType = buildingTypes[building.type];
  if (!buildingType) return null;

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
      const npc = window.dispatchEvent(new CustomEvent('npcHouseClick', { detail: building }));
    }
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
      {buildingType.model.shape === "box" ? (
        <boxGeometry args={[sizeX, buildingType.height, sizeZ]} />
      ) : (
        <cylinderGeometry args={[sizeX / 2, sizeX / 2, buildingType.height, 16]} />
      )}
      <meshStandardMaterial
        map={woodTexture}
        color={buildingType.model.color}
        emissive={hovered ? new THREE.Color(0x555555) : undefined}
      />
      {/* Ícones de status dos NPCs */}
        {building.type.includes("House") && (
          <group position={[0, buildingType.height + 0.5, 0]}>
            {/* Encontrar NPCs associados a esta casa */}
            {(() => {
              // Acessar NPCs via window global ou context
              const npcs = (window as any).gameNpcs || [];
              const houseNpcs = npcs.filter((npc: any) => npc.homeId === building.id);

              return houseNpcs.map((npc: any, index: number) => {
                const stateIcons = {
                  idle: { icon: "💤", color: "#6B7280" },
                  moving: { icon: "🚶", color: "#10B981" },
                  working: { icon: "⚡", color: "#F59E0B" },
                  gathering: { icon: "⛏️", color: "#3B82F6" },
                  resting: { icon: "😴", color: "#8B5CF6" },
                  searching: { icon: "🔍", color: "#EF4444" },
                  lunch: { icon: "🍽️", color: "#F97316" }
                };

                // Determinar estado baseado no horário se estiver em casa
                let displayState = npc.state;
                if (npc.state === "resting" && npc.currentSchedule === "lunch") {
                  displayState = "lunch";
                }

                const stateInfo = stateIcons[displayState as keyof typeof stateIcons] || stateIcons.idle;

                return (
                  <Html
                    key={`${npc.id}-${index}`}
                    position={[index * 0.8 - (houseNpcs.length - 1) * 0.4, 0, 0]}
                    center
                    distanceFactor={8}
                  >
                    <div 
                      className="flex flex-col items-center pointer-events-none"
                      style={{ transform: 'translate(-50%, -50%)' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white"
                        style={{ backgroundColor: stateInfo.color }}
                      >
                        {stateInfo.icon}
                      </div>
                      <div 
                        className="text-xs font-semibold px-2 py-1 rounded mt-1 shadow-md"
                        style={{ 
                          backgroundColor: stateInfo.color,
                          color: 'white'
                        }}
                      >
                        {displayState === "idle" ? "Parado" :
                         displayState === "moving" ? "Movendo" :
                         displayState === "working" ? "Trabalhando" :
                         displayState === "gathering" ? "Coletando" :
                         displayState === "resting" ? "Descansando" :
                         displayState === "searching" ? "Procurando" :
                         displayState === "lunch" ? "Almoçando" : "Desconhecido"}
                      </div>
                    </div>
                  </Html>
                );
              });
            })()}
          </group>
        )}
    </mesh>
  );
};

export default Building;