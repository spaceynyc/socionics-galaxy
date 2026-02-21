import { create } from "zustand";
import type { Quadra, TypeCode } from "../data/socionics";

interface GalaxyState {
  hovered?: TypeCode;
  selected?: TypeCode;
  selectedQuadra?: Quadra;
  compare?: { a?: TypeCode; b?: TypeCode };
  zoomOffset: number;
  orbitTheta: number;
  orbitPhi: number;
  highlightedEdge?: { target: TypeCode; relation: string }; // clicked relation highlight
  setHovered: (code?: TypeCode) => void;
  select: (code?: TypeCode) => void;
  selectQuadra: (quadra?: Quadra) => void;
  setCompare: (next: { a?: TypeCode; b?: TypeCode }) => void;
  addZoom: (delta: number) => void;
  addOrbit: (dTheta: number, dPhi: number) => void;
  setHighlightedEdge: (edge?: { target: TypeCode; relation: string }) => void;
}

const ZOOM_MIN = -5;  // closest (offset subtracted from base distance)
const ZOOM_MAX = 20;  // farthest

export const useGalaxyStore = create<GalaxyState>((set) => ({
  hovered: undefined,
  selected: undefined,
  selectedQuadra: undefined,
  compare: undefined,
  zoomOffset: 0,
  orbitTheta: 0,
  orbitPhi: 0.25,
  highlightedEdge: undefined,
  setHovered: (code) => set({ hovered: code }),
  select: (code) =>
    set({
      selected: code,
      zoomOffset: 0,
      orbitTheta: 0,
      orbitPhi: code ? 0 : 0.25,
      highlightedEdge: undefined,
      selectedQuadra: undefined,
    }),
  selectQuadra: (quadra) =>
    set({
      selectedQuadra: quadra,
      selected: undefined,
      zoomOffset: 0,
      orbitTheta: 0,
      orbitPhi: quadra ? 0.12 : 0.25,
      highlightedEdge: undefined,
    }),
  setCompare: (next) => set({ compare: next }),
  addZoom: (delta) =>
    set((s) => ({ zoomOffset: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, s.zoomOffset + delta)) })),
  addOrbit: (dTheta, dPhi) =>
    set((s) => ({
      orbitTheta: s.orbitTheta + dTheta,
      orbitPhi: Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, s.orbitPhi + dPhi)),
    })),
  setHighlightedEdge: (edge) => set({ highlightedEdge: edge }),
}));
