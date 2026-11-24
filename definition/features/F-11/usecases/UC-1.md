---
id: UC-1
title: Add mockitdown to an existing Zensical site
---

**Actor:** documentation-site maintainer.

1. The maintainer installs mockitdown with its `markdown` extra.
2. The maintainer adds the `mockitdown` extension and the `mockitdown` custom fence to `mkdocs.yml`.
3. The maintainer runs `zensical build`.

**Outcome:** every ```` ```mockitdown ```` block on the site renders as a figure, styled by CSS the
extension added to the pages that need it.
