import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#18181b',
        surfaceHover: '#27272a',
        foreground: '#fafafa',

        // Single accent — violet ("purple lap" = fastest)
        accent: {
          DEFAULT: '#8b5cf6',
          soft: '#a78bfa',
          strong: '#7c3aed',
        },

        // Tier colors: DEFAULT for chart fills / tints, text for badge text
        tierSPlus: { DEFAULT: '#8b5cf6', text: '#c4b5fd' },
        tierS: { DEFAULT: '#f59e0b', text: '#fcd34d' },
        tierA: { DEFAULT: '#10b981', text: '#6ee7b7' },
        tierB: { DEFAULT: '#3b82f6', text: '#93c5fd' },
        tierC: { DEFAULT: '#71717a', text: '#d4d4d8' },
        tierD: { DEFAULT: '#ef4444', text: '#fca5a5' },
      },
      borderColor: {
        DEFAULT: '#27272a',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
