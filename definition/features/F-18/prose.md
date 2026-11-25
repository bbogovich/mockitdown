**Problem.** The Python variant has the example site and its Reference section to show every pack; the web components need an equivalent that also serves as their end-to-end test (SRC-8).

**Change.** A test page in `typescript/` lists the packs on the left and shows the selected pack's elements and complete design patterns on the right, all as `mockitdown-mockup` components. The browser test suite (Playwright, SRC-8#clar-deps) drives the same page.
