import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useRef } from "react";
import { GalaxyScene } from "./three/GalaxyScene";
import { useGalaxyStore } from "./state/useGalaxyStore";
import { Hud } from "./ui/Hud";
import { InfoPanel } from "./ui/InfoPanel";
import { SearchPalette } from "./ui/SearchPalette";

export default function App() {
  const select = useGalaxyStore((s) => s.select);
  const setHovered = useGalaxyStore((s) => s.setHovered);
  const addZoom = useGalaxyStore((s) => s.addZoom);
  const addOrbit = useGalaxyStore((s) => s.addOrbit);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      addZoom(e.deltaY * 0.008);
    },
    [addZoom],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 0) {
      dragging.current = true;
      didDrag.current = false;
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      if (didDrag.current) addOrbit(dx * 0.005, -dy * 0.005);
    },
    [addOrbit],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      className="noise h-full w-full"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 18], fov: 55 }}
        onPointerMissed={() => {
          if (!didDrag.current) {
            select(undefined);
            setHovered(undefined);
          }
        }}
      >
        <Suspense fallback={null}>
          <GalaxyScene />
        </Suspense>
      </Canvas>

      <Hud />
      <InfoPanel />
      <SearchPalette />

      <div className="fixed bottom-4 left-1/2 z-10 -translate-x-1/2 text-center text-[11px] text-white/35">
        Quadras: <span className="text-electric">Alpha</span> • <span className="text-red-400">Beta</span> •{" "}
        <span className="text-emerald">Gamma</span> • <span className="text-amber">Delta</span>
      </div>
    </div>
  );
}
