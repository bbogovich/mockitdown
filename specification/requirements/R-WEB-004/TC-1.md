---
id: TC-1
title: Every pack renders
verifies: [C2]
---

Automated by `typescript/tests/browser/gallery.spec.ts`: for every pack, select it, wait for all mockups' `rendered`, and fail on any error diagnostic or empty shadow root.
