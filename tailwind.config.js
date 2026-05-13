/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'warm-white': '#FAFAF9',
        'navy': '#1E3A5F',
        'residence': '#3B82F6',
        'education': '#10B981',
        'work': '#8B5CF6',
        'travel': '#F59E0B',
        'transit': '#9CA3AF',
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      }
    },
  },
  plugins: [],
}
