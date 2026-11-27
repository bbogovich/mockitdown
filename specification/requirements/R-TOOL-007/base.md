---
id: R-TOOL-007
title: "The inspector: mockitdown-inspector"
status: active
version: 0.10.0
rev: 0
page: WEB.4
slot: reqs
order: 7
hash: 450c253ee34b
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-PACK-017, R-EDIT-007, R-EDIT-003]
constrained_by: [A-WEB-5]
---

C1: The package MUST define the custom element `mockitdown-inspector`, which shows the properties of the single selected node in four groups: Arguments, Variant and state, Modifiers, and Identity.
C2: Arguments MUST list the element's positional parameters in order, then the labelled arguments in use, and an Add argument control MUST offer the labels of the element's parameter types (R-PACK-017.C6) that are not in use.
C3: Each argument and modifier argument MUST be edited with the control of its type: a text field for `text`, a number field for `number`, a switch for `bool`, a choice of its values for `enum`, a colour field accepting names and hexadecimal values for `color`, a text field suggesting icon names for `icon` and a list editor for `array`.
C4: Variant and state MUST offer `variant` with only the variants the element declares (M-PACK-2.F5), and the state arguments `selected`, `disabled`, `checked` and `value` its role's parameters name.
C5: Modifiers MUST list the node's modifier chain grouped by the modifier groups of the vocabulary (R-PACK-017.C5), and an Add modifier control MUST offer only rendered modifiers that are not already in the chain.
C6: Identity MUST edit the node's `.id` (R-EDIT-003.C8), showing a refusal for an identifier in use, its `.ref` list (R-EDIT-003.C10) and its comment (R-EDIT-003.C11).
C7: A labelled argument the element does not understand (R-EVAL-004.C7) MUST be listed under Arguments with the note "not understood by this pack" and a remove control.
C8: An edit MUST be applied 150 ms after the last input in its control, as one operation coalesced per node and field (R-EDIT-007.C5).
C9: A value that its control cannot accept, or whose application would add a diagnostic located at the node, MUST be shown with `aria-invalid` and the diagnostic's text, and MUST NOT be applied.
C10: When nothing is selected, the inspector MUST show a Mockup tab that edits the active mockup's name, pack, device, width, height, appearance, title, caption and Elements table option, each edit one undo step with the change kind `options`.
C11: When the selected node is derived or has a construct the controls cannot express, the inspector MUST offer Edit in code, which switches the designer to Code mode and reveals the node's span (R-TOOL-008.C1).
C12: With several nodes selected, the inspector MUST show their number and no fields.
V1: Changing a button's variant in the inspector changes the code and the rendering, and undo restores both (F-19.AC4); a negative width is shown as invalid and not applied.
<!-- file: TC-1.md -->
---
id: TC-1
title: Variant change and undo
verifies: [C1, C4, C8]
---

Browser test (`inspector.spec.mjs`) on `pages/designer.html`: select a `Button` with declared variants;
the variant choice lists exactly those; choosing another changes the code's `.variant(…)` and the
rendered class within 500 ms; Undo restores both (F-19.AC4). Typing a label in the text field forms one
undo step.
<!-- file: TC-2.md -->
---
id: TC-2
title: Typed controls and validation
verifies: [C2, C3, C5, C6, C7, C9, C12]
---

Browser test: each type of R-PACK-017.C2 gets its control; Add argument offers only unused labels;
Add modifier omits modifiers in the chain; `.frame(width: -10)` is shown invalid with its message and the
code is unchanged; an unknown label `bogus:` shows "not understood by this pack" and can be removed; a
duplicate `.id` is refused; two selected nodes show "2 selected".
<!-- file: TC-3.md -->
---
id: TC-3
title: Mockup tab and Edit in code
verifies: [C10, C11]
---

Browser test: with nothing selected, changing the device in the Mockup tab changes the mockup's
`options.device` and the rendering, undoable; on a derived row, Edit in code switches to Code mode with
the node's span selected.
<!-- file: prose.md -->
The properties panel of SRC-13#p1.c5 (SRC-12#s7). Its controls are generated from the typed parameter
data (R-PACK-017), so a new pack needs no inspector code, and it borrows the field style of the MockItOut
inspector: a small grey label above a full-width input (SRC-12#s15).

Edits apply as the designer types, debounced, and a burst of typing is one undo step. An invalid value is
never written: a value the control rejects, or one whose rendering would add a diagnostic at the node,
stays red with the message until corrected.
