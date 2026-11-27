---
id: F-17
title: Mockups embedded in web pages
status: active
version: 0.5.0
rev: 0
page: FEAT.3
slot: features
order: 2
hash: 2c9169e2d23d
family: web
source: [SRC-8]
requires: [F-16]
---

G1: Web applications need to show mockitdown mockups inside their own pages without a documentation build.
C1: A web component `mockitdown-mockup` renders one mockup in place in an HTML page.
C2: The mockup's code is the component's only child, a `<script type="text/mockitdown">` element, so the browser does not parse it as markup.
C3: The code is the same language as the Markdown fence, with the same options (pack, device, appearance, title) and the same import mechanisms for packs and reusable components.
C4: The component re-renders when its code or its options change.
C5: Diagnostics are shown in place of the mockup and reported to the page, as the Markdown variant reports them to the build.
C6: The TypeScript variant is published as an NPM package with no runtime dependencies and no server part.
AC1: A page that loads the package and contains a `mockitdown-mockup` with a script child shows the rendered mockup in the chosen pack's style.
AC2: Code containing `<`, `>` and `&` renders exactly as the same code in a Markdown fence.
AC3: Changing the script's text or an option attribute updates the rendered mockup.
AC4: An invalid mockup shows its diagnostics in place and does not break the rest of the page.
AC5: All tags of the TypeScript variant begin with `mockitdown-`.
<!-- file: prose.md -->
**Problem.** Mockups written for documentation also need to appear in web applications, notably online design tools (SRC-8).

**Change.** A `<mockitdown-mockup>` element renders the code it carries. The request named a CDATA child; in an HTML document the parser turns CDATA into a comment that ends at the first `>`, so the developer chose a `<script type="text/mockitdown">` child instead (SRC-8#clar-script):

```html
<mockitdown-mockup pack="fluent" device="desktop">
  <script type="text/mockitdown">
    VStack { Text("Hello").font(.title); Button("OK") }
  </script>
</mockitdown-mockup>
```
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Show a mockup in a web application
---

**Actor:** web developer.

1. The developer adds the mockitdown package to the page.
2. The developer writes a `mockitdown-mockup` element with a `pack` attribute and a `<script type="text/mockitdown">` child holding the mockup code.
3. The page loads.

**Outcome:** the mockup appears in place, styled after the chosen framework, exactly as the same code renders in a Markdown site.
