---
id: R-REND-014
title: Shape framing
status: active
version: 0.7.0
rev: 0
page: REND.1
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-8]
constrained_by: [A-REND-1]
hash: 032fd3dff7dc
---

C1: A `Circle` given a frame of w × h MUST be drawn as a circle of diameter min(w, h) centred in that frame; the frame MUST keep w × h for layout.
C2: An `Ellipse` MUST fill its frame as a true ellipse (radii half its width and half its height, `border-radius: 50%`), never a capsule, in every pack; a `Capsule` MUST have corner radius half its shorter side; a `RoundedRectangle` MUST use its `cornerRadius`.
C3: A `Circle` without a frame MUST fill the shorter side of the space offered, as a circle.
C4: Packs MUST NOT override the geometry of C1–C3; a pack MAY restyle only fill, stroke and shadow.
V1: In every shipped pack, `Circle().frame(width: 160, height: 96)` renders a 96 × 96 circle centred in a 160 × 96 box, and `Ellipse().frame(width: 160, height: 96)` has border radii of 80 × 48 points (no straight edge).
<!-- file: TC-1.md -->
---
id: TC-1
title: Circle in a wide frame
verifies: [C1, C2, C3]
---

Python and TypeScript render tests plus a browser box check: V1 in every shipped pack (computed `border-radius` of the ellipse is 50%, the circle's box square), and the ellipse, capsule and rounded rectangle cases.
<!-- file: prose.md -->
SwiftUI fits a circle into its frame and draws an ellipse as an ellipse; neither is ever a capsule (SRC-9, SRC-9#ellipse). The base stylesheet gave circle, ellipse and capsule the same 9999-pixel radius, so every pack drew both as capsules.
