---
id: TC-2
title: Dotted element names
verifies: [C9, C10]
---

Conformance cases `eval-dotted-names`, `eval-dotted-names-unknown` and `eval-dotted-names-variable` in both
suites (pack `antd`): `Badge.Ribbon("New")` renders the same element as `BadgeRibbon("New")` with
`data-el="Badge.Ribbon"`; `Color.red` still makes a colour; `Nope.Thing { Text("in") }` is an `unknown`
error naming `Nope.Thing`, its `unknown` view holding the `Text`; a `let` named `Badge` makes
`Badge.Ribbon` a member access (an unknown-modifier warning), not a dotted name.

Unit tests in both suites, `python/tests/test_dotted_names.py` and `typescript/tests/unit/dotted-names.test.ts`:
the same cases, plus a dotted call with modifiers and as a `let` value, a dotted call resolving a struct
of the joined name (`Card.Meta()` calls `CardMeta`), a three-part name (`A.B.C()`) and edit mode marking the
dotted node (`data-mkd-node`).
