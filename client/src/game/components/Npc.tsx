import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NPC } from "../stores/useNpcStore";
import { npcTypes } from "../constants/npcs";

interface NpcProps {
  npc: NPC;
}

const Npc = ({ npc }: NpcProps) => {
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const lastPositionRef = useRef<[number, number, number]>(npc.position);

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent('npcClick', { detail: npc }));
  };

  const npcType = npcTypes[npc.type];
  if (!npcType) return null;

  // Criar geometria de partículas
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(30 * 3);

    for(let i = 0; i < 30; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = Math.random() * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    if (!bodyRef.current || !particlesRef.current || !groupRef.current) return;

    const time = clock.getElapsedTime();

    // Calcular rotação baseada na direção do movimento
    if (npc.state === "moving" && npc.targetPosition) {
      const currentPos = npc.position;
      const targetPos = npc.targetPosition;

      // Calcular direção do movimento
      const dx = targetPos[0] - currentPos[0];
      const dz = targetPos[2] - currentPos[2];

      // Apenas atualizar rotação se há movimento significativo
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        const angle = Math.atan2(dx, dz);
        groupRef.current.rotation.y = angle;
      }
    }

    // Animação do corpo ao andar
    if (npc.state === "moving") {
      // Movimento de balanço do corpo
      bodyRef.current.position.y = 0.5 + Math.sin(time * 5) * 0.05;

      // Movimento das pernas
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(time * 5) * 0.5;
        rightLegRef.current.rotation.x = -Math.sin(time * 5) * 0.5;
      }

      // Movimento dos braços
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(time * 5) * 0.5;
        rightArmRef.current.rotation.x = Math.sin(time * 5) * 0.5;
      }
    } else if (npc.state === "working" || npc.state === "gathering") {
      // Animação de trabalho específica para cada profissão
      if (leftArmRef.current && rightArmRef.current) {
        if (npc.type === "miner") {
          // Movimento de picareta - mais vigoroso
          leftArmRef.current.rotation.x = Math.sin(time * 4) * 0.6;
          rightArmRef.current.rotation.x = Math.sin(time * 4) * 0.8 + 0.3;
          rightArmRef.current.rotation.z = Math.sin(time * 4) * 0.2;
        } else if (npc.type === "lumberjack") {
          // Movimento de machado - alternado
          leftArmRef.current.rotation.x = Math.sin(time * 2.5) * 0.7;
          rightArmRef.current.rotation.x = Math.sin(time * 2.5) * 0.9 + 0.2;
          rightArmRef.current.rotation.z = Math.sin(time * 2.5) * 0.3;
        } else if (npc.type === "farmer") {
          // Movimento de enxada - suave
          leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.4;
          rightArmRef.current.rotation.x = Math.sin(time * 2) * 0.5 + 0.2;
        } else {
          // Movimento padrão para padeiro
          leftArmRef.current.rotation.x = Math.sin(time * 3) * 0.3;
          rightArmRef.current.rotation.x = Math.sin(time * 3) * 0.3;
        }
      }

      // Partículas de trabalho
      particlesRef.current.visible = true;
      particlesRef.current.rotation.y = time * 2;
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.size = 0.1 + Math.sin(time * 4) * 0.05;
    } else if (npc.state === "resting") {
      // Animação de descanso - movimento suave
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.3 + Math.sin(time * 1) * 0.05; // Mais baixo e lento
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
        rightArmRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
      }
      if (particlesRef.current) {
        particlesRef.current.visible = false;
      }
    } else {
      // Estado parado
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.02;
      }
      if (particlesRef.current) {
        particlesRef.current.visible = false;
      }
    }
  });

  const { position } = npc;

  // Calcular altura do terreno baseada na posição
  const terrainHeight = Math.sin(position[0] * 0.1) * 0.8 + 
                        Math.cos(position[2] * 0.08) * 0.6 + 
                        Math.sin(position[0] * 0.15) * Math.cos(position[2] * 0.12) * 0.4;

  return (
    <group position={[position[0], terrainHeight, position[2]]} onClick={handleClick}>
      <group ref={bodyRef}>
        {/* Cabeça */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FDBCB4" />
        </mesh>

        {/* Chapéus/Capacetes específicos */}
        {npc.type === "miner" && (
          <group position={[0, 0.85, 0]}>
            {/* Capacete de mineração */}
            <mesh>
              <sphereGeometry args={[0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#FFD700" metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Lanterna do capacete */}
            <mesh position={[0, 0, 0.16]}>
              <cylinderGeometry args={[0.03, 0.04, 0.06, 8]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[0, 0, 0.19]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={0.3} />
            </mesh>
          </group>
        )}

        {npc.type === "lumberjack" && (
          <group position={[0, 0.88, 0]}>
            {/* Chapéu de lenhador */}
            <mesh>
              <cylinderGeometry args={[0.18, 0.18, 0.08, 8]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.02, 8]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>
          </group>
        )}

        {npc.type === "farmer" && (
          <group position={[0, 0.88, 0]}>
            {/* Chapéu de palha */}
            <mesh>
              <cylinderGeometry args={[0.22, 0.16, 0.06, 16]} />
              <meshStandardMaterial color="#DAA520" />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
              <meshStandardMaterial color="#DAA520" />
            </mesh>
          </group>
        )}

        {npc.type === "baker" && (
          <group position={[0, 0.88, 0]}>
            {/* Touca de cozinheiro */}
            <mesh>
              <cylinderGeometry args={[0.16, 0.12, 0.15, 16]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <torusGeometry args={[0.16, 0.02, 8, 16]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        )}

        {/* Seta indicadora na cabeça */}
        <group position={[0, 1.1, 0]} rotation={[0, 0, Math.PI]}>
          <mesh>
            <coneGeometry args={[0.08, 0.2, 3]} />
            <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Corpo */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.3, 0.5, 0.2]} />
          <meshStandardMaterial color={npcType.color} />
        </mesh>

        {/* Cinto com ferramentas */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.32, 0.08, 0.22]} />
          <meshStandardMaterial color="#654321" />
        </mesh>

        {/* Fivela do cinto */}
        <mesh position={[0, 0.25, 0.11]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Detalhes específicos no cinto */}
        {npc.type === "miner" && (
          <group>
            {/* Martelo pequeno no cinto */}
            <mesh position={[0.12, 0.25, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0.12, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.08, 0.02, 0.02]} />
              <meshStandardMaterial color="#A0A0A0" />
            </mesh>
          </group>
        )}

        {npc.type === "lumberjack" && (
          <group>
            {/* Machado pequeno no cinto */}
            <mesh position={[-0.12, 0.25, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.12, 8]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
            <mesh position={[-0.12, 0.31, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.02, 0.02, 8]} />
              <meshStandardMaterial color="#A0A0A0" />
            </mesh>
          </group>
        )}

        {npc.type === "farmer" && (
          <group>
            {/* Sementes no cinto */}
            <mesh position={[0.1, 0.25, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[-0.1, 0.25, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        )}

        {npc.type === "baker" && (
          <group>
            {/* Avental */}
            <mesh position={[0, 0.4, 0.11]}>
              <boxGeometry args={[0.28, 0.4, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            {/* Laços do avental */}
            <mesh position={[0.14, 0.5, 0.05]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.02, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[-0.14, 0.5, 0.05]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.02, 0.02]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        )}

        {/* Braço Esquerdo */}
        <group ref={leftArmRef} position={[-0.2, 0.5, 0]}>
          {/* Ombro */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Braço Superior */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.08, 0.25, 0.08]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Cotovelo */}
          <mesh position={[0, -0.18, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Antebraço */}
          <mesh position={[0, -0.28, 0]}>
            <boxGeometry args={[0.07, 0.2, 0.07]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Punho */}
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>

          {/* Mão Esquerda */}
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>

          {/* Dedos Mão Esquerda */}
          <mesh position={[-0.03, -0.5, 0.03]}>
            <boxGeometry args={[0.015, 0.08, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
          <mesh position={[0, -0.52, 0.03]}>
            <boxGeometry args={[0.015, 0.1, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
          <mesh position={[0.03, -0.51, 0.03]}>
            <boxGeometry args={[0.015, 0.09, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
          <mesh position={[0.04, -0.48, 0.03]}>
            <boxGeometry args={[0.015, 0.06, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
          {/* Polegar */}
          <mesh position={[-0.05, -0.46, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.015, 0.06, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
        </group>

        {/* Braço Direito */}
        <group ref={rightArmRef} position={[0.2, 0.5, 0]}>
          {/* Ombro */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Braço Superior */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.08, 0.25, 0.08]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Cotovelo */}
          <mesh position={[0, -0.18, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Antebraço */}
          <mesh position={[0, -0.28, 0]}>
            <boxGeometry args={[0.07, 0.2, 0.07]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Punho */}
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>

          {/* Mão Direita */}
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>

          {/* Dedos Mão Direita */}
          <mesh position={[0.03, -0.5, 0.03]}>
            <boxGeometry args={[0.015, 0.08, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
          <mesh position={[0, -0.52, 0.03]}>
            <boxGeometry args={[0.015, 0.1, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
          <mesh position={[-0.03, -0.51, 0.03]}>
            <boxGeometry args={[0.015, 0.09, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
          <mesh position={[-0.04, -0.48, 0.03]}>
            <boxGeometry args={[0.015, 0.06, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
          {/* Polegar */}
          <mesh position={[0.05, -0.46, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[0.015, 0.06, 0.015]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>
        </group>

        {/* Ferramentas seguradas com ambas as mãos - posicionadas entre os braços */}
        {npc.type === "miner" && (
          <group position={[0, 0.2, 0]} rotation={[0.3, 0, 0]}>
            {/* Cabo da picareta */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Cabeça da picareta */}
            <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.3, 0.08, 0.08]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Ponta afiada */}
            <mesh position={[0.15, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
              <coneGeometry args={[0.04, 0.1, 4]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )}

        {npc.type === "lumberjack" && (
          <group position={[0, 0.2, 0]} rotation={[0.2, 0, 0]}>
            {/* Cabo do machado */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
            {/* Lâmina do machado */}
            <mesh position={[0, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.05, 0.05, 8]} />
              <meshStandardMaterial color="#A0A0A0" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )}

        {npc.type === "farmer" && (
          <group position={[0, 0.2, 0]} rotation={[0.4, 0, 0]}>
            {/* Cabo da enxada */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Lâmina da enxada */}
            <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.2, 0.05, 0.15]} />
              <meshStandardMaterial color="#A0A0A0" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        )}

        {npc.type === "baker" && (
          <group position={[0, 0.1, 0.15]}>
            {/* Saco de farinha segurado com as duas mãos */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.25, 0.1]} />
              <meshStandardMaterial color="#F5DEB3" />
            </mesh>
            {/* Amarração do saco */}
            <mesh position={[0, 0.12, 0]}>
              <torusGeometry args={[0.07, 0.01, 8, 16]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          </group>
        )}

        {/* Perna Esquerda */}
        <group ref={leftLegRef} position={[-0.1, 0.1, 0]}>
          {/* Quadril */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Coxa */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.09, 0.25, 0.09]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Joelho */}
          <mesh position={[0, -0.18, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Panturrilha */}
          <mesh position={[0, -0.28, 0]}>
            <boxGeometry args={[0.08, 0.2, 0.08]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Tornozelo */}
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>

          {/* Pé Esquerdo */}
          <mesh position={[0, -0.45, 0.08]}>
            <boxGeometry args={[0.12, 0.08, 0.25]} />
            <meshStandardMaterial color="#654321" />
          </mesh>

          {/* Sola do Pé Esquerdo */}
          <mesh position={[0, -0.49, 0.08]}>
            <boxGeometry args={[0.13, 0.02, 0.26]} />
            <meshStandardMaterial color="#2F1B14" />
          </mesh>

          {/* Cadarços Pé Esquerdo */}
          <mesh position={[0, -0.41, 0.15]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.08, 0.01, 0.01]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, -0.43, 0.12]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.08, 0.01, 0.01]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Perna Direita */}
        <group ref={rightLegRef} position={[0.1, 0.1, 0]}>
          {/* Quadril */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Coxa */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.09, 0.25, 0.09]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Joelho */}
          <mesh position={[0, -0.18, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Panturrilha */}
          <mesh position={[0, -0.28, 0]}>
            <boxGeometry args={[0.08, 0.2, 0.08]} />
            <meshStandardMaterial color={npcType.color} />
          </mesh>

          {/* Tornozelo */}
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#FDBCB4" />
          </mesh>

          {/* Pé Direito */}
          <mesh position={[0, -0.45, 0.08]}>
            <boxGeometry args={[0.12, 0.08, 0.25]} />
            <meshStandardMaterial color="#654321" />
          </mesh>

          {/* Sola do Pé Direito */}
          <mesh position={[0, -0.49, 0.08]}>
            <boxGeometry args={[0.13, 0.02, 0.26]} />
            <meshStandardMaterial color="#2F1B14" />
          </mesh>

          {/* Cadarços Pé Direito */}
          <mesh position={[0, -0.41, 0.15]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.08, 0.01, 0.01]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, -0.43, 0.12]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.08, 0.01, 0.01]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      </group>

      {/* Partículas de efeito */}
      <points ref={particlesRef}>
        <primitive object={particles} />
        <pointsMaterial
          color={npcType.color}
          size={0.1}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

export default Npc;