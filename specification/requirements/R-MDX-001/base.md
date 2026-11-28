---
id: R-MDX-001
title: Integration points
status: active
version: 0.2.0
rev: 0
page: MDX.1
slot: reqs
order: 1
source: [SRC-2, SRC-3]
realizes: [F-11]
constrained_by: [A-MDX-1, A-MDX-2]
decisions: [ADR-3]
reverse_engineered: true
hash: df38463cc45a
---

C1: mockitdown MUST integrate with documentation sites as a Python-Markdown extension named `mockitdown` (loadable as `markdown_extensions: [mockitdown]`) together with a `pymdownx.superfences` custom fence.
C2: The fence MUST be registered with `name: mockitdown`, `format: mockitdown.fence.format` and `validator: mockitdown.fence.validate`; the class name is free (`mockitdown` by convention).
C3: The integration MUST work unchanged in MkDocs, in Zensical and in any Python-Markdown pipeline that loads `pymdownx.superfences`; mockitdown MUST NOT ship or require a MkDocs plugin.
C4: The fence MUST work when the extension is not loaded, rendering with the default options and without CSS injection.
C5: The `mockitdown` extension SHOULD be listed before `pymdownx.superfences` in the extension list.
V1: The example site's configuration builds under Zensical 0.1.3 and renders every block; a plain `markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"], …)` converts a page with a block.
<!-- file: prose.md -->
Zensical reads `mkdocs.yml` and runs Python-Markdown extensions and superfences fences, but not
MkDocs plugins (ADR-3). Everything the prototype's plugin did — configuration, CSS, strict
failure — therefore moves into the extension and the fence. The [Site integration guide](site-guide.md)
has the complete configuration.
