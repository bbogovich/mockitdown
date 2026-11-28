Components behave like SwiftUI views: memberwise arguments, defaults, a trailing closure for
content. Struct bodies are isolated from the caller's scope, as Swift's are, so a component behaves
the same wherever it is used. A component cannot contain itself: recursion is not valid for a UI component, and a struct that
uses itself twice would otherwise expand exponentially. The evaluator decides this from the
declarations before expanding anything (a depth-first search over the struct-use graph), so
`struct Row` with `VStack { Row(); Row() }` is reported at once as "struct Row uses itself
(Row → Row)" and the rest of the mockup still renders. The 48-level depth limit remains only as a
backstop for a long chain of distinct structs.
