import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useMapEditorStore } from "../stores/useMapEditorStore";

const TerrainEditor = () => {
  const { camera, raycaster, mouse, gl } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const previewRef = useRef<THREE.Mesh>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3 | null>(null);

  const {
    isEditorMode,
    selectedTool,
    brushSize,
    brushStrength,
    gridSize,
    selectedTerrainType,
    updateTerrainTile,
    getTerrainTile,
  } = useMapEditorStore();

  // Handle mouse events
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!isEditorMode || selectedTool === "select") return;
      setIsMouseDown(true);
      handleTerrainEdit();
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseMove = () => {
      if (isMouseDown && isEditorMode && selectedTool !== "select") {
        handleTerrainEdit();
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isEditorMode, selectedTool, isMouseDown, currentPosition]);

  // Update raycasting and preview
  useFrame(() => {
    if (!isEditorMode) return;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Create a large plane for intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, intersection)) {
      setCurrentPosition(intersection);

      // Update preview position
      if (previewRef.current && selectedTool !== "select") {
        const gridX = Math.floor(intersection.x + 0.5);
        const gridZ = Math.floor(intersection.z + 0.5);

        previewRef.current.position.set(gridX, 0.1, gridZ);
        previewRef.current.visible = true;

        // Update preview size based on brush size
        previewRef.current.scale.set(brushSize, 1, brushSize);
      }
    }
  });

  const handleTerrainEdit = () => {
    if (!currentPosition) return;

    const gridX = Math.floor(currentPosition.x + 0.5);
    const gridZ = Math.floor(currentPosition.z + 0.5);

    // Apply brush effect in radius
    const radius = Math.floor(brushSize / 2);

    for (let x = gridX - radius; x <= gridX + radius; x++) {
      for (let z = gridZ - radius; z <= gridZ + radius; z++) {
        if (x < 0 || x >= gridSize || z < 0 || z >= gridSize) continue;

        const distance = Math.sqrt((x - gridX) ** 2 + (z - gridZ) ** 2);
        if (distance > radius) continue;

        const strength = (1 - distance / radius) * brushStrength;

        applyToolEffect(x, z, strength);
      }
    }
  };

  const applyToolEffect = (x: number, z: number, strength: number) => {
    const existingTile = getTerrainTile(x, z);
    const currentHeight = existingTile?.height || 0;

    switch (selectedTool) {
      case "terrain_height":
        // Increase height
        updateTerrainTile(x, z, {
          height: Math.min(currentHeight + strength, 10),
        });
        break;

      case "terrain_paint":
        updateTerrainTile(x, z, {
          type: selectedTerrainType,
          height: currentHeight,
        });
        break;

      case "water":
        updateTerrainTile(x, z, {
          type: "water",
          height: Math.min(currentHeight, 0),
        });
        break;

      case "eraser":
        // Reset to default
        updateTerrainTile(x, z, {
          height: 0,
          type: "grass",
        });
        break;
    }
  };

  const getTerrainColor = (type: string) => {
    switch (type) {
      case "grass": return "#4CAF50";
      case "dirt": return "#8B4513";
      case "sand": return "#F4A460";
      case "stone": return "#708090";
      case "water": return "#4FC3F7";
      default: return "#4CAF50";
    }
  };

  const getPreviewColor = () => {
    switch (selectedTool) {
      case "terrain_height": return "#FFD700";
      case "terrain_paint": return getTerrainColor(selectedTerrainType);
      case "water": return "#4FC3F7";
      case "eraser": return "#FF6B6B";
      default: return "#FFFFFF";
    }
  };

  if (!isEditorMode) return null;

  return (
    <group>
      {/* Brush Preview */}
      {selectedTool !== "select" && (
        <mesh ref={previewRef} position={[0, 0.1, 0]} visible={false}>
          <ringGeometry args={[0.4, 0.5, 8]} />
          <meshBasicMaterial 
            color={getPreviewColor()} 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Editor Grid Overlay */}
      <gridHelper 
        args={[gridSize, gridSize, "#FF0000", "#FF0000"]} 
        position={[gridSize/2 - 0.5, 0.05, gridSize/2 - 0.5]}
      >
        <meshBasicMaterial transparent opacity={0.3} />
      </gridHelper>
    </group>
  );
};

export default TerrainEditor;