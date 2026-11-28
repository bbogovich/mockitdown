---
id: R-TOOL-010.CR-5
target: R-TOOL-010
kind: revision
version: 0.13.19
date: 2026-11-28
issue: 40
summary: "as built (#40): entries in the session's order with their parts (C1); mockitdown-reveal for an entry with no node (C5); the designer reveals in the dock or Code mode (C6); imported-file and unlocated diagnostics lead nowhere (C7); the rules in mockitdown/design, columns in code points (C8); the count button, the problems part and diagnosticsOpen (C9); TC-1 names its tests (IT-68)"
from: ed0270abef35
to: 142113b67c1a
---

## Clauses

@ C1 edit
~ The package MUST define the custom element `mockitdown-diagnostics`, which lists the active mockup's diagnostics in {+the session's +}order, each {+as a button (part `entry`, +}with{+ `data-severity`) holding+} its severity, [-message, line-]{+message+} and [-column,-]{+`line:col` (parts `severity`, `message`, `location`),+} and shows "No problems" {+(part `empty`) +}when there are none.
@ C5 insert after C4
+ When no node holds an entry's location, which is the case while the code does not parse, the list MUST dispatch `mockitdown-reveal` (bubbling, composed, `detail: {mockup, range}`, the location as an empty range of the mockup's code) instead of selecting.
@ C6 insert after C5
+ The composite designer MUST reveal a `mockitdown-reveal` range of its active mockup in its code view, staying in Design mode while the code view is docked (R-TOOL-009.C8) and switching to Code mode otherwise.
@ C7 insert after C6
+ A diagnostic located in an imported file, or with no line, MUST be listed and MUST lead nowhere when activated.
@ C8 insert after C7
+ The rules of C1, C2, C5 and C7 MUST be held by `mockitdown/design` (`diagnosticEntries`, `diagnosticTarget`, `activateDiagnostic`, `diagnosticOffset`, A-WEB-5.K2), which reads a location's column in code points, as the lexer counts it.
@ C9 insert after C8
+ The designer's diagnostic count MUST be the button of part `diagnostics`, its `aria-expanded` true while the list is open; the list MUST stand above the status bar in the part `problems`, its open state the designer's `diagnosticsOpen` property, and opening it MUST focus its first entry.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,20 @@
 title: Diagnostics lead to their element
-verifies: [C1, C2, C3, C4]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
 ---
 
-Browser test on `pages/designer.html`: a mockup with `Text("A", bogus: 1)` and an unknown element shows
-two entries; activating the status count opens the list; activating the first entry selects the `Text`
-(F-19.AC7); with a syntax error, activating its entry reveals the location in the code view; fixing the
-code empties the list ("No problems").
+Browser test (`diagnostics.spec.mjs`, IT-68) on `pages/designer.html`, the active mockup given
+`VStack { Text("A", bogus: 1) Bogus() }` on three lines: the count reads "2 diagnostics" with
+`aria-expanded` false; activating it opens the list with two entries, the warning
+"'bogus' is not understood by Text in pack 'base'" at `2:13` and the unknown element's error at `3:8`
+(its call's parenthesis); a click on the first selects `Text("A", bogus: 1)` (F-19.AC7), Enter on the
+second selects `Bogus()`; Esc closes the list and focuses the count. With a missing `)` the one error at
+`3:1` reveals offset 20 in the code view in Code mode; fixing the code empties the open list
+("No problems", "0 diagnostics"). A second test reveals the error in the docked code view without
+leaving Design mode.
+
+`node:test` (`diagnostics.test.ts`, IT-68): the same entries (index, severity, message, line, column,
+`where`), none for another mockup or an empty document; `diagnosticOffset` with a code point past the
+BMP, a column past the line's end and lines out of range; `diagnosticTarget` gives the Text and the
+Bogus nodes, nothing for an imported file's diagnostic or one with no line; `activateDiagnostic` selects
+them, and for broken code returns the range `{20, 20}` and keeps the selection; one list per
+`diagnostics` notification (1, then 0 entries).
--- a/prose.md
+++ b/prose.md
@@ -2,2 +2,8 @@
 entry leads to its element, or, for a syntax error with no element yet, to its place in the code.
+
+As built (#40): the list itself only selects; for a place in the code it tells its host with
+`mockitdown-reveal`, so a host composing its own tools decides which code view shows it. The designer
+uses the docked code view when there is one, so a syntax error does not take the user out of Design
+mode. An unknown element is located at its call's parenthesis (`Bogus()` at column 8 of
+`  Bogus()`), which still lies inside the element's span.
 
```
