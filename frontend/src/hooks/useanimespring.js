import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Custom frame loop hook for snappy, high-energy anime game menus
 */
export function useAnimeSpring({ hovered, isActive }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (!meshRef.current) return;

        // Fast target translation based on interactive hover positioning
        const targetRotationX = hovered ? (state.pointer.y * 0.5) : 0;
        const targetRotationY = hovered ? (state.pointer.x * 0.5) : 0;

        // Snappy scaling and Z-depth adjustments
        const targetScale = hovered ? 1.15 : 1.0;
        const targetZ = isActive ? 0.5 : hovered ? 0.3 : 0;

        // Tight Linear Interpolation (lerp) increments for quick response snappiness
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 0.15);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 0.15);
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.2);

        meshRef.current.scale.setScalar(
            THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.2)
        );
    });

    return meshRef;
}
