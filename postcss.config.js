// This fixes the Node.js syntax error when loading PostCSS config in CommonJS
// Replace the existing postcss.config.js file with the following:

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
