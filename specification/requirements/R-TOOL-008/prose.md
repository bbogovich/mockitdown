A light editor built for this project (SRC-12#s9): a `<textarea>` over a coloured copy of its text,
with line numbers, diagnostics in the gutter, bracket matching and auto-indent. It has no third-party
editor (SRC-12#s14 "Dependencies", ADR-20) and, by the developer's choice, no find and replace, folding
or multi-cursor; find and replace can be a later issue. It is usable on its own, for example to show code
beside a `mockitdown-mockup` (the test page `pages/code.html` does that), and the designer's Code mode
edits the active mockup in one, joined to the session by two-way editing (R-TOOL-009).

**As built (#38).** The colouring comes from `highlight(source)` in the core lexer module, which scans
tolerantly so that half-typed code is still coloured: `Text("abc` colours `"abc` as an error up to the
line feed. A lower-case name after a `.` is a modifier when the dot continues a chain (after `)`, a name
or a line feed) and an implicit member such as `.title` when it starts a value (after `(`, `,`, `:` or an
operator). For keyboard users the messages of the caret's line appear below the text (the `message`
part), so moving the caret to a marked line reads them out. The editing keys use the browser's
`insertText` command, which keeps the browser's own undo; Chromium sends two `input` events for a line
feed and its indentation, so the view holds those back and sends one. On a 1000-line source a keystroke
re-colours in about 10 ms in Chromium.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-20, R-EDIT-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#39).** For two-way editing the view gained three small, rule-free capabilities that
`CodeSync` uses: `applyEdits` to take another component's edits without losing the caret, `mark` to show
the selection's span behind the text, and a `mockitdown-caret` event so that only deliberate caret moves
(the pointer, the navigation keys) select a node. It still imports only the core lexer.
