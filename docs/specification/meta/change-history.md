---
title: Change history
spec_version: 0.1.0
status: approved
updated: 2026-01-01
page_id: META.CHANGES
---

# Change history

Every version, newest first, with every page it changed. Generated from `changes/` by `sio-docs build`.

| Version | Date | Pages | Summary |
|---|---|---|---|
| 0.10.1 | 2026-11-26 | `WEB.2` | as built: Copy falls back to selecting the snippet when the clipboard refuses the write (R-WEB-004.C24) (#17) |
| 0.10.0 | 2026-11-26 | `ADR.3`, `ANN.1`, `ARCH.3`, `DIAG.1`, `LANG.1`, `LANG.2`, `MODEL.1`, `PACK.1`, `PACK.3`, `REPO.1`, `WEB.1`, `WEB.2`, `WEB.3`, `WEB.4`, `WEB.5` | ING-1 (MockItDown Designer components) and SRC-17: editing core R-EDIT-001..009, design-tool components R-TOOL-001..014, role rules and typed parameters R-PACK-016/017, ADR-21 (edit API TypeScript-only, language-neutral edit corpus), ADR-22 (edit-mode rendering in both variants with node ordinals), A-WEB-4/5, M-PACK-3, M-EDIT-1..3; gallery published at /gallery/ (R-WEB-004.C27-C31, R-PACK-012.C6); unknown labelled arguments warned (R-EVAL-004, R-DIAG-003); dotted names (R-EVAL-003, R-LANG-007); overlay callouts (R-ANN-001, R-ANN-003) |
| 0.9.0 | 2026-11-26 | `WEB.2` | show source on gallery examples (SRC-11) |
| 0.8.14 | 2026-11-25 | `WEB.2` | R-WEB-004 clarified as built: the design patterns in the Examples tab (C3), an index entry's device and chrome over the pack defaults (C9) (#16) |
| 0.8.13 | 2026-11-25 | `PACK.1` | as built in #15: a selected Table row stays accent over the Mac's row stripes (R-PACK-014.C14) |
| 0.8.12 | 2026-11-25 | `WEB.2` | R-WEB-004 re-based on R-WEB-002 (windowed, menubar attributes) |
| 0.8.11 | 2026-11-25 | `REND.2` | The macOS menu bar as built (#14): R-DEV-009 C1, C3, C5 revised; C10-C12 added |
| 0.8.10 | 2026-11-25 | `REND.2` | R-DEV-009 re-based on R-DEV-010 as built in #13 |
| 0.8.9 | 2026-11-25 | `CLI.1`, `PACK.1`, `REND.2`, `REPO.1`, `WEB.1` | R-DEV-010 as built: unified macOS title bar rules, icon-only toolbar buttons in one glass capsule, sidebar toggles and titles, windowed ignored without iPadOS chrome, split column toolbars; R-DEV-005 iPadOS home indicator; R-PACK-014 Form automatic per form; R-PACK-015 phone collapse; windowed in R-WEB-002, R-REPO-004, R-CLI-002 (#13) |
| 0.8.8 | 2026-11-25 | `PACK.1`, `REND.2` | iPadOS floating sidebar (R-DEV-010.C6, R-PACK-015.C7) |
| 0.8.7 | 2026-11-25 | `PACK.1` | R-PACK-015 as built in #12: Button children of alert and action-sheet dialogs are their actions (C9), a lone popover's placeholder anchor (C10), a lone Tab as a one-item tab bar (C11); split view column titles, 320 points at fit, .balanced and .prominentDetail (C7) |
| 0.8.6 | 2026-11-25 | `PACK.1` | R-PACK-014 as built in #11: menu group label and icon, field time, gauge labels when given; date components, wheel columns, tagged picker options, List selection, columns text field titles (C9-C13) |
| 0.8.5 | 2026-11-25 | `PACK.1` | R-PACK-012/014/015 clarified against R-PACK-013 as built in #10 |
| 0.8.4 | 2026-11-25 | `PACK.1` | R-PACK-013 as built: declared samples of elements with variants, inheritance, generic sample content (#10) |
| 0.8.3 | 2026-11-25 | `DIAG.1`, `REND.1`, `REND.2` | as built in #9: shape framing (R-REND-014.C5, C6), charts from series, gauge and bubble areas (R-REND-012.C8-C10), diagnostic code chart (R-DIAG-003) |
| 0.8.2 | 2026-11-25 | `PACK.1` | R-PACK-014/015 re-based on R-REND-013 and R-DEV-008 as built in #8 |
| 0.8.1 | 2026-11-25 | `PACK.1`, `REND.1`, `REND.2` | As built (#8): fit frames, presentations and toasts (R-DEV-008 C6–C10, V1), deliberate row overlaps (R-REND-013.C5), positional arguments take their parameter's alias (R-PACK-011.C3) |
| 0.8.0 | 2026-11-25 | `WEB.2` | SRC-10: gallery tabs and complex layout examples (R-WEB-004) |
| 0.7.0 | 2026-11-25 | `PACK.1`, `REND.1`, `REND.2`, `WEB.2` | SRC-9: fit frames and presentations, rows without overlap, shape framing, chart data, element samples, SwiftUI styles, macOS menu bar and multi-platform chrome, gallery geometry |
| 0.6.7 | 2026-11-25 | `ADR.2`, `WEB.1`, `WEB.2` | R-WEB-004 as built: pattern index, sample and pattern devices, lazy mockups, test hooks, fragment fallback; ADR-19 clarified and R-WEB-002 reviewed against it (#7) |
| 0.6.6 | 2026-11-25 | `ARCH.3`, `WEB.1` | as built (#6): R-WEB-002 mockup element (script child, attributes, events, rendered, errors); A-WEB-2 import rounds, shared stylesheets, shadow-root appearance selectors, coalesced renders |
| 0.6.5 | 2026-11-25 | `ARCH.3`, `WEB.2` | As built (#5): development server URL layout, index, content types and 405 (R-WEB-003); npm test in Chromium, CI on Node 22 with Zensical, browser smoke test (R-WEB-005); loadAssetsFromUrl (A-WEB-2) |
| 0.6.4 | 2026-11-25 | `ARCH.3`, `WEB.1` | as built (#4): R-WEB-001 C14 asset_base, C15 local image without a base, C16 RenderResult and check, TC-4; A-WEB-1 renderer modules |
| 0.6.3 | 2026-11-25 | `ARCH.3`, `WEB.1` | As built for the TypeScript core, part 1 (#3): R-WEB-001 C8 compares <name>.diag.json, C10–C13 (imports without paths, imported diagnostics' source, Python option names, dist/shared/manifest.json); A-WEB-1 stylesheet signature, evaluate and loadAssets |
| 0.6.2 | 2026-11-25 | `ANN.1`, `REPO.1` | R-REPO-004 and R-ANN-003 as built: conformance corpus options, results and harness; portable anchor prefix (#2) |
| 0.6.1 | 2026-11-25 | `ARCH.3`, `REPO.1` | As built for #1: vocabulary.json neutral_modules; shape of shared/reference JSON and index.json; LICENSE in the Python wheel and sdist |
| 0.6.0 | 2026-11-25 | `ADR.2`, `ARCH.3`, `REPO.1`, `WEB.1`, `WEB.2` | Variants and shared assets (R-REPO-001–004), TypeScript core and mockitdown-mockup (R-WEB-001–002), dev server, pack gallery and test suites (R-WEB-003–005); ADR-17–20; A-REPO-1, A-WEB-1–3 (SRC-8) |
| 0.5.0 | 2026-11-24 | `PACK.1` | R-PACK-008 ships vuetify, prime and sketch; R-PACK-012 Wireframe menu group; catalogue regenerated |
| 0.4.1 | 2026-11-24 | `PACK.1` | R-PACK-012: packs grouped as desktop, web, mobile; sticky header tabs; catalogue reordered |
| 0.4.0 | 2026-11-24 | `ADR.2`, `PACK.1` | R-PACK-008 ships antd, tailwind, carbon, primer, avalonia and the nls, win1, nextstep, win95, aqua retro packs; R-PACK-012 Reference gallery and site tabs; ADR-13 updated; catalogue regenerated |
| 0.3.1 | 2026-11-24 |  | Pack catalogue and role catalogue updated for the platform and retro packs |
| 0.3.0 | 2026-11-24 | `ADR.1`, `ADR.2`, `ANN.1`, `PACK.1`, `REND.1`, `REND.2` | Non-standard components, charts, annotations and overlays, more chrome kinds, hidden packs, argument aliases; platform, retro and easter-egg packs; ADR-15, ADR-16 |
| 0.2.1 | 2026-11-24 | `LANG.1`, `LANG.2`, `MDX.1`, `REND.2` | Pack catalogue generated from the shipped packs; known-deviation notes removed after the implementation fixes |
| 0.2.0 | 2026-11-24 | `ADR.1`, `ADR.2`, `API.1`, `ARCH.1`, `ARCH.2`, `ASSET.1`, `CLI.1`, `DIAG.1`, `IMP.1`, `LANG.1`, `LANG.2`, `MDX.1`, `MODEL.1`, `PACK.1`, `REND.1`, `REND.2` | First full specification derived from the prototype and the production code: 80 requirements (LANG, EVAL, PACK, REND, APP, DEV, ASSET, IMP, MDX, CLI, API, DIAG), 17 architecture elements, 10 model entities, ADR-1 – ADR-14; language reference, role catalogue, pack format and catalogue, markup and CSS contract, site integration guide, traceability to the prototype; site built with Zensical. |
| 0.1.0 | 2026-01-01 | `index.md`, `meta/change-history.md` | Initialized. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-01-01 | Page created |
