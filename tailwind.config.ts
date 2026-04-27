import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border-subtle))",
        input: "hsl(var(--border-strong))",
        ring: "hsl(var(--accent))",
        background: "hsl(var(--bg-base))",
        foreground: "hsl(var(--text-primary))",
        primary: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--bg-elevated))",
          foreground: "hsl(var(--text-primary))",
        },
        destructive: {
          DEFAULT: "hsl(var(--signal-danger))",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(var(--bg-inset))",
          foreground: "hsl(var(--text-secondary))",
        },
        accent: {
          DEFAULT: "hsl(var(--bg-elevated))",
          foreground: "hsl(var(--text-primary))",
        },
        popover: {
          DEFAULT: "hsl(var(--bg-elevated))",
          foreground: "hsl(var(--text-primary))",
        },
        card: {
          DEFAULT: "hsl(var(--bg-surface))",
          foreground: "hsl(var(--text-primary))",
        },
        surface: "hsl(var(--bg-surface))",
        elevated: "hsl(var(--bg-elevated))",
        inset: "hsl(var(--bg-inset))",
        "border-strong": "hsl(var(--border-strong))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-tertiary": "hsl(var(--text-tertiary))",
        dead: {
          DEFAULT: "hsl(var(--signal-dead))",
          foreground: "hsl(var(--signal-dead-foreground))",
        },
        injured: {
          DEFAULT: "hsl(var(--signal-injured))",
          foreground: "hsl(var(--signal-injured-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        drag: "var(--shadow-drag)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "row-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slot-drop": {
          "0%": { transform: "scale(1.15)" },
          "60%": { transform: "scale(0.96)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up": "slide-up 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scale-in 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        "row-in": "row-in 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        "count-up": "count-up 120ms cubic-bezier(0.22, 1, 0.36, 1)",
        "slot-drop": "slot-drop 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
