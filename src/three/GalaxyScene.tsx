import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { TYPES, type TypeCode } from "../data/socionics";
import { useGalaxyStore } from "../state/useGalaxyStore";
import { CameraRig } from "./CameraRig";
import { ParticleField } from "./ParticleField";
import { RelationshipEdges } from "./RelationshipEdges";
import { TypeNode } from "./TypeNode";

export function GalaxyScene() {
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

      <ambientLight intensity={0.65} />
      <directionalLight position={[10, 14, 8]} intensity={1.25} />

      <ParticleField />

      <group>
        {TYPES.map((t) => (
          <TypeNode key={t.code} t={t} />
        ))}
      </group>

      <RelationshipEdges focus={edgeFocus} />
      <CameraRig focusType={selected} focusQuadra={selectedQuadra} />

      <Environment preset="night" />

      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.7} intensity={1.2} />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
        <Noise opacity={0.035} />
      </EffectComposer>
    </>
  );
}
