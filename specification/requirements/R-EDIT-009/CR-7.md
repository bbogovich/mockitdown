---
id: R-EDIT-009.CR-7
target: R-EDIT-009
kind: revision
version: 0.13.22
date: 2026-11-28
issue: 43
summary: "as built (#43): session.commands lists the mockup commands newMockup, duplicateMockup and deleteMockup before undo, and run takes {mockup} for the latter two (C8); TC-2 counts sixteen commands"
from: bd6e8261861f
to: 8fcff6f861f5
---

## Clauses

@ C8 edit
~ `session.commands` MUST list every command of the session (delete, duplicate, cut, copy, paste, move up, move down, wrap, unwrap, convert, extract component, {+new mockup, duplicate mockup, delete mockup, +}undo and [-redo)-]{+redo, R-TOOL-013.C4)+} with its name, label, shortcut (`Mod` for Cmd/Ctrl, null for none) and whether it is enabled for the current selection (wrap for a `VStack`, convert for one selected element of the pack), and `session.run(name, args)` MUST run one, with `{name}` for wrap, convert and extract [-component and-]{+component,+} `{text}` for [-paste,-]{+paste and `{mockup}` for duplicate mockup and delete mockup,+} refusing an unknown name, so that a host can offer them in its own menus.

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,4 +6,4 @@
 
-`node:test` (`typescript/tests/unit/restructure.test.ts`, IT-65): `session.commands` lists the thirteen
-commands in menu order with their labels and shortcuts, all but paste disabled with nothing selected,
+`node:test` (`typescript/tests/unit/restructure.test.ts`, IT-65): `session.commands` lists the sixteen
+commands in menu order with their labels and shortcuts, all but paste and the three mockup commands disabled with nothing selected,
 for a leaf at the first position moveUp and unwrap disabled, unwrap enabled on a container, undo after
```
