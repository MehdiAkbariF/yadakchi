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
      '2xl': '1440px',
    },
    extend: {
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '7.5': '1.875rem',
        '9.5': '2.375rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
      },
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
        overlay: {
          DEFAULT: 'hsl(var(--overlay))',
          foreground: 'hsl(var(--overlay-foreground))',
        },
        status: {
          pending: {
            DEFAULT: 'hsl(var(--status-pending))',
            foreground: 'hsl(var(--status-pending-foreground))',
          },
          'needs-action': {
            DEFAULT: 'hsl(var(--status-needs-action))',
            foreground: 'hsl(var(--status-needs-action-foreground))',
          },
          'waiting-response': {
            DEFAULT: 'hsl(var(--status-waiting-response))',
            foreground: 'hsl(var(--status-waiting-response-foreground))',
          },
          confirmed: {
            DEFAULT: 'hsl(var(--status-confirmed))',
            foreground: 'hsl(var(--status-confirmed-foreground))',
          },
          completed: {
            DEFAULT: 'hsl(var(--status-completed))',
            foreground: 'hsl(var(--status-completed-foreground))',
          },
          rejected: {
            DEFAULT: 'hsl(var(--status-rejected))',
            foreground: 'hsl(var(--status-rejected-foreground))',
          },
        },
      },
      fontFamily: {
        sans: ['IRANYekan', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '3xs': ['0.625rem',  { lineHeight: '1.4' }],
        '2xs': ['0.6875rem', { lineHeight: '1.5' }],
        xs:    ['0.75rem',   { lineHeight: '1.6' }],
        sm:    ['0.8125rem', { lineHeight: '1.65' }],
        base:  ['0.875rem',  { lineHeight: '1.75' }],
        md:    ['0.9375rem', { lineHeight: '1.8' }],
        lg:    ['1rem',      { lineHeight: '1.75' }],
        xl:    ['1.125rem',  { lineHeight: '1.6' }],
        '2xl': ['1.25rem',   { lineHeight: '1.5' }],
        '3xl': ['1.5rem',    { lineHeight: '1.4' }],
        '4xl': ['1.75rem',   { lineHeight: '1.3' }],
        '5xl': ['2rem',      { lineHeight: '1.25' }],
        '6xl': ['2.25rem',   { lineHeight: '1.2' }],
      },
      lineHeight: {
        reading: '1.85',
      },
      borderRadius: {
        sm:    '0.375rem',
        md:    '0.5rem',
        lg:    '0.75rem',
        xl:    '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'overlay-top': '0 -8px 25px 0 rgb(0 0 0 / 0.08)',
        'overlay-top-dark': '0 -8px 25px 0 rgb(0 0 0 / 0.35)',
        'nav-top': '0 -4px 20px 0 rgb(0 0 0 / 0.06)',
        'nav-top-sm': '0 -2px 10px 0 rgb(0 0 0 / 0.05)',
        'sticky-start': '-4px 0 10px 0 rgb(0 0 0 / 0.03)',
        'focus-primary': '0 0 15px 0 rgb(234 88 12 / 0.6)',
        'sheet-up': '0 -16px 40px 0 rgb(0 0 0 / 0.16)',
        'sheet-up-dark': '0 -16px 40px 0 rgb(0 0 0 / 0.5)',
      },
      zIndex: {
        base:      '0',
        sticky:    '10',
        fixed:     '20',
        dropdown:  '30',
        overlay:   '40',
        modal:     '50',
        popover:   '60',
        toast:     '70',
        loader:    '80',
        nprogress: '90',
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
    },
  },
  plugins: [],
};