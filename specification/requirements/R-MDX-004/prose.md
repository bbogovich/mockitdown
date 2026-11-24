Inline CSS per page needs no asset pipeline, works with instant navigation (the style travels with
the page content) and loads only the packs a page uses. Sites with many mockup pages can switch to
one linked stylesheet with `css: none` (ADR-8).

Hosts may call `convert()` more than once per page — Zensical converts heading fragments in nested
calls while the page is being converted, and reuses the Markdown instance without `reset()` — so
the stylesheet is emitted only by the conversion whose output contains the page's figures, which
then consumes the collected packs.
