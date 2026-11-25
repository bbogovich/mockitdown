---
id: TC-1
title: Circle in a wide frame
verifies: [C1, C2, C3, C4, C5, C6]
---

Python and TypeScript render tests plus a browser box check: V1 in every shipped pack (computed `border-radius` of the ellipse is 50%, the circle's box square), and the ellipse, capsule and rounded rectangle cases; a stroked circle keeps its stroke on the circle (C5), and an ellipse given to `.background(_, in:)` has 50% radii (C6).
