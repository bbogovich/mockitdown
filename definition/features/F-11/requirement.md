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
