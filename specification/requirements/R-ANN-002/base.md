---
id: R-ANN-002
title: Pointers, selections, highlights and taps
status: active
version: 0.3.0
rev: 0
page: ANN.1
slot: reqs
order: 999
source: [SRC-4]
realizes: [F-15]
reverse_engineered: true
hash: 7eca90db0097
---

C1: `.pointer(kind, alignment:)` (alias `.cursor`) MUST draw a mouse pointer of kind arrow (default), hand, ibeam, grab, crosshair or touch over the view at the named alignment.
C2: `.dragSelect(colour?)` (alias `.marquee`) MUST draw a selection rectangle around the view: a border and a translucent tint of `--mkd-marquee` (or the given colour), extending slightly beyond the view.
C3: `.highlight(colour?)` MUST draw a focus ring around the view; `.tap(alignment:)` MUST draw a touch indicator.
C4: The elements `Pointer(kind)` and `SelectionRect()` MUST draw the same marks as free elements, sized with `.frame` and placed with `.position(x:y:)`.
V1: `List { … }.dragSelect()` renders a selection rectangle over the list.
<!-- file: prose.md -->
Workflow illustrations show what the user does: where the pointer is, what is dragged across, what is tapped. These marks are part of the mockup so they stay attached when the layout changes.
