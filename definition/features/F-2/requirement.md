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
