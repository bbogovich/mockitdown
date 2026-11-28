---
id: TC-1
title: Figure, stage, cells, frames and caption
verifies: [C1, C2, C3, C4, C5, C6, C7]
---

Python unit tests `python/tests/test_markup.py` `FigureStructureTests`: the figure's classes, `role`, `aria-label` (title, else id, else
"<pack name> mockup") and data attributes (C1); `appearance="both"` gives `data-count="2"`, two cells, frames light
and dark with `data-device`, `data-chrome` and the size, cell labels `Light` and `Dark` and the caption `S · T`; one
appearance gives one cell without a label, and `device="fit"` `data-fit="true"` without a size (C2, C3, C5, V1); a
SwiftUI phone with a sheet has the status chrome, one screen holding the views and then the presentation layer, and the
home indicator, in that order (C4); the caption shows whichever of id and title exists and nothing with neither or with
captions off (C6); the options' title and id win over `@Screen`'s (C7).
