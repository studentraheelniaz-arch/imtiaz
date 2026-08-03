/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette inspired by Sindhi truck/van art: a deep night-road navy,
        // with the hot marigold, magenta, and teal used on decorated vans.
        road: {
          950: '#12123A', // near-black indigo — the "night highway"
          900: '#1B1A4D',
          800: '#292766',
        },
        marigold: {
          400: '#F5B93D',
          500: '#F0A421',
          600: '#D98A12',
        },
        magenta: {
          400: '#EA4F92',
          500: '#DE2E77',
          600: '#B71F5D',
        },
        teal: {
          400: '#3FC2AE',
          500: '#219A87',
          600: '#157B6C',
        },
        paper: '#FBF8F2',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'ui-rounded', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'road-strip': "repeating-linear-gradient(90deg, #F0A421 0 24px, #DE2E77 24px 48px, #219A87 48px 72px)",
      },
    },
  },
  plugins: [],
};
