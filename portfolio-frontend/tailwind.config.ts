import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light canvas — the page sits on a warm off-white, cards on pure white.
        canvas: "#F5F5F4",
        surface: "#FFFFFF",
        ink: "#0A0A0A",
        "ink-muted": "#71717A",
        "ink-subtle": "#A1A1AA",
        line: "#E7E5E4",

        // Purple is the single accent — links, active nav, primary buttons.
        accent: "#7C3AED",
        "accent-soft": "#EDE9FE",
        "accent-ink": "#5B21B6",

        // The deep indigo used by the hero and the CTA bands.
        night: "#1E1B4B",
        "night-deep": "#0F0D2E",

        // Category chips and terminal syntax.
        signal: {
          green: "#22C55E",
          amber: "#F59E0B",
          red: "#EF4444",
          blue: "#3B82F6",
          cyan: "#06B6D4",
          pink: "#EC4899",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,0.04), 0 1px 3px rgba(10,10,10,0.04)",
        "card-hover": "0 4px 12px rgba(10,10,10,0.06), 0 2px 4px rgba(10,10,10,0.04)",
        lift: "0 12px 32px rgba(10,10,10,0.10)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
