import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions } = useMemo(() => {
    const count = 2200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 45 * Math.pow(Math.random(), 0.45);
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 22;
      pos[i * 3 + 0] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return { positions: pos };
  }, []);

  useFrame(({ clock }) => {
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.012;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={"#93c5fd"}
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}
