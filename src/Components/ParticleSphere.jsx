import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSphere = () => {
  const pointsRef = useRef();

  const particlesCount = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      // Math for a spherical distribution with denser center
      const r = 1.7 * Math.cbrt(Math.random()); 
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);     // x
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
      pos[i * 3 + 2] = r * Math.cos(phi);                   // z
    }
    return pos;
  }, [particlesCount]);

  // Smooth mouse interaction & rotation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Slow passive rotation
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.z = time * 0.02;

    // Interactive parallax based on mouse position
    const targetX = (state.pointer.x * Math.PI) / 4;
    const targetY = (state.pointer.y * Math.PI) / 4;
    
    pointsRef.current.rotation.x += 0.05 * (targetY - pointsRef.current.rotation.x);
    pointsRef.current.rotation.y += 0.05 * (targetX - pointsRef.current.rotation.y);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#00bfff" // The Azure brand color
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleSphere;