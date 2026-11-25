**Problem.** The prototype rendered either SVG boxes or real SAPUI5 web components loaded from a
CDN (SRC-3); neither gives a faithful, offline, deterministic picture for seven frameworks.

**Change.** Every pack is a static CSS replica of its framework, applied to one shared HTML markup.
Nothing runs in the browser, so pages stay fast, cacheable and safe.

**Layout without overlap (SRC-9).** The pack gallery showed controls drawn over each other and
presented surfaces collapsed to a small square. A mockup is a picture of a real screen, and a real
screen never shows siblings painted over each other: when space runs out, text truncates or wraps,
and controls keep their size. An element shown alone at `fit` is drawn whole, including what it presents.
