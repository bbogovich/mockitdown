---
id: TC-1
title: Image-bearing attributes
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_assets.py` `ImageAttributeTests`: `Image` takes its image from the
first argument, `url:`, `src:` or `source:`; `Avatar` from `image:`, `src:` or `url:`, and without one
draws the initials `AL` for "Ana Lima"; a list row's leading `image:` or `thumbnail:` becomes
`img.mkd-thumb` (C1, V1). `Card` with `cover:`, `media:` or `image:` draws `img.mkd-card__media` (C2).
`Image(systemName:)`, `Image(icon:)` and `Image(symbol:)` render the icon glyph and no `img` (C3). An
image renders as `<img class="mkd-image" … src alt>` with `alt` from `alt:`, `label:` or
`accessibilityLabel:`, and `alt=""` without one (C4, V1).
