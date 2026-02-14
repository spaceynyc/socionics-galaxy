# Socionics Galaxy — Project Spec

## Overview
An interactive 3D visualization of the 16 socionics types as a living galaxy, built with React Three Fiber (R3F). Types exist as glowing nodes on a rotating quadra lattice, with relationship edges (dual, activation, conflict, mirror, etc.) that animate on hover/search.

## Tech Stack
- **React + TypeScript + Vite**
- **React Three Fiber (R3F)** + Drei helpers
- **Tailwind CSS** for UI overlay
- **Framer Motion** for 2D UI animations
- **Three.js** postprocessing (bloom, vignette)

## Core Features

### 1. Galaxy View
- 16 type nodes arranged by quadra (Alpha, Beta, Gamma, Delta)
- Each quadra forms a cluster/constellation with shared color theming:
  - Alpha (ILE, SEI, ESE, LII) — electric blue
  - Beta (EIE, LSI, SLE, IEI) — deep red/crimson
  - Gamma (SEE, ILI, LIE, ESI) — emerald green
  - Delta (LSE, EII, IEE, SLI) — amber/gold
- Nodes glow, pulse subtly, orbit slowly
- Particle field background (stars)

### 2. Relationship Edges
- On hover/click a type node, draw animated edges to related types:
  - **Dual** — thick bright line (strongest)
  - **Activation** — pulsing dashed
  - **Mirror** — thin solid
  - **Conflict** — red jagged/lightning
  - **Semi-dual, Illusionary, Supervision, Benefit** — varying styles
- Edge labels appear on hover
- Color-coded by relationship quality (green=good, red=conflict, yellow=neutral)

### 3. Type Info Panel
- Click a node → slide-in panel with:
  - Type name, code, quadra, temperament
  - Function stack (8 functions with Model A positions)
  - Key traits / description
  - Relationship map (list of all 15 intertype relations)

### 4. Search / Filter
- ⌘K search palette to jump to a type
- Filter by quadra, temperament, or relationship type
- "Compare two types" mode — select two, see their intertype relation highlighted

### 5. Visual Polish (Awwwards-tier)
- Bloom postprocessing on nodes
- Glassmorphism UI panels (dark, blurred backgrounds)
- Smooth camera transitions (spring physics)
- Noise texture overlay
- Responsive — works on mobile (touch to tap nodes)

## Data Model
```ts
interface SocionicsType {
  code: string;        // "ILE", "SEI", etc.
  name: string;        // "Intuitive-Logical Extrovert"
  quadra: "Alpha" | "Beta" | "Gamma" | "Delta";
  temperament: "EP" | "EJ" | "IP" | "IJ";
  functions: string[]; // ["Ne", "Ti", "Se", "Fi", "Si", "Te", "Ni", "Fe"]
  color: string;
  position: [number, number, number]; // 3D coords
}

interface Relationship {
  type1: string;
  type2: string;
  relation: "Dual" | "Activation" | "Mirror" | "Conflict" | ...;
  quality: "positive" | "neutral" | "negative";
}
```

## Deployment
- Vite build → static files
- Serve on tailscale (port 5174, bind 0.0.0.0)
- Accessible from any tailnet device

## Stretch Goals
- Audio reactivity (like inner-system)
- Feed in Space's GitHub repo topics / bookmark themes to "pull" the lattice toward his interests
- Shareable URLs per type (`/type/ILE`)
- Animation presets (orbit, explode, cluster)
