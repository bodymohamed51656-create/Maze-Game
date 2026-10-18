/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#0e131f",
        "primary-container": "#8083ff",
        "secondary": "#4edea3",
        "surface-container-low": "#161c28",
        "surface-variant": "#2f3542",
        "primary": "#c0c1ff",
        "inverse-surface": "#dde2f3",
        "secondary-fixed": "#6ffbbe",
        "outline": "#908fa0",
        "surface-container-highest": "#2f3542",
        "surface-container-high": "#242a36",
        "on-surface-variant": "#c7c4d7",
        "tertiary-container": "#ff516a",
      },
      fontFamily: {
        "headline-sm": ["Space Grotesk", "sans-serif"],
        "label-sm": ["Space Mono", "monospace"],
        "label-md": ["Space Mono", "monospace"],
        "body-sm": ["Geist", "sans-serif"],
      }
    },
  },
  plugins: [],
}