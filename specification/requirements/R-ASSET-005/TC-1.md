---
id: TC-1
title: Built-in icons
verifies: [C1, C2, C3, C4, C5, C6]
---

Python unit tests `python/tests/test_assets.py` `IconTests`: `shared/icons/icons.json` holds over a
hundred glyphs, none referring to an image, text or URL; an icon is a 24 × 24 `svg` with
`fill="none" stroke="currentColor"`; no font file exists under `shared/` or the package and no pack or
page stylesheet declares `@font-face` or imports a font (C1). A pack's `icons` map is applied first
(antd), then an exact glyph, an exact alias, the normalised name (`Star24Regular`), the name without
`.circle` or `.fill`, a normalised alias (`more_vert`) and the first segment (`trash.slash.fill`) (C2).
`normalize` strips `sap-icon://`, splits camelCase, digits, `_`, `-`, `/` and spaces, lower-cases and
drops the size and style tokens (C3). SF Symbols, Material, Fluent and SAP names resolve (C4, V1).
`xyzzy` renders the question-mark glyph with `data-icon="unknown"` and exactly the warning
"unknown icon 'xyzzy'" (code `icon`) (C5, V1). The `svg` carries `viewBox="0 0 24 24"`,
`aria-hidden="true"` and `focusable="false"`, and the base stylesheet sets its `stroke-width` from
`--mkd-icon-stroke`, a base token (C6).
The conformance cases `image-icon-names`, `image-system-name` and `diag-unknown-icon` hold the same
output in both variants (IT-8, IT-10).
