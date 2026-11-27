---
id: R-PACK-018.CR-3
target: R-PACK-018
kind: correction
version: 0.12.5
date: 2026-11-27
issue: 55
summary: "as built: TC-2 names the measure's own test, TC-3 its configuration, MIGRATION_PACKS and the capture of packs the gallery does not list; prose names the partials #55 wrote (#55)"
from: 06ba8496c1ad
to: c80734dd337f
---

## Clauses

(none)

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -10,2 +10,4 @@
 lines, and fail listing file and line of every run that occurs twice (in two files or within one).
+`test_duplicated_runs_measure` checks the measure itself on small inputs: a copied six-line run is
+found across two files and within one, and six lines that differ in one line are not (V1).
 The same measure as the VibeItOut health report's duplicate blocks, so that after the migration the
--- a/TC-3.md
+++ b/TC-3.md
@@ -14,3 +14,8 @@
    against the baseline taken before). Any difference fails. The script is
-   `typescript/tests/browser/css-migration.spec.mjs`, run with `MIGRATION_BASELINE=1` to record the
-   baseline; it is not part of `npm test`.
+   `typescript/tests/browser/css-migration.spec.mjs`, run with its own configuration
+   (`npx playwright test -c playwright.migration.config.mjs`, after `npm run build`) and
+   `MIGRATION_PACKS=<id>,…` naming the packs whose `pack.css` changes; `MIGRATION_BASELINE=1` records the
+   baseline in `typescript/migration-baseline/` (git-ignored). It is not part of `npm test`.
+3. A pack the gallery does not list (an easter egg, F-3.C9) cannot be opened there: it is captured on the
+   same page, the gallery hidden, from its conformance sample (`shared/conformance/pack-<id>.mockitdown`)
+   and one card per element (`Name("Sample")` at `device: fit`), in light and dark, compared the same way.
--- a/prose.md
+++ b/prose.md
@@ -24 +24,13 @@
 **As built (#54).** The build also fails on an include that shares its line with other text (C6), and only an `@import` outside a comment is refused at run time (C8). Re-checked against ADR-17 as re-checked in the same release: no obligation changed.
+
+**As built (#55).** Three partials hold rules two packs share: `mac-1bit.css` (lisa and mac-classic: the
+whole common stylesheet), `material3.css` (android and angular-material: the text button and its state
+layer) and `win-button.css` (winxp and vista: the push button); `crt.css` (nls and phosphor) holds the
+layer the tube's scan lines are painted on. No rule was common to every pack, so `base` is unchanged.
+Where the two packs of `mac-1bit.css` name the same window or icon differently (`finder` and `folder`,
+`noGrow` and `tool`, `dBox` and `dialog`), the partial's selectors list both names; a pack only emits its
+own. Where they draw a part differently, the partial reads a custom property the pack sets (mac-classic's
+hollow scroll arrows: `--mc-arrow-up`, `-down`, `-left`, `-right` on its frame). Runs repeated inside one
+stylesheet (win95, hologram) became one rule with both selectors, or custom properties (`--ho-clip`,
+`--ho-cuts`). TC-3 captured the ten changed packs (hologram and phosphor, which the gallery does not list,
+as its step 3 says); every capture was identical.
```
