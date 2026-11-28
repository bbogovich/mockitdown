---
id: TC-1
title: Pointer, selection, highlight and tap marks
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_annotations.py` `PointerSelectionTests`:
`.pointer(.<kind>, alignment: .topTrailing)` for each of arrow, hand, ibeam, grab, crosshair and touch
draws `span.mkd-deco__pointer[data-align=topTrailing]` holding `span.mkd-pointer[data-kind=<kind>]`
with that kind's own drawing (six different drawings); `.pointer()` draws an arrow at `center`;
`.cursor` renders as `.pointer` (C1). `List { … }.dragSelect()` draws `span.mkd-deco__marquee` in the
anchored and the fallback layer; `.dragSelect(.green)` and `.marquee(.green)` set `--mkd-marquee`; the
base stylesheet gives the mark a negative inset, a border and a `color-mix` tint of `--mkd-marquee`
(C2, V1). `.highlight()` and `.highlight(.red)` draw `span.mkd-deco__highlight` (a solid ring);
`.tap()` and `.tap(alignment: .leading)` draw `span.mkd-deco__tap` at the alignment (C3). On a canvas,
`SelectionRect().frame(width: 60, height: 40).position(x: 50, y: 50)` and `Pointer(.hand).position(…)`
render `.mkd-marquee` and `.mkd-pointer` sized by the frame and centred at the position, with the same
drawing and stylesheet rule as the modifiers' marks (C4).
The conformance cases `annotate-pointer-*`, `annotate-cursor-alias`, `annotate-drag-select`,
`annotate-marquee-color`, `annotate-highlight`, `annotate-tap` and `annotate-free-elements` hold the
same output byte for byte in both variants (IT-8, IT-10).
