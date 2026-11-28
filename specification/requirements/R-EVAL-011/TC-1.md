---
id: TC-1
title: A pasted SwiftUI view
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_evaluate.py` `PastedSwiftUITests`: a pasted settings view with
`@State`, `@Binding`, `@ObservedObject`, `@Environment(\.colorScheme)`, a `public static let`,
`return`, `some View`, type annotations, a force unwrap, `import Combine`, `$wifi`, `.onTapGesture` and
`.onAppear` closures calling unknown functions and an `action:`/`perform:` closure renders an on toggle
and its texts with no diagnostics (C1-C5, V1). `@ViewBuilder` marks view properties, computed and slot,
while another attribute leaves an ordinary property (C1); access and `static` modifiers, conformance
lists, `return`, optional types, force unwraps and key paths are accepted silently (C2); the ten neutral
modules select no pack and draw no warning, alongside `import SwiftUI` too, while an unknown module warns
(C3); `$name` and `.constant(x)` read the value (C4); action closures and behaviour-only modifiers'
closures produce no views and no diagnostics (C5).
