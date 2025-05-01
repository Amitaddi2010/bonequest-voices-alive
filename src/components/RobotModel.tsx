
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  isSpeaking: boolean;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'confused';
  scale?: number;
}

function Robot({ isSpeaking, emotion = 'neutral', scale = 2 }: ModelProps) {
  const robotRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  // Use animations based on speaking state and emotion
  useFrame((state) => {
    if (!robotRef.current) return;
    
    // Gentle hover animation
    robotRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.05;
    robotRef.current.rotation.y += 0.003;

    // Head movement
    if (headRef.current) {
      if (emotion === 'thinking') {
        headRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      } else {
        headRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
      }
    }

    // Eye animations
    if (eyeLeftRef.current && eyeRightRef.current) {
      // Blink occasionally
      if (Math.floor(state.clock.getElapsedTime() * 2) % 20 === 0) {
        eyeLeftRef.current.scale.y = Math.max(0.1, Math.cos(state.clock.getElapsedTime() * 10) * 0.5 + 0.5);
        eyeRightRef.current.scale.y = Math.max(0.1, Math.cos(state.clock.getElapsedTime() * 10) * 0.5 + 0.5);
      } else {
        eyeLeftRef.current.scale.y = 1;
        eyeRightRef.current.scale.y = 1;
      }

      // Different eye colors based on emotion
      if (eyeLeftRef.current.material instanceof THREE.MeshStandardMaterial) {
        if (emotion === 'happy') {
          eyeLeftRef.current.material.emissive = new THREE.Color('#4DD5FE');
          eyeRightRef.current.material.emissive = new THREE.Color('#4DD5FE');
        } else if (emotion === 'confused') {
          eyeLeftRef.current.material.emissive = new THREE.Color('#FFA500');
          eyeRightRef.current.material.emissive = new THREE.Color('#FFA500');
        } else if (emotion === 'thinking') {
          eyeLeftRef.current.material.emissive = new THREE.Color('#FFFFFF');
          eyeRightRef.current.material.emissive = new THREE.Color('#FFFFFF');
        } else {
          eyeLeftRef.current.material.emissive = new THREE.Color('#4DD5FE');
          eyeRightRef.current.material.emissive = new THREE.Color('#4DD5FE');
        }
        
        eyeLeftRef.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
        eyeRightRef.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
      }
    }
    
    // Mouth animation when speaking
    if (mouthRef.current) {
      if (isSpeaking) {
        mouthRef.current.scale.y = 0.8 + Math.sin(state.clock.getElapsedTime() * 10) * 0.5;
        mouthRef.current.scale.x = 1 + Math.sin(state.clock.getElapsedTime() * 8) * 0.2;
      } else {
        // Default mouth shape when not speaking
        mouthRef.current.scale.y = 0.4;
        mouthRef.current.scale.x = 1;
      }
    }
  });

  return (
    <group ref={robotRef} scale={[scale, scale, scale]}>
      {/* Robot head */}
      <mesh ref={headRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#1E3A5F"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Robot eyes */}
      <mesh ref={eyeLeftRef} position={[-0.2, 0.6, 0.4]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#4DD5FE"
          emissive="#4DD5FE"
          emissiveIntensity={1}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      
      <mesh ref={eyeRightRef} position={[0.2, 0.6, 0.4]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#4DD5FE"
          emissive="#4DD5FE"
          emissiveIntensity={1}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      
      {/* Robot mouth */}
      <mesh ref={mouthRef} position={[0, 0.3, 0.4]}>
        <boxGeometry args={[0.3, 0.05, 0.05]} />
        <meshStandardMaterial
          color="#FF5E8E"
          emissive="#FF5E8E"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Robot antennas */}
      <mesh position={[-0.25, 0.9, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
        <meshStandardMaterial color="#4DD5FE" emissive="#4DD5FE" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0.25, 0.9, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
        <meshStandardMaterial color="#4DD5FE" emissive="#4DD5FE" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Robot body/platform */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.5, 0.2, 32]} />
        <meshStandardMaterial
          color="#0A1929"
          metalness={0.7}
          roughness={0.3}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Glowing base ring */}
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.05, 16, 32]} />
        <meshStandardMaterial
          color="#4DD5FE"
          emissive="#4DD5FE"
          emissiveIntensity={1}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

interface RobotModelProps {
  isSpeaking: boolean;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'confused';
}

const RobotModel: React.FC<RobotModelProps> = ({ isSpeaking, emotion = 'neutral' }) => {
  return (
    <div className="robot-model-container w-full h-[300px]">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight 
          position={[0, 5, 5]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1} 
          castShadow 
        />
        <fog attach="fog" args={['#070b10', 5, 15]} />
        <Robot isSpeaking={isSpeaking} emotion={emotion} />
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default RobotModel;
