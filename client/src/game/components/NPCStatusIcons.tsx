
import { useMemo } from "react";
import { Html } from "@react-three/drei";
import { useNpcStore } from "../stores/useNpcStore";
import { Building } from "../stores/useBuildingStore";

interface NPCStatusIconsProps {
  building: Building;
  buildingHeight: number;
}

const NPCStatusIcons = ({ building, buildingHeight }: NPCStatusIconsProps) => {
  const npcs = useNpcStore(state => state.npcs);

  const houseNpcs = useMemo(() => {
    return npcs.filter(npc => npc.homeId === building.id);
  }, [npcs, building.id]);

  if (!building.type.includes("House") || houseNpcs.length === 0) {
    return null;
  }

  const stateIcons = {
    idle: { icon: "💤", color: "#6B7280" },
    moving: { icon: "🚶", color: "#10B981" },
    working: { icon: "⚡", color: "#F59E0B" },
    gathering: { icon: "⛏️", color: "#3B82F6" },
    resting: { icon: "😴", color: "#8B5CF6" },
    searching: { icon: "🔍", color: "#EF4444" },
    lunch: { icon: "🍽️", color: "#F97316" }
  };

  return (
    <group position={[0, buildingHeight + 0.3, 0]}>
      {houseNpcs.map((npc, index) => {
        // Determinar estado de exibição
        let displayState = npc.state;
        if (npc.state === "resting" && npc.currentSchedule === "lunch") {
          displayState = "lunch";
        }

        const stateInfo = stateIcons[displayState as keyof typeof stateIcons] || stateIcons.idle;

        return (
          <Html
            key={`${npc.id}-${index}`}
            position={[index * 1.0 - (houseNpcs.length - 1) * 0.5, 0, 0]}
            center
            distanceFactor={6}
            transform
            occlude="blending"
          >
            <div className="flex flex-col items-center pointer-events-none select-none">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border border-white backdrop-blur-sm"
                style={{ backgroundColor: stateInfo.color }}
              >
                {stateInfo.icon}
              </div>
              <div 
                className="text-xs font-semibold px-1 py-0.5 rounded mt-1 shadow-md whitespace-nowrap"
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
      })}
    </group>
  );
};

export default NPCStatusIcons;
