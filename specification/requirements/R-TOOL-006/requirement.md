---
id: R-TOOL-006
title: "New elements: sample arguments and first-text editing"
status: active
version: 0.12.12
rev: 4
page: WEB.4
slot: reqs
order: 6
hash: 039b0bb3381d
source: [SRC-12]
realizes: [F-19]
requires: [R-TOOL-004, R-EDIT-003]
constrained_by: [A-WEB-5]
refs: [R-EDIT-003, R-PACK-013]
---

C1: An element inserted from the gallery MUST be written as the top-level call of its reference sample (R-PACK-013) with that call's arguments and modifiers and without its trailing closures, or as `<Name>()` when the sample is not a call of the element.
C2: After an insertion, when the new call's first positional argument is a string literal, the editor MUST open an inline text field over the rendered element holding that string, focused with its text selected.
C3: Enter or leaving the field MUST commit the text with `setArgument` (R-EDIT-003.C1) as one change and one undo step, separate from the insertion; Esc MUST close the field and keep the sample's text.
V1: Adding a `Button` inserts `Button("Button")`, opens a field holding `Button`, and typing `Save` then Enter gives `Button("Save")`; one undo restores `Button("Button")`.
