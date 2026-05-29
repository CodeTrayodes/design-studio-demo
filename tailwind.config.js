/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/hooks/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        amber: { DEFAULT: '#F5A623' },
        teal:  { DEFAULT: '#30D5C8' },
      },
      animation: {
        'heartbeat-glow': 'heartbeatPulse 1.5s ease-in-out infinite',
        'cursor-blink':   'cursorBlink 1s step-end infinite',
        'pulse-slow':     'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        heartbeatPulse: {
          '0%, 100%': { transform: 'scale(1)',   opacity: '0.8' },
          '50%':       { transform: 'scale(1.2)', opacity: '1'   },
        },
        cursorBlink: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
