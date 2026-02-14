export function Hud() {
  return (
    <div className="pointer-events-none fixed left-0 top-0 z-10 w-full p-5">
      <div className="pointer-events-auto inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
        <div className="h-2.5 w-2.5 rounded-full bg-electric shadow-glowBlue" />
        <div>
          <div className="text-sm font-semibold tracking-tight">Socionics Galaxy</div>
          <div className="text-xs text-white/55">Hover nodes for edges • Click to lock • ⌘K to search</div>
        </div>
      </div>
    </div>
  );
}
