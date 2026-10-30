/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        gym: {
          bg: "#ffffff",
          canvas: "#f8fafc",
          card: "#ffffff",
          cardLight: "#f1f5f9",
          border: "#e2e8f0",
          text: "#0f172a",
          textMuted: "#64748b",
          lime: "#84cc16",
          limeLight: "#ecfccb",
          coral: "#ef4444",
          red: "#dc2626",
          yellow: "#f59e0b",
          yellowLight: "#fef3c7",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
