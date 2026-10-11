import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#1F2937",
        primary: {
          DEFAULT: "#198754",
          dark: "#146C43",
          light: "#EAF7EE",
          hover: "#157347",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F9FAFB",
          pale: "#EAF7EE",
          subtle: "#F3FBF5",
        },
        charcoal: {
          DEFAULT: "#1F2937",
          muted: "#4B5563",
          light: "#6B7280",
          faint: "#9CA3AF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          light: "#F3F4F6",
          green: "#C3E6CB",
        },
        accent: {
          honey: "#F59E0B",
          honeyLight: "#FEF3C7",
        },
        state: {
          success: "#198754",
          warning: "#F59E0B",
          error: "#DC2626",
          info: "#0284C7",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        elevated: "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        greenGlow: "0 0 15px rgba(25, 135, 84, 0.15)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
