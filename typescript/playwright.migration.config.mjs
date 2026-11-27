// R-PACK-018 TC-3: the stylesheet-migration screenshots (tests/browser/css-migration.spec.mjs), not part of
// `npm test`. MIGRATION_BASELINE=1 records the baseline in migration-baseline/ (git-ignored); without it the
// run compares with that baseline. The spec's header gives the whole procedure.
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT || 8175);

export default defineConfig({
  testDir: "tests/browser",
  testMatch: "css-migration.spec.mjs",
  snapshotPathTemplate: "{testDir}/../../migration-baseline/{arg}{ext}",
  updateSnapshots: process.env.MIGRATION_BASELINE ? "all" : "none",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${PORT}/` },
  webServer: {
    command: "node scripts/serve.mjs",
    url: `http://127.0.0.1:${PORT}/`,
    env: { PORT: String(PORT) },
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } }],
});
