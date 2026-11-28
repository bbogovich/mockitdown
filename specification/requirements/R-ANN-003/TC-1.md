---
id: TC-1
title: Marks inside a dialog
verifies: [C3, C6]
---

Conformance cases `annotate-dialog-contents` (a callout on a button inside a `Dialog`) and
`annotate-in-dialog` (one inside an `.alert`) in both suites; the unit tests `DialogContentsTests`
(`python/tests/test_overlay_callouts.py`: a `Dialog`, an `.alert` and a `.sheet`, the anchored mark after
the layer). Browser test (Chromium, `typescript/tests/browser/overlay-callouts.spec.mjs`, IT-74): for a
`Dialog` and an `.alert`, in a fit frame and in a phone frame, the callout's centre lies within 4 px of the
button's top-left corner, once with anchor positioning and once with the fallback layer forced (anchor
positioning disabled through the stylesheet's `@supports` branch).
