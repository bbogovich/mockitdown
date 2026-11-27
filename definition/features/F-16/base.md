---
id: F-16
title: Shared language and packs for the Python and web variants
status: active
version: 0.5.0
rev: 0
page: FEAT.3
slot: features
order: 1
hash: 079014f59cbe
family: platform
source: [SRC-8]
requires: [F-10]
---

G1: Mockups must look and mean the same whether a Markdown site or a web application renders them, so the language and the packs are maintained once for both.
C1: One repository holds the Python variant, the TypeScript variant and the assets both publish.
C2: The pack definitions, pack stylesheets, page stylesheet, icon glyphs and any images exist once, as shared assets, and each variant publishes them from there.
C3: Both variants accept the same mockitdown language, the same imports and the same packs, including site- or app-supplied packs.
C4: The same mockup source renders to the same markup in both variants, so one stylesheet serves both.
C5: The Python variant keeps its behaviour, its command line, its Markdown integration and its PyPI package after the move.
AC1: The repository has the top-level folders `python/`, `typescript/` and `shared/`, and no pack definition, pack stylesheet or icon table exists outside `shared/`.
AC2: The Python package built from `python/` contains the shared assets and passes its existing test suite and example-site build.
AC3: A set of shared reference mockups renders to identical HTML in the Python and the TypeScript variant; a test fails on any difference.
AC4: Adding or changing a pack in `shared/` is enough for both variants to offer it.
<!-- file: prose.md -->
**Problem.** The web components were to be a separate project, but they need the same CSS and the same packs as the Python library; two copies would drift apart (SRC-8).

**Change.** The repository becomes the home of both variants: `python/` (the existing library), `typescript/` (the web components) and `shared/` (what both publish). A shared set of reference mockups keeps the two renderers producing the same markup.
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Change a pack once for both variants
---

**Actor:** pack author.

1. A pack author edits a pack's stylesheet and definition in `shared/packs/`.
2. The author runs the Python and the TypeScript test suites.

**Outcome:** both the Markdown sites and the web components render the changed pack, and the reference mockups still match between variants.
