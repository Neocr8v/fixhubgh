/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#181B19',
        paper: '#EDEAE1',
        panel: '#F7F5EF',
        steel: {
          DEFAULT: '#3E5C76',
          dark: '#2B4258',
          light: '#7B93A8',
        },
        amber: {
          DEFAULT: '#E8A33D',
          dark: '#C3811F',
          light: '#F5D19B',
        },
        status: {
          reported: '#E8A33D',
          assigned: '#3E5C76',
          progress: '#7C6FDB',
          resolved: '#4C8C6B',
          urgent: '#C1462F',
        },
        line: '#D8D3C4',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Avenir Next', 'Segoe UI', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '2px',
      },
      boxShadow: {
        ticket: '0 1px 0 rgba(24,27,25,0.06), 0 8px 20px -12px rgba(24,27,25,0.25)',
      },
    },
  },
  plugins: [],
};
