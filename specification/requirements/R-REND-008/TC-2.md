---
id: TC-2
title: An unknown element in the browser
verifies: [C3]
---

Chromium tests `typescript/tests/browser/markup.spec.mjs`: in `base`, Fluent and SwiftUI, an unknown element between
two texts has a visible dashed border and its name shown, holds its child, and sits between its siblings without
overlapping them (C3, V1).
