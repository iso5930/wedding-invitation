import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4175/wedding-invitation/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  },
  projects: [
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175/wedding-invitation/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
