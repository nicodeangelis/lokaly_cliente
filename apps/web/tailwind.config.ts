import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca' 
        },
        ink: { 
          700: '#0f172a',
          600: '#1f2937',
          500: '#334155' 
        },
        muted: '#f6f7fb',
        card: '#ffffff',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      boxShadow: {
        card: '0 6px 20px -8px rgb(2 6 23 / 20%)'
      },
      borderRadius: { 
        md: '12px',
        lg: '16px',
        xl: '24px' 
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [],
} satisfies Config
