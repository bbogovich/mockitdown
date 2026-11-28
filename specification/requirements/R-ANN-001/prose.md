Documentation often has to point at a part of a screen and then talk about it. A numbered circle on the element, matched by the same number in the prose (R-ANN-004), is the convention of manuals and design specs.

**Overlays keep their marks (F-15.C5).** A dialog, a toast or a floating action button with
`.callout(…)` draws the callout like any other element. As built (#46): such an overlay is lifted out of the flow into a
screen-level layer, and its marks used to be dropped with it; now the overlay's root is decorated inside
its layer, and its anchored mark follows that layer (R-ANN-003.C3).
