---
id: TC-2
title: Commands for a host menu
verifies: [C8, C9]
---

`node:test` (`typescript/tests/unit/restructure.test.ts`, IT-65): `session.commands` lists the sixteen
commands in menu order with their labels and shortcuts, all but paste and the three mockup commands disabled with nothing selected,
for a leaf at the first position moveUp and unwrap disabled, unwrap enabled on a container, undo after
a step; `session.run("wrap", {name: "VStack"})` gives the code `session.wrap("VStack")` gives, `run`
undoes and copies, and refuses an unknown name. Browser test (`typescript/tests/browser/commands.spec.mjs`,
IT-65) on `pages/designer.html`: with the Inbox title and list selected, Cmd/Ctrl+G wraps them in a
`VStack` (hand-written code), Shift+Cmd/Ctrl+G unwraps back to the sample with both selected, and
Cmd/Ctrl+Z undoes the unwrap.
