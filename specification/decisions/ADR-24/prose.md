The developer asked for import paths to work like a virtual file system — a map from namespaces to
locations, as TypeScript's `paths` does — for several component libraries with overlapping names to
coexist, for components defined on the same page to be importable, and for components to act as
templates whose users override values and fill content. SwiftUI already has the template mechanism:
`@ViewBuilder` properties (the developer's "@ContentBuilder"), so no new syntax is added for it.
