---
id: R-ANN-001
title: Numbered callouts
status: active
version: 0.10.0
rev: 1
page: ANN.1
slot: reqs
order: 999
source: [SRC-4, SRC-12]
realizes: [F-15]
reverse_engineered: true
hash: d39b3d42c845
---

C1: The modifier `.callout(n)` (alias `.annotation`) MUST draw a numbered circle on the corner of the modified view named by `alignment:` (default `.topLeading`), with an optional label (second argument or `text:`) drawn beside it.
C2: A callout label MUST point away from the view (leftwards from a leading corner, rightwards from a trailing one) unless `labelSide: .leading|.trailing` says otherwise; `inset: true` MUST draw the callout inside the corner.
C3: `color:` MUST set the callout colour; the default is the pack token `--mkd-callout` on `--mkd-on-callout`.
C4: A callout attached to a component that renders several views MUST be drawn once, on the first view.
C5: The `Callout(n, "label")` element MUST draw the same mark as a free element, for placement with `.position(x:y:)`.
V1: `Button("Send").callout(4)` renders the button and a mark containing `4`.
C6: The renderer MUST draw the marks of a view whose role is an overlay (`dialog`, `toast`, `fab`) — callouts, pointers, selections, highlights and taps — as for any other view, including when the overlay is presented through a modifier.
