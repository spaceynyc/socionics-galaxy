import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import type { QualityProfile } from "../perf/useQualityProfile";

export function SceneEffects({ mode }: { mode: QualityProfile["postProcessingMode"] }) {
  const isLite = mode === "lite";

  return (
    <EffectComposer multisampling={isLite ? 0 : 4}>
      <Bloom
        luminanceThreshold={isLite ? 0.2 : 0.15}
        luminanceSmoothing={0.7}
        intensity={isLite ? 0.9 : 1.2}
      />
      <Vignette eskil={false} offset={0.22} darkness={isLite ? 0.8 : 0.92} />
      <Noise opacity={isLite ? 0 : 0.035} />
    </EffectComposer>
  );
}
