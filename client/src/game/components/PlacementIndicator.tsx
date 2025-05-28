import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildingTypes } from "../constants/buildings";
import { useBuildingStore } from "../stores/useBuildingStore";
import { useGameStore } from "../stores/useGameStore";
import { useKeyboardControls } from "@react-three/drei";
import { Controls } from "../stores/useGameStore";

const PlacementIndicator = () => {
  const { camera, raycaster, scene, gl } = useThree();
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const indicatorRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  const [mousePosition, setMousePosition] = useState<THREE.Vector2>(new THREE.Vector2());

  useFrame(() => {
    if (gridRef.current) {
      // Ajusta a escala do grid inversamente proporcional à distância da câmera
      const distance = camera.position.y;
      const scale = Math.max(0.5, 50 / distance); // Quanto mais longe, menor o grid
      gridRef.current.scale.set(scale, scale, scale);
    }
  });

  const {
    selectedBuildingType,
    placementPosition,
    placementValid,
    setPlacementPosition,
    setPlacementValid,
    selectBuilding,
  } = useGameStore();

  const { canPlaceBuilding, placeBuilding } = useBuildingStore();
  const buildingType = selectedBuildingType ? buildingTypes[selectedBuildingType] : null;

  // Keyboard controls
  const placeKey = useKeyboardControls<Controls>((state) => state.place);
  const cancelKey = useKeyboardControls<Controls>((state) => state.cancel);

  // Track key press state to avoid repeated actions
  const keyState = useRef({
    placePressed: false,
    cancelPressed: false,
  });

  // Building size and position data
  const buildingData = useMemo(() => {
    if (!buildingType) return { size: [1, 1], height: 1 };

    const [sizeX, sizeZ] = buildingType.size;
    return {
      size: [sizeX, sizeZ],
      height: buildingType.height,
    };
  }, [buildingType]);

  // Adicionar event listeners para rastrear a posição do mouse
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setMousePosition(new THREE.Vector2(x, y));
    };

    const handleClick = (event: MouseEvent) => {
      // Clicar para colocar o edifício quando no modo de construção
      if (selectedBuildingType && placementValid && placementPosition) {
        const success = placeBuilding(
          selectedBuildingType,
          placementPosition,
          0 // Sem rotação por enquanto
        );

        if (success) {
          console.log(`Building ${selectedBuildingType} placed at ${placementPosition}`);
          // O GameStore será notificado automaticamente via useBuildingStore
        }
      }
    };

    // Adicionar os event listeners
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('click', handleClick);

    // Limpar os event listeners quando o componente for desmontado
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl, selectedBuildingType, placementValid, placementPosition, placeBuilding]);

  // Update placement indicator on each frame
  useFrame(() => {
    if (!selectedBuildingType || !indicatorRef.current || !buildingType) return;

    // Handle keyboard input for cancelar (Esc)
    if (cancelKey && !keyState.current.cancelPressed) {
      keyState.current.cancelPressed = true;
      selectBuilding(null);
    } else if (!cancelKey && keyState.current.cancelPressed) {
      keyState.current.cancelPressed = false;
    }

    // Handle keyboard input for colocar (Space)
    if (placeKey && !keyState.current.placePressed) {
      keyState.current.placePressed = true;

      // Attempt to place building
      if (placementValid && placementPosition) {
        const success = placeBuilding(
          selectedBuildingType,
          placementPosition,
          0 // No rotation for now
        );

        if (success) {
          console.log(`Building ${selectedBuildingType} placed at ${placementPosition}`);
          // O GameStore será notificado automaticamente via useBuildingStore
        }
      }
    } else if (!placeKey && keyState.current.placePressed) {
      keyState.current.placePressed = false;
    }

    // Update placement position based on mouse position
    raycaster.setFromCamera(mousePosition, camera);

    // Find intersection with ground plane
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane.current, intersectionPoint);

    // Convert to grid coordinates (round to nearest integer)
    const gridX = Math.floor(intersectionPoint.x + 0.5);
    const gridZ = Math.floor(intersectionPoint.z + 0.5);

    // Update indicator position
    const [sizeX, sizeZ] = buildingData.size;

    // Update position
    indicatorRef.current.position.set(
      gridX + sizeX / 2 - 0.5,
      buildingData.height / 2,
      gridZ + sizeZ / 2 - 0.5
    );

    // Check if placement is valid
    const isValid = canPlaceBuilding(selectedBuildingType, [gridX, gridZ]);

    // Update material color based on validity
    const material = indicatorRef.current.material as THREE.MeshStandardMaterial;
    const color = isValid ? "#4ade80" : "#ef4444";
    const opacity = isValid ? 0.5 : 0.3;
    material.color.set(color);
    material.opacity = opacity;

    // Update global state
    setPlacementPosition([gridX, gridZ]);
    setPlacementValid(isValid);
  });

  if (!selectedBuildingType || !buildingType) return null;

  const [sizeX, sizeZ] = buildingData.size;

  return (
    <mesh
      ref={indicatorRef}
      position={[0, 0, 0]}
      castShadow={false}
      receiveShadow={false}
    >
      {buildingType.model.shape === "box" ? (
        <boxGeometry args={[sizeX, buildingData.height, sizeZ]} />
      ) : (
        <cylinderGeometry args={[sizeX/2, sizeX/2, buildingData.height, 16]} />
      )}
      <meshStandardMaterial 
        color={buildingType.model.color}
        transparent={true} 
        opacity={0.5} 
      />
    </mesh>
  );
};

export default PlacementIndicator;