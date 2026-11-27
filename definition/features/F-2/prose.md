**Problem.** A bespoke mockup language must be learnt and has no tooling; drawing tools do not
read as text. The prototype's notation (`mockitout: 1`, `screen`, `component`, `@id`) was its own
dialect (SRC-3).

**Change.** The notation is a declarative subset of Swift and SwiftUI. Developers recognise it,
editors highlight it as Swift, and real SwiftUI code can be pasted in. The same syntax describes a
Fluent, Material or SAPUI5 screen — only the element names change.

**Dotted element names (SRC-12#s13).** Component libraries name sub-components with a dot
(`Badge.Ribbon`, `Card.Meta`); packs had to join them (`BadgeRibbon`). Both spellings now work.
