const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    video: true,
    screenshotOnRunFailure: true,
    supportFile: false
  },
});