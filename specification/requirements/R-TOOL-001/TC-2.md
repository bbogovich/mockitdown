---
id: TC-2
title: Overlays
verifies: [C2, C8, C9, C10, C19, C20]
---

Browser tests (`typescript/tests/browser/editor.spec.mjs`): hovering the button sets the session's
hovered node and shows one tag `Button · W × H` matching its bounding box, and a node hovered through
the session (`session.hover`) is outlined with a `Card · W × H` tag; with a selection and a hover, the
rendering's HTML and bounding box are unchanged, the selection outline lies on the button's box, the
overlay takes no pointer events and the outline's colour is `#ff8a00` until `--mkd-selection-color`
is set on the editor. An editor with `import-base` and `asset-base` renders the `import-component`
conformance source without import diagnostics, its derived elements marked, and an image resolved
against `asset-base`.
