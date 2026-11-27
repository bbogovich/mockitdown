---
id: F-16
title: Shared language and packs for the Python and web variants
status: active
version: 0.9.0
rev: 1
page: FEAT.3
slot: features
order: 1
hash: eae30e23ae52
family: platform
source: [SRC-8, SRC-12]
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
C6: The shared language data states, for every render role, its category (frame, bar, layout, collection, content and control, overlay, annotation), the child roles it accepts and how it attaches to its parent (as a child, a modifier or a presentation); a pack can narrow these rules for one of its elements.
C7: The shared language data states the type of every role parameter and every rendered modifier (text, number, Boolean, enumeration, colour, icon, array) and the group of each modifier, so that tools can choose a matching control; a pack can override a type for one of its elements.
C8: Both variants publish the role rules and the typed parameters with their other shared assets.
AC5: Every render role has a rule, and a test fails when a role has none.
AC6: Asking whether an element may contain another gives the answer of its role unless its pack narrows it, and a refusal names its reason.
AC7: Publishing the role rules and the typed parameters changes no rendered output in either variant.
