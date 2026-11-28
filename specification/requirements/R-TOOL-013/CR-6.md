---
id: R-TOOL-013.CR-6
target: R-TOOL-013
kind: revision
version: 0.14.0
date: 2026-11-28
issue: "#85"
summary: "SRC-21 answers (#85, #88, #90): the sapui5 ObjectPageLayout holds its header and AnchorBar; copies named <name>-copy; New Section and Delete Section"
from: bef6a74357c8
to: 5b4fd954931a
---

## Clauses

@ meta.source
- [SRC-12, SRC-15, SRC-16]
+ [SRC-21, SRC-12, SRC-15, SRC-16]
@ C5 edit
~ `duplicateMockup(name)` MUST copy the named mockup, the active one by default, with its code, its options and every other key, name the copy [-`<name> copy`,-]{+`<name>-copy`,+} or [-`<name> copy <n>`-]{+`<name>-copy-<n>`+} with the smallest free `<n>` from [-2,-]{+2 when that name is taken,+} place it as a new mockup is placed (R-TOOL-012.C8) beside the mockup it copies, and make the copy the active mockup.

## Files

```diff
--- a/TC-2.md
+++ b/TC-2.md
@@ -7,4 +7,5 @@
 `node:test` (`mockup-commands.test.ts`, IT-71) with hand-computed values: `duplicateMockupName`
-(`Inbox copy`, `Inbox copy 2`, a gap, a lowercase name that does not count, a copy of a copy);
-`newMockup`, `duplicateMockup` (`Inbox copy` at (860, 0), then `Inbox copy 2` at (1240, 0), options and
+(`Inbox-copy`, `Inbox-copy-2`, a gap filled, `Inbox Copy` that does not count, a copy of a copy
+`Inbox-copy-copy`);
+`newMockup`, `duplicateMockup` (`Inbox-copy` at (860, 0), then `Inbox-copy-2` at (1240, 0), options and
 unknown keys copied, a named mockup copied beside itself) and `deleteMockup` (the next, then the previous
--- a/prose.md
+++ b/prose.md
@@ -20 +20,4 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+Copies are named `<name>-copy` (`Inbox-copy`, then `Inbox-copy-2`), a plain mark for the designer to
+rename (SRC-21#answers), as a duplicated element's identifier is (R-EDIT-008.C2).
```
