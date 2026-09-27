/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SIH26127 semantic tokens — government-grade command center
        'brand-black': '#171717',
        'brand-panel': '#E9E9E6',
        'brand-paper': '#E9E9E6',
        'brand-dark': '#111111',
        'brand-acid': '#C6F135',
        'brand-purple': '#8057FF',
        'brand-alert': '#FF3B30',
        'brand-teal': '#00C2FF',
        'brand-gray': '#8A8A86',
        'brand-dark-gray': '#2A2A2A',
        // Fallbacks for existing variables used in components so they don't break entirely
        obsidian: "#171717",
        "surface-dark": "#111111",
        "surface-card": "#E9E9E6", 
        "surface-card-hover": "#d1d1d1",
        "lime-hud": "#C6F135",
        "lime-hud-dim": "rgba(198, 241, 53, 0.12)",
        "crimson-alert": "#FF3B30",
        "amber-hazard": "#F59E0B",
        "cyan-hud": "#00C2FF",
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'], // using space grotesk for mono elements to keep it cohesive
      },
      boxShadow: {
        'hud-lime': 'none',
        'hud-crimson': 'none',
        'hud-cyan': 'none',
        'editorial': '4px 4px 0px 0px rgba(32,32,32,1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
