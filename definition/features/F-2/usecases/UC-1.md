---
id: UC-1
title: Paste a SwiftUI view into the specification
---

**Actor:** developer. **Precondition:** an existing SwiftUI view in the application.

1. The developer copies the view's `struct … : View` declaration into a ```` ```mockitdown ```` block.
2. The developer adds `import SwiftUI` (or `pack="swiftui"` on the fence).
3. The site is built.

**Outcome:** the page shows the view in SwiftUI style; property wrappers, bindings and event
handlers in the pasted code are tolerated; elements the pack does not know are flagged with a
located error and drawn as labelled placeholders.
