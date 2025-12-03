// frontend/tailwind.config.js   ← MUST be .js (not .ts) for now
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        "primary-dark": "#1d4ed8",
        success: "#10b981",
        "success-dark": "#059669",
      },
    },
  },
  plugins: [],
}