/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Egyptian Retail Theme (System 1)
        luxury: {
          black: '#0A0A0B',        // Pure warm black for headers/footers
          charcoal: '#111827',     // Slate charcoal navy secondary
          gold: '#C5A880',         // Antique warm champagne/gold primary accent
          goldHover: '#D4AF37',    // Polished radiant gold for hover
          goldLight: '#FDFBF7',    // Soft champagne gold background tint
          goldMuted: 'rgba(197, 168, 128, 0.12)',
          ivory: '#FAFAFB',        // Clean modern luxury canvas background
          canvas: '#FAFAFB',       // Crisp modern canvas
          surface: '#FFFFFF',      // Clean white card surface
          text: '#0F172A',         // High contrast rich slate text
          muted: '#64748B',        // Secondary subtle text
          emerald: '#047857',      // Deep royal emerald for discounts & verified badges
          emeraldHover: '#065F46', // Darker emerald for buttons
          emeraldLight: '#ECFDF5', // Soft emerald tint
          border: '#E2E8F0',       // Clean subtle border
        },
        mall: {
          50: '#FAFAFB',
          100: '#F1F3F5',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#C5A880',
          500: '#B89B5E',
          600: '#9E834B',
          700: '#475569',
          800: '#1E293B',
          900: '#0F172A',
          950: '#090D16',
        },
        // B.TECH token override to completely eliminate orange & installments
        btech: {
          orange: '#C5A880',
          orangeHover: '#D4AF37',
          orangeLight: '#FDFBF7',
          black: '#0A0A0B',
          dark: '#0F172A',
          cardBg: '#ffffff',
          grayBg: '#FAFAFB',
        },
        gold: {
          50: '#FDFBF7',
          100: '#F9F4EB',
          200: '#F2E8D3',
          300: '#E5D3AE',
          400: '#D4AF37',
          500: '#C5A880',
          600: '#A4864A',
          700: '#8C6E38',
          800: '#6C542B',
          900: '#4D3B1E',
        },
        retail: {
          discount: '#047857',
          badge: '#047857',
          success: '#047857',
          whatsapp: '#25d366',
        }
      },
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', 'Tajawal', 'Cairo', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      },
      borderRadius: {
        'card': '12px',
        'xl': '12px',
        '2xl': '14px',
        '3xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 20px -3px rgba(10, 10, 11, 0.08), 0 2px 6px -1px rgba(10, 10, 11, 0.04)',
        'luxury': '0 10px 30px -5px rgba(184, 155, 94, 0.15)',
        'gold-glow': '0 0 15px rgba(184, 155, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
