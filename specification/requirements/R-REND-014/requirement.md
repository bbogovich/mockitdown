---
id: R-REND-014
title: Shape framing
status: active
version: 0.10.7
rev: 2
page: REND.1
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-8]
constrained_by: [A-REND-1]
hash: 0793372eb8b8
---

C1: A `Circle` given a frame of w × h MUST be drawn as a circle of diameter min(w, h) centred in that frame; the frame MUST keep w × h for layout.
C2: An `Ellipse` MUST fill its frame as a true ellipse (radii half its width and half its height, `border-radius: 50%`), never a capsule, in every pack; a `Capsule` MUST have corner radius half its shorter side; a `RoundedRectangle` MUST use its `cornerRadius`.
C3: A `Circle` without a frame MUST fill the shorter side of the space offered, as a circle.
C4: Packs MUST NOT override the geometry of C1–C3; a pack MAY restyle only fill, stroke and shadow.
C5: A `Circle`'s `.stroke()` and `.shadow()` MUST be drawn on the circle of C1, not on its frame.
C6: A shape given to `.background(_, in:)` or `.clipShape()` MUST follow C2: `Ellipse` with radii half the width and half the height, `Capsule` with radius half the shorter side.
V1: In every shipped pack, `Circle().frame(width: 160, height: 96)` renders a 96 × 96 circle centred in a 160 × 96 box, and `Ellipse().frame(width: 160, height: 96)` has border radii of 80 × 48 points (no straight edge).
