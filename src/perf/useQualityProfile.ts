import { useEffect, useState } from "react";

type PostProcessingMode = "full" | "lite";

export interface QualityProfile {
  isMobileClass: boolean;
  dpr: [number, number];
  particleCount: number;
  sphereSegments: number;
  ringSegments: number;
  useShadows: boolean;
  usePointLights: boolean;
  useEnvironment: boolean;
  postProcessingMode: PostProcessingMode;
}

function resolveQualityProfile(): QualityProfile {
  if (typeof window === "undefined") {
    return {
      isMobileClass: false,
      dpr: [1, 2],
      particleCount: 2200,
      sphereSegments: 64,
      ringSegments: 64,
      useShadows: true,
      usePointLights: true,
      useEnvironment: true,
      postProcessingMode: "full",
    };
  }

  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const smallViewport = window.innerWidth <= 900;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const lowEndDevice = memory <= 4 || cores <= 4;
  const isMobileClass = coarsePointer || smallViewport;

  if (prefersReducedMotion || (isMobileClass && lowEndDevice)) {
    return {
      isMobileClass,
      dpr: [0.85, 1.25],
      particleCount: 900,
      sphereSegments: 30,
      ringSegments: 40,
      useShadows: false,
      usePointLights: false,
      useEnvironment: false,
      postProcessingMode: "lite",
    };
  }

  if (isMobileClass) {
    return {
      isMobileClass,
      dpr: [0.95, 1.45],
      particleCount: 1400,
      sphereSegments: 40,
      ringSegments: 52,
      useShadows: false,
      usePointLights: true,
      useEnvironment: false,
      postProcessingMode: "lite",
    };
  }

  return {
    isMobileClass: false,
    dpr: [1, 2],
    particleCount: 2200,
    sphereSegments: 64,
    ringSegments: 64,
    useShadows: true,
    usePointLights: true,
    useEnvironment: true,
    postProcessingMode: "full",
  };
}

export function useQualityProfile() {
  const [profile, setProfile] = useState<QualityProfile>(() => resolveQualityProfile());

  useEffect(() => {
    const coarsePointerMedia = window.matchMedia("(hover: none), (pointer: coarse)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setProfile(resolveQualityProfile());
    update();

    window.addEventListener("resize", update);
    coarsePointerMedia.addEventListener("change", update);
    motionMedia.addEventListener("change", update);

    return () => {
      window.removeEventListener("resize", update);
      coarsePointerMedia.removeEventListener("change", update);
      motionMedia.removeEventListener("change", update);
    };
  }, []);

  return profile;
}
