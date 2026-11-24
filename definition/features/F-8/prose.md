**Problem.** The prototype rendered either SVG boxes or real SAPUI5 web components loaded from a
CDN (SRC-3); neither gives a faithful, offline, deterministic picture for seven frameworks.

**Change.** Every pack is a static CSS replica of its framework, applied to one shared HTML markup.
Nothing runs in the browser, so pages stay fast, cacheable and safe.
