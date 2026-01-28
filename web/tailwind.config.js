export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Blue-500
        secondary: '#64748B', // Slate-500
        success: '#22C55E', // Green-500
        danger: '#EF4444', // Red-500
        warning: '#F59E0B', // Amber-500
      }
    },
  },
  plugins: [],
}
