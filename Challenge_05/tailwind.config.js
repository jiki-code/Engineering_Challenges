/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7dc8fc",
          400: "#38aaf8",
          500: "#0e90ea",
          600: "#0271c8",
          700: "#0359a2",
          800: "#074b85",
          900: "#0c3f6e",
          950: "#082849",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      screens: {
        print: { raw: "print" },
      },
    },
  },
  plugins: [],
};
