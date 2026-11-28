---
id: R-EDIT-009.CR-8
target: R-EDIT-009
kind: revision
version: 0.14.0
date: 2026-11-28
issue: "#85"
summary: "SRC-21 answers (#85, #88, #90): the sapui5 ObjectPageLayout holds its header and AnchorBar; copies named <name>-copy; New Section and Delete Section"
from: 8fcff6f861f5
to: 098dc2507b4c
---

## Clauses

@ meta.source
- [SRC-12, SRC-16]
+ [SRC-21, SRC-12, SRC-16]
@ C8 edit
~ `session.commands` MUST list every command of the session (delete, duplicate, cut, copy, paste, move up, move down, wrap, unwrap, convert, extract component, new mockup, duplicate mockup, delete mockup, {+new section, delete section, +}undo and redo, [-R-TOOL-013.C4)-]{+R-TOOL-013.C4, R-TOOL-014.C13)+} with its name, label, shortcut (`Mod` for Cmd/Ctrl, null for none) and whether it is enabled for the current selection (wrap for a `VStack`, convert for one selected element of the pack), and `session.run(name, args)` MUST run one, with `{name}` for wrap, convert and extract component, `{text}` for paste [-and -]`{mockup}` for duplicate mockup and delete mockup,{+ `{name}` for new section and `{section}` for delete section,+} refusing an unknown name, so that a host can offer them in its own menus.

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,4 +6,4 @@
 
-`node:test` (`typescript/tests/unit/restructure.test.ts`, IT-65): `session.commands` lists the sixteen
-commands in menu order with their labels and shortcuts, all but paste and the three mockup commands disabled with nothing selected,
+`node:test` (`typescript/tests/unit/restructure.test.ts`, IT-65): `session.commands` lists the eighteen
+commands in menu order with their labels and shortcuts, all but paste, the three mockup commands and New Section disabled with nothing selected (Delete Section also needs a current section),
 for a leaf at the first position moveUp and unwrap disabled, unwrap enabled on a container, undo after
```
