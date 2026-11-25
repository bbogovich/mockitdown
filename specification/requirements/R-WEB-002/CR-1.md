---
id: R-WEB-002.CR-1
target: R-WEB-002
kind: revision
version: 0.6.6
date: 2026-11-25
issue: 6
summary: "as built (#6): C2 drops the script's first and last blank lines before dedenting; C3 adds window; C6 bubbling composed event with detail.diagnostics; C8 rendered resolves at once when up to date and never rejects; C10 empty boolean attribute is true; C11 fence errors for invalid attributes, other attributes ignored; C12 error box of code element when the element cannot render; TCs name mockup.spec.mjs; reviewed against R-WEB-001@0.6.4"
from: 7d428a930c36
to: eea2354c57af
---

## Clauses

@ C2 edit
~ The mockup element MUST take its code from its first child `<script type="text/mockitdown">`, with {+a first line and a last line holding only whitespace dropped and +}the common leading indentation of [-its-]{+the remaining+} lines removed; other children MUST be ignored.
@ C3 edit
~ The mockup element MUST accept the fence attributes of R-MDX-003 as HTML attributes with the same names and meanings (`pack`, `device`, `appearance`, `chrome`, `title`, `id`, `url`, `width`, `height`, `caption`, `elements`, [-`source`),-]{+`source`, and `window`, which the fence also accepts),+} plus `import-base` and `asset-base` (URLs, default: the document's base URL).
@ C6 edit
~ When rendering produces diagnostics, the mockup element MUST show them as the Python variant's error box does and MUST dispatch a {+bubbling, composed +}`mockitdown-diagnostics` event whose [-`detail`-]{+`detail.diagnostics`+} lists them.
@ C8 edit
~ The mockup element MUST expose the properties `code` (get and set the code), `diagnostics` (the last render's diagnostics) and `rendered` (a promise that resolves after the next [-render).-]{+render, at once when the element is rendered and up to date, and never rejects).+}
@ C10 insert after C9
+ The mockup element MUST read a boolean attribute that is present with an empty value as true.
@ C11 insert after C10
+ If an attribute of C3 has an invalid value, then the mockup element MUST report a fence error (code `fence`) as R-MDX-003.C4 does, after the render's diagnostics, and place an error box listing the fence errors above the rendering; attributes not named in C3 MUST be ignored.
@ C12 insert after C11
+ If the mockup element cannot render (the shared assets fail to load, or rendering throws), then it MUST show an error box holding one error of code `element` that names the cause.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,2 +6,2 @@
 
-Automated by `typescript/tests/browser/mockup.spec.ts`: code with `Text("a < b && c > d")` renders the text verbatim and the HTML equals the conformance output.
+Automated by `typescript/tests/browser/mockup.spec.mjs`: code with `Text("a < b && c > d")` renders the text verbatim and the HTML equals the conformance output.
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,2 +6,2 @@
 
-Automated by `typescript/tests/browser/mockup.spec.ts`: changing `pack` and then the script text updates the rendering; `rendered` resolves after each.
+Automated by `typescript/tests/browser/mockup.spec.mjs`: changing `pack` and then the script text updates the rendering; `rendered` resolves after each.
--- a/TC-3.md
+++ b/TC-3.md
@@ -6,2 +6,2 @@
 
-Automated by `typescript/tests/browser/mockup.spec.ts`: a page with one invalid and one valid mockup shows the error box in the first, renders the second, and fires one `mockitdown-diagnostics` event.
+Automated by `typescript/tests/browser/mockup.spec.mjs`: a page with one invalid and one valid mockup shows the error box in the first, renders the second, and fires one `mockitdown-diagnostics` event.
--- a/prose.md
+++ b/prose.md
@@ -1 +1,31 @@
 The renderer element of SRC-8, with the script child chosen in place of CDATA (ADR-19).
+
+```html
+<script type="module" src="node_modules/mockitdown/dist/mockitdown.js"></script>
+
+<mockitdown-mockup pack="mui" device="phone" import-base="mockups/">
+  <script type="text/mockitdown">
+    import "components/pill"
+    VStack {
+      Text("a < b && c > d")
+      StatusPill(text: "Online")
+    }
+  </script>
+</mockitdown-mockup>
+```
+
+The script's text reaches the element exactly as written, so `<`, `>` and `&` need no escaping. The
+line break after `<script …>` and the indentation before `</script>` are dropped, and the indentation
+common to the lines is removed, so the code is what a Markdown fence holding the same lines would
+contain. The one thing a page cannot put in the script is `</script` — it ends the element. Code that
+contains it (in a string, say) is set from a script instead: `element.code = source`.
+
+The attributes are the fence's, with the fence's meanings; as in HTML, a boolean attribute written
+without a value (`<mockitdown-mockup elements source>`) is on. Other attributes (`class`, `style`,
+`data-*`) belong to the page and are ignored. Note that `id` and `title` are also global HTML
+attributes: on a mockup element they name and caption the figure as well as the element.
+
+Every element renders on its own: a syntax error, a bad attribute or a missing import shows the error
+box in that element only, and the page hears about it through the `mockitdown-diagnostics` event,
+which bubbles out of shadow roots. `await element.rendered` waits for the render a change has
+started; it is the hook tests and editors use after setting an attribute or `code`.
```
