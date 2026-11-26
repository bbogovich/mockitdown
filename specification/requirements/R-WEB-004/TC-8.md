---
id: TC-8
title: Show source on every example
verifies: [C21, C22, C23, C24, C25, C26]
---

Browser test (Chromium, `gallery.spec.mjs`), for the `base` pack (core patterns) and for `swiftui`
(including the Mac example with `device`, `chrome`, `menubar` and `app`):

1. On the Examples tab every `.pattern` has one Show source button with `aria-expanded="false"`, and its
   source block is hidden.
2. Activating the button of each example sets `aria-expanded="true"`, the label to Hide source, and shows
   the block; the block's text equals `packGallery.source(id)`, which equals the expected snippet built
   from `shared/patterns/index.json` and the pattern file (C22 attribute order, file text unchanged, no
   `caption`, `label` or `appearance`).
3. The example's `mockitdown-mockup` is the same element before and after, its `rendered` event does not
   fire again and its bounding box is unchanged (C25).
4. The block's computed `white-space` keeps line breaks and its `overflow-x` scrolls; its colours differ
   between light and dark appearance (C23).
5. With a stubbed clipboard, Copy writes exactly the snippet and the live region reads Copied; with the
   clipboard removed, Copy selects the block's text (C24).
6. Activating the button again hides the block and restores `aria-expanded="false"`.
7. `packGallery.source(id)` resolves `null` for a swiftui-only example while `base` is selected (C26).

A unit test of the snippet builder (pure function, both a core and a pack-specific entry) runs under
`npm test` without a browser.
