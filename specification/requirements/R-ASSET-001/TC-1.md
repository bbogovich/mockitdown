---
id: TC-1
title: Classifying image references
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_assets.py` `ClassifyTests`: `https://`, `http://`, upper-case
`HTTPS://` and `//` references are kept as the `img` source with no diagnostic (C1, V1); a
`data:image/png;charset=x;base64,…` URI is kept, `data:text/html,…` and `DATA:application/json,…` warn
"only data:image/… URIs are accepted" (code `asset`) and render the placeholder (C2, V1);
`javascript:`, `file:`, `ftp:` and `mailto:` references warn "unsupported asset scheme in 'x'" and are
never emitted (C3, V1); the resolver trims a local path and a remote URL, and an empty or blank
reference resolves to nothing without a diagnostic (C4); a refused or missing image draws
`.mkd-image--placeholder` with the photo glyph and the alt text or the reference as label, a card its
`mkd-card__media--missing` block with the glyph and a list row its `mkd-thumb--missing` (C5).
The conformance cases `image-remote`, `image-protocol-relative`, `image-data-uri`,
`diag-image-data-not-image`, `diag-image-scheme` and `diag-image-missing` hold the same output in both
variants (IT-8, IT-10).
