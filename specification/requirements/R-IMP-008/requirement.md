---
id: R-IMP-008
title: Library blocks on a page
status: active
version: 0.12.11
rev: 1
page: IMP.1
slot: reqs
order: 8
hash: 30dfe98f1970
source: [SRC-19]
realizes: [F-4, F-11]
requires: [R-IMP-007, R-MDX-003]
constrained_by: [A-MDX-2, A-EVAL-1]
decisions: [ADR-24]
refs: [R-IMP-001, R-MDX-005, R-WEB-002]
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
