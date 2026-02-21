import { useEffect, useMemo, useState } from "react";

export function Hud() {
  const [isTouchUi, setIsTouchUi] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => {
      setIsTouchUi(media.matches || navigator.maxTouchPoints > 0);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const instructions = useMemo(
    () =>
      isTouchUi
        ? "Tap nodes for edges • Tap to lock • Drag to orbit • Pinch to zoom"
        : "Hover nodes for edges • Click to lock • Drag to orbit • Scroll to zoom • ⌘/Ctrl K to search",
    [isTouchUi],
  );

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-10 w-full p-5">
      <div className="pointer-events-auto inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-electric shadow-glowBlue" />
          <div className="text-sm font-semibold tracking-tight">Socionics Galaxy</div>
        </div>
        <div className="text-xs text-white/55">{instructions}</div>
      </div>
    </div>
  );
}
