---
title: "Shared stylesheet rules"
spec_version: 0.12.4
status: draft
updated: 2026-11-27
page_id: PACK.4
---

# Shared stylesheet rules

Packs that imitate related systems share drawing rules: the Lisa and the black-and-white Macintosh
(1-bit dither patterns, title-bar stripes), the Material 3 packs (button state layers), Windows XP and
Vista. A rule that holds for every pack belongs in the `base` pack's stylesheet; a rule shared by some
packs is written once as a *stylesheet partial* in `shared/packs/_partials/` and included by each pack
that uses it with a CSS `@import` line (F-3.C15, SRC-18#health).

The import is resolved when each variant's build copies the pack, not in the browser: a pack's
stylesheet reaches a page inlined in a `<style>` element (the Markdown extension), concatenated with
other packs (both variants' `stylesheet()`), or adopted into a shadow root as a constructed stylesheet
(the web component), and an `@import` works in none of these. Resolving it at build time makes every
delivery path — the example site, the Python API, the TypeScript package fetched from `dist/shared/`,
the published gallery — receive a plain, scoped `pack.css`, exactly as before.

### R-PACK-018 — Stylesheet partials

**Requires:** R-PACK-007, R-REPO-002

**Requirement.** Shared rules are written once, in `base` or in a partial under `shared/packs/_partials/`, and a
pack includes a partial with a CSS `@import` line at the top of its `pack.css`. Both builds resolve the
import when they copy the pack, writing the partial's rules into the package copy with the partial's
placeholder scope `.mkd-scope` replaced by the pack's own figure class.

**Rationale.** SRC-18#health: duplicated blocks across pack stylesheets (102 of the 116 the health report
counted at 0.10.8 are shared by `lisa` and `mac-classic`) must be defined once, with CSS imports. An
`@import` cannot reach the browser: a pack's CSS is inlined in a `<style>` element, concatenated with other
packs' CSS by `stylesheet()`, or adopted as a constructed stylesheet in the web component's shadow root,
and in each case an `@import` is either invalid (after other rules), resolved against the wrong base, or
ignored (`CSSStyleSheet.replaceSync`). Resolving at build time keeps every delivery path — the example
site, the Python API's inline or linked CSS, `dist/shared/` fetched by `loadAssetsFromUrl`, the published
gallery — unchanged, and keeps R-PACK-007.C1 true of every published `pack.css`. The placeholder scope
lets one partial serve any number of packs without naming them, so a new pack reuses a partial by adding
one line.

**Example.** `shared/packs/_partials/mac-1bit.css` holds
`.mkd-scope .mkd-frame { --mc-dither: …; }`; `shared/packs/lisa/pack.css` starts with
`@import "../_partials/mac-1bit.css";`; the package copy `packs/lisa/pack.css` starts with
`.mkd-pack-lisa .mkd-frame { --mc-dither: …; }` followed by Lisa's own rules.

**Verification.** TC-1 (resolution in both builds), TC-2 (the duplicate check), TC-3 (rendering unchanged).

**As built (#54).** The build also fails on an include that shares its line with other text (C6), and only an `@import` outside a comment is refused at run time (C8). Re-checked against ADR-17 as re-checked in the same release: no obligation changed.

**R-PACK-018.TC-1 — Partials resolved by both builds**

Unit tests in both variants over one fixture set, `python/tests/fixtures/partials/` read by
`python/tests/test_shared.py` (`PartialTests`, and step 4 in `PackageCopyTests`) and by
`typescript/tests/unit/package.test.ts` (each test points the build's resolve function —
`sync_shared.resolve_pack_css`, `copy-shared.mjs` `resolvePackCss` — at the fixture's `packs/` folder;
the expected copies are the fixture's `expected/<id>.pack.css`):

1. Fixture: `_partials/demo.css` = `.mkd-scope .mkd-button { color: red; }`; packs `one` and `two`
   (each `pack.json` plus a `pack.css` starting with a comment, `@import "../_partials/demo.css";` and
   one own rule). The resolved `one/pack.css` equals the comment, `.mkd-pack-one .mkd-button { color: red; }`
   and `one`'s own rule, byte for byte; `two` likewise with `.mkd-pack-two`; the same expected bytes
   are asserted in both suites (C4, C5).
2. The Python registry (`PackRegistry` over the fixture) and the TypeScript build's pack list (`packIds`) list
   `one` and `two` but not `_partials` (C1).
3. An `@import` after the first rule, of `../_partials/missing.css`, or of `../two/pack.css` makes the
   resolve step fail with a message naming the pack and the path; a partial with a selector
   `.mkd-button` (no scope) or containing `prefers-color-scheme` fails naming the partial (C2, C3, C6).
4. After `npm run build` and the Python sync, no file under `dist/shared/packs/` or
   `python/src/mockitdown/packs/` is named `*.css` other than `<id>/pack.css` beside a `pack.json`, the
   manifest names no `_partials` path, no copied `pack.css` contains `@import`, and every copied
   `pack.css` equals what the build's resolve step writes from `shared/` (C7, R-REPO-002.C6).
5. `PackRegistry(pack_paths=[tmp])` with `tmp/acme/pack.css` containing `@import "../_partials/x.css";`
   raises "pack 'acme': @import is resolved only in built-in packs"; `registerPack(json, css)` with the
   same CSS throws the same message (C8). An `@import` inside a comment is not refused.
6. The existing contract tests (`test_css_is_scoped`, `test_css_has_no_appearance_branching`) pass on
   the resolved copies of every built-in pack.

**R-PACK-018.TC-2 — No duplicated stylesheet runs**

Python unit test `python/tests/test_packs.py::test_no_duplicated_css_runs`: normalise each line of
`shared/packs/*/pack.css` and `shared/packs/_partials/*.css` (trim, collapse white space, drop lines
shorter than four characters or without a word character), hash every run of six consecutive kept
lines, and fail listing file and line of every run that occurs twice (in two files or within one).
The same measure as the VibeItOut health report's duplicate blocks, so that after the migration the
report counts no duplicated block in a pack stylesheet.

**R-PACK-018.TC-3 — Rendering unchanged by the migration**

Run once by the issue that moves rules, and again by any later issue that moves rules:

1. `gen_conformance.py --check` and both conformance suites pass with no expected file changed.
2. Before changing any stylesheet, capture with Playwright full-page screenshots of the gallery
   (`pages/packs.html#pack=<id>&tab=elements` and `&tab=examples`, after `renderAll()`) for every pack
   whose `pack.css` will change, in light and dark appearance, at 1280 × 800; after the change, capture
   them again and compare pixel by pixel (`expect(page).toHaveScreenshot` with `maxDiffPixels: 0`
   against the baseline taken before). Any difference fails. The script is
   `typescript/tests/browser/css-migration.spec.mjs`, run with `MIGRATION_BASELINE=1` to record the
   baseline; it is not part of `npm test`.

**Realizes.** F-3, F-16

| | Statement |
|---|---|
| C1 | A stylesheet partial MUST be a file `shared/packs/_partials/<name>.css`; the directory `_partials` MUST hold no `pack.json`, so the pack registry never lists it as a pack. |
| C2 | A built-in pack's `pack.css` MAY include partials with lines `@import "../_partials/<name>.css";`, each on a line of its own, before the first rule of the file (only comments and blank lines may precede them). |
| C3 | Every selector of a partial MUST start with the scope class `.mkd-scope`, alone or followed by a space, and a partial MUST NOT contain `@import`, `data-appearance` or `prefers-color-scheme`; R-PACK-007.C3 to C5 apply to partials as to pack stylesheets. |
| C4 | When the Python build (`python/tools/sync_shared.py`) or the TypeScript build (`typescript/scripts/copy-shared.mjs`) copies a pack whose `pack.css` includes partials, it MUST write the package copy with each `@import` line replaced by the text of the named partial in which every selector's leading `.mkd-scope` is replaced by `.mkd-pack-<id>` of the including pack; the copy MUST contain no `@import`. |
| C5 | The resolution of C4 MUST be textual and deterministic, so that both builds write byte-identical copies of every `pack.css`. |
| C6 | A build MUST fail, naming the pack and the partial, when an `@import` names a partial that does not exist, appears after the first rule, shares its line with anything but white space, or names a path outside `../_partials/`, and when a partial breaks C3. |
| C7 | The partials themselves MUST NOT be copied into either package; only the resolved `pack.css` copies are published. |
| C8 | A pack stylesheet loaded at run time — a site pack found through `pack_paths`, or an application pack given to `registerPack` — that contains `@import` outside a comment MUST be refused with the error "pack 'x': @import is resolved only in built-in packs". |
| C9 | A rule that holds for every pack MUST be written once, in the `base` pack's stylesheet; a rule that two or more packs share MUST be written once, in a partial those packs include; no run of six consecutive non-blank lines MAY appear in two of the files `shared/packs/*/pack.css` and `shared/packs/_partials/*.css`, nor twice in one of them. |
| C10 | Moving rules into `base` or into a partial MUST NOT change the rendering of any pack: the conformance corpus (R-REPO-004) MUST stay unchanged, and every pack whose stylesheet changed MUST look the same in the gallery as before, in light and dark appearance. |
| V1 | A partial imported by two packs reaches both packages resolved and scoped to each; an import of a missing partial fails both builds; the duplicate check fails on a copied six-line run. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.12.4 | 2026-11-27 | prose names the as-built C6 and C8 details; re-checked against ADR-17 (#54) |
| 0.12.2 | 2026-11-27 | as built (#54): C6 also fails an @import that shares its line; C8 refuses an @import outside comments only; TC-1 names the tests, the fixture's expected copies and dist/shared/packs/ for step 4 |
| 0.11.0 | 2026-11-27 | Page created (SRC-18) |
| 0.12.2 | 2026-11-27 | as built (#54): C6 also fails an @import that shares its line; C8 refuses an @import outside comments only; TC-1 names the tests, the fixture's expected copies and dist/shared/packs/ for step 4 |
| 0.11.0 | 2026-11-27 | Page created (SRC-18) |
