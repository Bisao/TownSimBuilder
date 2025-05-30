
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useCombatStore } from '../stores/useCombatStore';
import { useDummyStore } from '../stores/useDummyStore';

interface TrainingDummyProps {
  position: [number, number, number];
  id: string;
}

interface DamageNumber {
  id: string;
  damage: number;
  position: THREE.Vector3;
  life: number;
  critical: boolean;
}

const TrainingDummy: React.FC<TrainingDummyProps> = ({ position, id }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [isBeingHit, setIsBeingHit] = useState(false);
  const { addCombatEntity, getEntityById } = useCombatStore();
  const { hitDummy, getDummy } = useDummyStore();
  
  const dummy = getDummy(id);

  // Inicializar dummy como entidade de combate
  useEffect(() => {
    const dummyEntity = {
      id: id,
      name: 'Dummy de Treinamento',
      type: 'dummy' as const,
      position: { x: position[0], y: position[1], z: position[2] },
      stats: {
        health: 999999,
        maxHealth: 999999,
        mana: 0,
        maxMana: 0,
        physicalDamage: 0,
        magicalDamage: 0,
        physicalDefense: 5,
        magicalDefense: 5,
        speed: 0,
        criticalChance: 0,
        criticalDamage: 1,
        evasion: 0,
        accuracy: 100,
        level: 1,
        experience: 0
      },
      equipment: {
        weapon: null,
        armor: {
          helmet: null,
          chestplate: null,
          leggings: null,
          boots: null,
          gloves: null
        }
      },
      activeEffects: [],
      combatState: 'alive' as const
    };

    addCombatEntity(dummyEntity);
  }, [id, position, addCombatEntity]);

  // Monitorar dano recebido
  useEffect(() => {
    const entity = getEntityById(id);
    if (entity) {
      // Simular recebimento de dano para testes
      const checkForDamage = () => {
        // Esta é uma implementação simples - em um jogo real, 
        // o dano seria aplicado através do sistema de combate
      };
      
      const interval = setInterval(checkForDamage, 100);
      return () => clearInterval(interval);
    }
  }, [id, getEntityById]);

  // Função para simular recebimento de dano (para testes)
  const simulateDamage = (damage: number, critical: boolean = false) => {
    const newDamageNumber: DamageNumber = {
      id: `damage_${Date.now()}_${Math.random()}`,
      damage,
      position: new THREE.Vector3(
        position[0] + (Math.random() - 0.5) * 2,
        position[1] + 2 + Math.random(),
        position[2] + (Math.random() - 0.5) * 2
      ),
      life: 1.0,
      critical
    };

    setDamageNumbers(prev => [...prev, newDamageNumber]);
    setIsBeingHit(true);
    
    setTimeout(() => setIsBeingHit(false), 200);
  };

  // Clique para simular dano (temporário para testes)
  const handleClick = () => {
    const damage = Math.floor(Math.random() * 50) + 10;
    const critical = Math.random() < 0.15; // 15% chance de crítico
    simulateDamage(damage, critical);
    hitDummy(id, damage, critical);
  };

  // Animar números de dano
  useFrame((state, delta) => {
    setDamageNumbers(prev => 
      prev.map(dmg => ({
        ...dmg,
        life: dmg.life - delta * 0.8,
        position: dmg.position.clone().add(new THREE.Vector3(0, delta * 2, 0))
      })).filter(dmg => dmg.life > 0)
    );

    // Animação de balanço quando atingido
    if (meshRef.current && isBeingHit) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 20) * 0.1;
    } else if (meshRef.current) {
      meshRef.current.rotation.z *= 0.9; // Retorna suavemente à posição normal
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef} onClick={handleClick}>
        {/* Base do dummy */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 0.2, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Poste principal */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 2.8, 12]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>

        {/* Corpo do dummy */}
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 1.2, 12]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>

        {/* Cabeça */}
        <mesh position={[0, 3.1, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>

        {/* Braço esquerdo */}
        <mesh position={[-0.7, 2.4, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.12, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>

        {/* Braço direito */}
        <mesh position={[0.7, 2.4, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.12, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>

        {/* Alvos circulares no peito */}
        <mesh position={[0, 2.2, 0.51]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
        <mesh position={[0, 2.2, 0.52]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 2.2, 0.53]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>

        {/* Placa com nome */}
        <group position={[0, 0.8, 0.8]} rotation={[0.2, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.3, 0.05]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0, 0.026]}>
            <boxGeometry args={[1.1, 0.2, 0.01]} />
            <meshStandardMaterial color="#F5DEB3" />
          </mesh>
        </group>

        {/* Efeito de brilho quando atingido */}
        {isBeingHit && (
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial 
              color="#FFFF00" 
              transparent 
              opacity={0.3}
              emissive="#FFFF00"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>

      {/* Números de dano flutuantes */}
      {damageNumbers.map(dmg => (
        <group key={dmg.id} position={[dmg.position.x, dmg.position.y, dmg.position.z]}>
          <Text
            position={[0, 0, 0]}
            fontSize={dmg.critical ? 0.4 : 0.3}
            color={dmg.critical ? "#FF4444" : "#FFFF44"}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            font="/fonts/inter.json"
            material-transparent
            material-opacity={dmg.life}
          >
            {dmg.critical ? `CRÍTICO! ${dmg.damage}` : dmg.damage.toString()}
          </Text>
        </group>
      ))}
    </group>
  );
};

export default TrainingDummy;
