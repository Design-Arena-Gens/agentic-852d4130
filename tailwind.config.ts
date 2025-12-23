import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jetbrains)", "monospace"]
      },
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d6efff",
          200: "#b0e1ff",
          300: "#79ccff",
          400: "#38acff",
          500: "#0e8ef5",
          600: "#0170d7",
          700: "#0059b0",
          800: "#064c8f",
          900: "#0b3f73",
          950: "#07274a"
        }
      }
    }
  },
  plugins: []
};

export default config;
