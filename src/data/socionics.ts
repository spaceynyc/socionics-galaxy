export type Quadra = "Alpha" | "Beta" | "Gamma" | "Delta";
export type Temperament = "EP" | "EJ" | "IP" | "IJ";

// 14 canonical intertype relations (12 symmetric + 2 asymmetric)
export type RelationName =
  | "Identity"
  | "Dual"
  | "Activation"
  | "Mirror"
  | "Conflict"
  | "Super-ego"
  | "Contrary"        // aka Extinguishment / Погашение
  | "Quasi-identical"
  | "Supervision"     // asymmetric — use `role` to distinguish Supervisor vs Supervisee
  | "Benefit"         // asymmetric — use `role` to distinguish Benefactor vs Beneficiary
  | "Illusionary"
  | "Semi-dual"
  | "Look-a-like"     // aka Business / Деловые
  | "Kindred";

export type AsymmetricRole = "Supervisor" | "Supervisee" | "Benefactor" | "Beneficiary";

export type RelationQuality = "positive" | "neutral" | "negative";

export interface SocionicsType {
  code: string;
  name: string;
  quadra: Quadra;
  temperament: Temperament;
  functions: string[]; // Model A (8 positions)
  color: string;
  position: [number, number, number];
}

// Canonical ordering often used in intertype relation tables.
export const TYPE_ORDER = [
  "ILE",
  "SEI",
  "ESE",
  "LII",
  "EIE",
  "LSI",
  "SLE",
  "IEI",
  "SEE",
  "ILI",
  "LIE",
  "ESI",
  "LSE",
  "EII",
  "IEE",
  "SLI",
] as const;

export type TypeCode = (typeof TYPE_ORDER)[number];

export const QUADRA_COLORS: Record<Quadra, string> = {
  Alpha: "#3b82f6",
  Beta: "#ef4444",
  Gamma: "#10b981",
  Delta: "#f59e0b",
};

// Layout: 4 quadra clusters arranged in a spiral galaxy shape.
// Each quadra occupies one arm of the spiral, with types spread in 3D
// so the whole thing has depth and feels like a nebula, not a flat grid.

const TAU = Math.PI * 2;

// Quadra arm angles (evenly spaced around the spiral)
const QUADRA_ANGLES: Record<Quadra, number> = {
  Alpha: 0,
  Beta:  TAU * 0.25,
  Gamma: TAU * 0.5,
  Delta: TAU * 0.75,
};

// Spiral arm radius from center
const ARM_RADIUS = 6.5;
// Vertical spread of the whole galaxy (gives it thickness like a real galaxy)
const GALAXY_THICKNESS = 3.5;

// Each type within a quadra gets a unique offset in a tetrahedron-like arrangement
// so no two nodes overlap, and each quadra cluster has real 3D volume.
const INTRA_OFFSETS: [number, number, number][] = [
  [-1.8,  1.5,  1.4],
  [ 1.8,  0.7, -1.3],
  [-0.8, -1.4, -1.8],
  [ 1.4, -1.0,  1.8],
];

function quadraPos(quadra: Quadra, i: number): [number, number, number] {
  const angle = QUADRA_ANGLES[quadra];
  // Spiral: each arm curves outward slightly
  const armAngle = angle + 0.15 * (i - 1.5); // spread types along the arm arc
  const r = ARM_RADIUS + (i - 1.5) * 0.6; // types at slightly different radii
  const cx = Math.cos(armAngle) * r;
  const cz = Math.sin(armAngle) * r;
  // Vertical: use galaxy thickness with per-type offsets
  const cy = INTRA_OFFSETS[i % 4][1] * (GALAXY_THICKNESS / 3);
  // Add intra-cluster offset for separation
  const o = INTRA_OFFSETS[i % 4];
  return [cx + o[0] * 0.7, cy, cz + o[2] * 0.7];
}

// ──────────────────────────────────────────────────────────────────────────────
// Correct Model A stacks for all 16 types.
//
// Model A positions:
//   1 = Leading, 2 = Creative, 3 = Role, 4 = Vulnerable (PoLR),
//   5 = Suggestive, 6 = Mobilizing, 7 = Ignoring, 8 = Demonstrative
//
// Derivation rules given positions 1 and 2:
//   3 = same E/I & rationality class as 1, OTHER element within class
//   4 = same E/I & rationality class as 2, OTHER element within class
//   5 = opposite E/I & opposite element of 1 (within rationality class)
//   6 = opposite E/I & opposite element of 2
//   7 = opposite E/I of 1, same element (flip extraversion only)
//   8 = opposite E/I of 2, same element
// ──────────────────────────────────────────────────────────────────────────────

export const TYPES: SocionicsType[] = [
  // ── Alpha ──
  {
    code: "ILE",
    name: "Intuitive Logical Extrovert",
    quadra: "Alpha",
    temperament: "EP",
    functions: ["Ne", "Ti", "Se", "Fi", "Si", "Fe", "Ni", "Te"],
    color: QUADRA_COLORS.Alpha,
    position: quadraPos("Alpha", 0),
  },
  {
    code: "SEI",
    name: "Sensory Ethical Introvert",
    quadra: "Alpha",
    temperament: "IP",
    functions: ["Si", "Fe", "Ni", "Te", "Ne", "Ti", "Se", "Fi"],
    color: QUADRA_COLORS.Alpha,
    position: quadraPos("Alpha", 1),
  },
  {
    code: "ESE",
    name: "Ethical Sensory Extrovert",
    quadra: "Alpha",
    temperament: "EJ",
    functions: ["Fe", "Si", "Te", "Ni", "Ti", "Ne", "Fi", "Se"],
    color: QUADRA_COLORS.Alpha,
    position: quadraPos("Alpha", 2),
  },
  {
    code: "LII",
    name: "Logical Intuitive Introvert",
    quadra: "Alpha",
    temperament: "IJ",
    functions: ["Ti", "Ne", "Fi", "Se", "Fe", "Si", "Te", "Ni"],
    color: QUADRA_COLORS.Alpha,
    position: quadraPos("Alpha", 3),
  },

  // ── Beta ──
  {
    code: "EIE",
    name: "Ethical Intuitive Extrovert",
    quadra: "Beta",
    temperament: "EJ",
    functions: ["Fe", "Ni", "Te", "Si", "Ti", "Se", "Fi", "Ne"],
    color: QUADRA_COLORS.Beta,
    position: quadraPos("Beta", 0),
  },
  {
    code: "LSI",
    name: "Logical Sensory Introvert",
    quadra: "Beta",
    temperament: "IJ",
    functions: ["Ti", "Se", "Fi", "Ne", "Fe", "Ni", "Te", "Si"],
    color: QUADRA_COLORS.Beta,
    position: quadraPos("Beta", 1),
  },
  {
    code: "SLE",
    name: "Sensory Logical Extrovert",
    quadra: "Beta",
    temperament: "EP",
    functions: ["Se", "Ti", "Ne", "Fi", "Ni", "Fe", "Si", "Te"],
    color: QUADRA_COLORS.Beta,
    position: quadraPos("Beta", 2),
  },
  {
    code: "IEI",
    name: "Intuitive Ethical Introvert",
    quadra: "Beta",
    temperament: "IP",
    functions: ["Ni", "Fe", "Si", "Te", "Se", "Ti", "Ne", "Fi"],
    color: QUADRA_COLORS.Beta,
    position: quadraPos("Beta", 3),
  },

  // ── Gamma ──
  {
    code: "SEE",
    name: "Sensory Ethical Extrovert",
    quadra: "Gamma",
    temperament: "EP",
    functions: ["Se", "Fi", "Ne", "Ti", "Ni", "Te", "Si", "Fe"],
    color: QUADRA_COLORS.Gamma,
    position: quadraPos("Gamma", 0),
  },
  {
    code: "ILI",
    name: "Intuitive Logical Introvert",
    quadra: "Gamma",
    temperament: "IP",
    functions: ["Ni", "Te", "Si", "Fe", "Se", "Fi", "Ne", "Ti"],
    color: QUADRA_COLORS.Gamma,
    position: quadraPos("Gamma", 1),
  },
  {
    code: "LIE",
    name: "Logical Intuitive Extrovert",
    quadra: "Gamma",
    temperament: "EJ",
    functions: ["Te", "Ni", "Fe", "Si", "Fi", "Se", "Ti", "Ne"],
    color: QUADRA_COLORS.Gamma,
    position: quadraPos("Gamma", 2),
  },
  {
    code: "ESI",
    name: "Ethical Sensory Introvert",
    quadra: "Gamma",
    temperament: "IJ",
    functions: ["Fi", "Se", "Ti", "Ne", "Te", "Ni", "Fe", "Si"],
    color: QUADRA_COLORS.Gamma,
    position: quadraPos("Gamma", 3),
  },

  // ── Delta ──
  {
    code: "LSE",
    name: "Logical Sensory Extrovert",
    quadra: "Delta",
    temperament: "EJ",
    functions: ["Te", "Si", "Fe", "Ni", "Fi", "Ne", "Ti", "Se"],
    color: QUADRA_COLORS.Delta,
    position: quadraPos("Delta", 0),
  },
  {
    code: "EII",
    name: "Ethical Intuitive Introvert",
    quadra: "Delta",
    temperament: "IJ",
    functions: ["Fi", "Ne", "Ti", "Se", "Te", "Si", "Fe", "Ni"],
    color: QUADRA_COLORS.Delta,
    position: quadraPos("Delta", 1),
  },
  {
    code: "IEE",
    name: "Intuitive Ethical Extrovert",
    quadra: "Delta",
    temperament: "EP",
    functions: ["Ne", "Fi", "Se", "Ti", "Si", "Te", "Ni", "Fe"],
    color: QUADRA_COLORS.Delta,
    position: quadraPos("Delta", 2),
  },
  {
    code: "SLI",
    name: "Sensory Logical Introvert",
    quadra: "Delta",
    temperament: "IP",
    functions: ["Si", "Te", "Ni", "Fe", "Ne", "Fi", "Se", "Ti"],
    color: QUADRA_COLORS.Delta,
    position: quadraPos("Delta", 3),
  },
];

export const TYPE_BY_CODE: Record<TypeCode, SocionicsType> = Object.fromEntries(
  TYPES.map((t) => [t.code, t])
) as Record<TypeCode, SocionicsType>;

// ──────────────────────────────────────────────────────────────────────────────
// Intertype relation algorithm
//
// For types A and B, we find where B's leading (1st) and creative (2nd)
// functions sit within A's Model A. The resulting (posOfB1, posOfB2) pair
// uniquely determines the intertype relation.
//
// This approach correctly handles ALL 16 relations including the asymmetric
// Supervision and Benefit rings.
// ──────────────────────────────────────────────────────────────────────────────

// Map of (posOfB1, posOfB2) → relation name.
// Positions are 1-indexed (matching Model A convention).
export const RELATION_DESCRIPTIONS: Record<RelationName, string> = {
  Identity: "Same type. Complete mutual understanding but little to teach each other.",
  Dual: "The ideal complement. Each partner's strengths cover the other's weaknesses, creating natural psychological comfort.",
  Activation: "Energizing and fun. Partners activate each other's strengths but can tire each other out over time.",
  Mirror: "Similar worldview, different approach. Partners refine each other's ideas through constructive reflection.",
  Conflict: "Maximum friction. Each partner's strongest function hits the other's most vulnerable point.",
  "Super-ego": "Mutual admiration from a distance. Each envies the other's strengths but struggles to replicate them.",
  Contrary: "Partners cancel each other out. Despite surface similarities, conversations drain energy and motivation.",
  "Quasi-identical": "Looks similar on paper but processes information in fundamentally different ways.",
  Supervision: "Asymmetric relation. The supervisor's leading function unconsciously pressures the supervisee's most vulnerable point.",
  Benefit: "Asymmetric relation. The benefactor's creative function naturally feeds the beneficiary's suggestive, creating one-sided mentorship.",
  Illusionary: "Feels warm and comfortable at first, like a mirage of duality, but lacks real complementarity.",
  "Semi-dual": "Partially fulfills dual needs — shares one key function but misses the other. Close but incomplete.",
  "Look-a-like": "Types that appear similar on the surface but approach life from different angles. Cooperative but shallow.",
  Kindred: "Same leading function, different creative. Kindred spirits who approach problems similarly but solve them differently.",
};

export const ROLE_DESCRIPTIONS: Record<AsymmetricRole, string> = {
  Supervisor: "You are the supervisor — your leading function unconsciously pressures their vulnerable point. They feel scrutinized by you.",
  Supervisee: "You are the supervisee — their leading function pressures your vulnerable point. You feel watched and corrected.",
  Benefactor: "You are the benefactor — your creative function naturally mentors them, feeding their suggestive almost without trying.",
  Beneficiary: "You are the beneficiary — they naturally mentor you, but the dynamic can feel patronizing over time.",
};

// (p,q) → { relation, role? }
// role is only set for asymmetric relations (Supervision, Benefit)
const RELATION_BY_POSITION: Record<string, { relation: RelationName; role?: AsymmetricRole }> = {
  "1,2": { relation: "Identity" },
  "2,1": { relation: "Mirror" },
  "5,6": { relation: "Dual" },
  "6,5": { relation: "Activation" },
  "3,4": { relation: "Super-ego" },
  "4,3": { relation: "Conflict" },
  "7,8": { relation: "Contrary" },
  "8,7": { relation: "Quasi-identical" },
  "1,4": { relation: "Kindred" },
  "3,2": { relation: "Look-a-like" },
  "5,8": { relation: "Semi-dual" },
  "7,6": { relation: "Illusionary" },
  "6,7": { relation: "Benefit",      role: "Benefactor" },
  "8,5": { relation: "Benefit",      role: "Beneficiary" },
  "2,3": { relation: "Supervision",  role: "Supervisor" },
  "4,1": { relation: "Supervision",  role: "Supervisee" },
};

const QUALITY: Record<RelationName, RelationQuality> = {
  Identity: "neutral",
  Dual: "positive",
  Activation: "positive",
  Mirror: "neutral",
  Conflict: "negative",
  "Super-ego": "negative",
  Contrary: "negative",
  "Quasi-identical": "neutral",
  Supervision: "negative",
  Benefit: "neutral",
  Illusionary: "neutral",
  "Semi-dual": "positive",
  "Look-a-like": "neutral",
  Kindred: "neutral",
};

export interface RelationResult {
  relation: RelationName;
  quality: RelationQuality;
  role?: AsymmetricRole;  // only for Supervision and Benefit
}

export function getRelation(a: TypeCode, b: TypeCode): RelationResult {
  const typeA = TYPE_BY_CODE[a];
  const typeB = TYPE_BY_CODE[b];

  const posB1 = typeA.functions.indexOf(typeB.functions[0]) + 1;
  const posB2 = typeA.functions.indexOf(typeB.functions[1]) + 1;

  const key = `${posB1},${posB2}`;
  const entry = RELATION_BY_POSITION[key];

  if (!entry) {
    console.warn(`Unknown relation position pair (${key}) for ${a} → ${b}`);
    return { relation: "Identity", quality: "neutral" };
  }

  return { relation: entry.relation, quality: QUALITY[entry.relation], role: entry.role };
}

export function allRelationsFor(a: TypeCode): Array<{ other: TypeCode } & RelationResult> {
  return TYPE_ORDER.filter((b) => b !== a).map((b) => ({ other: b, ...getRelation(a, b) }));
}
