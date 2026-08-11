'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AmbientOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.03) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primary Teal/Cyan Distorted Orb */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
        <Sphere args={[1.8, 32, 32]} position={[-4, 2, -5]}>
          <MeshDistortMaterial
            color="#0ea5e9"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            transparent
            opacity={0.35}
          />
        </Sphere>
      </Float>

      {/* Secondary Indigo/Purple Floating Orb */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={1}>
        <Sphere args={[2.2, 32, 32]} position={[4, -1, -6]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.1}
            transparent
            opacity={0.3}
          />
        </Sphere>
      </Float>

      {/* Amber/Gold Accent Sphere */}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <Sphere args={[1.2, 32, 32]} position={[0, -3, -4]}>
          <MeshDistortMaterial
            color="#f59e0b"
            attach="material"
            distort={0.5}
            speed={2.5}
            roughness={0.3}
            transparent
            opacity={0.25}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export default function Background3D() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasWebGl, setHasWebGl] = useState(true);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGl(false);
    } catch (e) {
      setHasWebGl(false);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (reducedMotion || !hasWebGl) {
    // Elegant procedural CSS gradient fallback
    return <div className="bg-canvas-fallback" />;
  }

  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />
        <AmbientOrbs />
      </Canvas>
    </div>
  );
}
