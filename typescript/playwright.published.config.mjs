// R-WEB-004 TC-9: the published-site test, run by the Pages workflow against a static file server
// over the assembled site (public/), never against the development server:
//   GALLERY_URL=http://127.0.0.1:8174/gallery/ npx playwright test -c playwright.published.config.mjs
import { defineConfig, devices } from "@playwright/test";

if (!process.env.GALLERY_URL) throw new Error("GALLERY_URL must name the served /gallery/ URL");

export default defineConfig({
  testDir: "tests/browser",
  testMatch: "published.spec.mjs",
  retries: 0,
  reporter: "list",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
