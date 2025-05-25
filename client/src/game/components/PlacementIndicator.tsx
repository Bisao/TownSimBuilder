import { useRef, useMemo } from "react";
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
  
  // Update placement indicator on each frame
  useFrame(() => {
    if (!selectedBuildingType || !indicatorRef.current || !buildingType) return;
    
    // Handle keyboard input
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
          // Exit build mode after successful placement
          selectBuilding(null);
        }
      }
    } else if (!placeKey && keyState.current.placePressed) {
      keyState.current.placePressed = false;
    }
    
    // Handle cancel key
    if (cancelKey && !keyState.current.cancelPressed) {
      keyState.current.cancelPressed = true;
      selectBuilding(null);
    } else if (!cancelKey && keyState.current.cancelPressed) {
      keyState.current.cancelPressed = false;
    }
    
    // Update placement position based on mouse position
    const mouse = new THREE.Vector2();
    mouse.x = (gl.domElement.width / 2) / gl.domElement.width * 2 - 1;
    mouse.y = -(gl.domElement.height / 2) / gl.domElement.height * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
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
    material.color.set(isValid ? "#00ff00" : "#ff0000");
    material.opacity = 0.5;
    
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
      <boxGeometry args={[sizeX, buildingData.height, sizeZ]} />
      <meshStandardMaterial 
        color="#00ff00" 
        transparent={true} 
        opacity={0.5} 
      />
    </mesh>
  );
};

export default PlacementIndicator;
