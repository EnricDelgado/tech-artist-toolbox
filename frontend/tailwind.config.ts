import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Paleta oscura por defecto para technical artists.
        surface: {
          950: "#0b0d10",
          900: "#12151a",
          800: "#1a1f27",
          700: "#242b35",
        },
        accent: {
          500: "#6ee7b7",
          400: "#86efac",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
