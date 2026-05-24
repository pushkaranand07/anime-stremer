import React, { useState } from 'react';
import { Html, Float } from '@react-three/drei';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnimeSpring } from '../../hooks/useanimespring';

export function AnimeNavItem3D({ label, index, totalItems, path }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Match current URL pathname to determine if active
  const isActive = location.pathname === path || (path !== '/' && (location.pathname + location.search).startsWith(path));

  // Consume the separated animation system loop
  const meshRef = useAnimeSpring({ hovered, isActive });

  // Calculate dynamic X layout with spacing
  const positionX = (index - (totalItems - 1) / 2) * 3.6;

  return (
    <group position={[positionX, 0, 0]}>
      <Float speed={3.5} rotationIntensity={0.12} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => navigate(path)}
        >
          {/* Angled 3D Mesh Plate */}
          <boxGeometry args={[2.8, 1.15, 0.15]} />

          <meshPhysicalMaterial
            color={isActive ? 'r' : hovered ? '#00f0ff' : '#0b0920'}
            roughness={0.1}
            metalness={0.8}
            clearcoat={1.0}
            emissive={isActive ? '#a855f7' : hovered ? '#00f0ff' : '#000000'}
            emissiveIntensity={isActive ? 1.5 : hovered ? 0.6 : 0}
          />

          {/* Sharp Typographic Layer using standard CSS Font projection */}
          <Html
            position={[0, 0, 0.08]}
            center
            transform
            distanceFactor={10}
            pointerEvents="none"
          >
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: '700',
              fontSize: '15px',
              letterSpacing: '0.08em',
              color: isActive ? '#ffffff' : hovered ? '#06061a' : '#f0eeff',
              textShadow: isActive ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              transition: 'color 0.2s ease-in-out',
            }}>
              {label.toUpperCase()}
            </div>
          </Html>
        </mesh>
      </Float>
    </group>
  );
}
