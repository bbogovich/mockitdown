**Requirement.** A component is a template: its value properties are overridable defaults and its
`@ViewBuilder` properties are content slots. The trailing closure fills `content`; labelled closures
or labelled view arguments fill the other slots; an unfilled slot shows its default or, when its
type is optional, nothing.

```swift
struct AppShell: View {
  var title = "App"
  @ViewBuilder var sidebar: some View = Text("Navigation")
  @ViewBuilder var toolbar: (some View)?
  @ViewBuilder var content: some View
  var body: some View {
    HStack { sidebar; VStack { HStack { Text(title).font(.title); Spacer(); toolbar }; content } }
  }
}

AppShell(title: "Orders", toolbar: Button("New order")) {
  Table { … }
}
```

**Rationale.** This is SwiftUI's own mechanism (the request's "@ContentBuilder" is `@ViewBuilder`),
so the same code stays valid Swift (ADR-10.C1). Before this requirement the trailing closure went to
the first view property even when that one had a default, which made a defaulted slot declared
before `content` unusable.

**Verification.** TC-1 and the conformance case `template-slots`.
