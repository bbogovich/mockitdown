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
| 0.12.14 | 2026-11-27 | `WEB.2` | R-WEB-006 as built: C10, C11, TC-1 step 8 (#62) |
| 0.12.13 | 2026-11-27 | `PACK.1` | R-PACK-010 as built (#61): C4 group null for a hidden pack's reference file, C5 hidden packs' own-element conformance cases |
| 0.12.12 | 2026-11-27 | `ADR.2`, `ADR.3`, `PACK.1`, `PACK.3`, `PACK.4`, `PACK.5`, `REND.2`, `REPO.1`, `WEB.1`, `WEB.2`, `WEB.3`, `WEB.4`, `WEB.5` | specification audit, second pass: the items that cite the re-checked ones re-recorded in the same release, so no suspect citation remains (#81) |
| 0.12.11 | 2026-11-27 | `ADR.1`, `ADR.2`, `IMP.1`, `PACK.1`, `PACK.3`, `PACK.5`, `REND.2`, `REPO.1`, `WEB.1`, `WEB.2`, `WEB.3`, `WEB.4` | specification audit: 46 suspect citations re-checked with clarification records; ADR-17 no longer lists the requirements that cite it (#81) |
| 0.12.10 | 2026-11-27 | `MDX.1`, `PACK.1`, `REND.1`, `REND.2` | Test cases backfilled for R-MDX-001..006, R-PACK-001..003, 009, R-REND-001..003, 006..008, 011, and R-PACK-008.TC-1 steps 1 and 6; R-MDX-002.C1, R-MDX-003.C1, R-MDX-005.C1, R-PACK-002.C1, R-PACK-003.C3, R-PACK-009.V1, R-REND-002.C1, R-REND-003.C1, R-REND-011.C6 as built; the role catalogue (REF.2) completed as built (#59) |
| 0.12.9 | 2026-11-27 | `LANG.1`, `LANG.2`, `REND.1`, `REND.2` | Test cases backfilled for R-DEV-001..003, 005..007, R-EVAL-001, 002, 008, 011, R-LANG-006, 008; R-DEV-002, R-DEV-003, R-DEV-005, R-EVAL-002, R-EVAL-008 as built, R-DEV-007.C1 corrected (#58) |
| 0.12.8 | 2026-11-27 | `CLI.1`, `DIAG.1`, `IMP.1` | Test cases backfilled for R-CLI-001..006, R-DIAG-001..004, R-IMP-001, 003, 006; R-CLI-002.C1 and R-CLI-006 as built (#57) |
| 0.12.7 | 2026-11-27 | `ANN.1`, `API.1`, `ASSET.1`, `MODEL.1`, `REND.2` | Test cases backfilled for R-ANN-002, R-ANN-004, R-API-001..004, R-APP-001..003, R-ASSET-001, 002, 004, 005; M-OPT-1 F24-F28 as built (#56) |
| 0.12.6 | 2026-11-27 | `PACK.5` | #55: the requirements standing on R-PACK-018 (R-PACK-019 to R-PACK-029) re-checked after its as-built records; no obligation changed |
| 0.12.5 | 2026-11-27 | `PACK.4` | #55 as built: R-PACK-018 TC-2 names the measure's own test, TC-3 its configuration, MIGRATION_PACKS and the capture of packs the gallery does not list; prose names the four partials; no obligation changed |
| 0.12.4 | 2026-11-27 | `ADR.2`, `PACK.3`, `PACK.4`, `PACK.5`, `REPO.1` | #54 as-built records released together with their re-checks (R-PACK-018, R-REPO-002, ADR-17 and the requirements standing on them): no obligation changed |
| 0.12.3 | 2026-11-27 | `ADR.2`, `PACK.3`, `PACK.5`, `REPO.1` | re-checks after the #54 as-built records: ADR-17, R-PACK-016, R-REPO-003 and R-PACK-019 to R-PACK-029 unchanged in obligation |
| 0.12.2 | 2026-11-27 | `PACK.4`, `REPO.1` | as built (#54): R-PACK-018 C6 (an @import sharing its line fails), C8 (only an @import outside comments is refused) and TC-1 (tests, fixture copies, dist/shared/packs/); R-REPO-002.TC-4 names its tests |
| 0.12.1 | 2026-11-27 | `ADR.2` | ADR-10.D2 aligned with ADR-24 (SRC-19) |
| 0.12.0 | 2026-11-27 | `ADR.2`, `CLI.1`, `IMP.1`, `LANG.1`, `LANG.2`, `MDX.1`, `MODEL.1`, `PACK.1`, `WEB.1` | SRC-19: import map replaces import_paths (ADR-24, R-IMP-002, R-MDX-002, R-CLI-002, R-WEB-001/002, M-OPT-1); library names and qualified references (R-IMP-007, R-IMP-004, R-LANG-003, R-EVAL-003); page library blocks (R-IMP-008, R-MDX-003); templates with slots (R-IMP-009, R-EVAL-005, R-LANG-004); User guide with Installation (R-PACK-030, R-PACK-012) |
| 0.11.0 | 2026-11-27 | `ADR.2`, `ADR.3`, `ARCH.1`, `ARCH.3`, `PACK.1`, `PACK.3`, `PACK.4`, `PACK.5`, `REPO.1`, `WEB.1`, `WEB.2`, `WEB.3`, `WEB.4`, `WEB.5` | SRC-18: stylesheet partials (R-PACK-018), shared assets named (ADR-17, A-REPO-1, A-PACK-2, R-REPO-002), shipped and hidden packs (R-PACK-008, R-PACK-010), gallery home page and hidden packs (R-WEB-004, R-WEB-006), TypeScript release builds (R-WEB-007, ADR-23), eleven pack requirements (R-PACK-019 to R-PACK-029); citing items re-checked |
| 0.10.8 | 2026-11-27 | `ADR.1`, `ADR.2`, `ADR.3`, `ANN.1`, `LANG.2`, `MDX.1`, `PACK.1`, `PACK.3`, `REND.1`, `REND.2`, `REPO.1`, `WEB.1`, `WEB.2`, `WEB.3`, `WEB.4`, `WEB.5` | audit follow-up: the chain of items citing the re-checked requirements, re-checked in one release |
| 0.10.7 | 2026-11-27 | `ANN.1`, `ASSET.1`, `MDX.1`, `PACK.1`, `REND.1`, `WEB.3` | audit follow-up: requirements re-checked after the renderer split |
| 0.10.6 | 2026-11-27 | `PACK.1`, `REND.2`, `WEB.2` | audit follow-up: suspects from the renderer split cleared; test cases name the split gallery specs |
| 0.10.5 | 2026-11-27 | `ARCH.2`, `ARCH.3` | A-WEB-1 and A-REND-1 as built: the TypeScript role functions live in role-family modules under core/render/roles/, mirroring the Python split (#49) |
| 0.10.4 | 2026-11-27 | `ARCH.2` | A-REND-1 as built: Renderer inherits its r_<role> methods from role-family mixins in mockitdown.render.roles; shared helpers in mockitdown.render._util (#48) |
| 0.10.3 | 2026-11-26 | `ADR.1`, `ADR.2`, `ADR.3`, `PACK.1`, `PACK.3`, `REPO.1`, `WEB.1`, `WEB.2`, `WEB.3`, `WEB.4`, `WEB.5` | specification audit: items re-stamped together so the prose clarifications leave no suspect citation (#51) |
| 0.10.2 | 2026-11-26 | `ADR.1`, `ADR.2`, `API.1`, `CLI.1`, `MDX.1`, `PACK.1`, `REPO.1`, `WEB.2` | specification audit: suspects checked and cleared, R-WEB-004 TC-9 corrected, TC-10, R-REPO-002 TC-3 (#51) |
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
