/** @type {import('tailwindcss').Config} */
const nativewind = require("nativewind/preset");

const palette = {
  sand: "#F7F4EE",
  sandDark: "#10191C",
  surface: "#FFFFFF",
  surfaceDark: "#162327",
  brand: {
    DEFAULT: "#2D666B",
    dark: "#22474D",
    tint: "#6F9B9D",
  },
  gold: "#B08C57",
  success: "#788E76",
  danger: "#EF4444",
  text: "#1F2528",
  textMuted: "#6F7472",
  border: "#E7E0D4",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./modules/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [nativewind],
  darkMode: "class",
  theme: {
    screens: {
      xs: "360px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        sand: {
          DEFAULT: palette.sand,
          dark: palette.sandDark,
        },
        surface: {
          DEFAULT: palette.surface,
          dark: palette.surfaceDark,
        },
        brand: palette.brand,
        gold: palette.gold,
        success: palette.success,
        danger: palette.danger,
        text: {
          DEFAULT: palette.text,
          muted: palette.textMuted,
        },
        border: {
          DEFAULT: palette.border,
          dark: "#294046",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "Inter", "System"],
        display: ['"Space Grotesk"', '"DM Sans"', "System"],
      },
      borderRadius: {
        "3xl": "32px",
        "4xl": "40px",
        pill: "999px",
      },
      spacing: {
        gutter: "1.25rem",
        section: "1.75rem",
      },
      boxShadow: {
        card: "0 16px 32px rgba(15,31,43,0.14)",
        "card-dark": "0 16px 32px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
