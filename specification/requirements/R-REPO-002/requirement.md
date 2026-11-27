---
id: R-REPO-002
title: Shared assets are the single source
status: active
version: 0.12.4
rev: 7
page: REPO.1
slot: reqs
order: 2
hash: 5e262daf1ee3
source: [SRC-8, SRC-12, SRC-18]
realizes: [F-16]
requires: [R-REPO-001]
constrained_by: [ADR-17]
refs: [R-PACK-016, R-PACK-018]
---

C1: The built-in packs MUST exist only as `shared/packs/<id>/pack.json`, `shared/packs/<id>/pack.css` and the stylesheet partials `shared/packs/_partials/<name>.css` they include (R-PACK-018).
C2: The page stylesheet MUST exist only as `shared/css/page.css`.
C3: The icon glyphs and icon aliases MUST exist only as `shared/icons/icons.json`, an object with `glyphs` (name → SVG inner markup) and `aliases` (name → glyph name).
C4: The modifier vocabulary (rendered and ignored modifiers) MUST exist only as `shared/language/vocabulary.json`, with `rendered`, `ignored` and `neutral_modules` name lists, `neutral_modules` being the import names that select no pack.
C5: Each variant's build MUST copy the shared files it publishes into its own package; neither package MAY read `shared/` at run time.
C6: A test in each variant MUST fail when its package copy differs, after a build, from what the build writes from `shared/`: an identical copy of every file, except a `pack.css` that includes partials, whose copy is resolved as R-PACK-018.C4 says.
C7: Both variants MUST read the shared files as data and MUST NOT execute anything from them.
V1: After the move, the Python icon, vocabulary and pack modules load their data from the packaged copies and the existing test suite passes unchanged.
C8: The role rule table (R-PACK-016) MUST exist only as `shared/language/roles.json`, and each variant's build MUST copy it into its package beside `vocabulary.json`.
