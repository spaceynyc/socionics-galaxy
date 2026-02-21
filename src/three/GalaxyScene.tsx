import { TYPES, type TypeCode } from "../data/socionics";
import { lazy, Suspense } from "react";
import type { QualityProfile } from "../perf/useQualityProfile";
import { useGalaxyStore } from "../state/useGalaxyStore";
import { CameraRig } from "./CameraRig";
import { ParticleField } from "./ParticleField";
import { RelationshipEdges } from "./RelationshipEdges";
import { TypeNode } from "./TypeNode";

const SceneEnvironment = lazy(() =>
  import("./SceneEnvironment").then((mod) => ({ default: mod.SceneEnvironment })),
);
const SceneEffects = lazy(() =>
  import("./SceneEffects").then((mod) => ({ default: mod.SceneEffects })),
);

export function GalaxyScene({ quality }: { quality: QualityProfile }) {
  const hovered = useGalaxyStore((s) => s.hovered) as TypeCode | undefined;
  const selected = useGalaxyStore((s) => s.selected) as TypeCode | undefined;
  const selectedQuadra = useGalaxyStore((s) => s.selectedQuadra);

  // Camera only moves on click (selected), not hover — hover just shows edges/highlights.
  // Moving the camera on hover causes a feedback loop: camera moves → sphere shifts
  // under cursor → pointer-out fires → camera snaps back → pointer-over fires again → shaking.
  const edgeFocus = selected ?? hovered;  // edges + highlights for both

  return (
    <>
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 22, 70]} />

      <ambientLight intensity={quality.useEnvironment ? 0.65 : 0.75} />
      <directionalLight
        position={[10, 14, 8]}
        intensity={quality.useEnvironment ? 1.25 : 1.1}
        castShadow={quality.useShadows}
      />

      <ParticleField count={quality.particleCount} />

      <group>
        {TYPES.map((t) => (
          <TypeNode key={t.code} t={t} quality={quality} />
        ))}
      </group>

      <RelationshipEdges focus={edgeFocus} />
      <CameraRig focusType={selected} focusQuadra={selectedQuadra} />

      {quality.useEnvironment ? (
        <Suspense fallback={null}>
          <SceneEnvironment />
        </Suspense>
      ) : null}

      <Suspense fallback={null}>
        <SceneEffects mode={quality.postProcessingMode} />
      </Suspense>
    </>
  );
}
