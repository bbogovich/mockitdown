---
id: R-EVAL-011
title: Tolerance for pasted SwiftUI
status: active
version: 0.2.0
rev: 0
page: LANG.2
slot: reqs
order: 11
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-EVAL-1, A-SYN-2]
decisions: [ADR-2]
reverse_engineered: true
hash: b0409b83f3f7
---

C1: The evaluator MUST ignore property attributes (`@State`, `@Binding`, `@Environment(…)`, `@ObservedObject`, …) other than `@ViewBuilder`, which marks a view property.
C2: The evaluator MUST ignore access and `static` modifiers, conformance lists, `return`, `some`, type annotations, key paths and force unwraps.
C3: When `import` names one of the modules `Foundation`, `Combine`, `Observation`, `UIKit`, `AppKit`, `SwiftData`, `Charts`, `MapKit`, `PhotosUI` or `WebKit`, the evaluator MUST accept it without selecting a pack and without a warning.
C4: The evaluator MUST evaluate `$binding` as the bound value and `.constant(x)` as `x`, so `Toggle("Wi-Fi", isOn: $wifi)` reads `wifi`.
C5: The evaluator MUST NOT evaluate closures passed as action arguments (R-EVAL-004.C5) nor the trailing closures of behaviour-only modifiers (`.onTapGesture { … }`, `.onAppear { … }`), so their contents produce no views and no diagnostics.
V1: A pasted view with `@State private var wifi = true`, `import Combine`, `Toggle("Wi-Fi", isOn: $wifi)` and `.onTapGesture { wifi.toggle() }` renders an on toggle with no diagnostics.
<!-- file: prose.md -->
Pasting real code is a primary use case (F-2.UC-1). Everything that only matters at run time is
accepted and dropped; `@State` values become the state the mockup shows.

**Known deviation.** The implementation on `main` (0.1.0) evaluates a behaviour-only modifier's
trailing closure before discarding it, so `.onTapGesture { wifi.toggle() }` draws a spurious
`unknown modifier .toggle()` warning. C5 states the intended behaviour; see the implementation's
known-debt list.
