---
id: TC-2
title: Mockup commands
verifies: [C4, C5, C6, C7, C8]
---

`node:test` (`mockup-commands.test.ts`, IT-71) with hand-computed values: `duplicateMockupName`
(`Inbox copy`, `Inbox copy 2`, a gap, a lowercase name that does not count, a copy of a copy);
`newMockup`, `duplicateMockup` (`Inbox copy` at (860, 0), then `Inbox copy 2` at (1240, 0), options and
unknown keys copied, a named mockup copied beside itself) and `deleteMockup` (the next, then the previous
mockup made active, a named inactive one leaving the active mockup, the last one leaving none) each
record one undo step with a `change` of kind `mockups` and undo to the previous document; refusals
change nothing; `session.run` with `{mockup}`; `session.commands` lists the three with their labels and
enabled states. Browser part (`mockups.spec.mjs`): `run("duplicateMockup")` and `run("deleteMockup")`
update the frames and the Mockups list and each undoes with Cmd/Ctrl+Z.
