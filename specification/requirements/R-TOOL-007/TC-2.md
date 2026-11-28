---
id: TC-2
title: Typed controls and validation
verifies: [C2, C3, C5, C6, C7, C9, C12, C13, C14, C15, C16]
---

`node:test` (`tests/unit/inspect.test.ts`, IT-63) and a browser test (`tests/browser/inspector.spec.mjs`)
on the hand-written `fixtures/inspector-sample.mkdesign` (base): a `Button` with a label, `systemImage`,
`color`, `role`, `loading`, `elevation` and an unknown `bogus:`, `.frame(width: 80)`,
`.padding(.horizontal, 8)` and `.id("save")`, a `Breadcrumb(items: [...])` and a `Text` with
`.id("taken")`. Each type of R-PACK-017.C2 gets its control and the unknown label a code field; a
parameter written with its label is listed once; Add argument offers only unused labels, sorted; Add
modifier omits modifiers in the chain and `.id`; `.frame(width: -10)`, a non-number and a bad colour
are shown invalid with their messages and the code is unchanged; an unknown icon is refused with the
diagnostic's text; `bogus:` shows "not understood by this pack" and can be removed; a duplicate `.id` is
refused; values, a state modifier, a comment, references, an added argument and modifier are written as
hand-written code expects, each one change; two selected nodes show "2 selected" and no fields.
