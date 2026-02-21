import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  allRelationsFor,
  MODEL_A_SLOT_DEFINITIONS,
  RELATION_DESCRIPTIONS,
  ROLE_DESCRIPTIONS,
  TYPE_BY_CODE,
  type RelationName,
  type AsymmetricRole,
  type TypeCode,
} from "../data/socionics";
import { useGalaxyStore } from "../state/useGalaxyStore";

function chipClass() {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] tracking-wide border border-white/10 bg-white/5`;
}

function qualityStyle(quality: string) {
  if (quality === "positive")
    return {
      background: "rgba(34,197,94,0.12)",
      border: "1px solid rgba(34,197,94,0.25)",
      color: "#86efac",
    };
  if (quality === "negative")
    return {
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.25)",
      color: "#fca5a5",
    };
  return {
    background: "rgba(234,179,8,0.10)",
    border: "1px solid rgba(234,179,8,0.20)",
    color: "#fde68a",
  };
}

function RelationBadge({
  relation,
  quality,
  role,
}: {
  relation: RelationName;
  quality: string;
  role?: AsymmetricRole;
}) {
  const [hovered, setHovered] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number; flipUp: boolean }>({ top: 0, right: 0, flipUp: true });

  useLayoutEffect(() => {
    if (hovered && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const flipUp = rect.top > 160;
      setPos({
        top: flipUp ? rect.top - 8 : rect.bottom + 8,
        right: window.innerWidth - rect.right,
        flipUp,
      });
    }
  }, [hovered]);

  const label = role ? `${relation} (${role})` : relation;
  const description = role
    ? ROLE_DESCRIPTIONS[role]
    : RELATION_DESCRIPTIONS[relation];

  return (
    <span
      ref={badgeRef}
      className="rounded-full px-2 py-1 text-[11px] cursor-help whitespace-nowrap"
      style={qualityStyle(quality)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}

      {hovered && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: pos.flipUp ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: pos.flipUp ? 4 : -4 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] w-64 rounded-xl border border-white/15 bg-[#111114]/95 px-3 py-2.5 text-[11px] leading-relaxed text-white/80 shadow-xl backdrop-blur-md"
            style={{
              pointerEvents: "none",
              right: pos.right,
              ...(pos.flipUp
                ? { bottom: window.innerHeight - pos.top }
                : { top: pos.top }),
            }}
          >
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              {label}
            </div>
            {description}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
}

function FunctionSlotBadge({
  fn,
  slotIndex,
  color,
}: {
  fn: string;
  slotIndex: number;
  color: string;
}) {
  const slot = MODEL_A_SLOT_DEFINITIONS[slotIndex];
  const [hovered, setHovered] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; showAbove: boolean; width: number }>({
    top: 0,
    left: 0,
    showAbove: false,
    width: 250,
  });

  useLayoutEffect(() => {
    if (hovered && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const edgePadding = 10;
      const tooltipWidth = Math.min(250, window.innerWidth - edgePadding * 2);
      const estimatedHeight = 110;
      const left = Math.min(
        Math.max(rect.left + rect.width / 2, edgePadding + tooltipWidth / 2),
        window.innerWidth - edgePadding - tooltipWidth / 2
      );

      const spaceAbove = rect.top - edgePadding;
      const spaceBelow = window.innerHeight - rect.bottom - edgePadding;
      const showAbove =
        spaceAbove >= estimatedHeight
          ? true
          : spaceBelow >= estimatedHeight
            ? false
            : spaceAbove > spaceBelow;

      let top = showAbove ? rect.top - 8 : rect.bottom + 8;
      if (showAbove && top - estimatedHeight < edgePadding) {
        top = estimatedHeight + edgePadding;
      }
      if (!showAbove && top + estimatedHeight > window.innerHeight - edgePadding) {
        top = window.innerHeight - estimatedHeight - edgePadding;
      }

      setPos({
        top,
        left,
        showAbove,
        width: tooltipWidth,
      });
    }
  }, [hovered]);

  const title = slot.alias
    ? `${slotIndex + 1}. ${slot.name} (${slot.alias})`
    : `${slotIndex + 1}. ${slot.name}`;

  return (
    <div
      ref={badgeRef}
      className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 cursor-help"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
    >
      <div className="text-[10px] text-white/45">{slotIndex + 1}</div>
      <div className="text-sm font-semibold" style={{ color }}>
        {fn}
      </div>

      {hovered && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: pos.showAbove ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: pos.showAbove ? 4 : -4 }}
            transition={{ duration: 0.14 }}
            className="fixed z-[9999] max-h-[45vh] overflow-y-auto rounded-xl border border-white/15 bg-[#111114]/95 px-3 py-2.5 text-[11px] leading-relaxed text-white/80 shadow-xl backdrop-blur-md"
            style={{
              pointerEvents: "none",
              width: pos.width,
              top: pos.top,
              left: pos.left,
              transform: pos.showAbove
                ? "translate(-50%, -100%)"
                : "translateX(-50%)",
            }}
          >
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              {title}
            </div>
            {slot.description}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export function InfoPanel() {
  const selected = useGalaxyStore((s) => s.selected) as TypeCode | undefined;
  const select = useGalaxyStore((s) => s.select);
  const highlightedEdge = useGalaxyStore((s) => s.highlightedEdge);
  const setHighlightedEdge = useGalaxyStore((s) => s.setHighlightedEdge);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const t = selected ? TYPE_BY_CODE[selected] : undefined;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (selected) setMobileExpanded(false);
  }, [selected]);

  return (
    <AnimatePresence>
      {t && (
        <motion.aside
          initial={isMobile ? { y: 20, opacity: 0 } : { x: 24, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 20, opacity: 0 } : { x: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className={
            isMobile
              ? "glass fixed inset-x-3 bottom-3 z-20 rounded-2xl p-3"
              : "glass fixed right-5 top-5 z-20 w-[380px] max-w-[calc(100vw-40px)] rounded-2xl p-4"
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: t.color, boxShadow: `0 0 18px ${t.color}55` }}
                />
                <h2 className="text-lg font-semibold tracking-tight">{t.code}</h2>
              </div>
              <p className="mt-1 text-sm text-white/75">{t.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {isMobile && (
                <button
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10"
                  onClick={() => setMobileExpanded((v) => !v)}
                >
                  {mobileExpanded ? "Minimize" : "Details"}
                </button>
              )}
              <button
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10"
                onClick={() => select(undefined)}
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={chipClass()}>
              <span className="mr-1 text-white/60">Quadra</span>
              <span style={{ color: t.color }}>{t.quadra}</span>
            </span>
            <span className={chipClass()}>
              <span className="mr-1 text-white/60">Temperament</span>
              <span className="text-white/85">{t.temperament}</span>
            </span>
          </div>

          {(!isMobile || mobileExpanded) && (
            <>
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Model A</h3>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {t.functions.map((fn, idx) => (
                    <FunctionSlotBadge key={fn + idx} fn={fn} slotIndex={idx} color={t.color} />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Intertype relations</h3>
                <div
                  className="mt-2 rounded-xl border border-white/10 bg-black/20"
                  style={{
                    overflowY: "auto",
                    overflowX: "visible",
                    maxHeight: isMobile ? "34vh" : "240px",
                  }}
                >
                  <ul className="divide-y divide-white/10">
                    {allRelationsFor(t.code as TypeCode).map((r) => {
                      const isHighlighted =
                        highlightedEdge?.target === r.other && highlightedEdge?.relation === r.relation;
                      return (
                        <li
                          key={r.other}
                          className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer transition-colors"
                          style={{
                            background: isHighlighted ? "rgba(255,255,255,0.08)" : undefined,
                            boxShadow: isHighlighted ? "inset 2px 0 0 0 #fff" : undefined,
                          }}
                          onClick={() => {
                            if (isHighlighted) {
                              setHighlightedEdge(undefined);
                            } else {
                              setHighlightedEdge({ target: r.other, relation: r.relation });
                            }
                          }}
                        >
                          <span className="text-sm text-white/85">{r.other}</span>
                          <RelationBadge relation={r.relation} quality={r.quality} role={r.role} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-white/45">
                Hover Model A slots for function-role definitions. Click a relation to highlight it, then hover its badge for details.
              </p>
            </>
          )}

          {isMobile && !mobileExpanded && (
            <p className="mt-3 text-[11px] text-white/45">
              Tap Details to expand this card while keeping the galaxy visible behind it.
            </p>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
