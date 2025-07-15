/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  separator: '_',
  content: [
    // "./src/**/*.{js,ts,jsx,tsx}",
    // "./index.html",
    "./tailwind_always_compile.html", // For always compile some class

    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/ts/**/*.tsx',
  ],
  theme: {
    extend: {
      zIndex: {
        '1': '1',
        '2': '2',
        '301': '301',
        '1051': '1051',
        '1052': '1052',
      },
      fontSize: {
        '0': '0',
      },
      // colors: {
      //   'sky-1': '#3fe2ff',
      //   'sky-2': '#00ace8',
      //   'navy': '#054586',
      // },
      // borderWidth: {
      //   '18': '18px',
      // },
    },
  },
  plugins: [],
}
