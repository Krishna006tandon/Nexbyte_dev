import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Floating Cyber Core
function TechCore() {
  const meshRef = useRef();
  const wireframeRef = useRef();
  const innerCoreRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const { x, y } = state.pointer;

    // Smooth rotation influenced by mouse pointer
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.25 + y * 0.4;
      meshRef.current.rotation.y = time * 0.35 + x * 0.4;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x = -time * 0.15 - y * 0.2;
      wireframeRef.current.rotation.y = time * 0.25 - x * 0.2;
    }
    if (innerCoreRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.08;
      innerCoreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Outer Wireframe Lattice */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Main Faceted Crystal Core */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.15}
          metalness={0.85}
          emissive="#0284c7"
          emissiveIntensity={0.4}
          wireframe={false}
        />
      </mesh>

      {/* Inner Glowing Energy Node */}
      <mesh ref={innerCoreRef}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshBasicMaterial
          color="#60a5fa"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Orbiting Equatorial Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.7, 0.015, 16, 100]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// Particle Constellation Field
function ParticleField({ count = 120 }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 14;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 14;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return coords;
  }, [count]);

  const pointsRef = useRef();

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#38bdf8"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Fallback CSS Orb for WebGL disabled or loading
export function FallbackOrb() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '380px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(30,58,138,0.2) 60%, transparent 80%)',
        border: '1px solid rgba(56,189,248,0.4)',
        boxShadow: '0 0 50px rgba(56,189,248,0.25)',
        animation: 'pulse 3s infinite ease-in-out'
      }} />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('Hero3DScene WebGL fallback activated:', err);
  }
  render() {
    if (this.state.hasError) {
      return <FallbackOrb />;
    }
    return this.props.children;
  }
}

export default function Hero3DScene() {
  return (
    <div className="hero-3d-wrapper" style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <ErrorBoundary>
        <Suspense fallback={<FallbackOrb />}>
          <Canvas
            camera={{ position: [0, 0, 6.5], fov: 45 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
            <pointLight position={[-10, -10, -5]} intensity={1} color="#a855f7" />
            
            <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
              <TechCore />
            </Float>
            <ParticleField count={100} />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
