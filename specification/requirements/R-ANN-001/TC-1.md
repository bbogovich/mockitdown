---
id: TC-1
title: Callouts on overlays
verifies: [C6]
---

Conformance case `annotate-overlay-callouts` (a `Dialog`, a `Toast` and a floating action button each
with `.callout(n)`, a second `Toast` presented through `.overlay`) in both suites: each overlay's callout
mark is in the expected HTML. Unit tests `OverlayCalloutTests` (`python/tests/test_overlay_callouts.py`):
the overlay's root is decorated inside its layer and its anchored mark follows the layer; an inline toast
is decorated in place. Browser test (Chromium, `typescript/tests/browser/overlay-callouts.spec.mjs`,
IT-74): in a fit frame and in a phone frame, each mark is visible and centred on its overlay's top-left
corner within 4 px.
