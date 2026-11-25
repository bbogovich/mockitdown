---
id: R-WEB-002
title: The mockitdown-mockup element
status: active
version: 0.6.0
rev: 0
page: WEB.1
slot: reqs
order: 2
hash: 7d428a930c36
source: [SRC-8]
realizes: [F-17]
requires: [R-WEB-001]
constrained_by: [ADR-19]
---

C1: Loading the package entry `dist/mockitdown.js` MUST define the custom element `mockitdown-mockup`, and every custom element of the package MUST have a tag beginning with `mockitdown-`.
C2: The mockup element MUST take its code from its first child `<script type="text/mockitdown">`, with the common leading indentation of its lines removed; other children MUST be ignored.
C3: The mockup element MUST accept the fence attributes of R-MDX-003 as HTML attributes with the same names and meanings (`pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, `width`, `height`, `caption`, `elements`, `source`), plus `import-base` and `asset-base` (URLs, default: the document's base URL).
C4: The mockup element MUST render into an open shadow root holding the stylesheet for the packs used and the rendered HTML.
C5: The mockup element MUST re-render when an observed attribute changes or the script's text changes.
C6: When rendering produces diagnostics, the mockup element MUST show them as the Python variant's error box does and MUST dispatch a `mockitdown-diagnostics` event whose `detail` lists them.
C7: An error in one mockup element MUST NOT stop other mockup elements on the page from rendering.
C8: The mockup element MUST expose the properties `code` (get and set the code), `diagnostics` (the last render's diagnostics) and `rendered` (a promise that resolves after the next render).
C9: If the script child contains `</script`, the page cannot carry it; the element's documentation MUST say so and SHOULD suggest setting `code` by script.
V1: The browser tests mount mockup elements with code containing `<`, `>` and `&`, change attributes and code, and compare the shadow root's HTML with the conformance output.
<!-- file: TC-1.md -->
---
id: TC-1
title: Script child with markup characters
verifies: [C2]
---

Automated by `typescript/tests/browser/mockup.spec.ts`: code with `Text("a < b && c > d")` renders the text verbatim and the HTML equals the conformance output.
<!-- file: TC-2.md -->
---
id: TC-2
title: Re-render on change
verifies: [C5]
---

Automated by `typescript/tests/browser/mockup.spec.ts`: changing `pack` and then the script text updates the rendering; `rendered` resolves after each.
<!-- file: TC-3.md -->
---
id: TC-3
title: Diagnostics isolated
verifies: [C7]
---

Automated by `typescript/tests/browser/mockup.spec.ts`: a page with one invalid and one valid mockup shows the error box in the first, renders the second, and fires one `mockitdown-diagnostics` event.
<!-- file: prose.md -->
The renderer element of SRC-8, with the script child chosen in place of CDATA (ADR-19).
