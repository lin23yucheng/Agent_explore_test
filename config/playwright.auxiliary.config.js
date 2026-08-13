const { defineConfig } = require('@playwright/test');
const base = require('../playwright.config');

module.exports = defineConfig({
  ...base,
  testDir: '../tests/ui',
  testMatch: [
    'probes/**/*.spec.js',
    'maintenance/**/*.spec.js',
  ],
  reporter: [['list']],
});
