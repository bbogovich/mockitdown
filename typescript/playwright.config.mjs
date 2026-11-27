// Browser tests (R-WEB-005.C2): Playwright starts the development server itself and runs the tests
// in Chromium; Firefox and WebKit are selectable by project name:
//   npx playwright test                       Chromium (what `npm test` runs)
//   npx playwright test --project=firefox     after `npx playwright install firefox`
//   npx playwright test --project=webkit      after `npx playwright install webkit`
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT || 8173);

export default defineConfig({
  testDir: "tests/browser",
  testMatch: "**/*.spec.mjs",
  // The published-site test runs only in the Pages workflow (playwright.published.config.mjs), the
  // stylesheet-migration screenshots only on demand (playwright.migration.config.mjs).
  testIgnore: ["**/published.spec.mjs", "**/css-migration.spec.mjs"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}/`, trace: "on-first-retry" },
  webServer: {
    // The package is built by `npm test` before Playwright runs; the server only serves it.
    command: "node scripts/serve.mjs",
    url: `http://127.0.0.1:${PORT}/`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
