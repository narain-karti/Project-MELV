/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0A0D12",
        "surface-dark": "#0F172A",
        "surface-card": "#131C2E",
        "surface-card-hover": "#1A253C",
        "lime-hud": "#D4FF32",
        "lime-hud-dim": "rgba(212, 255, 50, 0.15)",
        "crimson-alert": "#FF3B30",
        "amber-hazard": "#F59E0B",
        "cyan-hud": "#00F2FE",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Syne"', '"Outfit"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hud-lime': '0 0 15px rgba(212, 255, 50, 0.3)',
        'hud-crimson': '0 0 20px rgba(255, 59, 48, 0.4)',
        'hud-cyan': '0 0 15px rgba(0, 242, 254, 0.3)',
      }
    },
  },
  plugins: [],
}
