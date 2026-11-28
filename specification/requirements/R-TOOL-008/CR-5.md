---
id: R-TOOL-008.CR-5
target: R-TOOL-008
kind: revision
version: 0.13.17
date: 2026-11-28
issue: 38
summary: "as built (#38): highlight(source) in the core lexer colours implicit members and unreadable text and never throws (C10); the caret line's messages shown as text (C4); brackets in strings and comments ignored (C5); Tab alone inserts a unit (C6); exactly one input event per change, none for value (C7); readonly and appearance (C11); the browser's insertText keeps native undo (C12); the written text is the first value (C13); TC-1, TC-2 name their tests (IT-66)"
from: 6ea965edd9d2
to: 23c1115fd691
---

## Clauses

@ C2 edit
~ The code view MUST colour the text from the TypeScript lexer's tokens (keywords, element and type names, identifiers, modifiers, {+implicit members, +}strings, numbers, comments, [-punctuation)-]{+punctuation and what the lexer cannot read)+} in a layer behind the transparent text area, with colours from custom properties for light and dark appearance.
@ C4 edit
~ The code view MUST mark each line holding a diagnostic in the gutter, with the severity's colour and the [-message-]{+messages+} [-available-]{+as the line's tooltip, and MUST show the messages of the caret's line+} as text [-to-]{+below+} [-pointer-]{+the+} [-and-]{+text+} [-keyboard-]{+area,+} [-users.-]{+which names that text as its description.+}
@ C5 edit
~ When the caret is next to a bracket (`(`, `)`, `{`, `}`, `[`, `]`), the code view MUST highlight it and its match, and MUST mark an unmatched [-bracket.-]{+bracket; a bracket inside a string or a comment MUST NOT count.+}
@ C6 edit
~ Enter MUST keep the current line's indentation and add one indentation unit (R-EDIT-002.C11) after a line ending in `{` or `(`; a `}` typed as a line's first character MUST remove one unit; Tab and Shift+Tab MUST indent and outdent the [-selected-]{+lines+} [-lines,-]{+the selection touches, Tab with no selection MUST insert one unit,+} and Esc followed by Tab MUST move the focus out.
@ C7 edit
~ The code view MUST dispatch [-a-]{+exactly one+} bubbling, composed `input` event for every change of its value by the [-user.-]{+user (a keystroke, or an editing key of C6), and none when `value` is set.+}
@ C10 insert after C9
+ The TypeScript core MUST export `highlight(source)`, the coloured ranges of C2 as `{start, end, kind}` in source order, which MUST NOT throw: an unterminated string MUST be coloured as an error to the end of its line, an unterminated block comment as a comment to the end of the source, and a character the lexer cannot read as an error.
@ C11 insert after C10
+ The `readonly` attribute (and the `readOnly` property) MUST make the text unchangeable, and the `appearance` attribute (`light`, `dark`) MUST choose the colours, the page's preference choosing them otherwise.
@ C12 insert after C11
+ The editing keys of C6 SHOULD change the text through the browser's text-insertion command, so that the browser's own undo keeps their changes.
@ C13 insert after C12
+ The text the element is written with, without the indentation its lines share, MUST be its value until a value is set.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,9 +3,15 @@
 title: Light editor
-verifies: [C1, C2, C3, C4, C5, C6, C7]
+verifies: [C1, C2, C3, C4, C5, C6, C7, C11, C12, C13]
 ---
 
-Browser test (`code.spec.mjs`) on `pages/designer.html` in Code mode and on a bare `mockitdown-code`:
-tokens get their colour classes; line numbers match the line count; a diagnostic on line 3 marks that
-gutter line with an accessible message; the caret after `{` highlights its `}`, an unmatched `)` is
-marked; Enter after `{` indents one unit, `}` outdents; Tab indents a selection; `reveal` selects the
-range; each typed character fires one `input` event.
+Browser test (`code.spec.mjs`, IT-66) on the bare `mockitdown-code` of `pages/code.html` and on
+`pages/designer.html` in Code mode, with hand-written expected values: the page's element starts with its
+own text dedented; names, strings, modifiers and members get their colour classes and the text area is
+transparent; one line number per line; a diagnostic on line 3 marks that gutter line (`data-severity`,
+the message as `title`) and, with the caret there, the `message` part reads "Line 3: error: …"; the
+caret after `{` highlights it and its `}`, an unmatched `)` and an unclosed `[` are marked, brackets in a
+string or comment are not; Enter after `{` indents one unit, after `)` keeps the indentation, after `(`
+with no indented line adds four spaces; `}` outdents; Tab and Shift+Tab indent and outdent a selection,
+Tab alone inserts a unit; Esc then Tab moves the focus to the next control; `reveal` selects the range
+and scrolls; each typed character and each editing key fires one bubbling, composed `input` event and
+setting `value` none; the designer's Code mode shows the active mockup's code, coloured and read-only.
--- a/TC-2.md
+++ b/TC-2.md
@@ -2,8 +2,13 @@
 id: TC-2
-title: No library, speed
-verifies: [C8, C9]
+title: No library, speed, colouring ranges
+verifies: [C8, C9, C10]
 ---
 
-`node:test` reads the compiled module graph of `mockitdown-code` and fails on an import outside the
-package's core lexer; a browser timing of 50 keystrokes in a 1000-line source reports the median
-re-colour time (warning above 16 ms).
+`node:test` (`code.test.ts`, IT-66) reads the compiled module graph of `dist/elements/code.js` and fails
+unless its only import is the core lexer and the whole graph is the lexer, `diagnostics`, `values` and
+`pyformat`; it checks `highlight` against ranges counted by hand (names, modifiers, a member, a chain
+continued on the next line, keywords, numbers, comments) and that an unterminated string, an
+unterminated block comment and an unreadable character are coloured without throwing. A browser timing
+(`code.spec.mjs`) of 50 keystrokes at the end of a 1000-line source in a code view of its own reports
+the median re-colour time as an annotation (a warning above 16 ms; about 10 ms in Chromium) and checks
+the line numbers and colours afterwards.
--- a/prose.md
+++ b/prose.md
@@ -4,3 +4,14 @@
 or multi-cursor; find and replace can be a later issue. It is usable on its own, for example to show code
-beside a `mockitdown-mockup`.
+beside a `mockitdown-mockup` (the test page `pages/code.html` does that), and the designer's Code mode
+shows the active mockup in a read-only one until two-way editing (R-TOOL-009).
+
+**As built (#38).** The colouring comes from `highlight(source)` in the core lexer module, which scans
+tolerantly so that half-typed code is still coloured: `Text("abc` colours `"abc` as an error up to the
+line feed. A lower-case name after a `.` is a modifier when the dot continues a chain (after `)`, a name
+or a line feed) and an implicit member such as `.title` when it starts a value (after `(`, `,`, `:` or an
+operator). For keyboard users the messages of the caret's line appear below the text (the `message`
+part), so moving the caret to a marked line reads them out. The editing keys use the browser's
+`insertText` command, which keeps the browser's own undo; Chromium sends two `input` events for a line
+feed and its indentation, so the view holds those back and sends one. On a 1000-line source a keystroke
+re-colours in about 10 ms in Chromium.
 
```
