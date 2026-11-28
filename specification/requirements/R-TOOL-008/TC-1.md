---
id: TC-1
title: Light editor
verifies: [C1, C2, C3, C4, C5, C6, C7, C11, C12, C13]
---

Browser test (`code.spec.mjs`, IT-66) on the bare `mockitdown-code` of `pages/code.html` and on
`pages/designer.html` in Code mode, with hand-written expected values: the page's element starts with its
own text dedented; names, strings, modifiers and members get their colour classes and the text area is
transparent; one line number per line; a diagnostic on line 3 marks that gutter line (`data-severity`,
the message as `title`) and, with the caret there, the `message` part reads "Line 3: error: …"; the
caret after `{` highlights it and its `}`, an unmatched `)` and an unclosed `[` are marked, brackets in a
string or comment are not; Enter after `{` indents one unit, after `)` keeps the indentation, after `(`
with no indented line adds four spaces; `}` outdents; Tab and Shift+Tab indent and outdent a selection,
Tab alone inserts a unit; Esc then Tab moves the focus to the next control; `reveal` selects the range
and scrolls; each typed character and each editing key fires one bubbling, composed `input` event and
setting `value` none; the designer's Code mode shows the active mockup's code, coloured and read-only.
