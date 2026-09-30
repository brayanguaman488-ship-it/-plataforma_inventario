import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'var(--font-sans)', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'var(--font-mono)', 'monospace'],
      },
      colors: {
        slate: {
          950: '#06080F',
          900: '#0D121E',
          850: '#111726',
          800: '#182032',
          700: '#232D42',
        },
        cyber: {
          blue: '#38BDF8',
          cyan: '#06B6D4',
          indigo: '#6366F1',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
