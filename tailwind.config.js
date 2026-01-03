/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dearly palette - soft romantic pink theme (love letter inspired)
        paper: '#FFF5F7', // Soft pink-tinted paper
        'paper-dark': '#FFEEF2', // Slightly deeper pink paper
        blush: '#E8B4BC', // Dusty rose
        'blush-light': '#F9DFE3', // Very soft pink
        'blush-dark': '#D4949F', // Muted rose
        sage: '#E8C5C5', // Pink-tinted sage (less green, more rose)
        'sage-light': '#F5E6E6', // Very light dusty pink
        ink: '#C84B5C', // Rose-crimson ink (refined from brown)
        'ink-light': '#D4586A', // Lighter rose-crimson
        'text-soft': '#8B5963', // Deep rose brown (for Monthly Letters - unchanged)
        'text-whisper': '#9B7B83', // Muted mauve
        'stamp-red': '#C84B5C', // Vintage stamp red
        'envelope-cream': '#FFF8F3', // Warm envelope cream
      },
      fontFamily: {
        bubble: ['Fredoka', 'Comic Sans MS', 'cursive'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      borderRadius: {
        'soft': '24px',
        'cloud': '48% 52% 68% 32% / 42% 58% 42% 58%',
        'puffy': '32px',
      },
      animation: {
        'breathe': 'breathe 6s ease-in-out infinite',
        'float-gentle': 'float-gentle 8s ease-in-out infinite',
        'orbit-slow': 'orbit-slow 30s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.95' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(3deg)' },
        },
        'orbit-slow': {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
      },
      boxShadow: {
        'gentle': '0 4px 20px rgba(139, 115, 85, 0.08)',
        'soft': '0 8px 32px rgba(139, 115, 85, 0.12)',
      },
    },
  },
  plugins: [],
}