import { Color } from "ogl";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist Sans", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      screens: {
        'xs': '320px',
      },
    },
  },
  plugins: [],
} satisfies Config;