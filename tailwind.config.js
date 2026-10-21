/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        pixel: ['"Silkscreen"', '"Press Start 2P"', 'monospace'],
        arcade: ['"Press Start 2P"', '"Silkscreen"', 'monospace'],
        crt: ['"VT323"', '"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        sm: '2px 2px 0px 0px #000000',
        DEFAULT: '4px 4px 0px 0px #000000',
        md: '4px 4px 0px 0px #000000',
        lg: '6px 6px 0px 0px #000000',
        xl: '8px 8px 0px 0px #000000',
        '2xl': '10px 10px 0px 0px #000000',
        pixel: '4px 4px 0px 0px #000000',
        'pixel-cyan': '4px 4px 0px 0px #00f0ff',
        'pixel-amber': '4px 4px 0px 0px #ffb000',
        'pixel-emerald': '4px 4px 0px 0px #00ff66',
      },
    },
  },
  plugins: [],
};
