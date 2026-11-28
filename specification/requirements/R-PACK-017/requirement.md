---
id: R-PACK-017
title: Typed parameters and modifiers
status: active
version: 0.12.12
rev: 5
page: PACK.3
slot: reqs
order: 2
hash: 91eaa20c3a80
source: [SRC-12]
realizes: [F-16]
requires: [R-PACK-016]
constrained_by: [A-REPO-1, M-PACK-2, M-PACK-3]
refs: [M-PACK-2, R-EVAL-004]
---

C1: Each rule of `roles.json` MUST carry `params`, an object mapping every labelled argument its role understands (R-EVAL-004.C7) to a type.
C2: A type MUST be one of `text`, `number`, `bool`, `color`, `icon`, `enum` and `array`, written as the name or as an object `{"type": …}`, where `enum` names its `values`, `array` names the type of its `items`, and `number` MAY name `min` and `max`.
C3: An element definition in `pack.json` MAY carry `types` (M-PACK-2), an object of parameter names and types that adds to or overrides its role's `params` for that element; `params` (M-PACK-2.F3) MUST stay a list of names.
C4: The type of `variant` MUST be an `enum` of the variants the element declares (M-PACK-2.F5).
C5: `shared/language/vocabulary.json` MUST also hold `modifiers`, an object mapping every rendered modifier to `{"group", "args"}`, the group being one of `layout`, `typography`, `colour`, `presentation`, `annotations` and `other`, and `args` listing each argument's label (or `null`) and type.
C6: The TypeScript core MUST export `parameterTypes(pack, element)`, the element's role `params` with its own `types` applied, and `modifierTypes()`, the vocabulary's `modifiers`.
C7: Loading the types MUST change neither the rendered HTML nor the diagnostics of any conformance case in either variant.
C8: A shared test MUST fail when a rule has no `params`, a type is unknown, an element's `types` names a type that is unknown, or a rendered modifier has no entry in `modifiers`.
V1: `parameterTypes("base", "Toggle")` gives `isOn` as `bool`, `parameterTypes` of an element with declared variants gives `variant` as an `enum` of them, and the conformance suites pass unchanged.
