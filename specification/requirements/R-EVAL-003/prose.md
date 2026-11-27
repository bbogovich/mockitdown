Structs shadow pack elements, so a site can override a pack's element with its own component of
the same name. Literals render as text so that `"Hello"` on its own line is a valid view, as in
a SwiftUI `ViewBuilder`.

**Dotted element names (F-2.C7, SRC-12#s13).** Component libraries name sub-components with a dot
(`Badge.Ribbon`, `Card.Meta`). Packs keep their joined names (`BadgeRibbon`), and a dotted call resolves
to the joined name, so both spellings work and no pack changes. `Color.red` keeps its own meaning (C6).
