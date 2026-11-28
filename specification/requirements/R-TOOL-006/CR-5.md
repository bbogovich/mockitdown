---
id: R-TOOL-006.CR-5
target: R-TOOL-006
kind: revision
version: 0.13.10
date: 2026-11-28
issue: 31
summary: "as built (#31): sample calls of the base pack (V1 Button(\"Label\")), the commit as a change of its own until R-EDIT-007, session firstText/setText (C4), an insertion while open and a vanished node (C5), sampleCall in the core (C6); TC-1 as built, TC-2 new"
from: 039b0bb3381d
to: eca4b98fc247
---

## Clauses

@ C2 edit
~ After an [-insertion,-]{+insertion into the mockup it shows,+} when the new call's first positional argument is a string [-literal,-]{+literal without interpolation,+} the editor MUST open an inline text field over the {+new element's first +}rendered element holding that string, focused with its text selected.
@ C3 edit
~ Enter or leaving the field MUST commit the text with `setArgument` (R-EDIT-003.C1) as one change [-and-]{+of+} [-one-]{+the+} [-undo step,-]{+session,+} separate from the [-insertion;-]{+insertion's (one undo step once the history of R-EDIT-007 exists);+} Esc MUST close the field and keep the sample's text.
@ V1 edit
~ [-Adding-]{+In the base pack, adding+} a `Button` inserts [-`Button("Button")`,-]{+`Button("Label")`,+} opens a field holding [-`Button`,-]{+`Label`,+} and typing `Save` then Enter gives [-`Button("Save")`;-]{+`Button("Save")`+} [-one-]{+in+} [-undo-]{+a+} [-restores-]{+second+} [-`Button("Button")`.-]{+change after the insertion's.+}
@ C4 insert after V1
+ The design session MUST provide `firstText(node)`, the text of a node's first positional argument when it is a string literal without interpolation, else null, and `setText(node, text)`, which sets that argument to the string literal of the text as one change, changes nothing and notifies nothing for the same text, and is refused for a node without such an argument.
@ C5 insert after C4
+ An insertion that arrives while the field is open MUST first commit the field's text, and a field whose node no longer has a first text after a render MUST close without committing.
@ C6 insert after C5
+ The code of C1 MUST be computed by the core (`sampleCall(name, sample)`), which gives `<Name>()` for a missing sample, a sample that does not parse, one with more than one top-level statement, a declaration or an import, and one whose single statement is not a call of the element.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,8 +3,22 @@
 title: Sample arguments and inline edit
-verifies: [C1, C2, C3]
+verifies: [C1, C2, C3, C5]
 ---
 
-Browser test on `pages/designer.html`: Add on `Button` inserts `Button("Button")` and opens a focused
+Browser test on `pages/designer.html`: Add on `Button` inserts `Button("Label")` and opens a focused
 field with the text selected; typing `Save` and Enter gives `Button("Save")`; undo restores
-`Button("Button")` and a second undo removes the button; Add on `List` inserts its sample call without
+`Button("Label")` and a second undo removes the button; Add on `List` inserts its sample call without
 the sample's rows; Esc keeps the sample text.
+
+As built (#31): `typescript/tests/browser/new-element.spec.mjs` (IT-59) opens the hand-written
+`tests/browser/fixtures/new-element-sample.mkdesign` (base pack, a `VStack` holding `Text("Sign in")`)
+in the designer and selects the stack. Add on `Button` inserts `Button("Label")`, the base pack's
+sample; the field `.mkd-editor__field` holds `Label`, is focused with characters 0 to 5 selected and
+sits over the new button's element; typing `Save` and Enter closes it and gives `Button("Save")`, the
+code changes being exactly the insertion's and then the text's, with the button still selected. Add
+on `List` gives `List()` and opens no field. Add on `Text` opens `Content`; typing then Esc closes it,
+keeps `Text("Content")` and adds no change; Add on `Toggle`, typing `Wi-Fi` and a click into the
+gallery's search field commits `Toggle("Wi-Fi")`. With `Hello` typed into the field of a new
+`Text`, a host's `session.insert('Button("Go")', …)` commits `Text("Hello")` and opens the field
+again on `Go`; replacing the code as text without the button closes the field with nothing committed. There is no undo yet (R-EDIT-007): the undo step is
+checked as a change of its own. The expected code was written by hand from the fixture and
+`shared/reference/base.json`.
--- /dev/null
+++ b/TC-2.md
@@ -0,0 +1,16 @@
+---
+id: TC-2
+title: The insertion code and the session's text
+verifies: [C1, C4, C6]
+---
+
+Unit test `typescript/tests/unit/sample.test.ts`: `sampleCall` keeps a sample call's arguments and
+modifiers and drops its trailing closures (`List() { … }` gives `List()`, `NavigationSplitView { … }
+detail: { … }` gives `NavigationSplitView()`, a modifier after the closure is kept, a closure passed as
+an argument is kept), and gives `<Name>()` for a sample shown inside another element, two statements,
+a `let`, a bare identifier, code that does not parse and no sample; over `shared/reference/base.json`
+Button, Toggle, List and VStack give `Button("Label")`, `Toggle("Label")`, `List()` and `VStack()`.
+`firstText` reads plain string literals only (not an interpolation, a label or a variable). On a
+session, `setText` with the same text has no edits and no notification, a new text with quotes is
+written escaped as one `change` keeping the node's id, and a node without a first text is refused
+(`n3 has no text as its first argument`). All expected values were written by hand.
--- a/prose.md
+++ b/prose.md
@@ -2,2 +2,12 @@
 as in the Reference pages, and its first text opens for editing at once.
+
+**As built (#31).** The sample is the one the pack's reference data publishes (R-PACK-013), so the
+text depends on the pack: in the base pack a `Button` arrives as `Button("Label")` and a `Toggle` as
+`Toggle("Label")`, in swiftui as `Button("Share", systemImage: "square.and.arrow.up")`. The rule
+applies to every insertion from the gallery, Add and a drop alike (R-TOOL-004.C8, R-TOOL-005.C5), and
+the editor opens the field after any insertion into the mockup it shows. The gallery holds no rule of
+its own: `sampleCall` is in the core, `firstText` and `setText` in the session (A-WEB-5.K2). The field
+is an `<input>` in the editor's shadow root (`part="text-field"`), drawn above the outlines with the
+rendered element's font; its keys stay in it, so the designer's Delete and the editor's Esc and Enter
+do not act on the selection while typing.
 
```
