---
id: R-LANG-004.CR-1
target: R-LANG-004
kind: revision
version: 0.12.0
date: 2026-11-27
summary: "SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide"
from: 1c78f0d2de3f
to: 6635d6616b5a
---

## Clauses

@ C6 edit
~ A property MUST count as view-typed when it carries `@ViewBuilder` or its type, with spaces [-removed,-]{+removed and one trailing `?` and enclosing parentheses ignored,+} is `someView`, `View`, `Content` or `AnyView`, or ends in `->someView` or [-`->Content`.-]{+`->Content`; a view-typed property whose type ends in `?` is optional.+}

## Files

```diff
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,7 @@
+---
+id: TC-2
+title: Optional view properties
+verifies: [C6]
+---
+
+`@ViewBuilder var toolbar: (some View)?`, `var footer: some View?` and `var x: Content?` are view-typed and optional; `var t: String?` is neither. Automated in the parser tests of both variants.
```
