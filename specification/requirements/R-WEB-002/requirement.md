---
id: R-WEB-002
title: The mockitdown-mockup element
status: active
version: 0.12.12
rev: 9
page: WEB.1
slot: reqs
order: 2
hash: dd7ed92fe04d
source: [SRC-8, SRC-12]
realizes: [F-17]
requires: [R-WEB-001]
constrained_by: [ADR-19]
refs: [R-EDIT-004, R-IMP-002, R-IMP-008, R-MDX-003]
---

C1: Loading the package entry `dist/mockitdown.js` MUST define the custom element `mockitdown-mockup`, and every custom element of the package MUST have a tag beginning with `mockitdown-`.
C2: The mockup element MUST take its code from its first child `<script type="text/mockitdown">`, with a first line and a last line holding only whitespace dropped and the common leading indentation of the remaining lines removed; other children MUST be ignored.
C3: The mockup element MUST accept the fence attributes of R-MDX-003 as HTML attributes with the same names and meanings (`pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, `width`, `height`, `caption`, `elements`, `source`, `window` and `windowed`, which the fence also accepts, but not `library`, R-IMP-008.C8), plus `import-base` and `asset-base` (URLs, default: the document's base URL); `import-base` is the base against which the import map's relative targets resolve, and the root target when the map has no empty key.
C4: The mockup element MUST render into an open shadow root holding the stylesheet for the packs used and the rendered HTML.
C5: The mockup element MUST re-render when an observed attribute changes or the script's text changes.
C6: When rendering produces diagnostics, the mockup element MUST show them as the Python variant's error box does and MUST dispatch a bubbling, composed `mockitdown-diagnostics` event whose `detail.diagnostics` lists them.
C7: An error in one mockup element MUST NOT stop other mockup elements on the page from rendering.
C8: The mockup element MUST expose the properties `code` (get and set the code), `diagnostics` (the last render's diagnostics) and `rendered` (a promise that resolves after the next render, at once when the element is rendered and up to date, and never rejects).
C9: If the script child contains `</script`, the page cannot carry it; the element's documentation MUST say so and SHOULD suggest setting `code` by script.
C10: The mockup element MUST read a boolean attribute that is present with an empty value as true.
C11: If an attribute of C3 has an invalid value, then the mockup element MUST report a fence error (code `fence`) as R-MDX-003.C4 does, after the render's diagnostics, and place an error box listing the fence errors above the rendering; attributes not named in C3 MUST be ignored.
C12: If the mockup element cannot render (the shared assets fail to load, or rendering throws), then it MUST show an error box holding one error of code `element` that names the cause.
V1: The browser tests mount mockup elements with code containing `<`, `>` and `&`, change attributes and code, and compare the shadow root's HTML with the conformance output.
C13: The mockup element MUST accept the boolean attribute `edit`, which renders with the `edit` option (R-EDIT-004.C1); like `import-base` and `asset-base`, it is not a fence attribute.
C14: The mockup element MUST take the document's import map from the first `<script type="mockitdown-imports">` element in the document, whose text is a JSON object of the form of R-IMP-002.C7 and C8, and MUST apply its `imports` attribute, a JSON object of the same form, on top of it for that element, its keys replacing the document's.
C15: If the document's import map or an `imports` attribute is not valid JSON of that form, then the mockup element MUST report the error "invalid import map: <reason>" with code `import` and render with the map ignored.
