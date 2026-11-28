---
id: F-11
title: Documentation-site integration
status: active
version: 0.2.0
rev: 0
page: FEAT.2
slot: features
order: 4
family: rendering
source: [SRC-2, SRC-3]
hash: 198514bcf8bf
---

G1: mockitdown must work in the documentation tools teams use, starting with MkDocs and its successor Zensical.
C1: A site enables mockitdown by configuration only, as a Markdown extension plus a fenced-block handler, with no MkDocs plugin.
C2: Site-wide options set the default pack, appearance and device, the import, asset and pack directories, image embedding, CSS delivery, strict mode, captions, Elements tables and whether warnings are shown in the page.
C3: The CSS the mockups need is delivered automatically once per page for the packs that page uses, or the site can link a generated stylesheet itself.
C4: The integration works with any Python-Markdown pipeline, including MkDocs, Zensical and plain Python-Markdown.
C5: The integration works with instant (single-page) navigation.
AC1: A Zensical site with the configuration from the site integration guide builds and renders mockups.
AC2: A page without mockups receives no mockitdown CSS.
<!-- file: prose.md -->
**Problem.** The prototype needed a MkDocs plugin (SRC-3); Zensical, the successor the project
moves to, does not run MkDocs plugins.

**Change.** mockitdown plugs in at the Markdown layer that every one of these tools shares: a
Python-Markdown extension for configuration and CSS, and a `pymdownx.superfences` custom fence for
the blocks.
<!-- file: usecases/UC-1.md -->
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
