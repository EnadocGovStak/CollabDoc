const { defineConfig, devices } = require('@playwright/test');

const baseURL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
  testDir: './tests/smoke',
  timeout: 60 * 1000,
  expect: {
    timeout: 15 * 1000
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
