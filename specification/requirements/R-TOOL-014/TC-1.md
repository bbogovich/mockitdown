---
id: TC-1
title: Round trip
verifies: [C4, C5]
---

Browser test (`canvas.spec.mjs`) on `pages/designer.html` covering F-20.AC1–AC4 together: three
mockups and a section; zoom, pan, move a frame, rename one, activate one; `toJSON()`, then `open` the
result in a fresh designer: names, positions, options, code, section, zoom, position and active
mockup are restored (F-20.AC3, F-20.AC7); `open` then `toJSON()` of the sample without edits yields the
sample.
