---
id: TC-1
title: Callouts on overlays
verifies: [C6]
---

Conformance cases `annotate-overlay-callouts` (a `Dialog`, a `Toast` and a floating action button each
with `.callout(n)`, one presented through `.overlay`) in both suites: each overlay's callout mark is in
the expected HTML. Browser test: each mark is visible and centred on its overlay's corner within 4 px.
