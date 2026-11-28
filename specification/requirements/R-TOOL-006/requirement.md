---
id: R-TOOL-006
title: "New elements: sample arguments and first-text editing"
status: active
version: 0.13.10
rev: 5
page: WEB.4
slot: reqs
order: 6
hash: eca4b98fc247
source: [SRC-12]
realizes: [F-19]
requires: [R-TOOL-004, R-EDIT-003]
constrained_by: [A-WEB-5]
refs: [R-EDIT-003, R-EDIT-007, R-PACK-013]
---

C1: An element inserted from the gallery MUST be written as the top-level call of its reference sample (R-PACK-013) with that call's arguments and modifiers and without its trailing closures, or as `<Name>()` when the sample is not a call of the element.
C2: After an insertion into the mockup it shows, when the new call's first positional argument is a string literal without interpolation, the editor MUST open an inline text field over the new element's first rendered element holding that string, focused with its text selected.
C3: Enter or leaving the field MUST commit the text with `setArgument` (R-EDIT-003.C1) as one change of the session, separate from the insertion's (one undo step once the history of R-EDIT-007 exists); Esc MUST close the field and keep the sample's text.
V1: In the base pack, adding a `Button` inserts `Button("Label")`, opens a field holding `Label`, and typing `Save` then Enter gives `Button("Save")` in a second change after the insertion's.
C4: The design session MUST provide `firstText(node)`, the text of a node's first positional argument when it is a string literal without interpolation, else null, and `setText(node, text)`, which sets that argument to the string literal of the text as one change, changes nothing and notifies nothing for the same text, and is refused for a node without such an argument.
C5: An insertion that arrives while the field is open MUST first commit the field's text, and a field whose node no longer has a first text after a render MUST close without committing.
C6: The code of C1 MUST be computed by the core (`sampleCall(name, sample)`), which gives `<Name>()` for a missing sample, a sample that does not parse, one with more than one top-level statement, a declaration or an import, and one whose single statement is not a call of the element.
