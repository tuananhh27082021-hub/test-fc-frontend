import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1280px',
      'xl': '1440px',
      '2xl': '1920px',
    },

    extend: {
      colors: {
        'primary': {
          DEFAULT: '#0000FF',
          1: '#4D4DFF',
          2: '#8080FF',
          3: '#B3B3FF',
          4: '#E6E6FF',
        },
        'secondary': {
          DEFAULT: '#1E90FF',
          1: '#62B2FF',
          2: '#8FC8FF',
          3: '#BCDEFF',
          4: '#E9F4FF',
        },
        'danger': '#FF4242',
        'alert': '#FBFF22',
        'good': '#42FF55',
        'info': '#2361FF',
        'sup-orange': {
          DEFAULT: '#FD671A',
          1: '#FE955F',
          2: '#FEB38D',
          3: '#FFD2BB',
        },
        'sup-lime': {
          DEFAULT: '#CDDD00',
          1: '#DCE84D',
          2: '#E6EE80',
          3: '#F0F5B3',
        },

        'border': 'var(--border)',
        'input': 'var(--input)',
        'foreground': 'var(--foreground)',
        'foreground-70': '#4D4D4D',
        'foreground-50': '#808080',
        'foreground-disabled': '#A4A4A4',
        'background': 'var(--background)',
        'background-extra-light': '#FAFAFA',
        'ring': 'var(--ring)',

        'destructive': {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'muted': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'popover': {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'card': {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      boxShadow: {
        light: '4px 4px 0px 0px #000',
        highlight: '5px 5px 0px 0px #006FBC',
        dark: '4px 4px 0px 0px #000',
      },
      translate: {
        boxShadowX: '4px',
        boxShadowY: '4px',
        reverseBoxShadowX: '-4px',
        reverseBoxShadowY: '-4px',
      },
      maxWidth: {
        1120: '1120px',
        1600: '1600px',
      },
      borderRadius: {
        14: '56px',
        12: '48px',
        8: '32px',
        10: '40px',
      },
      fontFamily: {
        'clash-display': ['var(--font-clash-display)'],
        'satoshi': ['var(--font-satoshi)'],
        'baloo-2': ['var(--font-baloo-2)'],
      },
      aspectRatio: {
        '4/3': '4 / 3',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
