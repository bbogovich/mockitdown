This is the core of SwiftUI's look: `VStack { … }`, `Section("Header") { … } footer: { … }`,
and modifiers stacked on their own lines. Requiring a call's `(` and a trailing closure's `{` on the
same line is what makes newline-separated statements unambiguous — the same rule Swift applies.
