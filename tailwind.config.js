/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/design-system/**/*.{js,ts,jsx,tsx,mdx}',
    './src/domains/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/providers/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
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
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          active: 'hsl(var(--primary-active))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        shop: {
          DEFAULT: 'hsl(var(--shop))',
          foreground: 'hsl(var(--shop-foreground))',
          hover: 'hsl(var(--shop-hover))',
        },
      },
      fontFamily: {
        sans: ['IRANYekan', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.6' }],
        xs:    ['12px', { lineHeight: '1.7' }],
        sm:    ['13px', { lineHeight: '1.75' }],
        base:  ['14px', { lineHeight: '1.9' }],
        md:    ['15px', { lineHeight: '2' }],
        lg:    ['16px', { lineHeight: '1.85' }],
        xl:    ['18px', { lineHeight: '1.7' }],
        '2xl': ['20px', { lineHeight: '1.6' }],
        '3xl': ['24px', { lineHeight: '1.5' }],
        '4xl': ['28px', { lineHeight: '1.4' }],
        '5xl': ['32px', { lineHeight: '1.3' }],
        '6xl': ['40px', { lineHeight: '1.2' }],
      },
      lineHeight: {
        reading: '2.15',
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        md: '0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        lg: '0 12px 24px -6px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.05)',
      },
      zIndex: {
        base:     '0',
        sticky:   '10',
        fixed:    '20',
        dropdown: '30',
        overlay:  '40',
        modal:    '50',
        popover:  '60',
        toast:    '70',
      },
      transitionDuration: {
        fast:   '150ms',
        normal: '200ms',
        slow:   '300ms',
      },
      transitionTimingFunction: {
        out:   'cubic-bezier(0.16, 1, 0.3, 1)',
        in:    'cubic-bezier(0.4, 0, 1, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to:   { opacity: '0' },
        },
        'slide-in': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to:   { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down':   'accordion-down 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'accordion-up':     'accordion-up 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in':          'fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out':         'fade-out 150ms cubic-bezier(0.4, 0, 1, 1)',
        'slide-in':         'slide-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-from-top': 'slide-in-from-top 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':         'scale-in 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
