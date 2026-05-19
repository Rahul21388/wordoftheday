/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        charcoal: "#1a1a1a",
        surface: "#222222",
        surfaceAlt: "#2a2a2a",
        teal: {
          DEFAULT: "#14b8a6",
          soft: "#0f766e",
        },
        muted: "#9ca3af",
        divider: "#2f2f2f",
      },
      fontFamily: {
        serif: ["serif"],
      },
    },
  },
  plugins: [],
};
