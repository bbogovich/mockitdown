---
id: R-IMP-008
title: Library blocks on a page
status: active
version: 0.12.0
rev: 0
page: IMP.1
slot: reqs
order: 8
hash: cdbffb21d68c
source: [SRC-19]
realizes: [F-4, F-11]
requires: [R-IMP-007, R-MDX-003]
constrained_by: [A-MDX-2, A-EVAL-1]
decisions: [ADR-24]
---

C1: When a fence has the attribute `library="<name>"`, the fence MUST treat the block as a library block: parse its source as a component file (R-IMP-001.C2 to C4) and register it for its page under the name `name`.
C2: A library block MUST NOT render a mockup; while its `source` attribute is true it MUST render its source as a code listing, and otherwise it MUST render nothing.
C3: An `import "#name"` MUST resolve to the library block `name` registered earlier on the same page, and never through the import map or the file system.
C4: If no library block `name` precedes the importing block on its page, then the evaluator MUST report the error "no library block '#name' earlier on this page" with code `import`.
C5: When a later library block on a page has the name of an earlier one, the fence MUST register it in place of the earlier one for the blocks after it and warn "library block '#name' redefined" with code `import`.
C6: The Markdown extension MUST forget the page's library blocks when Python-Markdown is reset between pages.
C7: A library block's diagnostics MUST be the block's own: logged and, under `strict`, failing the build as for any block (R-MDX-005), and located in the block.
C8: Loading the package entry of the web components MUST define the element `mockitdown-library`, which takes its source as the mockup element does (R-WEB-002.C2) and its name from its `name` attribute, registers it as C1 says for the mockup elements after it in document order, and renders nothing unless it has the attribute `source`, in which case it renders its source as a code listing.
C9: The render API MUST accept the render option `libraries`, a mapping from library name to source, as the library blocks that `import "#name"` resolves against; the fence and the web components MUST pass the library blocks preceding a block through it.
V1: A page whose first block is ```` ```mockitdown library="cards" ```` declaring `Pill`, followed by a block with `import "#cards"` and `Pill(text: "On")`, renders one mockup and no listing; on the next page `import "#cards"` is the C4 error; with `source="true"` the library block shows its code.
<!-- file: TC-1.md -->
---
id: TC-1
title: Library blocks in a site page
verifies: [C1, C2, C3, C4, C5, C6, C7, C9]
---

Converting Markdown pages with `markdown.Markdown(extensions=["mockitdown", "pymdownx.superfences"], …)`:

1. Page A: a block `library="cards"` declaring `Pill`, then a block `import "#cards"` / `Pill(text: "On")`: the output holds exactly one mockup figure and no listing (C1, C2, C3); with `source="true"` on the library block a code listing of its source appears and still no figure for it (C2).
2. Page A again with the importing block first: C4's error (C4).
3. Two library blocks named `cards`: the warning of C5, and the block after the second uses the second's `Pill` (C5).
4. Page B converted after a reset of the same `Markdown` instance: `import "#cards"` reports C4 (C6).
5. A syntax error in the library block, with `strict: true`, fails with a `SuperFencesException` naming the library block (C7).
6. `render(source, libraries={"cards": "struct Pill: View {…}"})` resolves `import "#cards"` (C9).

Automated in `python/tests/`.
<!-- file: TC-2.md -->
---
id: TC-2
title: The mockitdown-library element
verifies: [C8, C9]
---

Browser test (Chromium): a page with `<mockitdown-library name="cards">` holding a `<script type="text/mockitdown">` that declares `Pill`, followed by a `mockitdown-mockup` importing `#cards`, renders the pill; the library element renders nothing, and with the attribute `source` renders a code listing; a mockup element placed before the library element reports the C4 error of R-IMP-008. A unit test calls the TypeScript `render` with `libraries` (C9).
<!-- file: prose.md -->
**Requirement.** A block marked `library="name"` declares components for the rest of its page;
later blocks write `import "#name"`:

````markdown
```mockitdown library="cards" source="true"
struct Pill: View {
  var text: String
  var body: some View { Text(text).padding(4).border(.separator) }
}
```

```mockitdown
import "#cards"
HStack { Pill(text: "On"); Pill(text: "Off") }
```
````

The web components use `<mockitdown-library name="cards">` the same way.

**Rationale.** A page often needs one component for several of its mockups without a site-wide
library file. The `#` keeps page libraries apart from the import map's namespaces, and "earlier on
the page" matches how Python-Markdown converts a page, top to bottom, and how a reader reads it.

**Verification.** TC-1 (site pages), TC-2 (web components).
