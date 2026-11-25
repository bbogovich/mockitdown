**Problem.** Mockups written for documentation also need to appear in web applications, notably online design tools (SRC-8).

**Change.** A `<mockitdown-mockup>` element renders the code it carries. The request named a CDATA child; in an HTML document the parser turns CDATA into a comment that ends at the first `>`, so the developer chose a `<script type="text/mockitdown">` child instead (SRC-8#clar-script):

```html
<mockitdown-mockup pack="fluent" device="desktop">
  <script type="text/mockitdown">
    VStack { Text("Hello").font(.title); Button("OK") }
  </script>
</mockitdown-mockup>
```
