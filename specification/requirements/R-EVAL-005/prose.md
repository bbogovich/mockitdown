Components behave like SwiftUI views: memberwise arguments, defaults, a trailing closure for
content. Struct bodies are isolated from the caller's scope, as Swift's are, so a component behaves
the same wherever it is used. The recursion limit protects the build from a component that
contains itself.
