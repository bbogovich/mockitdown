One command for the web variant's tests, as the Python variant has `unittest discover`.

The browser tests live in `typescript/tests/browser/*.spec.mjs` and the configuration in
`typescript/playwright.config.mjs` (plain JavaScript, so neither needs type declarations). The CI
workflow is `.github/workflows/ci.yml`, with one job per variant; it publishes nothing, so it does not
overlap `pages.yml` and `release.yml`.
