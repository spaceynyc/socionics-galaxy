/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        electric: "#3b82f6",
        emerald: "#10b981",
        amber: "#f59e0b",
        crimson: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glowBlue: "0 0 40px rgba(59,130,246,0.35)",
        glowGreen: "0 0 40px rgba(16,185,129,0.28)",
        glowAmber: "0 0 40px rgba(245,158,11,0.28)",
        glowRed: "0 0 40px rgba(239,68,68,0.25)",
      },
      backdropBlur: {
        glass: "14px",
      },
    },
  },
  plugins: [],
};

