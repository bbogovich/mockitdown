---
id: TC-3
title: Deep link
verifies: [C5]
---

Automated by `typescript/tests/browser/gallery-packs.spec.mjs`: opening `packs.html#pack=carbon` shows Carbon selected; selecting MUI from the side panel sets `#pack=mui`, survives a reload, and Back returns to Carbon.
