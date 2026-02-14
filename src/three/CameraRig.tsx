import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { TYPE_BY_CODE, type TypeCode } from "../data/socionics";
import { useGalaxyStore } from "../state/useGalaxyStore";

export function CameraRig({ focus }: { focus?: TypeCode }) {
  const { camera } = useThree();
  const zoomOffset = useGalaxyStore((s) => s.zoomOffset);
  const orbitTheta = useGalaxyStore((s) => s.orbitTheta);
  const orbitPhi = useGalaxyStore((s) => s.orbitPhi);

  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPos = useMemo(() => new THREE.Vector3(0, 0, 18), []);
  const _goalTarget = useMemo(() => new THREE.Vector3(), []);
  const _goalPos = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.near = 0.1;
    camera.far = 120;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame((_, dt) => {
    if (focus) {
      const p = TYPE_BY_CODE[focus].position;
      _goalTarget.set(p[0], p[1], p[2]);
    } else {
      _goalTarget.set(0, 0, 0);
    }

    // Spherical offset from target: orbit angles + zoom
    const radius = (focus ? 7.8 : 18) + zoomOffset;
    // Convert spherical (theta=horizontal, phi=vertical) to cartesian offset
    const offX = radius * Math.sin(orbitTheta) * Math.cos(orbitPhi);
    const offY = radius * Math.sin(orbitPhi);
    const offZ = radius * Math.cos(orbitTheta) * Math.cos(orbitPhi);

    _goalPos.set(
      _goalTarget.x + offX,
      _goalTarget.y + offY,
      _goalTarget.z + offZ,
    );

    const alpha = 1 - Math.pow(0.001, dt);
    target.lerp(_goalTarget, alpha);
    desiredPos.lerp(_goalPos, alpha);
    camera.position.lerp(desiredPos, alpha);
    camera.lookAt(target);
  });

  return null;
}
