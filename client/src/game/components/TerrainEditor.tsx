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

  // Handle terrain editing
  const handleTerrainEdit = () => {
    if (!currentPosition || !isEditorMode) return;

    const x = Math.round(currentPosition.x);
    const z = Math.round(currentPosition.z);

    switch (selectedTool) {
      case "terrain_height":
        const currentTile = getTerrainTile(x, z);
        const newHeight = Math.max(0, (currentTile?.height || 0) + brushStrength);
        updateTerrainTile(x, z, { height: newHeight });
        break;

      case "terrain_paint":
        updateTerrainTile(x, z, { type: selectedTerrainType });
        break;

      case "eraser":
        updateTerrainTile(x, z, { height: 0, type: "grass" });
        break;

      case "water":
        updateTerrainTile(x, z, { type: "water", height: 0 });
        break;
    }
  };

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

    // Create a plane for intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
      setCurrentPosition(intersectionPoint);

      // Update preview position
      if (previewRef.current) {
        previewRef.current.position.set(
          Math.round(intersectionPoint.x),
          0.1,
          Math.round(intersectionPoint.z)
        );
        previewRef.current.visible = selectedTool !== "select";

        // Update preview scale based on brush size
        const scale = brushSize * 0.5;
        previewRef.current.scale.set(scale, 1, scale);
      }
    }
  });

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