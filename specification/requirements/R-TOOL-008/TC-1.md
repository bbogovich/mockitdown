---
id: TC-1
title: Light editor
verifies: [C1, C2, C3, C4, C5, C6, C7]
---

Browser test (`code.spec.mjs`) on `pages/designer.html` in Code mode and on a bare `mockitdown-code`:
tokens get their colour classes; line numbers match the line count; a diagnostic on line 3 marks that
gutter line with an accessible message; the caret after `{` highlights its `}`, an unmatched `)` is
marked; Enter after `{` indents one unit, `}` outdents; Tab indents a selection; `reveal` selects the
range; each typed character fires one `input` event.
