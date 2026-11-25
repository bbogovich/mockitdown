---
title: "Web components"
spec_version: 0.6.0
status: draft
updated: 2026-11-25
page_id: WEB.1
---

# Web components

The TypeScript variant (F-17) is an NPM package of web components whose tags begin with
`mockitdown-`. Its core is a port of the Python language, evaluation and rendering modules, held to
the same output by the conformance corpus (ADR-18). The renderer element carries its code in a
script child (ADR-19):

```html
<script type="module" src="node_modules/mockitdown/dist/mockitdown.js"></script>

<mockitdown-mockup pack="fluent" device="desktop" appearance="auto" title="Settings">
  <script type="text/mockitdown">
    import Fluent
    NavigationView { Text("Settings").font(.title) }
  </script>
</mockitdown-mockup>
```

The design-tool components (F-19, F-20) are specified after the designer design document is reviewed.

<!-- slot: reqs -->
