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
        background: '#0a0a0a',
        surface: '#1a1a1a',
        surfaceHover: '#252525',
        primary: '#ff3333',
        secondary: '#ffaa00',
        accent: '#00ff88',

        // Tier colors
        tierSPlus: '#a855f7',
        tierS: '#fbbf24',
        tierA: '#10b981',
        tierB: '#3b82f6',
        tierC: '#6b7280',
        tierD: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-rajdhani)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
