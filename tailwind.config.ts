/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'liangpeng': {
          'primary': '#2563eb',
          'primary-dark': '#1d4ed8',
          'secondary': '#f97316',
          'accent': '#8b5cf6',
          'background': '#f8fafc',
          'surface': '#ffffff',
          'text': '#1e293b',
          'text-muted': '#64748b',
          'border': '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
