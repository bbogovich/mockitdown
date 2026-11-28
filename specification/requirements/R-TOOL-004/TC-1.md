---
id: TC-1
title: Filtered gallery and Add
verifies: [C1, C3, C6, C7, C8, C9, C10, C11]
---

Browser test (`gallery-component.spec.mjs`) on `pages/designer.html`: with an `HStack` selected, no card
is `NavigationSplitView` or `TabView`, both appear under Hidden here with their reason, and Add on
`Toggle` appends `Toggle(…)` as the stack's last child, selected, with one `mockitdown-insert` (F-19.AC2).
With nothing selected, root-only frames are offered. Previews exist only for cards near the viewport.

As built (#29): `typescript/tests/browser/gallery-component.spec.mjs` opens the hand-written
`tests/browser/fixtures/gallery-sample.mkdesign` in the designer of `pages/designer.html`. With nothing
selected the frame and layout groups are shown with `NavigationSplitView` and `TabView`; with HStack
`#actions` selected both are under "A frame cannot be placed inside a horizontal stack" (R-PACK-016's own
example), the footer's `data-count` and "(n)" equal its listed elements, the first card has a
`mockitdown-mockup` (`device="fit"`, `pack="base"`) and the last none until it is scrolled to; Add on
`Toggle` gives the hand-written code with `Toggle()` as the stack's last child, selected, and one
`mockitdown-insert` from the designer. A second test adds `Text` by double-click and `Divider` by Enter
with nothing selected, each on a new line at the end of the top level.
