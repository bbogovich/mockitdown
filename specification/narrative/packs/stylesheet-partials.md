---
title: "Shared stylesheet rules"
spec_version: 0.11.0
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

<!-- slot: reqs -->

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.11.0 | 2026-11-27 | Page created (SRC-18) |
