---
id: R-TOOL-007.CR-5
target: R-TOOL-007
kind: correction
version: 0.13.14
date: 2026-11-28
issue: 35
summary: "as built (#35): parameters written with their label listed once, sorted Add argument without parameters and state labels, state arguments edited where written else as the pack's modifier, Modifiers without .id/.ref/state modifiers with typed fields and Remove, blur applies, refusals keep the typed text, Mockup tab shows the name (rename with R-TOOL-012), '<n> selected', code fields (C13), number min/max (C14), the model in mockitdown/design (C15), .frame sizes min 0 (C16); TC-1..TC-3 name IT-63"
from: cd4d39fca685
to: 2a615300c41b
---

## Clauses

@ C2 edit
~ Arguments MUST list the element's positional parameters in order,{+ a parameter written with its label listed once as that labelled argument,+} then the labelled arguments in use, and an Add argument control MUST [-offer-]{+offer, sorted,+} the labels of the element's parameter types (R-PACK-017.C6) that are not in [-use.-]{+use, are not its positional parameters and are not offered by Variant and state, adding the chosen one with the default value of its type.+}
@ C4 edit
~ Variant and state MUST offer `variant` with only the variants the element declares (M-PACK-2.F5), and the state arguments `selected`, `disabled`, `checked` and `value` its [-role's-]{+parameter+} [-parameters-]{+types+} [-name.-]{+name, each edited where it is written (a labelled argument, or a modifier of its name, or for `variant` a pack modifier setting the `variant` attribute), else added as the pack's modifier of that name when the pack has one, else as a labelled argument.+}
@ C5 edit
~ Modifiers MUST list the node's modifier [-chain-]{+chain, without `.id`, `.ref` and the modifiers Variant and state edits,+} grouped by the modifier groups of the vocabulary [-(R-PACK-017.C5),-]{+(R-PACK-017.C5) with a modifier the vocabulary does not list under `other`, each modifier with a field per argument the vocabulary lists and a remove control,+} and an Add modifier control MUST offer only rendered modifiers that are not already in the {+chain, other than `.id` and `.ref`, adding the chosen one with no arguments at the end of the +}chain.
@ C8 edit
~ An edit MUST be applied 150 ms after the last input in its control, {+or at once when the control loses the focus, +}as one operation coalesced per node and field [-(R-EDIT-007.C5).-]{+(R-EDIT-007.C5) with the key `<node>:<field>`.+}
@ C9 edit
~ A value that its control cannot accept,{+ that the edit operation refuses,+} or whose application would add a diagnostic located at the node, MUST be shown with [-`aria-invalid`-]{+`aria-invalid`, its typed text kept+} and the {+reason (the +}diagnostic's [-text,-]{+text) beside it,+} and MUST NOT be applied.
@ C10 edit
~ When nothing is selected, the inspector MUST show a Mockup tab that [-edits-]{+shows+} the active mockup's [-name,-]{+name and edits its+} pack, device, width, height, appearance, title, caption and Elements table option, each edit one undo step with the change kind [-`options`.-]{+`options` coalesced with the key `mockup:<name>:<option>`, renaming the mockup being left to the canvas (R-TOOL-012.C3).+}
@ C12 edit
~ With several nodes selected, the inspector MUST show their number {+as "<n> selected" +}and no fields.
@ C13 insert after C12
+ A value that none of the controls of C3 can show (a variable, an expression, a value outside its `enum`) MUST be edited as its code in a text field, and a modifier whose written arguments do not match the vocabulary's MUST be edited as the code of its arguments.
@ C14 insert after C13
+ The inspector's number field MUST refuse a value below the `min` or above the `max` its type names (R-PACK-017.C2).
@ C15 insert after C14
+ The inspector MUST hold no editing rule of its own (A-WEB-5.K2): `mockitdown/design` MUST export the model it renders, `inspect(session, pack)` and `setField`, `removeField`, `addArgument`, `addModifier`, `removeModifier` and `setOption`, each returning `{ok: true}` or `{ok: false, error, diagnostics}`.
@ C16 insert after C15
+ The vocabulary's `.frame` entry (R-PACK-017.C5) MUST give its width, height, minimum, maximum and ideal width and height arguments a `min` of 0.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -6,5 +6,8 @@
 
-Browser test (`inspector.spec.mjs`) on `pages/designer.html`: select a `Button` with declared variants;
-the variant choice lists exactly those; choosing another changes the code's `.variant(…)` and the
-rendered class within 500 ms; Undo restores both (F-19.AC4). Typing a label in the text field forms one
-undo step.
+Browser test (`tests/browser/inspector.spec.mjs`, IT-63) on `pages/designer.html`: in the sample's
+"Sign in" mockup (mui), select the `Button`, whose pack declares the variants text, outlined and
+contained; the inspector shows the four groups; the variant choice lists exactly those after the unset
+choice; choosing outlined adds `.variant("outlined")` to the code and the rendered `data-variant` within
+500 ms, as one change; Undo restores both (F-19.AC4). Typing " now" at the end of the label field gives
+`Button("Sign in now")` with the focus kept in the field, and one Undo gives the sample back with
+nothing left to undo (R-EDIT-007.C5).
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,8 +3,15 @@
 title: Typed controls and validation
-verifies: [C2, C3, C5, C6, C7, C9, C12]
+verifies: [C2, C3, C5, C6, C7, C9, C12, C13, C14, C15, C16]
 ---
 
-Browser test: each type of R-PACK-017.C2 gets its control; Add argument offers only unused labels;
-Add modifier omits modifiers in the chain; `.frame(width: -10)` is shown invalid with its message and the
-code is unchanged; an unknown label `bogus:` shows "not understood by this pack" and can be removed; a
-duplicate `.id` is refused; two selected nodes show "2 selected".
+`node:test` (`tests/unit/inspect.test.ts`, IT-63) and a browser test (`tests/browser/inspector.spec.mjs`)
+on the hand-written `fixtures/inspector-sample.mkdesign` (base): a `Button` with a label, `systemImage`,
+`color`, `role`, `loading`, `elevation` and an unknown `bogus:`, `.frame(width: 80)`,
+`.padding(.horizontal, 8)` and `.id("save")`, a `Breadcrumb(items: [...])` and a `Text` with
+`.id("taken")`. Each type of R-PACK-017.C2 gets its control and the unknown label a code field; a
+parameter written with its label is listed once; Add argument offers only unused labels, sorted; Add
+modifier omits modifiers in the chain and `.id`; `.frame(width: -10)`, a non-number and a bad colour
+are shown invalid with their messages and the code is unchanged; an unknown icon is refused with the
+diagnostic's text; `bogus:` shows "not understood by this pack" and can be removed; a duplicate `.id` is
+refused; values, a state modifier, a comment, references, an added argument and modifier are written as
+hand-written code expects, each one change; two selected nodes show "2 selected" and no fields.
--- a/TC-3.md
+++ b/TC-3.md
@@ -6,4 +6,7 @@
 
-Browser test: with nothing selected, changing the device in the Mockup tab changes the mockup's
-`options.device` and the rendering, undoable; on a derived row, Edit in code switches to Code mode with
-the node's span selected.
+`node:test` (`tests/unit/inspect.test.ts`) and a browser test (`tests/browser/inspector.spec.mjs`,
+IT-63): with nothing selected the Mockup tab shows the mockup's name and its options with the inherited
+values; changing the device changes the mockup's `options.device` as one `options` change, a height of 0
+or an unknown device is refused, and each option edit is undone on its own. Edit in code (C11) on a
+derived row, switching to Code mode with the node's span selected, is tested with the code view
+(R-TOOL-008).
--- a/prose.md
+++ b/prose.md
@@ -16 +16,14 @@
 **Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
+
+**As built (#35).** The model is `mockitdown/design`'s `inspect.ts`: `inspect(session, pack)` gives the
+groups, the fields (each with its control, value, code as written and where it is written) and the Add
+lists, and `setField` turns a typed value into an edit operation, checks it with the edit API and with
+the diagnostics its code would add at the node, and applies it through the session with the coalescing
+key `<node>:<field>`; the element only draws the model and debounces the inputs. A state argument is
+edited where it is written, so `Button("Sign in").variant("outlined")` and `Button("Sign in", variant:
+"outlined")` both show `outlined`; a new one becomes the pack's modifier (`.disabled(true)`) when the
+pack has one. Values the typed controls cannot show (`maxWidth: .infinity`, a variable) are edited as
+code. The negative width of V1 is refused by the number field itself: the vocabulary gives the `.frame`
+sizes a `min` of 0 (C16), since the renderer does not warn about them. Renaming the mockup stays with the
+canvas (R-TOOL-012), so the Mockup tab shows the name; Edit in code (C11) comes with the code view
+(R-TOOL-008).
```
