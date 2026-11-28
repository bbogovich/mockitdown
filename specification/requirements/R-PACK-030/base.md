---
id: R-PACK-030
title: "User guide: installation and defined terms"
status: active
version: 0.12.0
rev: 0
page: PACK.1
slot: reqs
order: 1000
hash: 056a40bad350
source: [SRC-19]
realizes: [F-14]
requires: [R-PACK-012, R-IMP-007, R-IMP-008, R-IMP-009]
constrained_by: [A-MDX-1]
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
<!-- file: TC-1.md -->
---
id: TC-1
title: User guide structure and option tables
verifies: [C1, C4, C5, C6, C8]
---

`python/tests/test_examples.py`: the first nav section of `python/examples/site/mkdocs.yml` is `User guide` with Home, Installation, Language tour, Custom components first (C1); every key of the extension's configuration schema and every fence attribute of R-MDX-003.C1 appears in the first column of the Installation page's option and attribute tables (C4); the Installation page names `imports`, `-I`, the render option `imports` and `mockitdown-imports` (C5); the Custom components page holds a block with `library=`, an `import "#` in a later block, a qualified call, an `as` import and a struct with a `content` slot, a defaulted and an optional view property (C6); the site configuration has `imports` and no `import_paths` (C8).
<!-- file: TC-2.md -->
---
id: TC-2
title: The Installation steps build a page
verifies: [C2, C3]
---

`python/tests/test_examples.py` (with Zensical installed): extracts the Installation page's Python configuration block and first page into a temporary directory, runs `zensical build` and finds a rendered mockup figure in the built page (C2). A browser test serves a temporary directory holding `dist/` and the Installation page's HTML snippet and finds a rendered `mockitdown-mockup` with no diagnostic (C3).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: Every term defined or linked
verifies: [C7]
---

Reading each User guide page in the built site, top to bottom: every option, attribute, flag, file name and term is explained where first used or links to its explanation. Record the pages read and any gap on the issue; a gap fails the issue.
<!-- file: prose.md -->
**Requirement.** The example site is the User guide (formerly "Demo"). It opens with an Installation
page for both variants — the Python package in a Zensical or MkDocs site, and the web components in
a plain HTML page — with tables of every extension option and fence attribute, and says where the
import map is defined in each integration. The Custom components page shows the import map, page
library blocks, qualified library names and templates with slots.

**Rationale.** The developer found terms used but never defined (where `import_paths` was set, how to
use a component from the same page). The option and attribute tables are tested against the code so
they cannot fall behind it; the published URL stays `/demos/` so existing links keep working.

**Verification.** TC-1 and TC-2 automated; TC-M1 a reading of every User guide page.
