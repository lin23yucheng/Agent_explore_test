const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/ui',
  testMatch: ['specs/**/*.spec.js'],
  timeout: 90_000,
  workers: process.env.PLAYWRIGHT_WORKERS ? Number(process.env.PLAYWRIGHT_WORKERS) : 1,
  expect: { timeout: 10_000 },
  fullyParallel: !!process.env.PLAYWRIGHT_WORKERS,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', {
      open: 'never',
      outputFolder: process.env.PLAYWRIGHT_HTML_DIR || 'reports/latest/playwright-report',
    }],
    ['./scripts/case-result-reporter.js', {
      outputFile: process.env.CASE_RESULTS_FILE || 'reports/latest/playwright-results.json',
    }]
  ],
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || 'reports/latest/test-results',
  use: {
    baseURL: process.env.UI_BASE_URL || 'https://fat-vla-web.svfactory.com:8443',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.UI_BROWSER_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
  }
});
