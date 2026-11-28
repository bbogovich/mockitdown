---
id: R-TOOL-008
title: "The code view: mockitdown-code"
status: active
version: 0.13.17
rev: 5
page: WEB.4
slot: reqs
order: 8
hash: 23c1115fd691
source: [SRC-12]
realizes: [F-19]
requires: [R-EDIT-001]
constrained_by: [A-WEB-5, ADR-20]
refs: [R-EDIT-002]
---

C1: The package MUST define the custom element `mockitdown-code`, a plain text area with the properties `value` and `diagnostics` and the method `reveal(range)`, which scrolls to the range `{start, end}` (offsets) and selects it.
C2: The code view MUST colour the text from the TypeScript lexer's tokens (keywords, element and type names, identifiers, modifiers, implicit members, strings, numbers, comments, punctuation and what the lexer cannot read) in a layer behind the transparent text area, with colours from custom properties for light and dark appearance.
C3: The code view MUST show line numbers in a gutter.
C4: The code view MUST mark each line holding a diagnostic in the gutter, with the severity's colour and the messages as the line's tooltip, and MUST show the messages of the caret's line as text below the text area, which names that text as its description.
C5: When the caret is next to a bracket (`(`, `)`, `{`, `}`, `[`, `]`), the code view MUST highlight it and its match, and MUST mark an unmatched bracket; a bracket inside a string or a comment MUST NOT count.
C6: Enter MUST keep the current line's indentation and add one indentation unit (R-EDIT-002.C11) after a line ending in `{` or `(`; a `}` typed as a line's first character MUST remove one unit; Tab and Shift+Tab MUST indent and outdent the lines the selection touches, Tab with no selection MUST insert one unit, and Esc followed by Tab MUST move the focus out.
C7: The code view MUST dispatch exactly one bubbling, composed `input` event for every change of its value by the user (a keystroke, or an editing key of C6), and none when `value` is set.
C8: The code view MUST depend on no editor library and on no other design-tool component, and MUST NOT provide find and replace, folding or multiple cursors.
C9: Re-colouring after a keystroke SHOULD take less than 16 ms for a source of 1000 lines.
C10: The TypeScript core MUST export `highlight(source)`, the coloured ranges of C2 as `{start, end, kind}` in source order, which MUST NOT throw: an unterminated string MUST be coloured as an error to the end of its line, an unterminated block comment as a comment to the end of the source, and a character the lexer cannot read as an error.
C11: The `readonly` attribute (and the `readOnly` property) MUST make the text unchangeable, and the `appearance` attribute (`light`, `dark`) MUST choose the colours, the page's preference choosing them otherwise.
C12: The editing keys of C6 SHOULD change the text through the browser's text-insertion command, so that the browser's own undo keeps their changes.
C13: The text the element is written with, without the indentation its lines share, MUST be its value until a value is set.
V1: Typing in the code view of a 1000-line source keeps colouring, line numbers and bracket matching correct, and its module imports only the core lexer.
