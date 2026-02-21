import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { DoubleSide } from "three";
import type { SocionicsType } from "../data/socionics";
import { useGalaxyStore } from "../state/useGalaxyStore";

export function TypeNode({ t }: { t: SocionicsType }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const hovered = useGalaxyStore((s) => s.hovered);
  const selected = useGalaxyStore((s) => s.selected);
  const selectedQuadra = useGalaxyStore((s) => s.selectedQuadra);
  const setHovered = useGalaxyStore((s) => s.setHovered);
  const select = useGalaxyStore((s) => s.select);

  const color = useMemo(() => new THREE.Color(t.color), [t.color]);
  const isHot = hovered === t.code || selected === t.code;
  const isQuadraMember = selectedQuadra === t.quadra;

  useFrame(({ clock }) => {
    const u = clock.getElapsedTime();
    const pulse = 0.92 + 0.10 * Math.sin(u * 1.8 + t.position[0]);
    meshRef.current.scale.setScalar(isHot ? pulse * 1.12 : pulse);
    materialRef.current.emissiveIntensity = isHot ? 2.2 : 1.35;
    meshRef.current.rotation.y += 0.002;
  });

  return (
    <group position={t.position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(t.code as any);
        }}
        onPointerOut={() => setHovered(undefined)}
        onClick={(e) => {
          e.stopPropagation();
          select(t.code as any);
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={1.4}
          roughness={0.22}
          metalness={0.65}
        />
      </mesh>

      <pointLight color={t.color} intensity={isHot ? 18 : 10} distance={8} />

      {isQuadraMember && (
        <Billboard follow>
          <mesh renderOrder={60}>
            <ringGeometry args={[0.66, 0.685, 64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.32}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </Billboard>
      )}

      <Billboard follow>
        <Text
          fontSize={0.28}
          anchorX="center"
          anchorY="middle"
          position={[0, -0.95, 0]}
          color={"rgba(255,255,255,0.92)"}
          outlineColor={"rgba(0,0,0,0.55)"}
          outlineWidth={0.012}
        >
          {t.code}
        </Text>
      </Billboard>
    </group>
  );
}
