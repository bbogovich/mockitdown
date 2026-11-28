---
id: R-PACK-017
title: Typed parameters and modifiers
status: active
version: 0.13.12
rev: 6
page: PACK.3
slot: reqs
order: 2
hash: d06e1a7c5f68
source: [SRC-12]
realizes: [F-16]
requires: [R-PACK-016]
constrained_by: [A-REPO-1, M-PACK-2, M-PACK-3]
refs: [M-PACK-2, R-EVAL-004]
---

C1: `roles.json` MUST carry `params` at its top level, an object mapping each label every role reads through the common element markup to a type, and each of its rules MUST carry `params`, an object mapping each other label its role reads (R-EVAL-004.C8) to a type, without repeating a common label.
C2: A type MUST be one of `text`, `number`, `bool`, `color`, `icon`, `enum` and `array`, written as the name or as an object `{"type": …}`, where `enum` names its `values`, `array` names the type of its `items`, and `number` MAY name `min` and `max`.
C3: An element definition in `pack.json` MAY carry `types` (M-PACK-2), an object of parameter names and types that adds to or overrides its role's `params` for that element; `params` (M-PACK-2.F3) MUST stay a list of names.
C4: The type of `variant` MUST be an `enum` of the variants the element declares (M-PACK-2.F5).
C5: `shared/language/vocabulary.json` MUST also hold `modifiers`, an object mapping every rendered modifier to `{"group", "args"}`, the group being one of `layout`, `typography`, `colour`, `presentation`, `annotations` and `other`, and `args` listing each argument's label (or `null`) and type.
C6: The TypeScript core MUST export `parameterTypes(pack, element)`, taking a pack id or a loaded pack, which returns the common `params`, then the element's role `params`, then its own `types`, the common ones alone for an element the pack does not define, and `modifierTypes()`, the vocabulary's `modifiers`, each type in its object form (`{"type": "bool"}`).
C7: Loading the types MUST change neither the rendered HTML nor the diagnostics of any conformance case in either variant.
C8: A shared test MUST fail when a rule has no `params`, a type is unknown, an element's `types` names a type that is unknown, or a rendered modifier has no entry in `modifiers`.
C9: If no role rules are loaded or the pack is unknown, then `parameterTypes` MUST throw a `MockitdownError`.
V1: `parameterTypes("base", "Toggle")` gives `isOn` as `bool`, `parameterTypes` of an element with declared variants gives `variant` as an `enum` of them, and the conformance suites pass unchanged.
