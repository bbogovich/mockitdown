---
id: ADR-2
title: The notation is a declarative subset of Swift and SwiftUI
status: active
version: 0.2.0
rev: 0
page: ADR.1
slot: decisions
order: 2
source: [SRC-2, SRC-3]
constrains: [R-LANG-001, R-LANG-003, R-LANG-004, R-EVAL-010, R-EVAL-011]
hash: ce8ad0048282
---

D1: The mockup notation is a declarative subset of Swift/SwiftUI: `import`, `struct` views with properties and `body`, element calls, modifier chains, trailing and labelled trailing closures, `ForEach` with closure parameters, `if`/`else`, `let`, the ternary operator, string interpolation `\(…)` and `#Preview`.
D2: It replaces the prototype notation (`mockitout: 1`, `screen … kit: … form: …`, `component`, `@id`, `@ref`, `form <device>` overrides).
D3: Element identifiers are written as the modifiers `.id()` and `.ref()`, which keep the Elements table; screen metadata is the directive `@Screen(title:id:device:appearance:…)`, which fence attributes override.
D4: Per-device `form` overrides are retired; a mockup per device is written as one block per device.
O1: rejected: keep the prototype's notation — its own dialect, with no editor support, and not what SRC-2 asks for ("follows the same syntax" as SwiftUI view structs).
O2: rejected: YAML or JSON descriptions — verbose for nested layouts and unfamiliar as UI code.
O3: rejected: full Swift — needs a Swift toolchain or an interpreter, and executes code at build time.
O4: rejected: keep per-device `form` overrides — a second syntax for a rare need; separate blocks are clearer and can differ freely.
C1: Developers read and paste mockups as ordinary SwiftUI; editors highlight blocks as Swift.
C2: The evaluator must tolerate run-time-only Swift (property wrappers, bindings, behaviour modifiers) by ignoring it.
C3: Non-SwiftUI frameworks are written in the same syntax with their own element names.
<!-- file: prose.md -->
**Context.** SRC-2 asks for a block structure "similar to SwiftUI view structs" that "follows the
same syntax". The prototype's notation (SRC-3) was brace-delimited but bespoke.

**Decision.** Adopt Swift syntax wholesale for everything declarative, and nothing else: no
functions, initialisers, generics or mutation. Metadata and identifiers become Swift-shaped too
(`@Screen`, `.id()`, `.ref()`).

**Consequences.** The grammar is larger than the prototype's but familiar; the language reference
documents the exact subset, and unsupported Swift fails with a clear syntax error.
