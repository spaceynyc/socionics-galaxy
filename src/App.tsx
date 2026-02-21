import { Suspense, lazy } from "react";
import type { Quadra } from "./data/socionics";
import { useGalaxyStore } from "./state/useGalaxyStore";
import { Hud } from "./ui/Hud";
import { InfoPanel } from "./ui/InfoPanel";
import { SearchPalette } from "./ui/SearchPalette";

const GalaxyViewport = lazy(async () => {
  const module = await import("./three/GalaxyViewport");
  return { default: module.GalaxyViewport };
});

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

export default function App() {
  const selectedQuadra = useGalaxyStore((s) => s.selectedQuadra);
  const selectQuadra = useGalaxyStore((s) => s.selectQuadra);

  return (
    <div className="noise h-full w-full">
      <Suspense fallback={<div className="h-full w-full bg-ink" />}>
        <GalaxyViewport />
      </Suspense>

      <Hud />
      <InfoPanel />
      <SearchPalette />

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
