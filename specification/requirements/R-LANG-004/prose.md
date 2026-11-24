Components are SwiftUI view structs: stored properties become parameters, `body` is the view.
Only declarations are supported — no initialisers, methods or generics — which keeps the notation
declarative while still accepting most real view structs. Computed `some View` properties are
supported because SwiftUI code uses them to split a body into parts.
