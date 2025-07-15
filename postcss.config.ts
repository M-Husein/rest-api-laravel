export default {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
    'postcss-replace': {
      pattern: /(--tw|\*, ::before, ::after)/g,
      data: {
        '--tw': '--t', // Prefixing
        '*, ::before, ::after': ':root', // So variables does not pollute every element
      }
    },
  },
}
