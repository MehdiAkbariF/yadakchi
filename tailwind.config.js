// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/design-system/**/*.{js,ts,jsx,tsx,mdx}',
    './src/domains/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    // ═══════════════════════════════════════════════
    // 🎨 COLORS — رنگ‌های معنایی
    // ═══════════════════════════════════════════════
    extend: {
      colors: {
        // ─── پایه (متصل به CSS Variables برای تم داینامیک) ───
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // ─── کارت ───
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        
        // ─── Popover ───
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        
        // ─── Primary (برند) ───
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50:  '#FFF4F0',
          100: '#FFE5DA',
          200: '#FFC7B0',
          300: '#FFA180',
          400: '#FF7A50',
          500: '#F56D3C',
          600: '#E55626',
          700: '#C24319',
          800: '#9A3513',
          900: '#7A2A10',
          950: '#41130A',
        },
        
        // ─── Secondary ───
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        
        // ─── Muted ───
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        
        // ─── Accent ───
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        
        // ─── Destructive (Danger) ───
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        
        // ─── Success ───
        success: {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF',
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        
        // ─── Warning ───
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        
        // ─── Info ───
        info: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        
        // ─── Neutral (برای جایگزینی مستقیم) ───
        neutral: {
          0:   '#FFFFFF',
          50:  '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        
        // ─── Domain — رنگ‌های اختصاصی یدک‌چی ───
        part: {
          engine:     '#DC2626',
          brake:      '#EF4444',
          electrical: '#F59E0B',
          body:       '#0891B2',
          audio:      '#8B5CF6',
          suspension: '#2563EB',
          fuel:       '#16A34A',
          cooling:    '#06B6D4',
          interior:   '#52525B',
          exterior:   '#71717A',
        },
        
        condition: {
          new:     '#22C55E',
          stock:   '#F59E0B',
          takeOff: '#EF4444',
        },
        
        seller: {
          verified: '#22C55E',
          pending:  '#F59E0B',
          rejected: '#EF4444',
          featured: '#8B5CF6',
        },
      },

      // ═══════════════════════════════════════════════
      // 📐 SPACING — با نام‌گذاری معنایی
      // ═══════════════════════════════════════════════
      spacing: {
        // ─── ریزی ───
        '3xs': '0.125rem',  // 2px
        '2xs': '0.25rem',   // 4px
        'xs':  '0.5rem',    // 8px
        'sm':  '0.75rem',   // 12px

        // ─── متوسط ───
        'md':  '1rem',      // 16px
        'lg':  '1.5rem',    // 24px

        // ─── بزرگ ───
        'xl':  '2rem',      // 32px
        '2xl': '3rem',      // 48px
        '3xl': '4rem',      // 64px

        // ─── عظیم ───
        '4xl': '6rem',      // 96px
        '5xl': '8rem',      // 128px
        '6xl': '12rem',     // 192px

        // ─── سازگاری با کد قبلی (مقدار Tailwind پیش‌فرض) ───
        '13': '3.25rem',    // 52px
        '15': '3.75rem',    // 60px
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '13.5': '3.375rem',
      },

      // ═══════════════════════════════════════════════
      // 📏 SIZES — ارتفاع/عرض‌های استاندارد
      // ═══════════════════════════════════════════════
      width: ({ theme }) => ({
        ...theme('spacing'),
        'touch-sm': '2.25rem',
        'touch-md': '2.75rem',
        'touch-lg': '3rem',
        'sidebar-sm': '16rem',
        'sidebar-md': '18rem',
        'sidebar-lg': '20rem',
      }),
      
      height: ({ theme }) => ({
        ...theme('spacing'),
        'touch-sm': '2.25rem',
        'touch-md': '2.75rem',
        'touch-lg': '3rem',
        'control-xs': '1.75rem',
        'control-sm': '2rem',
        'control-md': '2.5rem',
        'control-lg': '3rem',
        'control-xl': '3.25rem',
      }),

      // ═══════════════════════════════════════════════
      // 🔘 BORDER RADIUS
      // ═══════════════════════════════════════════════
      borderRadius: {
        'none': '0',
        'xs':   '0.25rem',   // 4px
        'sm':   '0.375rem',  // 6px
        'md':   '0.5rem',    // 8px  (پیش‌فرض Button)
        'lg':   '0.75rem',   // 12px
        'xl':   '1rem',      // 16px (Card)
        '2xl':  '1.5rem',    // 24px (Modal)
        '3xl':  '2rem',      // 32px
        'full': '9999px',
      },

      // ═══════════════════════════════════════════════
      // 🌑 SHADOWS — elevation + colored
      // ═══════════════════════════════════════════════
      boxShadow: {
        // ─── Neutral ───
        'xs':    '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'sm':    '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'md':    '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'lg':    '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
        'xl':    '0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
        '2xl':   '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'inner-top': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.06)',

        // ─── Brand (برای CTA) ───
        'brand-xs': '0 1px 3px 0 rgb(245 109 60 / 0.20)',
        'brand-sm': '0 2px 8px -2px rgb(245 109 60 / 0.25)',
        'brand-md': '0 8px 24px -4px rgb(245 109 60 / 0.30)',
        'brand-lg': '0 16px 40px -8px rgb(245 109 60 / 0.35)',
        'brand-xl': '0 24px 56px -12px rgb(245 109 60 / 0.40)',

        // ─── Colored (برای alert و وضعیت‌ها) ───
        'success-sm': '0 2px 8px -2px rgb(34 197 94 / 0.25)',
        'success-md': '0 8px 24px -4px rgb(34 197 94 / 0.30)',
        'danger-sm':  '0 2px 8px -2px rgb(239 68 68 / 0.25)',
        'danger-md':  '0 8px 24px -4px rgb(239 68 68 / 0.30)',
        'warning-sm': '0 2px 8px -2px rgb(245 158 11 / 0.25)',
        'warning-md': '0 8px 24px -4px rgb(245 158 11 / 0.30)',

        // ─── Focus Rings ───
        'focus-brand':   '0 0 0 3px rgb(245 109 60 / 0.20)',
        'focus-success': '0 0 0 3px rgb(34 197 94 / 0.20)',
        'focus-danger':  '0 0 0 3px rgb(239 68 68 / 0.20)',
        'focus-warning': '0 0 0 3px rgb(245 158 11 / 0.20)',
        'focus-neutral': '0 0 0 3px rgb(161 161 170 / 0.20)',
      },

      // ═══════════════════════════════════════════════
      // 🔤 FONT FAMILY
      // ═══════════════════════════════════════════════
      fontFamily: {
        sans: ['IRANYekan', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        yekan: ['IRANYekan', 'system-ui', 'sans-serif'],
        'iran-sans': ['IRANYekan', 'system-ui', 'sans-serif'],
        'iran-yekan': ['IRANYekan', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },

      // ═══════════════════════════════════════════════
      // 📝 FONT SIZE — با نام‌گذاری معنایی
      // ═══════════════════════════════════════════════
      fontSize: {
        // ─── Display ───
        'display-2xl': ['4.5rem',  { lineHeight: '1.05', letterSpacing: '-0.03em',  fontWeight: '900' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '900' }],
        'display-lg':  ['3rem',    { lineHeight: '1.1',  letterSpacing: '-0.02em',  fontWeight: '800' }],
        'display-md':  ['2.5rem',  { lineHeight: '1.15', letterSpacing: '-0.02em',  fontWeight: '800' }],

        // ─── Heading ───
        'heading-h1': ['2.25rem',  { lineHeight: '1.25', letterSpacing: '-0.02em',   fontWeight: '800' }],
        'heading-h2': ['1.875rem', { lineHeight: '1.3',  letterSpacing: '-0.015em',  fontWeight: '800' }],
        'heading-h3': ['1.5rem',   { lineHeight: '1.35', letterSpacing: '-0.01em',   fontWeight: '700' }],
        'heading-h4': ['1.25rem',  { lineHeight: '1.4',  letterSpacing: '-0.005em',  fontWeight: '700' }],
        'heading-h5': ['1.125rem', { lineHeight: '1.45', fontWeight: '700' }],
        'heading-h6': ['1rem',     { lineHeight: '1.5',  fontWeight: '600' }],

        // ─── Body ───
        'body-xl': ['1.125rem',  { lineHeight: '1.75' }],
        'body-lg': ['1rem',      { lineHeight: '1.75' }],
        'body-md': ['0.875rem',  { lineHeight: '1.7'  }],
        'body-sm': ['0.8125rem', { lineHeight: '1.65' }],
        'body-xs': ['0.75rem',   { lineHeight: '1.6'  }],

        // ─── Label ───
        'label-lg': ['0.9375rem', { lineHeight: '1.5', fontWeight: '500' }],
        'label-md': ['0.875rem',  { lineHeight: '1.5', fontWeight: '500' }],
        'label-sm': ['0.75rem',   { lineHeight: '1.5', fontWeight: '500' }],

        // ─── سازگاری با کد قدیم ───
        'xs':   ['0.75rem',    { lineHeight: '1rem' }],
        'sm':   ['0.875rem',   { lineHeight: '1.25rem' }],
        'base': ['1rem',       { lineHeight: '1.5rem' }],
        'lg':   ['1.125rem',   { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',    { lineHeight: '1.75rem' }],
        '2xl':  ['1.5rem',     { lineHeight: '2rem' }],
        '3xl':  ['1.875rem',   { lineHeight: '2.25rem' }],
        '4xl':  ['2.25rem',    { lineHeight: '2.5rem' }],
        '5xl':  ['3rem',       { lineHeight: '1' }],
        '6xl':  ['3.75rem',    { lineHeight: '1' }],
        '7xl':  ['4.5rem',     { lineHeight: '1' }],
        '8xl':  ['6rem',       { lineHeight: '1' }],
        '9xl':  ['8rem',       { lineHeight: '1' }],
      },

      // ═══════════════════════════════════════════════
      // ⏱️ TRANSITION — برای Tailwind
      // ═══════════════════════════════════════════════
      transitionDuration: {
        'instant': '100ms',
        'fast':    '150ms',
        'normal':  '250ms',
        'slow':    '400ms',
        'slower':  '600ms',
      },
      
      transitionTimingFunction: {
        'emphasized': 'cubic-bezier(0.2, 0.0, 0, 1)',
        'exit':       'cubic-bezier(0.4, 0, 1, 1)',
        'standard':   'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce':     'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // ═══════════════════════════════════════════════
      // 🎬 KEYFRAMES
      // ═══════════════════════════════════════════════
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.25s ease-out',
        'fade-out':       'fade-out 0.2s ease-out',
        'slide-in':       'slide-in 0.25s ease-out',
        'slide-in-from-top':   'slide-in-from-top 0.2s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.25s ease-out',
        'scale-in':       'scale-in 0.2s ease-out',
        'shimmer':        'shimmer 1.5s infinite linear',
        'pulse-soft':     'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft':    'bounce-soft 1s infinite ease-in-out',
      },

      // ═══════════════════════════════════════════════
      // 📐 ASPECT RATIO
      // ═══════════════════════════════════════════════
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video':  '16 / 9',
        'photo':  '4 / 3',
        'poster': '3 / 4',
        'wide':   '21 / 9',
      },

      // ═══════════════════════════════════════════════
      // 🎯 Z-INDEX
      // ═══════════════════════════════════════════════
      zIndex: {
        '0':   '0',
        '10':  '10',
        '20':  '20',
        '30':  '30',
        '40':  '40',
        '50':  '50',
        'sticky':  '60',
        'header':  '70',
        'modal':   '80',
        'popover': '90',
        'toast':   '100',
        'max':     '9999',
      },
    },
  },

  // ═══════════════════════════════════════════════
  // 🔌 PLUGINS
  // ═══════════════════════════════════════════════
  plugins: [
    // ─── پلاگین سفارشی برای کلاس‌های Utility ───
    function ({ addUtilities, addComponents, theme }) {
      // ─── Focus Ring یکدست ───
      addUtilities({
        '.focus-ring': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: theme('boxShadow.focus-brand'),
            borderColor: theme('colors.primary.500'),
          },
        },
        '.focus-ring-success': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: theme('boxShadow.focus-success'),
          },
        },
        '.focus-ring-danger': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: theme('boxShadow.focus-danger'),
          },
        },
        '.focus-ring-inset': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `inset 0 0 0 2px ${theme('colors.primary.500')}`,
          },
        },
      });

      // ─── Glass Effect ───
      addUtilities({
        '.glass': {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.glass-dark': {
          background: 'rgba(18, 18, 27, 0.6)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });

      // ─── Gradient Text ───
      addUtilities({
        '.text-gradient-brand': {
          background: `linear-gradient(135deg, ${theme('colors.primary.500')} 0%, ${theme('colors.primary.400')} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      });

      // ─── Scrollbar Custom ───
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.neutral.300'),
            borderRadius: '9999px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme('colors.neutral.400'),
          },
        },
      });

      // ─── Container ───
      addComponents({
        '.container-app': {
          width: '100%',
          maxWidth: '1840px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.md'),
          paddingRight: theme('spacing.md'),
          '@screen md': {
            paddingLeft: theme('spacing.lg'),
            paddingRight: theme('spacing.lg'),
          },
        },
      });
    },
  ],
};