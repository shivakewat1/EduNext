// 


// Global theme tokens — Gradient Edition
export const T = {
  // ── Core Colors ──────────────────────────────────────────────────────────
  primary:      "#4f46e5",          // indigo-600
  primaryDark:  "#3730a3",          // indigo-800
  primaryLight: "#eef2ff",          // indigo-50
  primaryMid:   "#6366f1",          // indigo-500 (for gradients)

  accent:       "#06b6d4",          // cyan-500
  accentDark:   "#0891b2",          // cyan-600
  accentLight:  "#ecfeff",          // cyan-50

  // ── Gradients ────────────────────────────────────────────────────────────
  gradientHero:    "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)",
  gradientCard:    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
  gradientAccent:  "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  gradientSubtle:  "linear-gradient(135deg, #eef2ff 0%, #ecfeff 100%)",
  gradientDark:    "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #164e63 100%)",

  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg:    "#f8faff",                 // very light blue-tinted white
  white: "#ffffff",

  // ── Text ─────────────────────────────────────────────────────────────────
  text:      "#0f172a",
  textMuted: "#64748b",
  textLight: "#94a3b8",

  // ── Borders ──────────────────────────────────────────────────────────────
  border:       "#e0e7ff",          // indigo-tinted border
  borderAccent: "#a5f3fc",          // cyan-tinted border

  // ── Shadows ──────────────────────────────────────────────────────────────
  shadow:      "0 4px 16px rgba(79,70,229,0.08)",
  shadowHover: "0 12px 32px rgba(79,70,229,0.18)",
  shadowCard:  "0 2px 8px rgba(79,70,229,0.06)",

  // ── Layout ───────────────────────────────────────────────────────────────
  radius:   14,
  radiusSm: 8,
  maxWidth: "1100px",
  px:       "clamp(20px, 5vw, 80px)",
};
