/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#202020',
        'brand-paper': '#E5E5E6',
        'brand-acid': '#C8E84D',
        'brand-purple': '#8050E8',
        'brand-gray': '#777777',
        'brand-dark-gray': '#333333',
        // Fallbacks for existing variables used in components so they don't break entirely
        obsidian: "#202020",
        "surface-dark": "#2a2a2a",
        "surface-card": "#E5E5E6", 
        "surface-card-hover": "#d1d1d1",
        "lime-hud": "#C8E84D",
        "lime-hud-dim": "rgba(200, 232, 77, 0.15)",
        "crimson-alert": "#FF3B30",
        "amber-hazard": "#F59E0B",
        "cyan-hud": "#8050E8", // Mapped to purple
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
