import { Line, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { TYPE_BY_CODE, TYPE_ORDER, getRelation, type RelationName, type AsymmetricRole, type TypeCode } from "../data/socionics";
import { useGalaxyStore } from "../state/useGalaxyStore";

function relationColor(r: RelationName) {
  if (r === "Dual" || r === "Activation" || r === "Semi-dual") return "#22c55e";
  if (r === "Conflict" || r === "Super-ego" || r === "Supervision" || r === "Contrary") return "#ef4444";
  if (r === "Benefit") return "#a78bfa"; // purple for asymmetric benefit
  return "#eab308";
}

function relationWidth(r: RelationName) {
  if (r === "Dual") return 2.6;
  if (r === "Conflict") return 2.2;
  if (r === "Activation" || r === "Mirror") return 1.9;
  return 1.2;
}

function relationOpacity(r: RelationName) {
  if (r === "Dual") return 0.95;
  if (r === "Conflict" || r === "Activation" || r === "Mirror") return 0.75;
  return 0.4;
}

/** Display label for a relation, including the role for asymmetric ones */
function displayLabel(relation: RelationName, role?: AsymmetricRole): string {
  if (role) return `${relation} (${role})`;
  return relation;
}

function buildJagged(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  const pts: THREE.Vector3[] = [];
  const segments = 18;
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  dir.normalize();
  const ortho = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
  const ortho2 = new THREE.Vector3().crossVectors(dir, ortho).normalize();
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const base = new THREE.Vector3().copy(a).addScaledVector(dir, len * u);
    const noise =
      0.22 * Math.sin(t * 6.0 + u * 18.0) * (0.6 + 0.4 * Math.sin(u * Math.PI));
    const noise2 =
      0.18 * Math.cos(t * 5.0 + u * 14.0) * (0.6 + 0.4 * Math.sin(u * Math.PI));
    pts.push(base.addScaledVector(ortho, noise).addScaledVector(ortho2, noise2));
  }
  return pts;
}

export function RelationshipEdges({ focus }: { focus?: TypeCode }) {
  const dashRef = useRef<{ offset: number }>({ offset: 0 });
  const highlightedEdge = useGalaxyStore((s) => s.highlightedEdge);
  const setHighlightedEdge = useGalaxyStore((s) => s.setHighlightedEdge);

  useFrame((_, dt) => {
    dashRef.current.offset -= dt * 0.55;
  });

  const edges = useMemo(() => {
    if (!focus) return [] as Array<{ to: TypeCode; relation: RelationName; role?: AsymmetricRole }>;
    return TYPE_ORDER.filter((b) => b !== focus).map((b) => {
      const r = getRelation(focus, b);
      return { to: b, relation: r.relation, role: r.role };
    });
  }, [focus]);

  if (!focus) return null;

  const from = new THREE.Vector3(...TYPE_BY_CODE[focus].position);
  const hasHighlight = !!highlightedEdge;

  return (
    <group>
      {edges.map(({ to, relation, role }, i) => {
        const target = TYPE_BY_CODE[to];
        const toV = new THREE.Vector3(...target.position);
        const mid = new THREE.Vector3().addVectors(from, toV).multiplyScalar(0.5);

        const isHighlighted = highlightedEdge?.target === to && highlightedEdge?.relation === relation;
        const dashed = relation === "Activation" || relation === "Semi-dual";
        const jagged = relation === "Conflict";
        const pts = jagged ? buildJagged(from, toV, dashRef.current.offset) : [from, toV];

        const opacity = hasHighlight
          ? isHighlighted ? 1.0 : 0.08
          : relationOpacity(relation);
        const width = isHighlighted
          ? Math.max(relationWidth(relation), 3.0)
          : relationWidth(relation);
        const labelOpacity = hasHighlight
          ? isHighlighted ? 1.0 : 0.15
          : 0.78;

        const labelYOffset = 0.15 + (i % 3) * 0.22;
        const label = displayLabel(relation, role);

        return (
          <group
            key={`${focus}-${to}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isHighlighted) {
                setHighlightedEdge(undefined);
              } else {
                setHighlightedEdge({ target: to, relation });
              }
            }}
          >
            <Line
              points={pts}
              color={isHighlighted ? "#ffffff" : relationColor(relation)}
              lineWidth={width}
              dashed={dashed}
              dashSize={0.5}
              gapSize={0.35}
              dashOffset={dashRef.current.offset}
              transparent
              opacity={opacity}
            />
            <Text
              fontSize={isHighlighted ? 0.24 : 0.18}
              position={[mid.x, mid.y + labelYOffset, mid.z]}
              color={isHighlighted ? "#ffffff" : `rgba(255,255,255,${labelOpacity})`}
              outlineColor={"rgba(0,0,0,0.6)"}
              outlineWidth={0.012}
              anchorX="center"
              anchorY="middle"
            >
              {label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
