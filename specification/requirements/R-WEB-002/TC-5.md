---
id: TC-5
title: Document import map and imports attribute
verifies: [C3, C14, C15]
---

Browser test (Chromium) serving `typescript/tests/fixtures/`: a page with `<script type="mockitdown-imports">{"acme/": "libs/acme/"}</script>` and `import-base="/fixtures/"` renders a mockup importing `acme/cards` from `/fixtures/libs/acme/cards.mockitdown` (C3, C14); an element with `imports='{"acme/": "other/"}'` loads from `other/` (C14); a map holding `{"acme/": 3}` shows the error of C15 and the mockup still renders its other content.
