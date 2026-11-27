---
id: R-PACK-007
title: Pack stylesheet rules
status: active
version: 0.2.0
rev: 0
page: PACK.1
slot: reqs
order: 7
source: [SRC-2]
realizes: [F-3, F-8]
constrained_by: [A-STYLE-1]
decisions: [ADR-5, ADR-6, ADR-7]
reverse_engineered: true
hash: 307ff0e5b8f0
---

C1: Every selector in a non-base pack's `pack.css` MUST start with `.mkd-pack-<id>` (the pack's figure class), so a pack's rules never apply outside its own figures.
C2: A pack's `pack.css` other than `base` MUST NOT contain `data-appearance` or `prefers-color-scheme`; appearance MUST be expressed through tokens only.
C3: Pack CSS MUST select markup only through the markup contract: role classes `mkd-<role>`, part classes `mkd-<role>__<part>`, and the `data-*` attributes the renderer emits (R-REND-002, R-REND-003).
C4: Pack CSS MUST write lengths in `px`; it MUST NOT depend on the frame unit being 1px (R-DEV-005).
C5: Pack CSS MUST NOT import fonts, images or other resources from the network, and MUST NOT require JavaScript.
C6: The `base` pack's CSS MUST define the structure of every render role (layout, parts, states) so that a pack without CSS still renders a usable wireframe.
V1: The contract test parses every pack's CSS and fails on an unscoped selector or on appearance branching.
<!-- file: TC-1.md -->
---
id: TC-1
title: Scoped, appearance-neutral pack CSS
verifies: [C1, C2]
---

Automated by `tests/test_packs.py::PackTests::test_css_is_scoped` and
`test_css_has_no_appearance_branching`.
<!-- file: prose.md -->
Scoping lets several packs share one page — a Fluent and a Material mockup side by side — and
keeps mockitdown's CSS from leaking into the documentation theme. Writing plain `px` keeps pack
CSS ordinary; scaling is applied when the stylesheet is assembled.
