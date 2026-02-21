import { useEffect, useMemo, useState } from "react";
import * as Command from "cmdk";
import { TYPES, TYPE_BY_CODE, type TypeCode } from "../data/socionics";
import { useGalaxyStore } from "../state/useGalaxyStore";

export function SearchPalette({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState("");
  const select = useGalaxyStore((s) => s.select);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          const next = !v;
          if (!next) setQuery("");
          return next;
        });
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TYPES;
    return TYPES.filter((t) => (t.code + " " + t.name + " " + t.quadra).toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={() => {
          setOpen(false);
          setQuery("");
        }}
      />
      <div className="absolute left-1/2 top-[14vh] w-[640px] max-w-[calc(100vw-28px)] -translate-x-1/2">
        <Command.Command
          className="glass overflow-hidden rounded-2xl border border-white/10"
          shouldFilter={false}
        >
          <div className="flex items-center gap-2 border-b border-white/10 bg-black/20 px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-electric shadow-glowBlue" />
            <Command.CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search a type… (ILE, EII, Gamma, etc.)"
              className="w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/40"
            />
            <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/55">
              esc
            </kbd>
          </div>

          <Command.CommandList className="max-h-[420px] overflow-auto p-2">
            {items.map((t) => (
              <Command.CommandItem
                key={t.code}
                value={t.code}
                onSelect={() => {
                  select(t.code as TypeCode);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-white/85 aria-selected:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: t.color, boxShadow: `0 0 18px ${t.color}55` }}
                  />
                  <div>
                    <div className="font-semibold tracking-tight">{t.code}</div>
                    <div className="text-xs text-white/55">{t.name}</div>
                  </div>
                </div>
                <div className="text-xs text-white/50">{t.quadra}</div>
              </Command.CommandItem>
            ))}

            {items.length === 0 && (
              <div className="px-3 py-10 text-center text-sm text-white/45">No matches</div>
            )}
          </Command.CommandList>

          <div className="border-t border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">
            Jump-to focuses the camera and opens the info panel.
          </div>
        </Command.Command>

        {/* preload */}
        <div className="hidden">{Object.values(TYPE_BY_CODE).map((x) => x.code).join(" ")}</div>
      </div>
    </div>
  );
}
