---
id: TC-1
title: Marks inside a dialog
verifies: [C6]
---

Conformance case `annotate-dialog-contents` (a callout on a button inside a `Dialog`) in both suites.
Browser test (Chromium): the callout's centre lies within 4 px of the button's top-left corner, once
with anchor positioning and once with the fallback layer forced (anchor positioning disabled through
the stylesheet's `@supports` branch).
