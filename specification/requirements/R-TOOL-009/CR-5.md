---
id: R-TOOL-009.CR-5
target: R-TOOL-009
kind: revision
version: 0.13.18
date: 2026-11-28
issue: 39
summary: "as built (#39): typed text is applied 300 ms after the last keystroke or when the focus leaves, coalesced as code (C1); broken code: the status bar names the first error, outline and editor show the last valid code read-only, edits, commands and drops refused (C3); only the pointer and navigation keys select by the caret, nothing outside every node, typing never selects (C4); typed text waiting is kept past other edits (C5); CodeSync in mockitdown/design holds the rules (C9); session parses, validCode, nodeAt, selectionSpan (C10); the dock toggle, docked and codeView (C11); TC-1, TC-2 name their tests (IT-67)"
from: 5defdbc8f7f8
to: f47debb59a14
---

## Clauses

@ C1 edit
~ A code view joined to the session MUST apply its text to the active mockup 300 ms after the last keystroke, {+or at once when the focus leaves the code view, +}as one change{+ with the coalescing key `code`+} whose edits replace the range between the longest common prefix and suffix of the old and new text.
@ C3 edit
~ When the new code does not parse, the code view {+MUST show its diagnostics +}and the status bar [-MUST show -]its [-diagnostics,-]{+first error,+} and the outline and the editor MUST [-keep-]{+show the code of+} the last valid tree, marked [-read-only-]{+read-only, while the session refuses every edit, command+} and [-refusing edits,-]{+drop,+} until the code parses again.
@ C4 edit
~ While the code [-parses,-]{+parses and no typed text waits to be applied,+} moving the caret{+ with the pointer or a navigation key+} MUST select the innermost view node whose span holds the caret [-(R-EDIT-001.C8).-]{+(R-EDIT-001.C8), and clear the selection when no node holds it; typing MUST NOT change the selection.+}
@ C5 edit
~ A change made in another component MUST be applied to the code view by its text edits, keeping the caret and the scroll position outside the edited [-ranges.-]{+ranges; text typed and not yet applied MUST be kept, the edits moved past it, unless an edit overlaps it, when the code view MUST take the session's code.+}
@ C9 insert after C8
+ The rules of C1 to C6 MUST be held by `CodeSync` of `mockitdown/design` (A-WEB-5.K2), which joins any object with the code view's `value`, `diagnostics`, `selection`, `applyEdits` and `mark` and its `input`, `focusout` and `mockitdown-caret` events to a session's active mockup, applying typed text to the previous mockup before showing a newly active one.
@ C10 insert after C9
+ The session MUST expose `parses(name)` (whether the mockup's code parses), `validCode(name)` (the code of its last valid tree), `nodeAt(name, offset)` (C4's node, null while the code does not parse) and `selectionSpan()` (the span from the first selected node's start to the last one's end, the range C6 marks).
@ C11 insert after C10
+ The toolbar's dock toggle MUST be the button of part `dock`, pressed while the designer's `docked` attribute (and property) is set, and shown in Design mode only; the designer's `codeView` property MUST return its code view.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,21 @@
 title: Unbalanced brace
-verifies: [C1, C2, C3]
+verifies: [C1, C2, C3, C9, C10]
 ---
 
-Browser test (`sync.spec.mjs`) on `pages/designer.html`: select a `Text`; in Code mode delete a `}`;
-after 300 ms the gutter and the status bar show a syntax diagnostic and the outline still shows the
-previous tree with editing refused; retype the `}`; the view updates and the same `Text` node is still
-selected (F-19.AC5); the change's edits are the one-character replacements.
+Browser test (`sync.spec.mjs`, IT-67) on `pages/designer.html`: select `Text("Quarterly report")`; in Code
+mode delete the VStack's closing `}` (offset 274) with Backspace; the session's code is unchanged at once
+and becomes the broken text after the pause, with the one edit `{274, 275, ""}`; the gutter marks an error
+line, the status bar does not read "0 diagnostics" and names the error; the outline keeps its rows, shows
+its read-only note and `data-readonly`, and Delete there (and `session.delete()`) changes nothing; the
+selection is kept. Retyping `}` parses again with the edit `{274, 274, "}"}`, the note goes, the same Text
+node is selected, and Design mode renders the view without the read-only note (F-19.AC5). A second test
+leaves the code view with the code broken (applied at once) and finds the editor showing the last valid
+version under the note, `aria-readonly` on its view.
+
+`node:test` (`code-sync.test.ts`, IT-67) with a stand-in code view and fake timers: eight keystrokes 50 ms
+apart over "back" give nothing 299 ms after the last and, at 300 ms, one change `{25, 29, "home"}` with the
+button keeping its id and its selection, one undo step that the view follows by text edits; broken code
+keeps the last valid tree (`parses` false, `validCode` the old code), refuses delete, insert and drops
+(`checkDrop` says why), and the retyped brace parses with the Text still selected; leaving the view
+applies at once, typing back to the code applies nothing; the constants (300, `code`,
+`mockitdown-caret`); the active mockup's change applies typed text to the old mockup first.
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,8 +3,17 @@
 title: Following the caret and visual edits
-verifies: [C4, C5, C6, C7, C8]
+verifies: [C4, C5, C6, C7, C8, C10, C11]
 ---
 
-Browser test: moving the caret into a `Toggle` selects its row; a gallery Add in Code mode inserts into
-the stack holding the caret; a Delete in the outline updates the code view with the caret kept before
-the removed range; selecting a node highlights its span; in Design mode the dock toggle shows the code
-view below the view.
+Browser test (`sync.spec.mjs`, IT-67) on `pages/designer.html`: in Code mode the caret moved into
+`Button("Open")` by ArrowRight selects it and its outline row; moved to line 6 before `List` it selects the
+VStack, the inspector shows it, and the gallery's Add on Divider inserts `  Divider()` as the VStack's last
+child, the code view following by text edits; with the caret at 100, selecting `Text("Inbox")` and then
+the button marks their spans (part `span`) while the focus stays in the outline, Delete there removes the
+button's line from the code view with the caret still at 100, and Cmd/Ctrl+Z restores it; in Design mode
+the Dock code toggle (part `dock`, `docked`) shows the code view below the view, a Delete in the view
+reaches it and typing there reaches the view; the toggle and the code are hidden in Preview mode.
+
+`node:test` (`code-sync.test.ts`): caret events select the Button (offset 40), the VStack (9) and nothing
+(53), and nothing while typed text waits; a delete elsewhere reaches the view as edits, moves past typed
+text before it and replaces typed text inside it; the selection's spans `{11, 31}` and `{11, 51}` are
+marked and nothing while typing waits.
--- a/prose.md
+++ b/prose.md
@@ -13 +13,11 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#39).** The rules live in `CodeSync` (`typescript/src/design/code-sync.ts`) beside the session,
+so the code view stays a plain text component that imports only the lexer: the view gains `applyEdits`,
+`mark` and a `mockitdown-caret` event, and `CodeSync` decides when text is applied, which node the caret
+selects and which span is marked. Only the pointer and the navigation keys select by the caret, so typing
+inside a node never moves the selection away from the one the designer picked; this is what lets the
+selection survive a missing brace and its repair. Leaving the code view applies its text at once, so a
+click on a visual tool never races the 300 ms pause. A visual edit made while typed text waits (rare, the
+pause is short) is moved past the typing when they do not overlap; otherwise the session's code wins. The
+docked view is the same element as Code mode's, placed below the view.
```
