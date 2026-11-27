This is the core of SwiftUI's look: `VStack { … }`, `Section("Header") { … } footer: { … }`,
and modifiers stacked on their own lines. Requiring a call's `(` and a trailing closure's `{` on the
same line is what makes newline-separated statements unambiguous — the same rule Swift applies.

A dotted element name such as `Badge.Ribbon("New")` parses as one call with a dotted callee (C8); the
evaluator resolves it (R-EVAL-003.C9).
