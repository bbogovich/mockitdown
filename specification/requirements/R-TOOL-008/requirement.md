---
id: R-TOOL-008
title: "The code view: mockitdown-code"
status: active
version: 0.12.12
rev: 4
page: WEB.4
slot: reqs
order: 8
hash: 6ea965edd9d2
source: [SRC-12]
realizes: [F-19]
requires: [R-EDIT-001]
constrained_by: [A-WEB-5, ADR-20]
refs: [R-EDIT-002]
---

C1: The package MUST define the custom element `mockitdown-code`, a plain text area with the properties `value` and `diagnostics` and the method `reveal(range)`, which scrolls to the range `{start, end}` (offsets) and selects it.
C2: The code view MUST colour the text from the TypeScript lexer's tokens (keywords, element and type names, identifiers, modifiers, strings, numbers, comments, punctuation) in a layer behind the transparent text area, with colours from custom properties for light and dark appearance.
C3: The code view MUST show line numbers in a gutter.
C4: The code view MUST mark each line holding a diagnostic in the gutter, with the severity's colour and the message available as text to pointer and keyboard users.
C5: When the caret is next to a bracket (`(`, `)`, `{`, `}`, `[`, `]`), the code view MUST highlight it and its match, and MUST mark an unmatched bracket.
C6: Enter MUST keep the current line's indentation and add one indentation unit (R-EDIT-002.C11) after a line ending in `{` or `(`; a `}` typed as a line's first character MUST remove one unit; Tab and Shift+Tab MUST indent and outdent the selected lines, and Esc followed by Tab MUST move the focus out.
C7: The code view MUST dispatch a bubbling, composed `input` event for every change of its value by the user.
C8: The code view MUST depend on no editor library and on no other design-tool component, and MUST NOT provide find and replace, folding or multiple cursors.
C9: Re-colouring after a keystroke SHOULD take less than 16 ms for a source of 1000 lines.
V1: Typing in the code view of a 1000-line source keeps colouring, line numbers and bracket matching correct, and its module imports only the core lexer.
