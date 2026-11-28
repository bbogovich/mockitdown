---
id: R-EVAL-011.CR-2
target: R-EVAL-011
kind: clarification
version: 0.12.9
date: 2026-11-27
issue: 58
summary: "test cases backfilled: TC-1 verifies C1-C5 (#58)"
from: fce4708196ec
to: b79647cd4e14
---

## Clauses

(none)

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,16 @@
+---
+id: TC-1
+title: A pasted SwiftUI view
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_evaluate.py` `PastedSwiftUITests`: a pasted settings view with
+`@State`, `@Binding`, `@ObservedObject`, `@Environment(\.colorScheme)`, a `public static let`,
+`return`, `some View`, type annotations, a force unwrap, `import Combine`, `$wifi`, `.onTapGesture` and
+`.onAppear` closures calling unknown functions and an `action:`/`perform:` closure renders an on toggle
+and its texts with no diagnostics (C1-C5, V1). `@ViewBuilder` marks view properties, computed and slot,
+while another attribute leaves an ordinary property (C1); access and `static` modifiers, conformance
+lists, `return`, optional types, force unwraps and key paths are accepted silently (C2); the ten neutral
+modules select no pack and draw no warning, alongside `import SwiftUI` too, while an unknown module warns
+(C3); `$name` and `.constant(x)` read the value (C4); action closures and behaviour-only modifiers'
+closures produce no views and no diagnostics (C5).
```
