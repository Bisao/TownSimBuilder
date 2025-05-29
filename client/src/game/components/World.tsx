
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stats, Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useGameStore } from "../stores/useGameStore";
// Controls interface is for state management, not key mapping

// Components
import Terrain from "./Terrain";
import CameraControls from "./CameraControls";
import Building from "./Building";
import Npc from "./Npc";
import Resource from "./Resource";
import PlacementIndicator from "./PlacementIndicator";
import DayNightCycle from "./DayNightCycle";
import Sky from "./Sky";
import ManualNpcController from "./ManualNpcController";

// Stores
import { useBuildingStore } from "../stores/useBuildingStore";
import { useNpcStore } from "../stores/useNpcStore";
import { useResourceStore } from "../stores/useResourceStore";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "place", keys: ["Space"] },
  { name: "cancel", keys: ["Escape"] },
];

const World: React.FC = () => {
  const { phase } = useGameStore();
  const { buildings } = useBuildingStore();
  const { npcs } = useNpcStore();
  const { resources } = useResourceStore();

  if (phase !== "game") {
    return null;
  }

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{
          position: [25, 15, 25],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true }}
      >
        <KeyboardControls map={keyboardMap}>
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              {/* Lighting */}
              <ambientLight intensity={0.3} />
              <directionalLight
                position={[50, 50, 50]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={100}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
              />

              {/* Environment */}
              <Sky />
              <Terrain />
              
              {/* Day/Night Cycle */}
              <DayNightCycle />

              {/* Game Objects */}
              {Object.entries(buildings).map(([id, building]) => (
                <Building
                  key={id}
                  id={id}
                  type={building.type}
                  position={building.position}
                  rotation={building.rotation}
                />
              ))}

              {Object.entries(npcs).map(([id, npc]) => (
                <Npc
                  key={id}
                  id={id}
                  type={npc.type}
                  position={npc.position}
                  rotation={npc.rotation}
                />
              ))}

              {Object.entries(resources).map(([id, resource]) => (
                <Resource
                  key={id}
                  id={id}
                  type={resource.type}
                  position={resource.position}
                  amount={resource.amount}
                />
              ))}

              {/* Placement Indicator */}
              <PlacementIndicator />

              {/* Camera Controls */}
              <CameraControls />

              {/* Manual NPC Controller */}
              <ManualNpcController />
            </Physics>
          </Suspense>
        </KeyboardControls>

        {/* Performance Stats */}
        <Stats />
      </Canvas>
    </div>
  );
};

export default World;
