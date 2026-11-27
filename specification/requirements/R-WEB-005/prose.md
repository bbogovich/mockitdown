One command for the web variant's tests, as the Python variant has `unittest discover`.

The browser tests live in `typescript/tests/browser/*.spec.mjs` and the configuration in
`typescript/playwright.config.mjs` (plain JavaScript, so neither needs type declarations). The CI
workflow is `.github/workflows/ci.yml`, with one job per variant; it publishes nothing, so it does not
overlap `pages.yml` and `release.yml`.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-20, R-WEB-003 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
