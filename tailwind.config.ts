import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        bangla: ["Noto Sans Bengali", "Hind Siliguri", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Noto Sans Bengali", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          navy: "#08090d",
          dark: "#0d0f14",
          card: "#141720",
          surface: "#191d28",
          border: "#242936",
          blue: "#2563eb",
          cyan: "#22d3ee",
          electric: "#22d3ee",
          orange: "#f97316",
          green: "#22c55e",
          purple: "#8b5cf6",
          violet: "#8b5cf6",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
