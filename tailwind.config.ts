import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#FBF7F0",
          100: "#F6EFE2",
          200: "#EFE3CE",
          300: "#E4D2B1",
        },
        clay: {
          400: "#B8956A",
          500: "#A07B52",
          600: "#7A5C3B",
        },
        ink: {
          700: "#5B4A36",
          800: "#3D2F1F",
          900: "#2A1F12",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif KR"', "ui-serif", "Georgia", "serif"],
        sans:  ['"Noto Sans KR"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
