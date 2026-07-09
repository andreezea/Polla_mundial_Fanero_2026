/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A",
          50: "#EAF0FA",
          100: "#CBD9EE",
          200: "#9AB3DC",
          300: "#688DCA",
          400: "#3F68A8",
          500: "#1B4F86",
          600: "#123A63",
          700: "#0B1F3A",
          800: "#081729",
          900: "#050E1A",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF6E6",
          100: "#F6EBC5",
          200: "#F1D97A",
          300: "#E8C555",
          400: "#DFBB44",
          500: "#D4AF37",
          600: "#B3922B",
          700: "#8C7220",
          800: "#645217",
          900: "#3D320E",
        },
        surface: {
          DEFAULT: "#0F2540",
          light: "#152E4D",
          card: "#132B49",
          border: "#22406A",
        },
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.25)",
        gold: "0 4px 14px rgba(212,175,55,0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};
