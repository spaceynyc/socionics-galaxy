import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { TYPE_BY_CODE, TYPES, type Quadra, type TypeCode } from "../data/socionics";
import { useGalaxyStore } from "../state/useGalaxyStore";

const QUADRA_CENTERS: Record<Quadra, [number, number, number]> = {
  Alpha: [0, 0, 0],
  Beta: [0, 0, 0],
  Gamma: [0, 0, 0],
  Delta: [0, 0, 0],
};

for (const quadra of Object.keys(QUADRA_CENTERS) as Quadra[]) {
  const members = TYPES.filter((t) => t.quadra === quadra);
  const center = members.reduce(
    (acc, t) => {
      acc[0] += t.position[0];
      acc[1] += t.position[1];
      acc[2] += t.position[2];
      return acc;
    },
    [0, 0, 0] as [number, number, number],
  );
  QUADRA_CENTERS[quadra] = [center[0] / members.length, center[1] / members.length, center[2] / members.length];
}

export function CameraRig({ focusType, focusQuadra }: { focusType?: TypeCode; focusQuadra?: Quadra }) {
  const { camera } = useThree();
  const zoomOffset = useGalaxyStore((s) => s.zoomOffset);
  const orbitTheta = useGalaxyStore((s) => s.orbitTheta);
  const orbitPhi = useGalaxyStore((s) => s.orbitPhi);

  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPos = useMemo(() => new THREE.Vector3(0, 0, 18), []);
  const _goalTarget = useMemo(() => new THREE.Vector3(), []);
  const _goalPos = useMemo(() => new THREE.Vector3(), []);
  const _focusPos = useMemo(() => new THREE.Vector3(), []);
  const _center = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const _outward = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.near = 0.1;
    camera.far = 120;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame((_, dt) => {
    let baseTheta = 0;
    let basePhi = 0;
    let baseRadius = 18;

    if (focusType) {
      const p = TYPE_BY_CODE[focusType].position;
      _focusPos.set(p[0], p[1], p[2]);
      baseRadius = 10.5;

      // Place the camera from the selected type's outward perspective so
      // other planets stay in front for clearer edge visibility.
      _outward.copy(_focusPos).sub(_center).normalize();
      if (_outward.lengthSq() < 1e-6) _outward.set(0, 0, 1);

      baseTheta = Math.atan2(_outward.x, _outward.z);
      basePhi = Math.asin(THREE.MathUtils.clamp(_outward.y, -1, 1));

      // Aim slightly toward the galaxy center for better framing of links.
      _goalTarget.copy(_focusPos).lerp(_center, 0.22);
    } else if (focusQuadra) {
      const p = QUADRA_CENTERS[focusQuadra];
      _focusPos.set(p[0], p[1], p[2]);
      baseRadius = 14;

      _outward.copy(_focusPos).sub(_center).normalize();
      if (_outward.lengthSq() < 1e-6) _outward.set(0, 0, 1);

      baseTheta = Math.atan2(_outward.x, _outward.z);
      basePhi = Math.asin(THREE.MathUtils.clamp(_outward.y, -1, 1));

      _goalTarget.copy(_focusPos).lerp(_center, 0.12);
    } else {
      _goalTarget.set(0, 0, 0);
    }

    // Spherical offset from target: orbit angles + zoom
    const radius = baseRadius + zoomOffset;
    const theta = baseTheta + orbitTheta;
    const phi = THREE.MathUtils.clamp(basePhi + orbitPhi, -Math.PI / 2.2, Math.PI / 2.2);
    // Convert spherical (theta=horizontal, phi=vertical) to cartesian offset
    const offX = radius * Math.sin(theta) * Math.cos(phi);
    const offY = radius * Math.sin(phi);
    const offZ = radius * Math.cos(theta) * Math.cos(phi);

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
