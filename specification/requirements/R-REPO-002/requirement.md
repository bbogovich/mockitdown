---
id: R-REPO-002
title: Shared assets are the single source
status: active
version: 0.6.0
rev: 0
page: REPO.1
slot: reqs
order: 2
hash: a769efe08283
source: [SRC-8]
realizes: [F-16]
requires: [R-REPO-001]
constrained_by: [ADR-17]
---

C1: The built-in packs MUST exist only as `shared/packs/<id>/pack.json` and `shared/packs/<id>/pack.css`.
C2: The page stylesheet MUST exist only as `shared/css/page.css`.
C3: The icon glyphs and icon aliases MUST exist only as `shared/icons/icons.json`, an object with `glyphs` (name → SVG inner markup) and `aliases` (name → glyph name).
C4: The modifier vocabulary (rendered and ignored modifiers) MUST exist only as `shared/language/vocabulary.json`, with `rendered` and `ignored` name lists.
C5: Each variant's build MUST copy the shared files it publishes into its own package; neither package MAY read `shared/` at run time.
C6: A test in each variant MUST fail when its package copy differs from `shared/` after a build.
C7: Both variants MUST read the shared files as data and MUST NOT execute anything from them.
V1: After the move, the Python icon, vocabulary and pack modules load their data from the packaged copies and the existing test suite passes unchanged.
