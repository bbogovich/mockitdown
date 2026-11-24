---
id: R-REND-001
title: Figure structure
status: active
version: 0.2.0
rev: 0
page: REND.1
slot: reqs
order: 1
source: [SRC-3]
realizes: [F-8, F-9, F-10]
constrained_by: [A-REND-2]
decisions: [ADR-1]
reverse_engineered: true
hash: 10a15a3e88c1
---

C1: The figure assembler MUST render a mockup as one `div.mkd-figure.mkd-pack-<id>` with `role="figure"`, an `aria-label` (the title, else the id, else "<pack name> mockup"), and `data-pack`, `data-device` and `data-appearance` attributes.
C2: The figure MUST contain one `div.mkd-stage` with `data-count` equal to its number of cells, and one `div.mkd-cell` per rendered appearance (one, or two for `both`).
C3: Each cell MUST contain one `div.mkd-frame` with `data-appearance` (`light`, `dark` or `auto`), `data-device` and `data-chrome`, and either `style="--mkd-w:<width>;--mkd-h:<height>"` in logical points or `data-fit="true"`.
C4: Each frame MUST contain, in order, the top chrome (if any), one `div.mkd-screen` holding the rendered views followed by the presentation layers, and the bottom chrome (if any).
C5: When the appearance is `both`, each cell MUST end with a `div.mkd-cell__label` reading `Light` or `Dark`.
C6: When captions are enabled and the mockup has an id or a title, the figure MUST contain `div.mkd-caption` reading `<id> · <title>` (or whichever of the two exists).
C7: The title MUST come from the `title` option, else `@Screen`'s title; the id from the `id` option, else `@Screen(id:)`.
V1: Rendering `Text("x")` with `appearance="both" title="T" id="S"` yields a figure with two cells, two frames with `data-appearance` light and dark, two cell labels and the caption `S · T`.
