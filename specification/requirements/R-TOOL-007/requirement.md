---
id: R-TOOL-007
title: "The inspector: mockitdown-inspector"
status: active
version: 0.13.18
rev: 6
page: WEB.4
slot: reqs
order: 7
hash: ac1075a221f0
source: [SRC-12, SRC-13]
realizes: [F-19]
requires: [R-PACK-017, R-EDIT-007, R-EDIT-003]
constrained_by: [A-WEB-5]
refs: [A-WEB-5, F-19, M-PACK-2, R-EDIT-003, R-EDIT-007, R-EVAL-004, R-PACK-017, R-TOOL-008, R-TOOL-012]
---

C1: The package MUST define the custom element `mockitdown-inspector`, which shows the properties of the single selected node in four groups: Arguments, Variant and state, Modifiers, and Identity.
C2: Arguments MUST list the element's positional parameters in order, a parameter written with its label listed once as that labelled argument, then the labelled arguments in use, and an Add argument control MUST offer, sorted, the labels of the element's parameter types (R-PACK-017.C6) that are not in use, are not its positional parameters and are not offered by Variant and state, adding the chosen one with the default value of its type.
C3: Each argument and modifier argument MUST be edited with the control of its type: a text field for `text`, a number field for `number`, a switch for `bool`, a choice of its values for `enum`, a colour field accepting names and hexadecimal values for `color`, a text field suggesting icon names for `icon` and a list editor for `array`.
C4: Variant and state MUST offer `variant` with only the variants the element declares (M-PACK-2.F5), and the state arguments `selected`, `disabled`, `checked` and `value` its parameter types name, each edited where it is written (a labelled argument, or a modifier of its name, or for `variant` a pack modifier setting the `variant` attribute), else added as the pack's modifier of that name when the pack has one, else as a labelled argument.
C5: Modifiers MUST list the node's modifier chain, without `.id`, `.ref` and the modifiers Variant and state edits, grouped by the modifier groups of the vocabulary (R-PACK-017.C5) with a modifier the vocabulary does not list under `other`, each modifier with a field per argument the vocabulary lists and a remove control, and an Add modifier control MUST offer only rendered modifiers that are not already in the chain, other than `.id` and `.ref`, adding the chosen one with no arguments at the end of the chain.
C6: Identity MUST edit the node's `.id` (R-EDIT-003.C8), showing a refusal for an identifier in use, its `.ref` list (R-EDIT-003.C10) and its comment (R-EDIT-003.C11).
C7: A labelled argument the element does not understand (R-EVAL-004.C7) MUST be listed under Arguments with the note "not understood by this pack" and a remove control.
C8: An edit MUST be applied 150 ms after the last input in its control, or at once when the control loses the focus, as one operation coalesced per node and field (R-EDIT-007.C5) with the key `<node>:<field>`.
C9: A value that its control cannot accept, that the edit operation refuses, or whose application would add a diagnostic located at the node, MUST be shown with `aria-invalid`, its typed text kept and the reason (the diagnostic's text) beside it, and MUST NOT be applied.
C10: When nothing is selected, the inspector MUST show a Mockup tab that shows the active mockup's name and edits its pack, device, width, height, appearance, title, caption and Elements table option, each edit one undo step with the change kind `options` coalesced with the key `mockup:<name>:<option>`, renaming the mockup being left to the canvas (R-TOOL-012.C3).
C11: When the selected node is derived (an `if`, a `ForEach` or a call of a struct of the mockup) or has a value only a code field shows (C13), the inspector MUST offer Edit in code (part `edit-in-code`), which dispatches a bubbling, composed `mockitdown-edit-in-code` event with the mockup, the node and its span, on which the designer switches to Code mode and reveals the span (R-TOOL-008.C1); the model's `editInCode` MUST give that span, else null.
C12: With several nodes selected, the inspector MUST show their number as "<n> selected" and no fields.
C13: A value that none of the controls of C3 can show (a variable, an expression, a value outside its `enum`) MUST be edited as its code in a text field, and a modifier whose written arguments do not match the vocabulary's MUST be edited as the code of its arguments.
C14: The inspector's number field MUST refuse a value below the `min` or above the `max` its type names (R-PACK-017.C2).
C15: The inspector MUST hold no editing rule of its own (A-WEB-5.K2): `mockitdown/design` MUST export the model it renders, `inspect(session, pack)` and `setField`, `removeField`, `addArgument`, `addModifier`, `removeModifier` and `setOption`, each returning `{ok: true}` or `{ok: false, error, diagnostics}`.
C16: The vocabulary's `.frame` entry (R-PACK-017.C5) MUST give its width, height, minimum, maximum and ideal width and height arguments a `min` of 0.
V1: Changing a button's variant in the inspector changes the code and the rendering, and undo restores both (F-19.AC4); a negative width is shown as invalid and not applied.
