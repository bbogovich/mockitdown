---
id: F-2
title: SwiftUI-syntax notation
status: active
version: 0.2.0
rev: 0
page: FEAT.1
slot: features
order: 2
family: authoring
source: [SRC-2, SRC-3]
hash: 5a32f9e2a2c1
---

G1: Authors and developers need a mockup notation that is already familiar, expressive enough for real screens and close to how the final application is written.
C1: The notation follows Swift and SwiftUI syntax: view structs with properties and a `body`, element calls with positional and labelled arguments, modifier chains with a leading dot, trailing and labelled trailing closures.
C2: The notation supports data-driven layout: `let` bindings, arrays, dictionaries, tuples and ranges, `ForEach` with closure parameters, `if`/`else`, the ternary operator and string interpolation `\(…)`.
C3: SwiftUI code pasted from a real project renders where its elements exist in the chosen pack: behaviour-only modifiers, property wrappers, bindings and `#Preview` blocks are accepted and ignored or unwrapped.
C4: The notation is declarative: it describes one visual state of a screen and has no runtime behaviour (actions, gestures and state changes are not executed).
C5: Metadata for a screen (title, id, device, appearance, chrome, pack) can be written in the source with an `@Screen(…)` directive.
C6: The same notation is used for every UI framework; only the available element names differ (F-3).
AC1: A SwiftUI view body built from stacks, lists, forms, controls, navigation and modifiers renders without errors in the SwiftUI pack.
AC2: A block using `ForEach` over an array of tuples with named closure parameters renders one element per array item with the tuple values in place.
AC3: Pasting a SwiftUI struct that uses `@State`, `$binding`, `.onTapGesture` and `.animation` produces no error.
<!-- file: prose.md -->
**Problem.** A bespoke mockup language must be learnt and has no tooling; drawing tools do not
read as text. The prototype's notation (`mockitout: 1`, `screen`, `component`, `@id`) was its own
dialect (SRC-3).

**Change.** The notation is a declarative subset of Swift and SwiftUI. Developers recognise it,
editors highlight it as Swift, and real SwiftUI code can be pasted in. The same syntax describes a
Fluent, Material or SAPUI5 screen — only the element names change.
<!-- file: usecases/UC-1.md -->
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
<!-- file: usecases/UC-2.md -->
---
id: UC-2
title: Generate rows from data
---

**Actor:** specification author.

1. The author declares `let people = [("Ana", "Design"), ("Ben", "Engineering")]`.
2. The author writes `List { ForEach(people) { name, team in Row(name, subtitle: team) } }`.

**Outcome:** the mockup shows one row per person; adding a tuple adds a row.
