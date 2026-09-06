/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090A0F",
        card: "#12141F",
        cardBorder: "#1E2235",
        brand: {
          DEFAULT: "#38BDF8",
          neon: "#CCFF00",
          cyan: "#00F0FF",
        },
      },
    },
  },
  plugins: [],
};
