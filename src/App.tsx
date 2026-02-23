import { Canvas } from "@react-three/fiber";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { Quadra } from "./data/socionics";
import { useQualityProfile } from "./perf/useQualityProfile";
import { useGalaxyStore } from "./state/useGalaxyStore";
import { Hud } from "./ui/Hud";

const GalaxyScene = lazy(() =>
  import("./three/GalaxyScene").then((mod) => ({ default: mod.GalaxyScene })),
);
const InfoPanel = lazy(() =>
  import("./ui/InfoPanel").then((mod) => ({ default: mod.InfoPanel })),
);
const SearchPalette = lazy(() =>
  import("./ui/SearchPalette").then((mod) => ({ default: mod.SearchPalette })),
);

const ORBIT_SENSITIVITY_MOUSE = 0.005;
const ORBIT_SENSITIVITY_TOUCH = 0.0075;
const PINCH_ZOOM_SENSITIVITY = 0.035;
const DRAG_THRESHOLD_MOUSE = 2;
const DRAG_THRESHOLD_TOUCH = 1;

const QUADRA_TEXT_CLASSES: Record<Quadra, string> = {
  Alpha: "text-electric",
  Beta: "text-red-400",
  Gamma: "text-emerald",
  Delta: "text-amber",
};

const QUADRA_ACTIVE_TEXT_CLASSES: Record<Quadra, string> = {
  Alpha: "text-[#1d4ed8]",
  Beta: "text-[#b91c1c]",
  Gamma: "text-[#047857]",
  Delta: "text-[#b45309]",
};

function getDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function App() {
  const select = useGalaxyStore((s) => s.select);
  const selected = useGalaxyStore((s) => s.selected);
  const selectedQuadra = useGalaxyStore((s) => s.selectedQuadra);
  const selectQuadra = useGalaxyStore((s) => s.selectQuadra);
  const setHovered = useGalaxyStore((s) => s.setHovered);
  const addZoom = useGalaxyStore((s) => s.addZoom);
  const addOrbit = useGalaxyStore((s) => s.addOrbit);
  const quality = useQualityProfile();
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistance = useRef<number | null>(null);
  const [searchReady, setSearchReady] = useState(false);

  useEffect(() => {
    if (quality.isMobileClass) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchReady(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quality.isMobileClass]);

  const getPinchDistance = useCallback(() => {
    const [a, b] = Array.from(activePointers.current.values());
    if (!a || !b) return null;
    return getDistance(a, b);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      addZoom(e.deltaY * 0.008);
    },
    [addZoom],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      e.currentTarget.setPointerCapture(e.pointerId);
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size >= 2) {
        didDrag.current = true;
        dragging.current = false;
        pinchDistance.current = getPinchDistance();
        return;
      }

      dragging.current = true;
      didDrag.current = false;
      lastPos.current = { x: e.clientX, y: e.clientY };
    },
    [getPinchDistance],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activePointers.current.has(e.pointerId)) return;
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size >= 2) {
        const nextDistance = getPinchDistance();
        if (nextDistance != null && pinchDistance.current != null) {
          const delta = nextDistance - pinchDistance.current;
          if (Math.abs(delta) > 0.25) {
            didDrag.current = true;
            addZoom(-delta * PINCH_ZOOM_SENSITIVITY);
          }
        }
        pinchDistance.current = nextDistance;
        dragging.current = false;
        return;
      }

      if (!dragging.current) return;

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const threshold = e.pointerType === "touch" ? DRAG_THRESHOLD_TOUCH : DRAG_THRESHOLD_MOUSE;
      const sensitivity = e.pointerType === "touch" ? ORBIT_SENSITIVITY_TOUCH : ORBIT_SENSITIVITY_MOUSE;

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) didDrag.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      if (didDrag.current) addOrbit(-dx * sensitivity, dy * sensitivity);
    },
    [addOrbit, addZoom, getPinchDistance],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      activePointers.current.delete(e.pointerId);
      pinchDistance.current = null;

      if (activePointers.current.size === 1) {
        const [remaining] = Array.from(activePointers.current.values());
        if (remaining) {
          lastPos.current = { x: remaining.x, y: remaining.y };
          dragging.current = true;
        }
        return;
      }

      dragging.current = false;
    },
    [],
  );

  return (
    <div className="noise h-full w-full">
      <Canvas
        className="select-none"
        shadows={quality.useShadows}
        dpr={quality.dpr}
        camera={{ position: [0, 0, 18], fov: 55 }}
        style={{ touchAction: "none" }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerMissed={() => {
          if (!didDrag.current) {
            select(undefined);
            selectQuadra(undefined);
            setHovered(undefined);
          }
        }}
      >
        <Suspense fallback={null}>
          <GalaxyScene quality={quality} />
        </Suspense>
      </Canvas>

      <Hud />
      <Suspense fallback={null}>{selected ? <InfoPanel /> : null}</Suspense>
      <Suspense fallback={null}>{searchReady ? <SearchPalette initialOpen /> : null}</Suspense>

      <div className="fixed bottom-4 left-1/2 z-10 -translate-x-1/2 px-2 text-[10px] text-white/35 sm:text-[11px]">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span>Quadras:</span>
          {(["Alpha", "Beta", "Gamma", "Delta"] as Quadra[]).map((quadra, i) => {
            const isActive = selectedQuadra === quadra;
            const textClass = isActive
              ? QUADRA_ACTIVE_TEXT_CLASSES[quadra]
              : QUADRA_TEXT_CLASSES[quadra];

            return (
              <span key={quadra}>
                <button
                  type="button"
                  onClick={() => selectQuadra(isActive ? undefined : quadra)}
                  className={`${textClass} cursor-pointer rounded-full border-0 px-2 py-[2px] leading-none transition-all duration-200 ${
                    isActive
                      ? "bg-white/95 font-semibold shadow-[0_2px_14px_rgba(255,255,255,0.3)] ring-1 ring-black/10"
                      : "bg-transparent hover:bg-white/8"
                  }`}
                >
                  {quadra}
                </button>
                {i < 3 ? <span className="mx-1 text-white/25">•</span> : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
