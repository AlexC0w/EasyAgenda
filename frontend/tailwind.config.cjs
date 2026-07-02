/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        oct: {
          void:    '#060312',
          bg:      '#0A0518',
          surface: '#120A26',
          violet:  '#A24BFF',
          brand:   '#662D91',
          neon:    '#A24BFF',
          hot:     '#FFB4F3',
          text:    '#F3EEFF',
          mute:    '#8678A6',
          success: '#36E5A4',
          danger:  '#FF5470',
          warning: '#FFC24B',
          info:    '#4BB8FF',
        },
      },
      fontFamily: {
        brand:   ['Fredoka', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans:    ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'oct-sm': '10px',
        'oct-md': '14px',
        'oct-lg': '20px',
        'oct-xl': '28px',
        'oct-2xl': '36px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(162,75,255,0.45)',
        'glow-md': '0 0 24px rgba(162,75,255,0.5), 0 0 4px rgba(255,180,243,0.4)',
        'glow-lg': '0 0 48px rgba(162,75,255,0.55), 0 0 16px rgba(224,100,255,0.35)',
        'glow-btn': '0 8px 24px rgba(0,0,0,0.4), 0 0 28px rgba(162,75,255,0.45)',
      },
    },
  },
  plugins: [],
};
