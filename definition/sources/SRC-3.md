---
id: SRC-3
title: "The MockItOut prototype (mockitout-python, example-site, ADR-001)"
recorded: 2026-11-23
---

The prototype at `~/Documents/Projects/Dev/DevTools/MockItOut/prototype/MockItOut/` (a throwaway spike,
2026-10). Cited parts:

- `README.md` — the `mockitout` notation: a `mockitout: 1` version line; `screen <ID> "title" kit: <kit>
  form: <device>`; brace-delimited element calls `Type(args) { children }`; `@id(x)` and `@ref ID` feeding
  the Elements table; `component Name(p: Type) { … Slot("x") … }` with `$var` interpolation; `form <device>
  { … }` per-device overrides.
- `mockitout-python/src/mockitout/kits/` — three kits: `base` (generic `mio-*` light-DOM elements), `swift`
  (SwiftUI / Apple HIG mapping) and `fiori` (real `ui5-*` SAPUI5 Web Components tags); each kit an
  `ElementSpec` catalogue (`html_tag`, `control`, `role`, `label_arg`, `allowed_children`, `states`) plus
  CSS assets (`mio-base.css`, `kit-swift.css`, `kit-fiori.css`).
- `render_html.py` and `render_svg.py` — two renderers sharing one AST; CSS container-query `--u`
  scaling of device frames.
- `mkdocs/fence_format.py` — the `pymdownx.superfences` custom fence (options `kit`, `form`, `render`);
  `mkdocs/plugin.py` — a MkDocs plugin copying kit CSS into the site, warning on
  `navigation.instant` (declarative shadow DOM does not attach to script-inserted HTML), and failing
  the build in strict mode on fence errors.
- `docs/adr/ADR-001-renderer.md` (2026-10-12) — "Adopt the HTML custom-element renderer as the
  primary/default renderer … Keep the SVG renderer as a secondary output".
- `example-site/` — a worked feature definition with a Fiori web screen and an iOS screen.
