Code and pictures edit the same mockup (SRC-12#s4 "Modes", SRC-12#s9). Typing re-parses after a short
pause; a valid result updates the outline and the view and keeps the selection by node id, an invalid one
leaves them on the last valid tree, read-only, so the designer never loses the picture while a brace is
missing. Developers can keep the code docked under the canvas in Design mode.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-007, R-TOOL-003, R-TOOL-008 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#39).** The rules live in `CodeSync` (`typescript/src/design/code-sync.ts`) beside the session,
so the code view stays a plain text component that imports only the lexer: the view gains `applyEdits`,
`mark` and a `mockitdown-caret` event, and `CodeSync` decides when text is applied, which node the caret
selects and which span is marked. Only the pointer and the navigation keys select by the caret, so typing
inside a node never moves the selection away from the one the designer picked; this is what lets the
selection survive a missing brace and its repair. Leaving the code view applies its text at once, so a
click on a visual tool never races the 300 ms pause. A visual edit made while typed text waits (rare, the
pause is short) is moved past the typing when they do not overlap; otherwise the session's code wins. The
docked view is the same element as Code mode's, placed below the view.
