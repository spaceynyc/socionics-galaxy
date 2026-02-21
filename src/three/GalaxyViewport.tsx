import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useRef } from "react";
import { useGalaxyStore } from "../state/useGalaxyStore";
import { GalaxyScene } from "./GalaxyScene";

const ORBIT_SENSITIVITY_MOUSE = 0.005;
const ORBIT_SENSITIVITY_TOUCH = 0.0075;
const PINCH_ZOOM_SENSITIVITY = 0.035;
const DRAG_THRESHOLD_MOUSE = 2;
const DRAG_THRESHOLD_TOUCH = 1;

function getDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function GalaxyViewport() {
  const select = useGalaxyStore((s) => s.select);
  const selectQuadra = useGalaxyStore((s) => s.selectQuadra);
  const setHovered = useGalaxyStore((s) => s.setHovered);
  const addZoom = useGalaxyStore((s) => s.addZoom);
  const addOrbit = useGalaxyStore((s) => s.addOrbit);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistance = useRef<number | null>(null);

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
      if (didDrag.current) addOrbit(dx * sensitivity, -dy * sensitivity);
    },
    [addOrbit, addZoom, getPinchDistance],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
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
  }, []);

  return (
    <Canvas
      className="select-none"
      shadows
      dpr={[1, 2]}
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
        <GalaxyScene />
      </Suspense>
    </Canvas>
  );
}
