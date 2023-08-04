/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: [
    "./src/components/**/*.js", 
    "./src/components/**/*.css", 
    "./src/**/*.css" ,
    "./src/**/*.js",
    "./**/*.js",
    "./**/*.css"
  ],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
