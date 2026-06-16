import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSphere = () => {
  const parallaxRef = useRef();
  const sphereRef = useRef();

  // ==========================================
  // 1. THE CORE SPHERE MATH (WITH PHYSICS)
  // ==========================================
  const sphereCount = 3500;
  
  const { originalPositions, currentPositions, velocities } = useMemo(() => {
    const orig = new Float32Array(sphereCount * 3);
    const curr = new Float32Array(sphereCount * 3);
    const vel = new Float32Array(sphereCount * 3); // Starts at 0
    
    for (let i = 0; i < sphereCount; i++) {
      const r = 1.65 * Math.cbrt(Math.random()); 
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      curr[i * 3] = x;
      curr[i * 3 + 1] = y;
      curr[i * 3 + 2] = z;
    }
    return { originalPositions: orig, currentPositions: curr, velocities: vel };
  }, [sphereCount]);

  // ==========================================
  // 2. ANIMATION & PHYSICS ENGINE
  // ==========================================
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // 1. Rotation
    sphereRef.current.rotation.y = time * 0.05;

    // 2. Parallax Tilt
    const targetX = (state.pointer.x * Math.PI) / 4;
    const targetY = (state.pointer.y * Math.PI) / 4;
    parallaxRef.current.rotation.x += 0.05 * (targetY - parallaxRef.current.rotation.x);
    parallaxRef.current.rotation.y += 0.05 * (targetX - parallaxRef.current.rotation.y);

    // 3. INTERACTIVE PARTICLE PHYSICS (The Magic)
    const vector = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5);
    vector.unproject(state.camera);
    const dir = vector.sub(state.camera.position).normalize();
    const distance = -state.camera.position.z / dir.z;
    const mousePos = state.camera.position.clone().add(dir.multiplyScalar(distance));
    
    sphereRef.current.worldToLocal(mousePos);

    // Physics settings
    const spring = 0.0015;     
    const friction = 0.85;    
    const repulsion = 0.06;   
    const mouseRadiusSq = 1.0; 

    const positions = sphereRef.current.geometry.attributes.position.array;

    for (let i = 0; i < sphereCount; i++) {
      const i3 = i * 3;

      let x = positions[i3];
      let y = positions[i3 + 1];
      let z = positions[i3 + 2];

      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      velocities[i3]     += (ox - x) * spring;
      velocities[i3 + 1] += (oy - y) * spring;
      velocities[i3 + 2] += (oz - z) * spring;

      const dx = x - mousePos.x;
      const dy = y - mousePos.y;
      const dz = z - mousePos.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < mouseRadiusSq && distSq > 0) {
        const force = (mouseRadiusSq - distSq) * repulsion;
        velocities[i3]     += dx * force;
        velocities[i3 + 1] += dy * force;
        velocities[i3 + 2] += dz * force;
      }

      velocities[i3]     *= friction;
      velocities[i3 + 1] *= friction;
      velocities[i3 + 2] *= friction;

      positions[i3]     += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
    }

    sphereRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={parallaxRef}>
      <points ref={sphereRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={sphereCount} array={currentPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#00bfff" transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};

export default ParticleSphere;