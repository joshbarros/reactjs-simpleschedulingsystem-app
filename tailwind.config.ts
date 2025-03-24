
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--tertiary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))'
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: '9999px'
      },
      boxShadow: {
        'low': 'var(--shadow-low)',
        'medium': 'var(--shadow-medium)',
        'high': 'var(--shadow-high)',
        'xl': 'var(--shadow-xl)',
      },
      fontFamily: {
        'sans': ['var(--font-roboto)', 'system-ui', 'sans-serif'],
        'heading': ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-roboto-mono)', 'monospace'],
      },
      fontSize: {
        'display-lg': ['3.5625rem', { lineHeight: '4rem', letterSpacing: '-0.025em' }],
        'display-md': ['2.8125rem', { lineHeight: '3.25rem', letterSpacing: '-0.025em' }],
        'display-sm': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.025em' }],
        'headline-lg': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        'headline-md': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        'headline-sm': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
        'title-lg': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        'title-md': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.025em', fontWeight: '500' }],
        'title-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.025em', fontWeight: '500' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        "accordion-up": {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        "fade-in": {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "fade-out": {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        "slide-in-right": {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        "slide-out-right": {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        "scale-in": {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        "scale-out": {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.95)', opacity: '0' },
        },
        "shake": {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "enter": "fade-in 0.3s ease-out, scale-in 0.2s ease-out",
        "exit": "fade-out 0.3s ease-out, scale-out 0.2s ease-out",
      },
      transitionDuration: {
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
