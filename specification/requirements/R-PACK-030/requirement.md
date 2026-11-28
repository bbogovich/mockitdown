---
id: R-PACK-030
title: "User guide: installation and defined terms"
status: active
version: pending
rev: 1
page: PACK.1
slot: reqs
order: 1000
hash: bccd78c3473f
source: [SRC-19]
realizes: [F-14]
requires: [R-PACK-012, R-IMP-007, R-IMP-008, R-IMP-009]
constrained_by: [A-MDX-1]
refs: [R-MDX-001, R-MDX-002, R-MDX-003, R-WEB-007]
---

C1: The example site's first navigation section MUST be named `User guide` and list, in this order, Home, Installation, Language tour and Custom components, followed by the pages it lists today.
C2: The Installation page MUST describe the Python variant: installing `mockitdown[markdown]` with Zensical or MkDocs from PyPI; the `markdown_extensions` entries for the `mockitdown` extension and the `pymdownx.superfences` fence (R-MDX-001); a first page with a `mockitdown` block; the build command and where the built page is; and `mockitdown render` for a single file.
C3: The Installation page MUST describe the TypeScript variant: installing the release archive (R-WEB-007, `npm install <archive URL>`) or copying its `dist/`; a plain HTML page that loads `dist/mockitdown.js` and holds a `mockitdown-mockup` element; and serving that page over HTTP.
C4: The Installation page MUST hold a table of every option of the Markdown extension (R-MDX-002.C1) with its default and meaning, and a table of every fence attribute (R-MDX-003.C1) with its meaning, each linking to the page that specifies it further.
C5: The Installation page MUST say where the import map is defined in each integration — the extension's `imports` option, the command line's `-I`, the render option `imports` and the web components' `<script type="mockitdown-imports">` — with one example map used by all four.
C6: The Custom components page MUST show, each as a rendered block with its source: the site's import map configuration, a library block used by a later block on the page, two libraries declaring a component of the same name used qualified and through `as`, and a layout template with a `content` slot, a slot with a default and an optional slot.
C7: Every option, attribute, command-line flag, file name and term a User guide page uses MUST be explained on that page where first used, or link to the page that explains it.
C8: The example site's own configuration MUST use `imports` (no `import_paths`), and the Installation page's Python configuration MUST be the subset of it that a new site needs.
V1: The User guide tab opens Home, then Installation; the test suite fails when an extension option or fence attribute is missing from the Installation tables, and when the Installation snippets no longer build a page with a rendered mockup.
