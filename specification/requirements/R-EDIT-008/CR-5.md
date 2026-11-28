---
id: R-EDIT-008.CR-5
target: R-EDIT-008
kind: revision
version: 0.13.15
date: 2026-11-28
issue: 36
summary: "as built (#36): copy keeps comment lines and gives an empty text for no selection; cut selects as delete and returns the text; paste into a container whose role accepts every element, else after a placed node, else at the top level's end, selecting the pasted views, refusing non-view text; moves shift each node; pasted ids renamed only when taken (C11); refusals (C12); selectRange/toggleSelected (C13); clipboard fallback (C14); TC-1, TC-2 name their tests"
from: be22cfcf8aea
to: 9dcee1f1692d
---

## Clauses

@ C3 edit
~ `session.copy()` MUST return, and the composite designer MUST write to the clipboard as `text/plain`, the source text of the selected nodes in {+source +}order, each{+ from its leading comment lines to its end with a comment trailing its last line,+} re-indented to column 0 by its first line, joined by line [-feeds.-]{+feeds, and an empty text when nothing is selected.+}
@ C4 edit
~ `session.cut()` MUST copy the selected nodes and remove them as one [-step.-]{+step, selecting as `session.delete()` does (R-TOOL-003.C11), and return the copied text with the removal.+}
@ C5 edit
~ `session.paste(text)` MUST insert the views the text [-holds-]{+holds, in order,+} as the last children of the selected node when one node is [-selected-]{+selected, it is a container (R-TOOL-005.C3)+} and its role accepts [-them-]{+each pasted element in the active mockup's pack+} (R-PACK-016), else directly after the last selected [-node,-]{+node when it is placed among its parent's statement children,+} else at the end of the mockup's [-root.-]{+top level, and select the pasted views.+}
@ C6 edit
~ If the pasted text does not [-parse as views,-]{+parse,+} then `paste` MUST be refused with the syntax [-diagnostic-]{+diagnostics+} and record no [-step.-]{+step; text that holds no view, or anything but views (an import, a directive, a struct, a `let`), MUST be refused the same way.+}
@ C7 edit
~ `session.moveUp()` and `session.moveDown()` MUST move [-the-]{+each+} selected [-nodes-]{+node+} one position among [-their-]{+its+} [-siblings;-]{+parent's statement children, the selection and the nodes' ids kept; when the first selected node is+} at the first {+position (up) +}or{+ the last at the+} last position{+ (down)+} they MUST do nothing and record no step.
@ C8 edit
~ In the outline and the editor, Shift-click MUST select the siblings from the selection's first node to the clicked [-node,-]{+node (in the editor the innermost element under the pointer), the first node staying first,+} Cmd/Ctrl-click MUST add or remove the clicked node, and a click on a node that is not a sibling of the selection MUST replace the selection.
@ C9 edit
~ The composite designer MUST bind Cmd/Ctrl+D to duplicate, Cmd/Ctrl+X, C and V to cut, copy and paste, and Alt+Up and Alt+Down to move, while the focus is in the outline or the [-view.-]{+view, outside a text field and outside Preview mode.+}
@ C11 insert after C10
+ In pasted views, each `.id("x")` that the mockup already uses MUST become `.id("x-<n>")` as in C2, and an identifier the mockup does not use MUST be kept.
@ C12 insert after C11
+ `session.duplicate()`, `session.moveUp()` and `session.moveDown()` MUST be refused, changing nothing, when nothing is selected or a selected node is not placed among its parent's statement children (an argument, a modifier's content, a struct body).
@ C13 insert after C12
+ The session MUST offer the selection of C8 as `session.selectRange(node)` and `session.toggleSelected(node)`, which the outline and the editor call, so that they hold no selection rule of their own (A-WEB-5.K2).
@ C14 insert after C13
+ When the clipboard cannot be read or is empty, Cmd/Ctrl+V in the composite designer MUST paste the text it copied or cut last.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,18 @@
 title: Commands and undo
-verifies: [C1, C2, C4, C5, C6, C7, C10]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C10, C11, C12, C13]
 ---
 
-`node:test`: duplicate of `Button("A").id("ok")` yields `.id("ok-2")`, a second duplicate `ok-3`;
-cut and paste into a stack and after a leaf; paste of invalid text is refused without a step;
-moveUp at the first position records no step; every command undoes and redoes with the selection
-restored (the AC9 check of F-19).
+`node:test` (`typescript/tests/unit/commands.test.ts`, IT-64) on a hand-written mockup
+(`VStack { Text("Title"); Button("A").id("ok"); // the row; HStack { Text("Left").id("left") } }`),
+every expected code written by hand: a duplicate of the button gives `.id("ok-2")` directly after it,
+selected, and a second duplicate of the original `.id("ok-3")`; duplicating the title and the stack
+copies each after itself with the nested `left` becoming `left-2`; `copy` gives the stack with its
+comment at column 0; a cut of the button selects the stack, and its text pasted into the stack goes in
+as the last child with `ok` kept, after the title (a leaf) as `ok-2`, with nothing selected at the end
+of the top level as `ok-3`; several pasted views go after the last of several selected nodes; a paste
+of invalid text (`Button("A"`), of a `let`, of nothing and of a struct is refused with no step and no
+notification; moveUp at the first position and moveDown at the last record no step, moveDown and
+moveUp of the title and moveUp of two siblings move them as one step each; `selectRange` and
+`toggleSelected` as C8 says; duplicate, the moves and cut with nothing selected, and duplicate and the
+moves of an argument view (`Section(header: Text("H"))`), are refused with no step; every command undoes and redoes with the code and the selection restored
+(the AC9 check of F-19).
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,8 +3,15 @@
 title: Keyboard, clipboard and multi-select
-verifies: [C3, C8, C9]
+verifies: [C3, C8, C9, C14]
 ---
 
-Browser test on `pages/designer.html` with a granted clipboard: Shift-click selects a range of rows,
-Cmd/Ctrl-click toggles one, a click on a non-sibling replaces the selection; Cmd/Ctrl+C puts the
-selected text on the clipboard; a Python test renders that text in a `mockitdown` fence without a
-diagnostic (F-19.AC10); Alt+Down moves the selection.
+Browser test (`typescript/tests/browser/commands.spec.mjs`, IT-64) on `pages/designer.html` with the
+clipboard granted, over the sample's Inbox mockup: in the outline, Shift-click selects the title and the
+list, Cmd/Ctrl-click toggles the title off and on, a Cmd/Ctrl-click on the VStack (no sibling) replaces
+the selection; in the view, Shift-click from the card's text to its button selects both, Cmd/Ctrl-click
+toggles the button, a Cmd/Ctrl-click on the title replaces the selection. With the card selected,
+Cmd/Ctrl+C puts exactly `fixtures/copied-card.mockitdown` (written by hand) on the clipboard; a Python
+test (`python/tests/test_clipboard.py`) renders that text in a `mockitdown` fence with no diagnostic
+(F-19.AC10). Cmd/Ctrl+D duplicates the card (`open-2`), Cmd/Ctrl+X cuts it and Cmd/Ctrl+V pastes it
+after the ForEach, Alt+Down and Alt+Up move the title below the list and back, each against hand-written
+code; Cmd/Ctrl+D in the gallery's search field changes nothing. With `readText` refusing, Cmd/Ctrl+C then
+Cmd/Ctrl+V on the title pastes the designer's own copy after it.
--- a/prose.md
+++ b/prose.md
@@ -14 +14,14 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#36).** The commands are methods of the design session (`mockitdown/design`); the outline,
+the editor and the designer only call them. A command with several operations (a duplicate or paste of
+several views, a move of several nodes) applies them one after the other to the tree and forms one step
+and one `change`, whose single text edit turns the code before into the code after. The identifiers of
+a copy are renamed only where the mockup already uses them, so a duplicate always renames (`ok` →
+`ok-2`) and a paste after a cut keeps them; duplicating `ok-2` gives `ok-2-2`, by C2's letter, so the
+second duplicate of TC-1 is one of the original. Copied code keeps the comment lines above a node, as a
+move carries them. A paste goes into the one selected node only when it is a container the drop rules
+of R-TOOL-005 would drop into (never a `ForEach`) and its role accepts every pasted element. With
+several nodes selected, a move shifts each of them one position, so a scattered selection stays
+scattered. The designer writes the clipboard with `navigator.clipboard.writeText` and reads it with
+`readText`, falling back to its own last copy when reading is refused.
```
