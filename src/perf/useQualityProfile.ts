import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PostProcessingMode = "full" | "lite" | "off";
export type QualityTier = "high" | "medium" | "low";

export interface QualityProfile {
  tier: QualityTier;
  isMobileClass: boolean;
  dpr: [number, number];
  particleCount: number;
  sphereSegments: number;
  ringSegments: number;
  useShadows: boolean;
  usePointLights: boolean;
  useEnvironment: boolean;
  postProcessingMode: PostProcessingMode;
  showAllEdgeLabels: boolean;
  conflictJaggedSegments: number;
}

interface QualityProfileController {
  profile: QualityProfile;
  reportFps: (fps: number, sampleSeconds?: number) => void;
}

interface DeviceHints {
  isMobileClass: boolean;
  prefersReducedMotion: boolean;
  initialTier: QualityTier;
  maxTier: QualityTier;
}

const TIER_ORDER: QualityTier[] = ["low", "medium", "high"];

function clampTier(tier: QualityTier, maxTier: QualityTier) {
  const currentIndex = TIER_ORDER.indexOf(tier);
  const maxIndex = TIER_ORDER.indexOf(maxTier);
  return TIER_ORDER[Math.min(currentIndex, maxIndex)];
}

function stepDownTier(tier: QualityTier): QualityTier {
  if (tier === "high") return "medium";
  if (tier === "medium") return "low";
  return "low";
}

function stepUpTier(tier: QualityTier, maxTier: QualityTier): QualityTier {
  if (tier === "low") return clampTier("medium", maxTier);
  if (tier === "medium") return clampTier("high", maxTier);
  return clampTier("high", maxTier);
}

function resolveDeviceHints(): DeviceHints {
  if (typeof window === "undefined") {
    return {
      isMobileClass: false,
      prefersReducedMotion: false,
      initialTier: "high",
      maxTier: "high",
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

  if (prefersReducedMotion) {
    return {
      isMobileClass,
      prefersReducedMotion,
      initialTier: "low",
      maxTier: "low",
    };
  }

  if (isMobileClass && lowEndDevice) {
    return {
      isMobileClass,
      prefersReducedMotion,
      initialTier: "low",
      maxTier: "medium",
    };
  }

  if (isMobileClass || lowEndDevice) {
    return {
      isMobileClass,
      prefersReducedMotion,
      initialTier: "medium",
      maxTier: "medium",
    };
  }

  return {
    isMobileClass,
    prefersReducedMotion,
    initialTier: "high",
    maxTier: "high",
  };
}

function resolveTierProfile(tier: QualityTier, isMobileClass: boolean): QualityProfile {
  if (tier === "low") {
    return {
      tier,
      isMobileClass,
      dpr: [0.7, 1.0],
      particleCount: isMobileClass ? 450 : 600,
      sphereSegments: 20,
      ringSegments: 24,
      useShadows: false,
      usePointLights: false,
      useEnvironment: false,
      postProcessingMode: "off",
      showAllEdgeLabels: false,
      conflictJaggedSegments: 0,
    };
  }

  if (tier === "medium") {
    return {
      tier,
      isMobileClass,
      dpr: isMobileClass ? [0.9, 1.35] : [0.95, 1.5],
      particleCount: isMobileClass ? 1200 : 1400,
      sphereSegments: isMobileClass ? 36 : 40,
      ringSegments: isMobileClass ? 48 : 52,
      useShadows: false,
      usePointLights: true,
      useEnvironment: false,
      postProcessingMode: "lite",
      showAllEdgeLabels: !isMobileClass,
      conflictJaggedSegments: isMobileClass ? 10 : 12,
    };
  }

  return {
    tier,
    isMobileClass: false,
    dpr: [1, 2],
    particleCount: 2200,
    sphereSegments: 64,
    ringSegments: 64,
    useShadows: true,
    usePointLights: true,
    useEnvironment: true,
    postProcessingMode: "full",
    showAllEdgeLabels: true,
    conflictJaggedSegments: 18,
  };
}

function applyInteractionQuality(profile: QualityProfile): QualityProfile {
  const minDpr = Math.max(0.6, profile.dpr[0] - 0.15);
  const maxDpr = Math.max(minDpr, profile.dpr[1] - 0.35);

  return {
    ...profile,
    dpr: [minDpr, maxDpr],
    postProcessingMode: "off",
    conflictJaggedSegments: Math.max(0, Math.floor(profile.conflictJaggedSegments * 0.5)),
  };
}

function resolveQualityProfile(tier: QualityTier, isMobileClass: boolean, isInteracting: boolean) {
  const baseProfile = resolveTierProfile(tier, isMobileClass);
  return isInteracting ? applyInteractionQuality(baseProfile) : baseProfile;
}

export function useQualityProfile(
  { isInteracting = false }: { isInteracting?: boolean } = {},
): QualityProfileController {
  const [hints, setHints] = useState<DeviceHints>(() => resolveDeviceHints());
  const [tier, setTier] = useState<QualityTier>(() => resolveDeviceHints().initialTier);
  const lowFpsSeconds = useRef(0);
  const highFpsSeconds = useRef(0);
  const cooldownUntil = useRef(0);

  useEffect(() => {
    const coarsePointerMedia = window.matchMedia("(hover: none), (pointer: coarse)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const nextHints = resolveDeviceHints();
      setHints(nextHints);
      setTier((current) => clampTier(current, nextHints.maxTier));
    };

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

  useEffect(() => {
    if (!hints.prefersReducedMotion) return;
    setTier("low");
  }, [hints.prefersReducedMotion]);

  const reportFps = useCallback(
    (fps: number, sampleSeconds = 1) => {
      if (!Number.isFinite(fps) || sampleSeconds <= 0) return;

      const now = performance.now();
      if (now < cooldownUntil.current) return;

      const LOW_FPS_THRESHOLD = 46;
      const HIGH_FPS_THRESHOLD = 56;

      if (fps < LOW_FPS_THRESHOLD) {
        lowFpsSeconds.current += sampleSeconds;
        highFpsSeconds.current = 0;
      } else if (fps > HIGH_FPS_THRESHOLD) {
        highFpsSeconds.current += sampleSeconds;
        lowFpsSeconds.current = 0;
      } else {
        lowFpsSeconds.current = Math.max(0, lowFpsSeconds.current - sampleSeconds * 0.5);
        highFpsSeconds.current = Math.max(0, highFpsSeconds.current - sampleSeconds * 0.5);
      }

      setTier((current) => {
        let next = current;

        if (lowFpsSeconds.current >= 2) {
          next = stepDownTier(current);
        } else if (highFpsSeconds.current >= 5) {
          next = stepUpTier(current, hints.maxTier);
        }

        if (next !== current) {
          lowFpsSeconds.current = 0;
          highFpsSeconds.current = 0;
          cooldownUntil.current = now + (next < current ? 1500 : 2500);
          return clampTier(next, hints.maxTier);
        }

        return clampTier(current, hints.maxTier);
      });
    },
    [hints.maxTier],
  );

  const profile = useMemo(
    () => resolveQualityProfile(tier, hints.isMobileClass, isInteracting),
    [tier, hints.isMobileClass, isInteracting],
  );

  return { profile, reportFps };
}
