**Problem.** Mockups written for documentation also need to appear in web applications, notably online design tools (SRC-8).

**Change.** A `<mockitdown-mockup>` element renders the code it carries. The request named a CDATA child; in an HTML document the parser turns CDATA into a comment that ends at the first `>`, so the developer chose a `<script type="text/mockitdown">` child instead (SRC-8#clar-script):

```html
<mockitdown-mockup pack="fluent" device="desktop">
  <script type="text/mockitdown">
    VStack { Text("Hello").font(.title); Button("OK") }
  </script>
</mockitdown-mockup>
```

**Re-checked at definition 0.9.1.** F-16.CR-1 adds role rules and typed parameters as shared data that only the design tools read; embedding a mockup in a web page is unchanged.

**Release builds on GitHub (SRC-18#gallery).** A web project needs a released build to depend on.
Each TypeScript release is attached to a GitHub release as the archive `npm pack` makes, which `npm
install` accepts by its URL; the gallery's home page links to it.
