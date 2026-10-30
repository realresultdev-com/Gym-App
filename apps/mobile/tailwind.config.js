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
          bg: "#0c0d0e",
          dark: "#121214",
          card: "#18191b",
          cardLight: "#222326",
          border: "#282a2e",
          lime: "#bbf451",
          limeLight: "#d9f99d",
          coral: "#f43f5e",
          red: "#ff3b30",
          yellow: "#f59e0b",
          yellowLight: "#fde68a",
          muted: "#8e8e93",
        },
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
