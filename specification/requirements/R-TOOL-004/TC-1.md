---
id: TC-1
title: Filtered gallery and Add
verifies: [C1, C3, C6, C7, C8]
---

Browser test (`gallery-component.spec.mjs`) on `pages/designer.html`: with an `HStack` selected, no card
is `NavigationSplitView` or `TabView`, both appear under Hidden here with their reason, and Add on
`Toggle` appends `Toggle(…)` as the stack's last child, selected, with one `mockitdown-insert` (F-19.AC2).
With nothing selected, root-only frames are offered. Previews exist only for cards near the viewport.
