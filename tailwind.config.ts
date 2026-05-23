import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marigold: "#E8703C",
        ledger: "#0F3B2E",
        mustard: "#F4B740",
        cream: "#FDF8F0",
        khadi: "#F4ECD9",
        inkblack: "#1A1814",
        success: "#2D8659",
        danger: "#C44536",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'DM Serif Display'", "serif"],
      },
    },
  },
  plugins: [animate],
} satisfies Config;
