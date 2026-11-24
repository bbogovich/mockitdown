---
id: R-ANN-003
title: Overlay placement and free positioning
status: active
version: 0.3.0
rev: 0
page: ANN.1
slot: reqs
order: 999
source: [SRC-4]
constrained_by: [A-REND-1]
decisions: [ADR-15]
reverse_engineered: true
hash: 669b1db20a16
---

C1: The renderer MUST attach annotation marks (R-ANN-001, R-ANN-002) to the modified view's own root element — not a wrapper — so the view keeps its place in its parent's layout; only a void root element (an image) MAY be wrapped.
C2: The renderer MUST name the decorated element as a CSS anchor (unique within the page) and draw its marks twice: in a screen-level layer positioned with CSS anchor positioning, and in a layer inside the element used only where anchor positioning is unsupported.
C3: Marks created inside a modal dialog MUST be emitted after the dialog's layer, so their anchors precede them.
C4: `.position(x:y:)` MUST place the view's centre at (x, y) points in its nearest positioned container (canvas, z-stack, screen); `.position` without coordinates MUST warn and be ignored; `.rotationEffect(.degrees(n))` MUST rotate the view; `.zIndex(n)` MUST order overlapping views; canvas, z-stack, card and presented containers MUST isolate the stacking of their children.
V1: A callout on a row inside a clipped list is fully visible in a browser with anchor positioning.
